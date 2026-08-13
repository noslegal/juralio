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

import { FONT_COLOURS } from '../common/constants-colours'
import { NO_BORDERS } from '../common/constants-word'
import { TABLE_HEADER_FIRST_COLUMN_FORMATTING } from './common.js'
import { formatUserDisplayName } from '../../../user/helper/user-format-service'
import {
  buildCell,
  buildParagraphTextRun,
  getBlankParagraph,
} from '../common/word-helpers'

import { FONT_SIZES } from '../common/constants-reports'
import { BACKGROUND_SHADING_GREY } from './common.js'

export const buildTeamList = (t, task) => {
  const content = [getBlankParagraph()]

  task.teamMembers.forEach(teamMember => {
    content.push(
      buildParagraphTextRun(formatUserDisplayName(teamMember), {
        fontColor: FONT_COLOURS.GREY,
      })
    )
  })

  return [
    buildTeamHeading(t),
    new TableRow({
      children: [
        new TableCell({
          margins: { ...TABLE_HEADER_FIRST_COLUMN_FORMATTING.margins, top: 0 },
          borders: NO_BORDERS,
          children: content,
          ...BACKGROUND_SHADING_GREY,
        }),
      ],
    }),
  ]
}

const buildTeamHeading = t => {
  return new TableRow({
    children: [
      buildCell(t('taskTeamMembers.header'), {
        margins: { top: 100, left: 100 },
        fontSize: FONT_SIZES.SUBHEADING,
        fontColor: FONT_COLOURS.GREY,
        ...BACKGROUND_SHADING_GREY,
      }),
    ],
  })
}
