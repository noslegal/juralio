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

import { computeAutoWidth } from './autofit'
import { decodeCell, encodeCell } from './refs'

// Column definitions ({ wch } / { wpx } / { auto: 1 }) are stored per
// worksheet and resolved in writeWorkbook, after all content and styling is
// in place — auto widths depend on final cell fonts and values.
const pendingColumns = new WeakMap()

// ExcelJS's column model has no bestFit, so auto-fitted column numbers are
// remembered here and the attribute is patched into the file afterwards
// (workbook.js), keeping the exported XML identical to the previous writer.
const autoFittedColumns = new WeakMap()

export const getAutoFittedColumns = ws => autoFittedColumns.get(ws) ?? []

const MDW = 8 // max digit width (px) of the default font, Calibri 12

// OOXML round-trips, matching the previous writer's output exactly:
// char count -> stored width, px -> char count.
const chToWidth = ch => Math.round(((ch * MDW + 5) / MDW) * 256) / 256
const pxToCh = px => Math.floor(((px - 5) / MDW) * 100 + 0.5) / 100

// Creates a worksheet and fills it from an array-of-arrays. Empty strings
// still create cells (styles and fills on them must render); null/undefined
// entries do not. Some builders push non-primitive values (e.g. arrays);
// the previous writer coerced those with String(), so keep doing that.
export const createSheet = (wb, name, aoa) => {
  const ws = wb.addWorksheet(name)
  aoa.forEach((rowValues, r) => {
    rowValues.forEach((value, c) => {
      if (value !== null && value !== undefined) {
        ws.getCell(r + 1, c + 1).value =
          typeof value === 'object' ? String(value) : value
      }
    })
  })
  return ws
}

export const setColumns = (ws, colDefs) => {
  pendingColumns.set(ws, colDefs)
}

export const resolveColumns = ws => {
  const colDefs = pendingColumns.get(ws)
  if (!colDefs) {
    return
  }
  colDefs.forEach((def, i) => {
    if (!def) {
      return
    }
    const column = ws.getColumn(i + 1)
    if (def.auto) {
      column.width = chToWidth(computeAutoWidth(ws, i + 1))
      autoFittedColumns.set(ws, [...getAutoFittedColumns(ws), i + 1])
    } else if (def.wpx != null) {
      column.width = chToWidth(pxToCh(def.wpx))
    } else if (def.wch != null) {
      column.width = chToWidth(def.wch)
    }
  })
}

// Row heights in the legacy { hpx } shape; ExcelJS row.height is in points.
export const setRows = (ws, rowDefs) => {
  rowDefs.forEach((def, i) => {
    if (def && def.hpx != null) {
      ws.getRow(i + 1).height = def.hpx * 0.75
    }
  })
}

// Merges in the legacy shape [{ s: 'B4', e: 'D4' }] (or {r,c} objects).
// Recorded as metadata and injected into the sheet XML at write time
// (workbook.js) rather than merged through ExcelJS, which would clear the
// covered cells' values — the previous writer kept them, and the xlsx e2e
// specs read them.
const mergedRanges = new WeakMap()

export const getMergedRanges = ws => mergedRanges.get(ws) ?? []

const toRef = point =>
  typeof point === 'string'
    ? point
    : encodeCell({ row: point.r + 1, col: point.c + 1 })

export const applyMerges = (ws, merges) => {
  const refs = merges.map(merge => {
    const from = toRef(merge.s)
    const to = toRef(merge.e)
    return from === to ? from : `${from}:${to}`
  })
  mergedRanges.set(ws, [...getMergedRanges(ws), ...refs])
}

// Frozen panes + gridline suppression: both live on the sheet view.
export const setSheetView = (ws, { freeze, gridlines = true } = {}) => {
  if (freeze) {
    const { row, col } = decodeCell(freeze)
    ws.views = [
      {
        state: 'frozen',
        xSplit: col - 1,
        ySplit: row - 1,
        topLeftCell: freeze,
        showGridLines: gridlines,
      },
    ]
  } else {
    ws.views = [{ showGridLines: gridlines }]
  }
}
