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

import { toColour } from './flat-style'
import { decodeCell } from './refs'

// Auto column widths are measured against the plain text a cell held before
// rich runs replaced it (matching the previous writer), so remember it here.
const originalValues = new WeakMap()

export const getOriginalRichTextValue = cell => originalValues.get(cell)

// Replaces a cell's value with styled runs. Runs use the legacy shape
// { v: text, s: { italic, bold, color, sz, name } }.
export const setRichText = (ws, cellRef, runs) => {
  const { row, col } = decodeCell(cellRef)
  const cell = ws.findRow(row)?.findCell(col)
  if (!cell) {
    return
  }
  if (typeof cell.value === 'string') {
    originalValues.set(cell, cell.value)
  }
  cell.value = {
    richText: runs.map(run => {
      const font = {
        size: run.s.sz,
        name: run.s.name,
      }
      if (run.s.bold) font.bold = true
      if (run.s.italic) font.italic = true
      const colour = toColour(run.s.color)
      if (colour) font.color = colour
      return { text: run.v, font }
    }),
  }
}
