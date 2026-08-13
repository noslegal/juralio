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
  applyMerges,
  setColumns,
  setRows,
  setSheetView,
} from '../common/excel/sheet-builder'
import {
  getHeaderRowHeights,
  ReportDataHeaderFormat,
} from '../common/report-header'

const columnToLetter = column => {
  let letterArray = column.trim()
  letterArray = letterArray.split('')
  return String(letterArray[0]).charCodeAt(0) - 65
}
const FIRST_TASK_ROW = 7

export const applyStyle = (ws, taskCount) => {
  const style = (id, style) => addCellStyle(ws, id, style)

  // Blanket Apply Font
  setRangeStyle(ws, 'A0:G' + (FIRST_TASK_ROW + taskCount), {
    ...FONTS.STANDARD_FONT,
  })

  style('A4', {
    sz: FONT_SIZES.SUBHEADING / 2,
  })
  style('C1', {
    alignment: { ...ALIGN_CELL.CENTERCENTER },
    sz: FONT_SIZES.SUBHEADING / 2,
  })
  // Template Number
  style('F1', {
    alignment: { ...ALIGN_CELL.BOTTOMRIGHT, wrapText: true },
    sz: FONT_SIZES.NORMAL / 2,
  })

  style('F2', {
    alignment: { ...ALIGN_CELL.BOTTOMRIGHT, wrapText: true },
    sz: FONT_SIZES.NORMAL / 2,
  })

  // Downloaded by
  style('F4', {
    alignment: { ...ALIGN_CELL.CENTERRIGHT, wrapText: true },
    sz: FONT_SIZES.SMALL / 2,
    italic: true,
  })

  // Format Task Header
  style('A6', ReportDataHeaderFormat)
  style('B6', ReportDataHeaderFormat)
  style('C6', ReportDataHeaderFormat)
  style('D6', ReportDataHeaderFormat)
  style('E6', ReportDataHeaderFormat)
  style('F6', ReportDataHeaderFormat)
  style('G6', ReportDataHeaderFormat)

  //Format Task Rows
  for (let i = FIRST_TASK_ROW; i < FIRST_TASK_ROW + taskCount; i++) {
    const level = columnToLetter(ws.getCell(`A${i}`).value)

    style('A' + i, {
      bold: level === 0 ? true : false,
      italic: level === 5 ? true : false,
      alignment: { indent: level, ...ALIGN_CELL.TOPLEFT },
      bottom: { style: 'thin', color: { rgb: FONT_COLOURS.GREY } },
      sz:
        level === 0 || level === 1
          ? 14
          : level === 2
            ? 12
            : level === 3
              ? 10
              : 8,
    })

    style('B' + i, {
      bold: level === 0 ? true : false,
      italic: level === 5 ? true : false,
      alignment: ALIGN_CELL.TOPLEFT,
      bottom: { style: 'thin', color: { rgb: FONT_COLOURS.GREY } },
      sz:
        level === 0 || level === 1
          ? 14
          : level === 2
            ? 12
            : level === 3
              ? 10
              : 8,
      color: { rgb: FONT_COLOURS.BLACK.main },
    })

    style('C' + i, {
      bottom: { style: 'thin', color: { rgb: FONT_COLOURS.GREY } },
      sz: 10,
    })

    style('D' + i, {
      alignment: ALIGN_CELL.TOPLEFT,
      bottom: { style: 'thin', color: { rgb: FONT_COLOURS.GREY } },
      sz: 10,
    })

    style('E' + i, {
      alignment: { ...ALIGN_CELL.TOPLEFT, wrapText: true },
      bottom: { style: 'thin', color: { rgb: FONT_COLOURS.GREY } },
      sz: 8,
    })

    style('F' + i, {
      alignment: { ...ALIGN_CELL.TOPLEFT, wrapText: true },
      bottom: { style: 'thin', color: { rgb: FONT_COLOURS.GREY } },
      sz: 8,
    })
  }

  // Set columns in spread sheet - Note mixed use of characters and pixels.
  setColumns(ws, [
    { wpx: 140 }, // Logo
    { wch: 30 }, // Task name
    { wch: 43 }, // Gap
    { wpx: 145 }, // Gap
    { wch: 5 }, // Gap
    { wch: 30 }, // Downloader details
  ])

  applyMerges(ws, [{ s: 'A4', e: 'B4' }])

  const rowsHeight = [...getHeaderRowHeights()]
  setRows(ws, rowsHeight)

  // Freeze - This causes a visible border on the header.
  setSheetView(ws, { freeze: 'A7', gridlines: false })
}
