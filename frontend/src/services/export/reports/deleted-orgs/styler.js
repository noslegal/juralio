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
import { setRangeStyle } from '../common/excel-helper'
import { applyMerges, setColumns } from '../common/excel/sheet-builder'

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

export const applyStyle = (t, ws) => {
  setRangeStyle(ws, 'A8:G8', {
    ...headerStyle,
  })

  setRangeStyle(ws, 'A5:D5', {
    fgColor: { rgb: FONT_COLOURS.GREY_LIGHT },
    bottom: { style: 'thin', color: { rgb: FONT_COLOURS.GREY } },
  })

  const wideColumn = 23

  // Apply merges
  applyMerges(ws, [{ s: 'B4', e: 'D4' }])

  setColumns(ws, [
    { wch: wideColumn },
    { wch: wideColumn },
    { wch: wideColumn },
    { wch: wideColumn },
  ])
}
