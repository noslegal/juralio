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

import { AlignmentType, ShadingType, Table, TableRow, WidthType } from 'docx'
import { formatReferenceNumber } from '../../../../services/task/task-text-format-service'
import { levelNumberToLetter } from '../../../helpers/task/task-util-helper'
import { FONT_COLOURS, STATUS_COLOURS } from '../common/constants-colours'
import { FONT_SIZES } from '../common/constants-reports'
import { NO_BORDERS } from '../common/constants-word'
import { getTaskStatusText } from '../common/report-text-helpers'
import {
  buildCell,
  buildMultiLineCell,
  getBlankRow,
} from '../common/word-helpers'
import { buildDateDetails } from './build-date-details'
import { buildTeamList } from './build-team-list'
import { BACKGROUND_SHADING_GREY } from './common'

export const buildRHSColumn = (t, task) => {
  const content = []
  const dateDetails = buildDateDetails(t, task)

  content.push(
    getBlankRow(),
    getBlankRow(),
    getBlankRow(),
    getBlankRow(),
    buildLevelAndStatusHeader(t, task),
    getBlankRow(),
    buildDateHeading(t),
    dateDetails,
    getBlankRow()
  )

  if (task.teamMembers.length > 0) {
    content.push(...buildTeamList(t, task))
  }

  return new Table({
    borders: NO_BORDERS,
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    columnWidths: [2000],
    rows: content,
  })
}

const buildLevelAndStatusHeader = (t, task) => {
  return new TableRow({
    children: [
      buildMultiLineCell(
        [
          `${levelNumberToLetter(task.level)}. ${formatReferenceNumber(task)}`,
          `${getTaskStatusText(t, task)}`,
          '',
        ],
        {
          fontColor: FONT_COLOURS.BLACK.main,
          fontSize: FONT_SIZES.LARGER,
          verticalAlignment: AlignmentType.CENTER,
          alignment: AlignmentType.CENTER,
          shading: {
            fill: STATUS_COLOURS[task.status],
            val: ShadingType.CLEAR,
          },
          margins: { top: 150, bottom: 0 },
        }
      ),
    ],
  })
}

const buildDateHeading = t => {
  return new TableRow({
    children: [
      buildCell(t('taskCardContent.keyDatesHeading'), {
        fontSize: FONT_SIZES.SUBHEADING,
        fontColor: FONT_COLOURS.GREY,
        ...BACKGROUND_SHADING_GREY,
        margins: { top: 100, left: 100 },
      }),
    ],
  })
}
