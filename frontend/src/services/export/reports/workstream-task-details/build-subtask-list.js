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

import { AlignmentType, Table, TableRow, WidthType } from 'docx'

import { TASK_STATUS } from '../../../../app/constants'
import { FONTS, FONT_SIZES } from '../common/constants-reports'
import { BOTTOM_BORDER } from '../common/constants-word'
import { FONT_COLOURS, STATUS_COLOURS } from '../common/constants-colours'
import {
  TABLE_HEADER_FORMATTING,
  TABLE_HEADER_HEIGHT_OPTIONS,
  TABLE_ROW_HEIGHT_OPTIONS,
  TABLE_FIRST_COLUMN_FORMATTING,
  TABLE_HEADER_FIRST_COLUMN_FORMATTING,
} from './common.js'
import {
  buildCell,
  buildMultiLineCell,
  buildParagraphTextRun,
} from '../common/word-helpers'
import { getPercentageWidth, getBlankParagraph } from '../common/word-helpers'
import { getDateDisplayString } from '../../../helpers/date-helper'
import { getDisplayDate } from '../common/report-date-helpers'
import { getTaskStatusText } from '../common/report-text-helpers'

import { getTasksByStatus } from '../../../../app/task-details/SubTaskPanelContainer'
import { formatReferenceNumber } from '../../../../services/task/task-text-format-service'

export const buildSubtaskList = (t, task, content) => {
  const taskCount = task.tasks.length
  content.push(
    getBlankParagraph(),
    buildParagraphTextRun(
      `${taskCount} ${t('entity.subtask', { count: taskCount })}`,
      {
        font: FONTS.STANDARD_FONT,
        fontColor: FONT_COLOURS.GREY,
        fontSize: FONT_SIZES.SUBHEADING,
      }
    ),
    getBlankParagraph()
  )
  const subtaskTableRows = []
  const subtaskTableHeader = new TableRow({
    height: TABLE_HEADER_HEIGHT_OPTIONS,
    children: [
      buildCell(t('exports.tableHeadings.taskId'), {
        ...TABLE_HEADER_FORMATTING,
        ...TABLE_HEADER_FIRST_COLUMN_FORMATTING,
      }),
      buildCell(t('common.name'), TABLE_HEADER_FORMATTING),
      buildCell(t('exports.tableHeadings.completion'), {
        ...TABLE_HEADER_FORMATTING,
        alignment: AlignmentType.RIGHT,
      }),
    ],
  })

  const tableCellFormatting = {
    borders: BOTTOM_BORDER,
  }

  const sortedTasks = [
    ...getTasksByStatus(task.tasks, TASK_STATUS.DONE),
    ...getTasksByStatus(task.tasks, TASK_STATUS.IN_PROGRESS),
    ...getTasksByStatus(task.tasks, TASK_STATUS.NOT_STARTED),
  ]

  sortedTasks.forEach(task => {
    const displayDate = getDisplayDate(task)
    const completionDate = displayDate
      ? getDateDisplayString(displayDate, undefined, true)
      : ''

    subtaskTableRows.push(
      new TableRow({
        height: TABLE_ROW_HEIGHT_OPTIONS,
        children: [
          buildCell(formatReferenceNumber(task), {
            ...getPercentageWidth(20),
            ...tableCellFormatting,
            ...TABLE_FIRST_COLUMN_FORMATTING,
            fontColor: STATUS_COLOURS[task.status],
          }),
          buildCell(task.name, {
            ...getPercentageWidth(60),
            ...tableCellFormatting,
          }),
          buildMultiLineCell([getTaskStatusText(t, task), completionDate], {
            alignment: AlignmentType.RIGHT,
            ...getPercentageWidth(15),
            ...tableCellFormatting,
            fontColor: STATUS_COLOURS[task.status],
          }),
        ],
      })
    )
  })

  const subTaskTable = new Table({
    width: {
      size: 95,
      type: WidthType.PERCENTAGE,
    },
    rows: [subtaskTableHeader, ...subtaskTableRows],
  })
  content.push(subTaskTable, getBlankParagraph())
}
