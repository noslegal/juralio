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

// Converts the flat style vocabulary used throughout the report stylers
// ({ name, sz, bold, italic, color, fgColor, top/right/bottom/left,
// alignment }) into ExcelJS cell properties, preserving the merge semantics
// of the previous writer: font and border keys accumulate per key, while an
// alignment object replaces the whole alignment.

const HEX_COLOUR = /^[0-9a-fA-F]{6}$/

// { rgb: '666361' } -> { argb: 'FF666361' }. Non-hex values (the codebase
// passes e.g. 'black' and '#ffffff' in places) are normalised: a leading '#'
// is stripped; anything still invalid returns undefined, which renders as the
// default text colour — the same thing Excel does with the invalid colour
// attributes the previous writer emitted for those values.
export const toColour = colour => {
  if (!colour || typeof colour.rgb !== 'string') {
    return undefined
  }
  const hex = colour.rgb.replace(/^#/, '')
  return HEX_COLOUR.test(hex) ? { argb: `FF${hex.toUpperCase()}` } : undefined
}

const BORDER_SIDES = ['top', 'right', 'bottom', 'left']
const ALIGNMENT_KEYS = [
  'horizontal',
  'vertical',
  'wrapText',
  'shrinkToFit',
  'indent',
  'readingOrder',
  'textRotation',
]

// Fonts are kept SPARSE — only the keys a report explicitly styled. Missing
// name/size/colour are filled in by the font-resolution pass at write time
// (workbook.js), which reproduces how the previous writer materialised
// fonts; auto column widths also depend on which keys were explicit.
export const toFont = flat => {
  const font = {}
  if ('name' in flat) font.name = flat.name
  if ('sz' in flat) font.size = flat.sz
  if ('bold' in flat) font.bold = flat.bold
  if ('italic' in flat) font.italic = flat.italic
  if ('underline' in flat) font.underline = flat.underline
  if ('color' in flat) {
    const colour = toColour(flat.color)
    if (colour) font.color = colour
  }
  return font
}

const toAlignment = flatAlignment => {
  const alignment = {}
  ALIGNMENT_KEYS.forEach(key => {
    if (key in flatAlignment) alignment[key] = flatAlignment[key]
  })
  // the stylers use the OOXML value; ExcelJS expects 'middle' and maps it back
  if (alignment.vertical === 'center') {
    alignment.vertical = 'middle'
  }
  return alignment
}

const toBorderSide = side => ({
  style: side.style,
  color: toColour(side.color),
})

export const applyFlatStyle = (cell, flat) => {
  const font = toFont(flat)
  if (Object.keys(font).length > 0) {
    cell.font = { ...cell.font, ...font }
  }

  if ('fgColor' in flat) {
    const colour = toColour(flat.fgColor)
    if (colour) {
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: colour }
    }
  }

  const border = {}
  BORDER_SIDES.forEach(side => {
    if (flat[side]) border[side] = toBorderSide(flat[side])
  })
  if (Object.keys(border).length > 0) {
    cell.border = { ...cell.border, ...border }
  }

  if (flat.alignment) {
    cell.alignment = toAlignment(flat.alignment)
  }
}
