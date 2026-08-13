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

import { TASK_STATUS } from '../../../../app/constants'
import { BACKGROUND_COLOURS, FONT_COLOURS } from '../common/constants-colours'
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
import {
  getEarliestStartTime,
  getEndTime,
  getLatestEndTime,
  getStartTime,
} from './build-roadmap-report'

const columnToLetter = column => {
  let temp,
    letter = ''
  while (column > 0) {
    temp = (column - 1) % 26
    letter = String.fromCharCode(temp + 65) + letter
    column = (column - temp - 1) / 26
  }
  return letter
}

const getColorForStatus = status => {
  switch (status) {
    case TASK_STATUS.NOT_STARTED:
      return 'FCFBE8'
    case TASK_STATUS.IN_PROGRESS:
      return 'F4E1BA'
    case TASK_STATUS.DONE:
      return 'C9E0E1'
    default:
      return 'FFFFFF'
  }
}
const getColorForHighlightedStatus = status => {
  switch (status) {
    case TASK_STATUS.NOT_STARTED:
      return 'DBD9B5'
    case TASK_STATUS.IN_PROGRESS:
      return 'F4E1BA'
    case TASK_STATUS.DONE:
      return 'C9E0E1'
    default:
      return 'FFFFFF'
  }
}
const FIRST_TASK_ROW = 7
const TITLE_ROW = 6
const ROW_LENGTH = 56
const CONTENT_START_CELL = 8

export const applyRoadmapStyle = (t, worksheet, tasks, isPrivate) => {
  const merges = []
  const style = (id, style) => addCellStyle(worksheet, id, style)

  setRangeStyle(worksheet, 'A0:BB' + (FIRST_TASK_ROW + tasks.length), {
    ...FONTS.STANDARD_FONT,
  })

  for (let i = 1; i <= ROW_LENGTH; i++) {
    style(columnToLetter(i) + TITLE_ROW, {
      bottom: { style: 'medium', color: { rgb: FONT_COLOURS.GREY } },
      top: { style: 'medium', color: { rgb: FONT_COLOURS.GREY } },
      fgColor: { rgb: BACKGROUND_COLOURS.TITLE_BLUE },
      sz: FONT_SIZES.SMALLER,
    })
  }

  const startDate = getEarliestStartTime(tasks)
  const endDate = getLatestEndTime(tasks)
  const totalRoadmapCells = 40
  let secondsPerSquare =
    ((endDate.getTime() - startDate.getTime()) * 1000) / totalRoadmapCells

  if (secondsPerSquare === 0) secondsPerSquare = 31684385950 // This is the value taken from a workstream with single date set.

  for (let i = 0; i < tasks.length; i++) {
    const task = tasks[i]
    const status = task.status

    let squaresBefore = 0
    let squaresToFill = 1
    let startTime = getStartTime(task)
    let endTime = getEndTime(task)

    if (startTime !== null && endTime !== null) {
      const secondsFromEarliestToStart =
        (new Date(startTime).getTime() - startDate.getTime()) * 1000
      squaresBefore = Math.floor(secondsFromEarliestToStart / secondsPerSquare)
      if (squaresBefore === 40) {
        squaresBefore = 39
      }
      const taskLengthInSeconds =
        (new Date(endTime).getTime() - new Date(startTime).getTime()) * 1000
      squaresToFill = Math.max(
        1,
        Math.ceil(taskLengthInSeconds / secondsPerSquare)
      )
    }
    if (startTime !== null && endTime === null) {
      const secondsFromEarliestToStart =
        (new Date(startTime).getTime() - startDate.getTime()) * 1000
      squaresBefore = Math.floor(secondsFromEarliestToStart / secondsPerSquare)
      if (squaresBefore === 40) {
        squaresBefore = 39
      }
      squaresToFill = 1
    }
    if (startTime === null && endTime != null) {
      const secondsFromEarliestToEnd =
        (new Date(endTime).getTime() - startDate.getTime()) * 1000
      squaresBefore =
        Math.floor(secondsFromEarliestToEnd / secondsPerSquare) - 1
      if (squaresBefore === 40) {
        squaresBefore = 39
      }
      squaresToFill = 1
    }
    if (startTime == null && endTime == null) {
      const secondsFromEarliestToToday =
        (new Date().getTime() - startDate.getTime()) * 1000
      squaresBefore = Math.floor(secondsFromEarliestToToday / secondsPerSquare)
      if (squaresBefore === 40) {
        squaresBefore = 39
      }
      squaresToFill = 1
    }

    merges.push(
      {
        s:
          columnToLetter(squaresBefore + CONTENT_START_CELL + 1) +
          (TITLE_ROW + 1 + i),
        e:
          columnToLetter(squaresBefore + CONTENT_START_CELL + squaresToFill) +
          (TITLE_ROW + 1 + i),
      },
      {
        s:
          columnToLetter(squaresBefore + CONTENT_START_CELL - 4) +
          (TITLE_ROW + 1 + i),
        e:
          columnToLetter(squaresBefore + CONTENT_START_CELL) +
          (TITLE_ROW + 1 + i),
      },
      {
        s:
          columnToLetter(
            squaresBefore + CONTENT_START_CELL + squaresToFill + 1
          ) +
          (TITLE_ROW + 1 + i),
        e:
          columnToLetter(
            squaresBefore + CONTENT_START_CELL + squaresToFill + 5
          ) +
          (TITLE_ROW + 1 + i),
      }
    )

    // Roadmap Bar display
    for (let j = 1; j < ROW_LENGTH; j++) {
      const column = columnToLetter(j)
      const highlight =
        j > squaresBefore + CONTENT_START_CELL &&
        j < squaresBefore + 8 + squaresToFill + 1

      const isLHSDate =
        j >= squaresBefore + CONTENT_START_CELL - 4 &&
        j <= squaresBefore + CONTENT_START_CELL
      if (!task.isMilestone) {
        style(column + (TITLE_ROW + i + 1), {
          fgColor: {
            rgb: highlight
              ? getColorForHighlightedStatus(status)
              : BACKGROUND_COLOURS.WHITE,
          },
          bottom: { style: 'medium', color: { rgb: FONT_COLOURS.WHITE } },
          alignment: {
            vertical: 'center',
            horizontal: isLHSDate ? 'right' : 'left',
            wordWrap: true,
            shrinkToFit: true,
          },
          sz: FONT_SIZES.SMALLER,
        })
      }
      if (task.isMilestone) {
        style(column + (TITLE_ROW + i + 1), {
          fgColor: {
            rgb: highlight ? '808080' : BACKGROUND_COLOURS.WHITE,
          },
          bottom: { style: 'medium', color: { rgb: FONT_COLOURS.WHITE } },
          alignment: {
            vertical: 'center',
            horizontal: isLHSDate ? 'right' : 'left',
            wordWrap: true,
            shrinkToFit: true,
          },
          sz: FONT_SIZES.SMALLER,
        })
      }

      // Level Letters and Task numbers.
      if (task.level === 1) {
        style('A' + (TITLE_ROW + i + 1), {
          bold: true,
          sz: 10,
        })
        style('B' + (i + TITLE_ROW + 1), {
          bold: true,
          sz: 10,
        })
      } else {
        style('A' + (TITLE_ROW + i + 1), {
          sz: task.level === 2 ? 10 : 8,
        })
        style('B' + (i + TITLE_ROW + 1), {
          sz: task.level === 2 ? 10 : 8,
        })
      }
    }

    // LHS Date Label
    style(
      columnToLetter(squaresBefore + CONTENT_START_CELL - 4) +
        (TITLE_ROW + 1 + i),
      { sz: FONT_SIZES.NORMAL / 2 }
    )
    if (task.isMilestone) {
      style(
        columnToLetter(squaresBefore + CONTENT_START_CELL + 1) +
          (TITLE_ROW + 1 + i),
        {
          sz: FONT_SIZES.SMALL,
          color: { rgb: getColorForHighlightedStatus(task.status) },
        }
      )
    }
    if (isPrivate) {
      style('A3', {
        alignment: ALIGN_CELL.CENTERCENTER,
        sz: FONT_SIZES.NORMAL / 2,
        color: { rgb: 'FFFFFF' },
        fgColor: { rgb: '000000' },
      })
    }

    // RHS Date Label
    style(
      columnToLetter(squaresBefore + CONTENT_START_CELL + squaresToFill + 1) +
        (TITLE_ROW + 1 + i),
      { sz: FONT_SIZES.NORMAL / 2 }
    )
  }

  setColumns(worksheet, [
    { auto: 1 },
    { auto: 1 },
    { auto: 1 },
    ...new Array(4).fill({ wch: 3 }), //start date buffer
    ...new Array(40).fill({ wch: 3 }),
    ...new Array(4).fill({ wch: 3 }), //end date buffer
    { auto: 1 },
    { auto: 1 },
    { auto: 1 },
    { auto: 1 },
    { auto: 1 },
  ])

  setRows(worksheet, [...getHeaderRowHeights()])

  merges.push(
    {
      s: 'B' + TITLE_ROW,
      e: 'AY' + TITLE_ROW,
    },
    { s: 'AA1', e: 'AE1' },
    { s: 'AA2', e: 'AE2' },
    { s: 'AA3', e: 'AE3' },
    { s: 'AA4', e: 'AE4' },
    { s: 'D1', e: 'Z1' },
    { s: 'D2', e: 'Z2' },
    { s: 'D3', e: 'Z3' },
    { s: 'A4', e: 'B4' }
  )
  applyMerges(worksheet, merges)

  setSheetView(worksheet, { freeze: 'A7', gridlines: false })

  style('BB1', {
    alignment: { ...ALIGN_CELL.CENTERRIGHT, wrapText: true },
  })
  style('BB2', {
    alignment: { ...ALIGN_CELL.CENTERRIGHT, wrapText: true },
  })

  // Report Title
  style('A4', { sz: FONT_SIZES.SUBHEADING / 2 })

  // Set style on the Matter, client and project labels.
  style('C1', labelFormat)
  style('C2', labelFormat)
  style('C3', labelFormat)

  // Set style on the Matter, client and project name.
  style('D1', fieldEntry)
  style('D2', fieldEntry)
  style('D3', fieldEntry)

  style('BB2', {
    alignment: ALIGN_CELL.TOPRIGHT,
    sz: FONT_SIZES.NORMAL / 2,
  })

  // Downloaded by
  style('BD1', {
    right: { style: 'thin', color: { rgb: FONT_COLOURS.GREY } },

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
  style('BB6', ReportDataHeaderFormat)
  style('BC6', ReportDataHeaderFormat)
  style('BD6', ReportDataHeaderFormat)

  // Status Task Counts
  style('AA1', {
    fgColor: { rgb: getColorForStatus('not-started') },
    sz: FONT_SIZES.NORMAL / 2,
    alignment: ALIGN_CELL.CENTERCENTER,
  })
  style('AA2', {
    fgColor: { rgb: getColorForStatus('in-progress') },
    sz: FONT_SIZES.NORMAL / 2,
    alignment: ALIGN_CELL.CENTERCENTER,
  })
  style('AA3', {
    fgColor: { rgb: getColorForStatus('done') },
    sz: FONT_SIZES.NORMAL / 2,
    alignment: ALIGN_CELL.CENTERCENTER,
  })
  style('AA4', {
    sz: FONT_SIZES.NORMAL / 2,
    alignment: ALIGN_CELL.CENTERCENTER,
  })
  style('AC4', {
    sz: FONT_SIZES.NORMAL / 2,
    alignment: ALIGN_CELL.CENTERCENTER,
  })

  // Border round totals
  for (let i = 0; i < 5; i++) {
    style(`A${String.fromCharCode(65 + i)}4`, {
      top: { style: 'thin', color: { rgb: '000000' } },
      bottom: { style: 'thin', color: { rgb: '000000' } },
    })
  }
}
