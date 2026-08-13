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

// Auto column widths matching the output of the previous xlsx writer, so
// exported files keep identical column sizing. Derived by calibrating
// against a corpus of exports produced by the old writer:
//
//   candidate(cell) =
//     string cell:  trunc(length(text) * fontScale * 1.2)
//     number cell:  length(String(value)) * fontScale
//     boolean cell: 5 * fontScale
//   column width (chars) = max(1, max over cells of candidate)
//
// fontScale is the cell font's digit width in px relative to the workbook
// default (Calibri 12 = 8px). A cell only scales when BOTH its font name and
// size are explicitly styled and the combination is in the table below;
// everything else (Montserrat, 'Ariel', name-only or size-only fonts) uses
// scale 1 — this matches the old writer's observed behaviour exactly.
//
// Rich-text cells measure the plain value the cell held before the rich runs
// replaced it (see rich-text.js), again matching the previous output.

import { getOriginalRichTextValue } from './rich-text'

const BASE_DIGIT_WIDTH = 8 // Calibri 12

// px digit widths at 96dpi. Deliberately sparse — only these font/size
// combinations scale; every other combination measures at scale 1. Confirmed
// against the old writer's exports (e.g. Arial 12 and Arial 8 cells measure
// unscaled, while Arial 10 measures at 7/8).
const DIGIT_WIDTH_PX = {
  Calibri: { 11: 7, 12: 8, 13: 10, 14: 11, 16: 12, 18: 14, 20: 16 },
  Arial: { 10: 7 },
}

// Cell fonts are sparse until the write-time resolution pass, so a cell only
// scales when the reports explicitly styled both a name and a size.
const fontScale = font => {
  if (!font || !font.name || !font.size) {
    return 1
  }
  const width = DIGIT_WIDTH_PX[font.name]?.[font.size]
  return width ? width / BASE_DIGIT_WIDTH : 1
}

const candidateWidth = cell => {
  const scale = fontScale(cell.font)
  const original = getOriginalRichTextValue(cell)
  if (typeof original === 'string') {
    return Math.trunc(original.length * scale * 1.2)
  }
  const value = cell.value
  if (typeof value === 'string') {
    return Math.trunc(value.length * scale * 1.2)
  }
  if (typeof value === 'number') {
    return String(value).length * scale
  }
  if (typeof value === 'boolean') {
    return 5 * scale
  }
  return 0
}

export const computeAutoWidth = (ws, colNumber) => {
  let best = 0
  ws.eachRow({ includeEmpty: false }, row => {
    const cell = row.findCell(colNumber)
    if (cell) {
      best = Math.max(best, candidateWidth(cell))
    }
  })
  return best < 1 ? 1 : best
}
