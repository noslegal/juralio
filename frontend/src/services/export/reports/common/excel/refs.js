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

// A1-notation helpers for the ExcelJS-based report writers.

export const colToNumber = letters => {
  let n = 0
  for (const ch of letters) {
    n = n * 26 + (ch.charCodeAt(0) - 64)
  }
  return n
}

export const numberToCol = n => {
  let s = ''
  while (n > 0) {
    const rem = (n - 1) % 26
    s = String.fromCharCode(65 + rem) + s
    n = Math.floor((n - 1) / 26)
  }
  return s
}

// 'B4' -> { row: 4, col: 2 } (1-based). Rows below 1 (e.g. the legacy 'A0'
// ranges some stylers use) are clamped to 1.
export const decodeCell = ref => {
  const match = /^([A-Z]+)(-?\d+)$/.exec(ref)
  const row = parseInt(match[2], 10)
  return { row: Math.max(1, row), col: colToNumber(match[1]) }
}

// 'A1:G13' -> { top, left, bottom, right } (1-based, clamped)
export const decodeRange = range => {
  const [start, end] = range.split(':')
  const s = decodeCell(start)
  const e = decodeCell(end)
  return {
    top: Math.min(s.row, e.row),
    left: Math.min(s.col, e.col),
    bottom: Math.max(s.row, e.row),
    right: Math.max(s.col, e.col),
  }
}

// { row, col } (1-based) -> 'B4'
export const encodeCell = ({ row, col }) => `${numberToCol(col)}${row}`
