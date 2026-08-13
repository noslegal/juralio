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

import { ALIGN_CELL } from '../common/constants-excel'
import { FONT_SIZES } from '../common/constants-reports'

import { FONT_COLOURS, BACKGROUND_COLOURS } from '../common/constants-colours'

const extraHeight = 30

export const getHeaderRowHeights = () => {
  const rowsHeight = [
    { hpx: extraHeight },
    { hpx: extraHeight },
    { hpx: extraHeight },
    { hpx: extraHeight + 5 },
    { hpx: extraHeight },
    { hpx: extraHeight + 5 },
  ]

  return rowsHeight
}

export const labelFormat = {
  alignment: ALIGN_CELL.CENTERRIGHT,
  sz: FONT_SIZES.NORMAL / 2,
}

export const fieldEntry = {
  alignment: ALIGN_CELL.CENTERLEFT,
  sz: FONT_SIZES.NORMAL / 2,
  bold: true,
}

export const ReportDataHeaderFormat = {
  sz: FONT_SIZES.LARGE / 2,
  bold: true,
  bottom: { style: 'medium', color: { rgb: FONT_COLOURS.GREY } },
  top: { style: 'medium', color: { rgb: FONT_COLOURS.GREY } },
  fgColor: { rgb: BACKGROUND_COLOURS.TITLE_BLUE },
  alignment: ALIGN_CELL.CENTERLEFT,
}
