/*
 * Copyright 2026 Graeme and Joanna Johnston
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Normalises an xlsx file into a semantic model for parity comparison.
 * Style-table indices, shared-string usage, anchor flavours and other
 * serialisation details legitimately differ between writers; what must match
 * is the resolved per-cell state and the sheet-level layout Excel renders.
 */
import JSZip from 'jszip'

const NS_MAIN = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main'

const parseXml = xml => new DOMParser().parseFromString(xml, 'application/xml')

const els = (parent, name) =>
  parent ? Array.from(parent.getElementsByTagNameNS(NS_MAIN, name)) : []

const el = (parent, name) => els(parent, name)[0]

const colToNumber = letters => {
  let n = 0
  for (const ch of letters) n = n * 26 + (ch.charCodeAt(0) - 64)
  return n
}

// FF-alpha stripped, uppercased; theme-1 / invalid / absent all normalise to
// null (the default text colour) — the old writer emitted literal junk like
// rgb="0black" for invalid values, which Excel renders as default.
const normaliseColour = colourEl => {
  if (!colourEl) return null
  const rgb = colourEl.getAttribute('rgb')
  if (rgb && /^[0-9a-fA-F]{6,8}$/.test(rgb)) {
    return rgb.toUpperCase().replace(/^FF(?=[0-9A-F]{6}$)/, '')
  }
  const theme = colourEl.getAttribute('theme')
  if (theme && theme !== '1') return `theme:${theme}`
  return null
}

const parseFonts = stylesDoc =>
  els(el(stylesDoc.documentElement, 'fonts'), 'font').map(f => ({
    name: el(f, 'name')?.getAttribute('val') ?? 'Calibri',
    size: parseFloat(el(f, 'sz')?.getAttribute('val') ?? '11'),
    bold: !!el(f, 'b'),
    italic: !!el(f, 'i'),
    colour: normaliseColour(el(f, 'color')),
  }))

const parseFills = stylesDoc =>
  els(el(stylesDoc.documentElement, 'fills'), 'fill').map(f => {
    const pattern = el(f, 'patternFill')
    const type = pattern?.getAttribute('patternType') ?? 'none'
    if (type === 'none' || type === 'gray125') return null
    return {
      pattern: type,
      fg: normaliseColour(el(pattern, 'fgColor')),
    }
  })

const parseBorders = stylesDoc =>
  els(el(stylesDoc.documentElement, 'borders'), 'border').map(b => {
    const border = {}
    for (const side of ['left', 'right', 'top', 'bottom']) {
      const sideEl = el(b, side)
      const style = sideEl?.getAttribute('style')
      if (style) {
        border[side] = { style, colour: normaliseColour(el(sideEl, 'color')) }
      }
    }
    return Object.keys(border).length ? border : null
  })

const parseAlignments = stylesDoc =>
  els(el(stylesDoc.documentElement, 'cellXfs'), 'xf').map(xf => {
    const a = el(xf, 'alignment')
    if (!a) return null
    const alignment = {}
    for (const key of ['horizontal', 'vertical', 'indent']) {
      const value = a.getAttribute(key)
      if (value && value !== '0') alignment[key] = value
    }
    if (['1', 'true'].includes(a.getAttribute('wrapText'))) {
      alignment.wrapText = true
    }
    if (['1', 'true'].includes(a.getAttribute('shrinkToFit'))) {
      alignment.shrinkToFit = true
    }
    return Object.keys(alignment).length ? alignment : null
  })

const parseStyles = stylesXml => {
  const doc = parseXml(stylesXml)
  const fonts = parseFonts(doc)
  const fills = parseFills(doc)
  const borders = parseBorders(doc)
  const alignments = parseAlignments(doc)
  const xfs = els(el(doc.documentElement, 'cellXfs'), 'xf').map((xf, i) => ({
    font: fonts[parseInt(xf.getAttribute('fontId') ?? '0', 10)],
    fill: fills[parseInt(xf.getAttribute('fillId') ?? '0', 10)] ?? null,
    border: borders[parseInt(xf.getAttribute('borderId') ?? '0', 10)] ?? null,
    alignment: alignments[i],
  }))
  return { xfs, defaultFont: fonts[0] }
}

const runFont = (rPr, baseFont) => {
  if (!rPr) return { ...baseFont }
  return {
    name: el(rPr, 'rFont')?.getAttribute('val') ?? baseFont.name,
    size: parseFloat(el(rPr, 'sz')?.getAttribute('val') ?? baseFont.size),
    bold: !!el(rPr, 'b'),
    italic: !!el(rPr, 'i'),
    colour: normaliseColour(el(rPr, 'color')),
  }
}

const parseRuns = (container, baseFont) =>
  els(container, 'r').map(r => ({
    text: el(r, 't')?.textContent ?? '',
    font: runFont(el(r, 'rPr'), baseFont),
  }))

// Shared strings may themselves hold plain text or rich runs
const parseSharedStrings = (xml, defaultFont) => {
  if (!xml) return []
  const doc = parseXml(xml)
  return els(doc.documentElement, 'si').map(si => {
    const runs = parseRuns(si, defaultFont)
    if (runs.length) return { runs }
    return { text: el(si, 't')?.textContent ?? '' }
  })
}

const cellValue = (c, shared, defaultFont) => {
  const type = c.getAttribute('t') ?? 'n'
  const v = el(c, 'v')
  if (type === 's') {
    const item = shared[parseInt(v?.textContent ?? '0', 10)] ?? { text: '' }
    return item.runs ? { runs: item.runs } : { text: item.text }
  }
  if (type === 'inlineStr') {
    const is = el(c, 'is')
    const runs = parseRuns(is, defaultFont)
    if (runs.length) return { runs }
    return { text: el(is, 't')?.textContent ?? '' }
  }
  if (type === 'str') return { text: v?.textContent ?? '' }
  if (type === 'b') return { bool: v?.textContent === '1' }
  if (v?.textContent == null) return { text: '' }
  return { number: parseFloat(v.textContent) }
}

const isDefaultStyle = style =>
  !style.fill &&
  !style.border &&
  !style.alignment &&
  style.font.name === 'Calibri' &&
  !style.font.bold &&
  !style.font.italic &&
  style.font.colour === null

const parseSheet = (sheetXml, styles, shared) => {
  const doc = parseXml(sheetXml)
  const root = doc.documentElement

  const cells = {}
  for (const c of els(root, 'c')) {
    const ref = c.getAttribute('r')
    const styleIdx = parseInt(c.getAttribute('s') ?? '0', 10)
    const style = styles.xfs[styleIdx] ?? {
      font: styles.defaultFont,
      fill: null,
      border: null,
      alignment: null,
    }
    const value = cellValue(c, shared, styles.defaultFont)
    const empty =
      ('text' in value && value.text === '') ||
      ('number' in value && Number.isNaN(value.number))
    // blank cells with entirely default styling are serialisation noise
    if (empty && isDefaultStyle(style)) continue
    cells[ref] = {
      value: empty ? { text: '' } : value,
      font: style.font,
      fill: style.fill,
      border: style.border,
      alignment: style.alignment,
    }
  }

  const cols = {}
  for (const col of els(root, 'col')) {
    const min = parseInt(col.getAttribute('min'), 10)
    const max = parseInt(col.getAttribute('max'), 10)
    const width = col.getAttribute('width')
    for (let i = min; i <= max; i++) {
      cols[i] = {
        width: width ? Math.round(parseFloat(width) * 1000) / 1000 : null,
        bestFit: ['1', 'true'].includes(col.getAttribute('bestFit')),
      }
    }
  }

  const rows = {}
  for (const row of els(root, 'row')) {
    const ht = row.getAttribute('ht')
    if (ht) {
      rows[row.getAttribute('r')] = Math.round(parseFloat(ht) * 100) / 100
    }
  }

  const view = el(root, 'sheetView')
  const pane = el(root, 'pane')
  const gridAttr = view?.getAttribute('showGridLines')
  const pageSetupEl = el(root, 'pageSetup')
  const printOptions = el(root, 'printOptions')
  const marginsEl = el(root, 'pageMargins')
  // Excel's own defaults — an absent pageMargins element means exactly this,
  // so both an explicit-default and an absent element normalise the same way
  const margins = {
    left: 0.7,
    right: 0.7,
    top: 0.75,
    bottom: 0.75,
    header: 0.3,
    footer: 0.3,
  }
  if (marginsEl) {
    for (const key of Object.keys(margins)) {
      margins[key] = parseFloat(marginsEl.getAttribute(key))
    }
  }
  const fitToPage = !!el(root, 'pageSetUpPr')?.getAttribute('fitToPage')

  return {
    cells,
    // single-cell "merges" (s === e) are metadata noise the old writer
    // emitted; Excel ignores them and the new writer drops them
    merges: els(root, 'mergeCell')
      .map(m => m.getAttribute('ref'))
      .filter(ref => {
        const [s, e] = ref.split(':')
        return e && s !== e
      })
      .sort(),
    cols,
    rows,
    view: {
      showGridLines: !(gridAttr === 'false' || gridAttr === '0'),
      pane: pane
        ? {
            state: pane.getAttribute('state'),
            xSplit: pane.getAttribute('xSplit') ?? '0',
            ySplit: pane.getAttribute('ySplit') ?? '0',
            topLeftCell: pane.getAttribute('topLeftCell'),
          }
        : null,
    },
    print: {
      fitToPage,
      // absent attributes mean Excel's defaults; fit counts only when
      // fitToPage is on
      orientation: pageSetupEl?.getAttribute('orientation') ?? 'portrait',
      paperSize: pageSetupEl?.getAttribute('paperSize') ?? null,
      errors: pageSetupEl?.getAttribute('errors') ?? null,
      fitToWidth: fitToPage
        ? (pageSetupEl?.getAttribute('fitToWidth') ?? '1')
        : null,
      fitToHeight: fitToPage
        ? (pageSetupEl?.getAttribute('fitToHeight') ?? '1')
        : null,
      horizontalCentered: ['1', 'true'].includes(
        printOptions?.getAttribute('horizontalCentered')
      ),
      margins,
      oddFooter: el(root, 'oddFooter')?.textContent ?? null,
      evenFooter: el(root, 'evenFooter')?.textContent ?? null,
    },
  }
}

// EMU anchors; absoluteAnchor is represented as offsets from A1, which is
// how the new writer expresses the same visual position.
const parseDrawing = (drawingXml, imageHashes) => {
  const doc = parseXml(drawingXml)
  const anchors = []
  for (const node of Array.from(doc.documentElement.childNodes)) {
    if (!node.localName?.endsWith('Anchor')) continue
    const get = name => node.getElementsByTagNameNS('*', name)[0]
    const embed = node
      .getElementsByTagNameNS('*', 'blip')[0]
      ?.getAttributeNS(
        'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
        'embed'
      )
    const ext = get('ext')
    let from = { col: 0, colOff: 0, row: 0, rowOff: 0 }
    if (node.localName === 'absoluteAnchor') {
      const pos = get('pos')
      from = {
        col: 0,
        colOff: parseInt(pos.getAttribute('x'), 10),
        row: 0,
        rowOff: parseInt(pos.getAttribute('y'), 10),
      }
    } else {
      const fromEl = get('from')
      const part = name =>
        parseInt(fromEl.getElementsByTagNameNS('*', name)[0].textContent, 10)
      from = {
        col: part('col'),
        colOff: part('colOff'),
        row: part('row'),
        rowOff: part('rowOff'),
      }
    }
    anchors.push({
      ...from,
      cx: parseInt(ext.getAttribute('cx'), 10),
      cy: parseInt(ext.getAttribute('cy'), 10),
      image: imageHashes[embed] ?? null,
    })
  }
  return anchors.sort((a, b) => a.col - b.col || a.colOff - b.colOff)
}

const relTargets = relsXml => {
  const map = {}
  if (!relsXml) return map
  const doc = parseXml(relsXml)
  for (const rel of Array.from(
    doc.getElementsByTagNameNS('*', 'Relationship')
  )) {
    map[rel.getAttribute('Id')] = rel.getAttribute('Target')
  }
  return map
}

const hashBytes = bytes => {
  // FNV-1a — collision-resistant enough to assert "same image bytes"
  let hash = 0x811c9dc5
  for (const byte of bytes) {
    hash ^= byte
    hash = Math.imul(hash, 0x01000193)
  }
  return (hash >>> 0).toString(16) + ':' + bytes.length
}

export const normaliseWorkbook = async data => {
  const zip = await JSZip.loadAsync(data)
  const read = async name => {
    const file = zip.file(name.replace(/^\//, ''))
    return file ? file.async('string') : null
  }

  const styles = parseStyles(await read('xl/styles.xml'))
  const shared = parseSharedStrings(
    await read('xl/sharedStrings.xml'),
    styles.defaultFont
  )

  const workbookDoc = parseXml(await read('xl/workbook.xml'))
  const wbRels = relTargets(await read('xl/_rels/workbook.xml.rels'))
  const sheetEls = els(workbookDoc.documentElement, 'sheet')

  const printAreas = {}
  for (const dn of els(workbookDoc.documentElement, 'definedName')) {
    if (dn.getAttribute('name') === '_xlnm.Print_Area') {
      const area = dn.textContent.replace(/['$]/g, '')
      printAreas[dn.getAttribute('localSheetId')] = area.split('!')[1] ?? area
    }
  }

  const sheets = []
  for (let i = 0; i < sheetEls.length; i++) {
    const sheetEl = sheetEls[i]
    const rid = sheetEl.getAttributeNS(
      'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
      'id'
    )
    const target = wbRels[rid].replace(/^\//, '')
    const path = target.startsWith('xl/') ? target : `xl/${target}`
    const sheetXml = await read(path)
    const sheet = parseSheet(sheetXml, styles, shared)
    sheet.name = sheetEl.getAttribute('name')
    sheet.printArea = printAreas[String(i)] ?? null

    const relsPath = path.replace(/worksheets\//, 'worksheets/_rels/') + '.rels'
    const sheetRels = relTargets(await read(relsPath))
    sheet.images = []
    const drawingRef = els(parseXml(sheetXml).documentElement, 'drawing')[0]
    if (drawingRef) {
      const drawingRid = drawingRef.getAttributeNS(
        'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
        'id'
      )
      const drawingPath = sheetRels[drawingRid]
        .replace(/^\.\.\//, 'xl/')
        .replace(/^\//, '')
      const drawingRels = relTargets(
        await read(
          drawingPath.replace(/drawings\//, 'drawings/_rels/') + '.rels'
        )
      )
      const imageHashes = {}
      for (const [rid2, imgTarget] of Object.entries(drawingRels)) {
        const imgPath = imgTarget.replace(/^\.\.\//, 'xl/')
        const bytes = await zip.file(imgPath).async('uint8array')
        imageHashes[rid2] = hashBytes(bytes)
      }
      sheet.images = parseDrawing(await read(drawingPath), imageHashes)
    }
    sheets.push(sheet)
  }
  return { sheets }
}

// Deep-compares two normalised workbooks, returning human-readable diff lines
export const diffWorkbooks = (expected, actual) => {
  const diffs = []
  const walk = (a, b, path) => {
    if (diffs.length > 60) return
    if (a === b) return
    if (
      typeof a === 'number' &&
      typeof b === 'number' &&
      Math.abs(a - b) < 1e-9
    ) {
      return
    }
    if (a == null || b == null || typeof a !== typeof b) {
      diffs.push(`${path}: ${JSON.stringify(a)} != ${JSON.stringify(b)}`)
      return
    }
    if (typeof a !== 'object') {
      diffs.push(`${path}: ${JSON.stringify(a)} != ${JSON.stringify(b)}`)
      return
    }
    const keys = new Set([...Object.keys(a), ...Object.keys(b)])
    for (const key of keys) {
      walk(a[key], b[key], `${path}.${key}`)
    }
  }
  walk(expected, actual, '')
  return diffs
}

export const colNumberFromRef = ref => colToNumber(/^([A-Z]+)/.exec(ref)[1])

// Recursively sorts object keys so a value serialises identically regardless
// of insertion order — used for stable style keys and canonical snapshots.
const canonicalise = value => {
  if (Array.isArray(value)) return value.map(canonicalise)
  if (value && typeof value === 'object') {
    return Object.keys(value)
      .sort()
      .reduce((acc, key) => {
        acc[key] = canonicalise(value[key])
        return acc
      }, {})
  }
  return value
}

const fnv = str => {
  let hash = 0x811c9dc5
  for (let i = 0; i < str.length; i++) {
    hash ^= str.charCodeAt(i)
    hash = Math.imul(hash, 0x01000193)
  }
  return (hash >>> 0).toString(16).padStart(8, '0')
}

// Compact, diffable form of a normalised workbook: the resolved cell styles
// (font/fill/border/alignment) are deduped into a content-keyed `styles`
// table and each cell keeps only its value plus a style key. Keeps snapshots
// small and makes a style change show up as one table entry rather than a
// per-cell explosion. Deterministic given the model, so equal models produce
// equal snapshots.
export const toSnapshot = model => {
  const styles = {}
  const sheets = model.sheets.map(sheet => {
    const cells = {}
    for (const [ref, cell] of Object.entries(sheet.cells)) {
      const style = {
        font: cell.font,
        fill: cell.fill,
        border: cell.border,
        alignment: cell.alignment,
      }
      const key = fnv(JSON.stringify(canonicalise(style)))
      if (!styles[key]) styles[key] = style
      cells[ref] = { value: cell.value, s: key }
    }
    return { ...sheet, cells }
  })
  return { styles, sheets }
}

// Canonical, order-stable JSON for committing a snapshot to disk.
export const stableSnapshotJson = model =>
  JSON.stringify(canonicalise(toSnapshot(model)), null, 2) + '\n'
