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

import {
  getAutoFittedColumns,
  getMergedRanges,
  resolveColumns,
} from './sheet-builder'

// ExcelJS is only ever loaded lazily, keeping it out of the main bundle just
// as the previous xlsx writer was.
export const createWorkbook = async () => {
  const mod = await import('exceljs')
  const ExcelJS = mod.default || mod
  return new ExcelJS.Workbook()
}

const colourKey = colour =>
  colour ? (colour.argb ?? `theme${colour.theme}`) : 'theme1'

// Materialises the sparse cell fonts the way the previous writer did:
// walking cells row-major across the workbook, each font either fuzzy-matches
// an already-materialised one (name/size only compared when explicitly
// styled) or is added with the defaults filled in (Calibri / 12 / theme text
// colour). This is what makes e.g. a name-less size-8 style on column H
// pick up the Arial-8 font created for column G, exactly as before.
const resolveFonts = wb => {
  // the default font participates in matching, so a name-less size-12 style
  // resolves to Calibri 12 rather than an earlier materialised font
  const fonts = [{ name: 'Calibri', size: 12, family: 2, color: { theme: 1 } }]
  wb.worksheets.forEach(ws => {
    // includeEmpty: styled cells without values (range-style stubs) carry
    // fonts that must resolve too
    ws.eachRow({ includeEmpty: true }, row => {
      row.eachCell({ includeEmpty: true }, cell => {
        const font = cell?.font
        if (!font || Object.keys(font).length === 0) {
          return
        }
        let match = fonts.find(
          existing =>
            !!font.bold === !!existing.bold &&
            !!font.italic === !!existing.italic &&
            !!font.underline === !!existing.underline &&
            (!font.size || font.size === existing.size) &&
            (!font.name || font.name === existing.name) &&
            colourKey(font.color) === colourKey(existing.color)
        )
        if (!match) {
          match = {
            name: font.name || 'Calibri',
            size: font.size || 12,
            family: 2,
            color: font.color || { theme: 1 },
            ...(font.bold && { bold: true }),
            ...(font.italic && { italic: true }),
            ...(font.underline && { underline: font.underline }),
          }
          fonts.push(match)
        }
        cell.font = match
      })
    })
  })
}

// The workbook default font must be Calibri 12 (what the previous writer
// used) rather than ExcelJS's hard-coded Calibri 11: unstyled cells render
// with it, and Excel derives every column's on-screen width from the default
// font's digit width. ExcelJS has no API for it, so patch font0 in
// styles.xml after serialising. The exact match is guarded by the parity
// spec and exceljs is pinned, so drift shows up in tests, not in exports.
const patchDefaultFontSize = stylesXml => {
  const fontsStart = stylesXml.indexOf('<fonts')
  const firstFontEnd = stylesXml.indexOf('</font>', fontsStart)
  const firstFont = stylesXml.slice(fontsStart, firstFontEnd)
  const patched = firstFont.replace('<sz val="11"/>', '<sz val="12"/>')
  return (
    stylesXml.slice(0, fontsStart) + patched + stylesXml.slice(firstFontEnd)
  )
}

// Auto-fitted columns carry bestFit="1" and no customWidth (they are sized
// to content, not user-set) — ExcelJS can't express either and it also
// coalesces equal-width columns into min/max ranges, so expand the ranges
// into per-column elements and patch the auto ones to match the previous
// writer's output.
const patchAutoFitColumns = (sheetXml, autoCols) => {
  const auto = new Set(autoCols)
  return sheetXml.replace(/<col [^>]*?\/>/g, colXml => {
    const min = parseInt(/min="(\d+)"/.exec(colXml)[1], 10)
    const max = parseInt(/max="(\d+)"/.exec(colXml)[1], 10)
    const cols = []
    for (let n = min; n <= max; n++) {
      let col = colXml
        .replace(/min="\d+"/, `min="${n}"`)
        .replace(/max="\d+"/, `max="${n}"`)
      if (auto.has(n)) {
        col = col
          .replace(/ customWidth="1"/, '')
          .replace(/\/>$/, ' bestFit="1"/>')
      }
      cols.push(col)
    }
    return cols.join('')
  })
}

// Merges are injected as pure metadata after </sheetData> so covered cells
// keep their values and styles, matching the previous writer.
const injectMerges = (sheetXml, refs) => {
  const merges = refs.map(ref => `<mergeCell ref="${ref}"/>`).join('')
  const mergeCells = `<mergeCells count="${refs.length}">${merges}</mergeCells>`
  if (sheetXml.includes('</sheetData>')) {
    return sheetXml.replace('</sheetData>', `</sheetData>${mergeCells}`)
  }
  return sheetXml.replace(/<sheetData\s*\/>/, `<sheetData/>${mergeCells}`)
}

// Resolves deferred column widths (auto widths need final fonts/values) and
// fonts, serialises the workbook and applies the XML-level patches. Returns
// data suitable for new Blob([...]).
export const writeWorkbook = async wb => {
  wb.worksheets.forEach(ws => resolveColumns(ws))
  resolveFonts(wb)
  const buffer = await wb.xlsx.writeBuffer()

  const mod = await import('jszip')
  const JSZip = mod.default || mod
  const zip = await JSZip.loadAsync(buffer)
  const stylesXml = await zip.file('xl/styles.xml').async('string')
  zip.file('xl/styles.xml', patchDefaultFontSize(stylesXml))

  for (const ws of wb.worksheets) {
    const autoCols = getAutoFittedColumns(ws)
    const merges = getMergedRanges(ws)
    if (!autoCols.length && !merges.length) {
      continue
    }
    const path = `xl/worksheets/sheet${ws.id}.xml`
    let sheetXml = await zip.file(path).async('string')
    if (autoCols.length) {
      sheetXml = patchAutoFitColumns(sheetXml, autoCols)
    }
    if (merges.length) {
      sheetXml = injectMerges(sheetXml, merges)
    }
    zip.file(path, sheetXml)
  }
  return zip.generateAsync({ type: 'uint8array', compression: 'DEFLATE' })
}
