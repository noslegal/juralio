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

import { AlignmentType, Table, TableRow, WidthType, ShadingType } from 'docx'

import {
  FONT_COLOURS,
  BACKGROUND_COLOURS,
  STATUS_COLOURS,
} from '../common/constants-colours'

import {
  buildParagraphTextRun,
  getBlankParagraph,
  buildCell,
  buildRawCell,
} from '../common/word-helpers'

import { EXPORT_MARGINS, NO_BORDERS } from '../common/constants-word'
import { FONT_SIZES } from '../common/constants-reports'

import { getBlankRow } from '../common/word-helpers'
import { getTaskStatusText } from '../common/report-text-helpers'
import { levelNumberToLetter } from '../../../helpers/task/task-util-helper'
import { getStatusColour } from '../../../helpers/task/task-status-colour-helper'

import { formatUserDisplayName } from '../../../user/helper/user-format-service'
import { formatReferenceNumber } from '../../../../services/task/task-text-format-service'
import {
  getDateDisplayString,
  getTimeDisplayStringSecondsUTC,
} from '../../../helpers/date-helper'

const pointsToMargins = 20

const rhsMargins = {
  top: 6 * pointsToMargins,
  left: 6 * pointsToMargins,
  right: 6 * pointsToMargins,
  bottom: 6 * pointsToMargins,
}

const beigeBackground = {
  shading: {
    color: FONT_COLOURS.BEIGE,
    val: ShadingType.SOLID,
  },
}

const row = children =>
  new TableRow({ children: Array.isArray(children) ? children : [children] })

const buildDateCreated = (t, post) =>
  new TableRow({
    children: [
      buildRawCell([
        buildParagraphTextRun('    ' + t('exports.common.created'), {
          size: FONT_SIZES.SMALL,
          color: FONT_COLOURS.BLACK[200],
        }),
        buildParagraphTextRun(
          '   ' +
            getDateDisplayString(Date.parse(post.dateCreated), undefined, true),
          { size: FONT_SIZES.LARGER, color: FONT_COLOURS.BLACK[200] }
        ),
      ]),
    ],
  })

const buildDateExported = t => {
  const exportDate = new Date()

  return new TableRow({
    children: [
      buildRawCell([
        buildParagraphTextRun('    ' + t('exports.common.exported'), {
          size: FONT_SIZES.SMALL,
          color: FONT_COLOURS.BLACK[200],
        }),
        buildParagraphTextRun(
          '   ' + getDateDisplayString(exportDate, undefined, true),
          {
            size: FONT_SIZES.LARGER,
            color: FONT_COLOURS.BLACK[200],
          }
        ),
        buildParagraphTextRun(
          '   ' +
            `UTC ${getTimeDisplayStringSecondsUTC(
              exportDate,
              undefined,
              true
            )}`,
          {
            size: FONT_SIZES.LARGER,
            color: FONT_COLOURS.BLACK[200],
          }
        ),
      ]),
    ],
  })
}

const buildTaskSummary = (t, task) =>
  new TableRow({
    children: [
      buildRawCell([
        buildParagraphTextRun('    ' + t('exports.posts.tableHeadings.task'), {
          size: FONT_SIZES.SMALL,
          color: FONT_COLOURS.BLACK[200],
        }),
        buildParagraphTextRun(
          '   ' +
            `${levelNumberToLetter(task.level)} . ${formatReferenceNumber(
              task
            )}`,
          {
            size: FONT_SIZES.LARGER,
            color: getStatusColour(task.status),
          }
        ),
        buildParagraphTextRun(`   ${getTaskStatusText(t, task)}`, {
          size: FONT_SIZES.LARGER,
          color: getStatusColour(task.status),
        }),
        buildParagraphTextRun('   ' + task.name, {
          size: FONT_SIZES.LARGER,
          color: FONT_COLOURS.BLACK[200],
        }),
        getBlankParagraph(),
      ]),
    ],
  })

const buildPostDetailsPanel = (t, task, post) =>
  row(
    buildRawCell(
      new Table({
        borders: NO_BORDERS,
        margins: rhsMargins,
        width: {
          size: 100,
          type: WidthType.PERCENTAGE,
        },
        columnWidths: [2000],
        rows: [
          row(
            buildCell(
              post.startTime
                ? t('exports.posts.tableHeadings.meetingNoteDetails')
                : t('exports.posts.tableHeadings.postDetails'),
              {
                runOptions: {
                  color: FONT_COLOURS.GREY,
                  size: FONT_SIZES.SUBHEADING,
                },
              }
            )
          ),
          buildDateCreated(t, post),
          buildDateExported(t),
          buildTaskSummary(t, task),
        ],
      }),
      beigeBackground
    )
  )

const buildAuthorsPanel = (t, post) => {
  const sortedAuthors = [...post.authors]
  sortedAuthors.sort((a, b) => a.user.lastname.localeCompare(b.user.lastname))

  return row(
    buildRawCell(
      new Table({
        borders: NO_BORDERS,
        margins: rhsMargins,
        width: {
          size: 100,
          type: WidthType.PERCENTAGE,
        },
        columnWidths: [2000],
        rows: [
          row(
            buildCell(t('exports.posts.tableHeadings.authors'), {
              runOptions: {
                color: FONT_COLOURS.GREY,
                size: FONT_SIZES.SUBHEADING,
              },
            })
          ),
          new TableRow({
            children: [
              buildRawCell([
                ...sortedAuthors.map(a =>
                  buildParagraphTextRun(
                    '    ' + formatUserDisplayName(a.user),
                    {
                      size: FONT_SIZES.NORMAL,
                      color: FONT_COLOURS.BLACK[200],
                    }
                  )
                ),
                getBlankParagraph(),
              ]),
            ],
          }),
        ],
      }),
      beigeBackground
    )
  )
}

const redBackground = {
  shading: {
    color: BACKGROUND_COLOURS.RED,
    val: ShadingType.SOLID,
  },

  alignment: AlignmentType.CENTER,
  margins: EXPORT_MARGINS,
  runOptions: {
    allCaps: true,
    color: FONT_COLOURS.BEIGE,
    size: FONT_SIZES.SUBHEADING,
  },
}

const buildDraftFinalLabel = (t, post) => {
  const { finalised } = post

  return row(
    buildCell(
      t(
        'exports.posts.tableHeadings.draftOrFinal' +
          (finalised ? '_finalised' : '')
      ),
      {
        ...redBackground,
        ...(finalised
          ? {
              shading: { ...redBackground.shading, color: STATUS_COLOURS.done },
            }
          : {}),
      }
    )
  )
}

const greyBackground = {
  shading: {
    color: FONT_COLOURS.GREY,
    val: ShadingType.SOLID,
  },
  alignment: AlignmentType.CENTER,
  margins: EXPORT_MARGINS,
  runOptions: {
    allCaps: true,
    color: FONT_COLOURS.BEIGE,
    size: FONT_SIZES.SUBHEADING,
  },
}

const buildNoteOrMeetingNoteOrLinkPrivacyLabel = (t, post) =>
  row(
    buildCell(
      t(
        `exports.posts.tableHeadings.${
          post.url ? 'link' : post.type === 'Meeting' ? 'meeting_note' : 'note'
        }_${post.privatePost ? 'private' : 'public'}`
      ),
      greyBackground
    )
  )

export const buildRHSColumn = (t, task, post) =>
  new Table({
    borders: NO_BORDERS,
    width: {
      size: 100,
      type: WidthType.PERCENTAGE,
    },
    columnWidths: [2000],
    rows: [
      buildDraftFinalLabel(t, post),
      getBlankRow(),
      buildNoteOrMeetingNoteOrLinkPrivacyLabel(t, post),
      getBlankRow(),
      buildPostDetailsPanel(t, task, post),
      getBlankRow(),
      buildAuthorsPanel(t, post),
    ],
  })
