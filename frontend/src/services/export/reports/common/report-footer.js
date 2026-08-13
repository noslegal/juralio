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

import { Footer, PageNumber, Paragraph, TextRun } from 'docx'
import { DATE_FORMAT_FULL } from '../../../../app/constants'
import { getDateDisplayString } from '../../../helpers/date-helper'
import { FONTS } from './constants-reports'

export const buildFooter = t => {
  return new Footer({
    children: [
      new Paragraph({
        children: [
          new TextRun({
            text: t('exports.reportDownload.footer.exportedFrom', {
              date: getDateDisplayString(new Date(), DATE_FORMAT_FULL, true),
            }),
            font: FONTS.STANDARD_FONT.name,
          }),
          new TextRun({
            font: FONTS.STANDARD_FONT.name,
            children: [
              `${new Array(100).join(' ')}Page `,
              PageNumber.CURRENT,
              ' of ',
              PageNumber.TOTAL_PAGES,
            ],
          }),
        ],
      }),
    ],
  })
}
