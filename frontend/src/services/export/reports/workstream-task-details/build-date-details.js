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

import { TableCell, TableRow } from 'docx'

import { NO_BORDERS } from '../common/constants-word'
import { FONT_COLOURS } from '../common/constants-colours'
import { FONT_SIZES } from '../common/constants-reports'
import { BACKGROUND_SHADING_GREY } from './common.js'
import {
  buildParagraphTextRun,
  getBlankParagraph,
} from '../common/word-helpers'
import {
  getDateDisplayString,
  getDateDisplayStringUTC,
  getTimeDisplayStringUTC,
} from '../../../helpers/date-helper'

export const buildDateDetails = (t, task) => {
  const addLabeledDate = (label, value) => {
    content.push(
      buildParagraphTextRun(label, {
        fontSize: FONT_SIZES.SMALL,
        fontColor: FONT_COLOURS.GREY,
      }),
      buildParagraphTextRun(getDateDisplayString(value, undefined, true), {
        fontColor: FONT_COLOURS.GREY,
      }),
      getBlankParagraph()
    )
  }

  const content = [getBlankParagraph()]

  if (task.actualStartDate) {
    addLabeledDate(
      t('exports.taskDetails.dates.startedOn'),
      getDateDisplayString(task.actualStartDate, undefined, true)
    )
  } else if (task.plannedStartDate) {
    addLabeledDate(
      t('exports.taskDetails.dates.startingOn'),
      getDateDisplayString(task.plannedStartDate, undefined, true)
    )
  }

  if (task.actualEndDate) {
    addLabeledDate(
      t('exports.taskDetails.dates.completed'),
      getDateDisplayString(task.actualEndDate, undefined, true)
    )
  } else if (task.plannedEndDate) {
    addLabeledDate(
      t('exports.taskDetails.dates.dueToEnd'),
      getDateDisplayString(task.plannedEndDate, undefined, true)
    )
  }

  // Export Date and time.
  const exportTime = new Date()

  content.push(
    buildParagraphTextRun(t('exports.common.exported'), {
      fontColor: FONT_COLOURS.GREY,
    }),
    buildParagraphTextRun(getDateDisplayStringUTC(exportTime), {
      fontColor: FONT_COLOURS.GREY,
    }),
    buildParagraphTextRun(getTimeDisplayStringUTC(exportTime) + ' UTC', {
      fontColor: FONT_COLOURS.GREY,
    })
  )

  return new TableRow({
    borders: NO_BORDERS,
    children: [
      new TableCell({
        margins: { left: 250, top: 0, bottom: 100 },
        borders: NO_BORDERS,
        children: content,
        ...BACKGROUND_SHADING_GREY,
      }),
    ],
  })
}
