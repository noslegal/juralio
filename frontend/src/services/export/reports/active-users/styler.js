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

import { FONT_COLOURS } from '../common/constants-colours'
import { FONTS, FONT_SIZES } from '../common/constants-reports'
import { addCellStyle, setRangeStyle } from '../common/excel-helper'
import { applyMerges, setColumns } from '../common/excel/sheet-builder'

export const applyStyle = (
  t,
  ws,
  partOfMonthUserCount = 0,
  downloadDateRange
) => {
  const style = (id, style) => addCellStyle(ws, id, style)

  const dateHeaderSize =
    downloadDateRange.length < 12 ? FONT_SIZES.LARGER : FONT_SIZES.SMALL
  style('A4', { sz: dateHeaderSize, color: { rgb: FONT_COLOURS.GREY } })
  style('B4', { sz: FONT_SIZES.LARGER, color: { rgb: FONT_COLOURS.GREY } })
  style('A7', { sz: FONT_SIZES.SMALL })
  style('B7', {
    sz: FONT_SIZES.SMALL,
    alignment: {
      horizontal: 'left',
      vertical: 'center',
    },
  })
  style(`A${11 + partOfMonthUserCount}`, { sz: FONT_SIZES.SMALL })
  style(`B${11 + partOfMonthUserCount}`, {
    sz: FONT_SIZES.SMALL,
    alignment: {
      horizontal: 'left',
      vertical: 'center',
    },
  })

  setRangeStyle(ws, 'A8:G8', {
    ...headerStyle,
  })

  const secondHeaderRow = 12 + partOfMonthUserCount
  setRangeStyle(ws, `A${secondHeaderRow}:G${secondHeaderRow}`, {
    ...headerStyle,
  })

  setRangeStyle(ws, 'A4:D4', {
    fgColor: { rgb: FONT_COLOURS.GREY_LIGHT },
    top: { style: 'medium', color: { rgb: FONT_COLOURS.GREY } },
  })

  setRangeStyle(ws, 'A5:D5', {
    fgColor: { rgb: FONT_COLOURS.GREY_LIGHT },
    bottom: { style: 'thin', color: { rgb: FONT_COLOURS.GREY } },
  })

  // Apply merges
  applyMerges(ws, [{ s: 'B4', e: 'D4' }])

  setColumns(ws, [
    { wch: widerColumn },
    { wch: wideColumn },
    { wch: wideColumn },
    { wch: wideColumn },
  ])
}

// Share the below?
const wideColumn = 23
const widerColumn = 46

const headerStyle = {
  ...FONTS.STANDARD_FONT_SEMIBOLD,
  color: { rgb: FONT_COLOURS.BLACK['main'] },
  sz: FONT_SIZES.SMALL / 2,
  top: { style: 'medium', color: { rgb: FONT_COLOURS.GREY } },
  bottom: { style: 'thin', color: { rgb: FONT_COLOURS.GREY } },
  alignment: {
    horizontal: 'left',
    vertical: 'center',
  },
}
