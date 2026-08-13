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
import { ALIGN_CELL } from '../common/constants-excel'
import { FONT_SIZES, NEW_FONTS as FONTS } from '../common/constants-reports'
import { addCellStyle, setRangeStyle } from '../common/excel-helper'
import {
  setColumns,
  setRows,
  setSheetView,
} from '../common/excel/sheet-builder'
import {
  fieldEntry,
  getHeaderRowHeights,
  labelFormat,
  ReportDataHeaderFormat,
} from '../common/report-header'

const FIRST_TASK_ROW = 7
const FIRST_MEMBER_ROW = 7

export const applyTeamStyle = (t, worksheet, teamCount, isPrivate) => {
  const style = (id, style) => addCellStyle(worksheet, id, style)

  setRangeStyle(worksheet, 'A0:G' + (FIRST_TASK_ROW + teamCount), {
    ...FONTS.STANDARD_FONT,
  })

  setColumns(worksheet, [{ auto: 1 }, { auto: 1 }, { auto: 1 }, { wch: 36 }])
  setRows(worksheet, [...getHeaderRowHeights()])

  // Report Title
  style('A4', { sz: FONT_SIZES.SUBHEADING / 2 })

  // Set style on the Matter, client and project labels.
  style('B1', labelFormat)
  style('B2', labelFormat)
  style('B3', labelFormat)
  if (isPrivate) {
    style('A3', {
      alignment: ALIGN_CELL.CENTERCENTER,
      sz: FONT_SIZES.NORMAL / 2,
      color: { rgb: 'FFFFFF' },
      fgColor: { rgb: '000000' },
    })
  }

  // Set style on the Matter, client and project name.
  style('C1', fieldEntry)
  style('C2', fieldEntry)
  style('C3', fieldEntry)

  style('D2', {
    sz: FONT_SIZES.SMALLER,
    alignment: { ...ALIGN_CELL.CENTERRIGHT, wrapText: true },
  })

  // Downloaded by
  style('D1', {
    alignment: { ...ALIGN_CELL.CENTERRIGHT, wrapText: true },
    sz: FONT_SIZES.SMALL / 2,
    italic: true,
  })

  style('D2', {
    alignment: ALIGN_CELL.TOPRIGHT,
    sz: FONT_SIZES.NORMAL / 2,
  })

  // Format Task Header
  style('A6', ReportDataHeaderFormat)
  style('B6', ReportDataHeaderFormat)
  style('C6', ReportDataHeaderFormat)
  style('D6', ReportDataHeaderFormat)
  style('E6', ReportDataHeaderFormat)
  style('F6', ReportDataHeaderFormat)

  for (let i = FIRST_MEMBER_ROW; i < FIRST_MEMBER_ROW + teamCount; i++) {
    style('A' + i, {
      bottom: { style: 'thin', color: { rgb: FONT_COLOURS.GREY } },
    })
    style('B' + i, {
      bottom: { style: 'thin', color: { rgb: FONT_COLOURS.GREY } },
    })
    style('C' + i, {
      bottom: { style: 'thin', color: { rgb: FONT_COLOURS.GREY } },
    })
    style('D' + i, {
      bottom: { style: 'thin', color: { rgb: FONT_COLOURS.GREY } },
      color: { rgb: FONT_COLOURS.GREY_DARK },
    })
  }
  setSheetView(worksheet, { freeze: 'A7', gridlines: false })
}
