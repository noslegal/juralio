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

import { Paragraph, TextRun, Table, TableRow, TableCell, WidthType } from 'docx'

import { NO_BORDERS } from '../common/constants-word'
import { FONTS, FONT_SIZES } from '../common/constants-reports'
import {
  getBlankParagraph,
  buildParagraphTextRun,
} from '../common/word-helpers'

export const buildTaskNameAndDescription = (t, task, content) => {
  content.push(
    getBlankParagraph(),
    new Paragraph({
      children: [
        new TextRun({
          text: task.name,
          size: FONT_SIZES.HEADING,
          font: FONTS.STANDARD_FONT,
        }),
      ],
    }),
    getBlankParagraph()
  )

  if (task.description) {
    content.push(
      new Table({
        borders: NO_BORDERS,
        rows: [
          new TableRow({
            children: [
              new TableCell({
                children: [buildParagraphTextRun(task.description)],
              }),
            ],
          }),
        ],
        width: {
          size: 95,
          type: WidthType.PERCENTAGE,
        },
      }),
      getBlankParagraph()
    )
  }
}
