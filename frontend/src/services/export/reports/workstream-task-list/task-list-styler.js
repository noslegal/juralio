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
  fieldEntry,
  getHeaderRowHeights,
  labelFormat,
  ReportDataHeaderFormat,
} from '../common/report-header'

const STATUS_COLOURS_LIGHT = {
  'not-started': 'FCFBE8',
  'in-progress': 'F4E1BA',
  done: 'D0E5E6',
}

const columnToLetter = column => {
  let letterArray = column.trim()
  letterArray = letterArray.split('')
  return String(letterArray[0]).charCodeAt(0) - 65
}

const formatTotalsRow = style => {
  style('E1', {
    fgColor: { rgb: STATUS_COLOURS_LIGHT['not-started'] },
  })
  style('E2', {
    fgColor: { rgb: STATUS_COLOURS_LIGHT['in-progress'] },
  })
  style('E3', {
    fgColor: { rgb: STATUS_COLOURS_LIGHT['done'] },
  })
  style('E4', {
    top: { style: 'thin', color: { rgb: '000000' } },
    bottom: { style: 'thin', color: { rgb: '000000' } },
  })
}

const countStyle = {
  alignment: ALIGN_CELL.CENTERCENTER,
  sz: FONT_SIZES.NORMAL / 2,
}

const FIRST_TASK_ROW = 7

export const applyStyle = (
  ws,
  taskCount,
  taskStatusPerRow,
  taskTeam,
  isPrivate
) => {
  const style = (id, style) => addCellStyle(ws, id, style)
  const taskNameMerges = []
  const teamMerges = []
  const newHeight = []

  taskTeam.forEach(t => {
    newHeight.push({ hpx: 25 + 7 * t })
  })

  // Blanket Apply Font
  setRangeStyle(ws, 'A0:G' + (FIRST_TASK_ROW + taskCount), {
    ...FONTS.STANDARD_FONT,
  })

  //Task list title
  style('A4', { sz: FONT_SIZES.SUBHEADING / 2 })

  if (isPrivate) {
    style('A3', {
      alignment: ALIGN_CELL.CENTERCENTER,
      sz: FONT_SIZES.NORMAL / 2,
      color: { rgb: 'FFFFFF' },
      fgColor: { rgb: '000000' },
    })
  }

  // Set style on the Matter, client and project labels.
  style('B1', labelFormat)
  style('B2', labelFormat)
  style('B3', labelFormat)

  // Set style on the Matter, client and project name.
  style('C1', fieldEntry)
  style('C2', fieldEntry)
  style('C3', fieldEntry)

  // Set style on the Task counts
  style('E1', countStyle)
  style('E2', countStyle)
  style('E3', countStyle)
  style('E4', countStyle)

  style('H1', {
    alignment: { ...ALIGN_CELL.CENTERRIGHT, wrapText: true },
    sz: FONT_SIZES.SMALL / 2,
    italic: true,
  })
  style('G2', {
    alignment: ALIGN_CELL.TOPRIGHT,
    sz: FONT_SIZES.NORMAL / 2,
  })

  // Downloaded by
  style('G4', {
    alignment: { ...ALIGN_CELL.TOPRIGHT, wrapText: true },
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
  style('H6', ReportDataHeaderFormat)

  let counter = 0 //counter to change colour of task cell

  //Format Task Rows
  for (let i = FIRST_TASK_ROW; i < FIRST_TASK_ROW + taskCount + 1; i++) {
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
    style('F' + i, {
      sz: FONT_SIZES.SMALL / 2,
    })
    taskNameMerges.push({
      s: 'B' + i,
      e: 'C' + i,
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
      bottom: { style: 'thin', color: { rgb: FONT_COLOURS.GREY } },
      alignment: ALIGN_CELL.TOPLEFT,
      sz: 10,
    })

    style('E' + i, {
      alignment: ALIGN_CELL.TOPLEFT,
      bottom: { style: 'thin', color: { rgb: FONT_COLOURS.GREY } },
      sz: 10,
      fgColor:
        taskStatusPerRow[counter] === 'done'
          ? { rgb: STATUS_COLOURS_LIGHT['done'] }
          : taskStatusPerRow[counter] === 'in-progress'
            ? { rgb: STATUS_COLOURS_LIGHT['in-progress'] }
            : taskStatusPerRow[counter] === 'not-started'
              ? { rgb: STATUS_COLOURS_LIGHT['not-started'] }
              : { rgb: '#ffffff' },
    })

    style('F' + i, {
      alignment: { ...ALIGN_CELL.TOPLEFT, wrapText: true },
      bottom: { style: 'thin', color: { rgb: FONT_COLOURS.GREY } },
      sz: 8,
    })

    style('G' + i, {
      alignment: { ...ALIGN_CELL.TOPLEFT, wrapText: true },
      bottom: { style: 'thin', color: { rgb: FONT_COLOURS.GREY } },
      sz: 8,
    })
    style('H' + i, {
      alignment: { ...ALIGN_CELL.TOPLEFT, wrapText: true },
      bottom: { style: 'thin', color: { rgb: FONT_COLOURS.GREY } },
      sz: 8,
    })
    counter++
  }

  // Apply merges
  applyMerges(ws, [...taskNameMerges, ...teamMerges])
  formatTotalsRow(style)

  // Set columns in spread sheet - Note mixed use of characters and pixels.
  setColumns(ws, [
    { wpx: 140 }, // Logo
    { wch: 15 }, // Client Matter fields
    { auto: 1 }, // Client Matter entries
    { wch: 10 }, //milestone
    { wpx: 145 }, // Task counts
    { auto: 1 }, // labels
    { auto: 1 }, // Matter and downloader details
    { auto: 1 }, // Matter and downloader details
  ])

  const rowsHeight = [...getHeaderRowHeights()]

  newHeight.forEach(h => {
    rowsHeight.push(h) // Add in the varying height rows for the Teams.
  })
  setRows(ws, rowsHeight)

  // Freeze - This causes a visible border on the header.
  setSheetView(ws, { freeze: 'A7', gridlines: false })
}
