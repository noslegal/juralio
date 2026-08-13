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

import { applyFlatStyle } from './excel/flat-style'
import { decodeCell, decodeRange } from './excel/refs'

// Styles a single existing cell; cells that don't exist are left alone
// (matching the previous writer, which only styled cells present in the
// sheet). Style objects use the flat legacy shape — see flat-style.js.
export const addCellStyle = (ws, cellId, style) => {
  const { row, col } = decodeCell(cellId)
  const cell = ws.findRow(row)?.findCell(col)
  if (cell) {
    applyFlatStyle(cell, style)
  }
}

// Styles every cell in a range, clamped to the sheet's used range; empty
// cells inside the clamped range are created so fills/borders on them
// render. Border sides apply to the range PERIMETER only (left on the first
// column, right on the last, top/bottom on the edge rows) — replacing
// XLSX.utils.sheet_set_range_style with identical semantics (including
// tolerating row-0 refs like 'A0:G13').
export const setRangeStyle = (ws, range, style) => {
  const dims = ws.dimensions
  if (!dims || !dims.top) {
    return
  }
  const target = decodeRange(range)
  const top = Math.max(target.top, dims.top)
  const bottom = Math.min(target.bottom, dims.bottom)
  const left = Math.max(target.left, dims.left)
  const right = Math.min(target.right, dims.right)
  for (let row = top; row <= bottom; row++) {
    for (let col = left; col <= right; col++) {
      const cellStyle = { ...style }
      if (row !== top) delete cellStyle.top
      if (row !== bottom) delete cellStyle.bottom
      if (col !== left) delete cellStyle.left
      if (col !== right) delete cellStyle.right
      applyFlatStyle(ws.getCell(row, col), cellStyle)
    }
  }
}
