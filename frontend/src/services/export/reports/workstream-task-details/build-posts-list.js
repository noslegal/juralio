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

import {
  TABLE_HEADER_FORMATTING,
  TABLE_HEADER_HEIGHT_OPTIONS,
  TABLE_ROW_HEIGHT_OPTIONS,
  TABLE_FIRST_COLUMN_FORMATTING,
  TABLE_HEADER_FIRST_COLUMN_FORMATTING,
} from './common.js'
import { FONTS, FONT_SIZES } from '../common/constants-reports'
import { BOTTOM_BORDER } from '../common/constants-word'
import { FONT_COLOURS } from '../common/constants-colours'

import { buildCell } from '../common/word-helpers'
import { formatUserDisplayName } from '../../../user/helper/user-format-service'
import {
  buildImageCell,
  buildMultiLineCell,
  buildParagraphTextRun,
  getBlankParagraph,
  getPercentageWidth,
} from '../common/word-helpers'
import { postIcons } from '../common/image-helpers'
import { getDateDisplayString } from '../../../helpers/date-helper'

const tableCellFormatting = {
  borders: BOTTOM_BORDER,
}

const NAME_COLUMN_FORMATTING = { margins: { left: 200 } }

export const buildPostsList = (t, posts, content) => {
  const postCount = posts.filter(post => post.privatePost === false).length
  content.push(
    getBlankParagraph(),
    buildParagraphTextRun(
      `${postCount} ${t('entity.post', { count: postCount })}`,
      {
        font: FONTS.STANDARD_FONT,
        fontColor: FONT_COLOURS.GREY,
        fontSize: FONT_SIZES.SUBHEADING,
      }
    ),
    getBlankParagraph()
  )

  const postsTableRows = []

  const postsTableHeader = new TableRow({
    height: TABLE_HEADER_HEIGHT_OPTIONS,
    children: [
      buildCell(t('exports.tableHeadings.type'), {
        ...TABLE_HEADER_FORMATTING,
        ...TABLE_FIRST_COLUMN_FORMATTING,
        ...TABLE_HEADER_FIRST_COLUMN_FORMATTING,
      }),
      buildCell(t('common.name'), {
        ...TABLE_HEADER_FORMATTING,
        ...NAME_COLUMN_FORMATTING,
      }),
      buildCell(t('exports.tableHeadings.lastUpdated'), {
        ...TABLE_HEADER_FORMATTING,
        alignment: AlignmentType.RIGHT,
      }),
    ],
  })

  posts.forEach(post => {
    if (!post.privatePost)
      postsTableRows.push(
        new TableRow({
          height: TABLE_ROW_HEIGHT_OPTIONS,
          children: [
            buildImageCell(getPostImage(post.type), {
              ...getPercentageWidth(10),
              ...tableCellFormatting,
              margins: { top: 150 },
            }),
            buildCell(post.name, {
              ...getPercentageWidth(65),
              ...tableCellFormatting,
              ...NAME_COLUMN_FORMATTING,
            }),
            buildMultiLineCell(
              [
                `${t('exports.taskDetails.posts.by')} ${formatUserDisplayName(
                  post.creator
                )}`,
                getDateDisplayString(post.lastUpdated, undefined, true),
              ],
              {
                ...getPercentageWidth(25),
                alignment: AlignmentType.RIGHT,
                ...tableCellFormatting,
              }
            ),
          ],
        })
      )
  })

  const postsTable = new Table({
    width: {
      size: 95,
      type: WidthType.PERCENTAGE,
    },
    rows: [postsTableHeader, ...postsTableRows],
  })

  content.push(postsTable, getBlankParagraph())
}

const getPostImage = postType => {
  if (postType === 'Word document') return postIcons.getWordIcon()
  if (postType === 'Excel sheet') return postIcons.getExcelIcon()
  if (postType === 'Powerpoint deck') return postIcons.getPowerpointIcon()
  if (postType === 'Link') return postIcons.getLinkIcon()
  if (postType === 'Email') return postIcons.getEmailIcon()
  if (postType === 'Image') return postIcons.getImageIcon()
  if (postType === 'Video') return postIcons.getVideoIcon()
  return postIcons.getNoteIcon()
}
