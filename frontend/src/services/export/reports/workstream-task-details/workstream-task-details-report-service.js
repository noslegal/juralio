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

import {
  convertMillimetersToTwip,
  Document,
  Packer,
  Paragraph,
  TextRun,
} from 'docx'
import { saveAs } from 'file-saver'
import {
  DATE_FORMAT_FULL,
  LABEL_TYPES,
  TASK_STATUS,
} from '../../../../app/constants'
import { getDateDisplayString } from '../../../helpers/date-helper'
import {
  getSiblings,
  getSiblingTaskCount,
} from '../../../helpers/task/task-util-helper'
import { flatTaskListFromTree } from '../../../task/data-provider/task-list-data-provider'
import { formatReferenceNumber } from '../../../task/task-text-format-service'
import { formatUserDisplayName } from '../../../user/helper/user-format-service'
import { EXPORT_FORMATS, FONTS } from '../common/constants-reports'
import { EXPORT_MARGINS } from '../common/constants-word'
import { generateDownloadFilename } from '../common/file-name-helpers'
import { buildFooter } from '../common/report-footer'
import { getTaskReferenceAndName } from '../common/report-text-helpers'
import { convertHTMLToDocX } from '../post/html-to-docx-conversion-helpers'
import { buildHeader } from './build-header'

const buildReport = async (t, reportData, options) => {
  const { task, matter, project, posts } = reportData
  const includePosts = options.includePosts

  const taskReferenceAndName = getTaskReferenceAndName(t, task)
  const downloadFilename = generateDownloadFilename(
    taskReferenceAndName,
    EXPORT_FORMATS.WORD
  )

  const getStatusColour = status => {
    switch (status) {
      case TASK_STATUS.NOT_STARTED:
        return 'dbd9b5'
      case TASK_STATUS.IN_PROGRESS:
        return 'fff2cc'
      case TASK_STATUS.DONE:
        return '73afb2'
      default:
        return 'lightGray'
    }
  }
  const integerToWordLimitTen = int => {
    switch (int) {
      case 1:
        return 'one'
      case 2:
        return 'two'
      case 3:
        return 'three'
      case 4:
        return 'four'
      case 5:
        return 'five'
      case 6:
        return 'six'
      case 7:
        return 'seven'
      case 8:
        return 'eight'
      case 9:
        return 'nine'
      case 10:
        return 'ten'
      default:
        return int
    }
  }

  const generateTeamMembers = task => {
    let teamMemberItems = []
    for (let i = 0; i < task.teamMembers.length; i++) {
      teamMemberItems.push(
        new TextRun({
          break: i > 0 ? 0 : 1,
          text: `${formatUserDisplayName(task.teamMembers[i])}`,
          font: FONTS.STANDARD_FONT.name,
          bold: true,
        })
      )
      teamMemberItems.push(
        new TextRun({
          text: `${i < task.teamMembers.length - 2 ? ', ' : ''}${
            i === task.teamMembers.length - 2 ? ' and ' : ''
          }`,
          font: FONTS.STANDARD_FONT.name,
        })
      )
    }
    teamMemberItems.push(
      new TextRun({
        text:
          task.teamMembers.length > 1
            ? ' are responsible for it.'
            : ' is responsible for it.',
        font: FONTS.STANDARD_FONT.name,
      })
    )

    return teamMemberItems
  }

  const generateLabels = labels => {
    const getLabelColour = label => {
      if (label.type === LABEL_TYPES.USER_DEFINED) {
        return 'd9d9d9'
      }
      if (label.type === LABEL_TYPES.WORKFLOW) {
        return '000000'
      }
      if (label.type === LABEL_TYPES.RISK) {
        if (label.modifier === 'amber') {
          return 'bf9001'
        }
        if (label.modifier === 'green') {
          return '69a84f'
        }
        return 'ff0201'
      }
      return 'red'
    }
    const generatedLabels = []
    for (let i = 0; i < labels.length; i++) {
      generatedLabels.push(
        new TextRun({
          text: ` ${labels[i].type === LABEL_TYPES.USER_DEFINED ? '#' : ''}${
            labels[i].name
          } `,
          color: labels[i].type === LABEL_TYPES.WORKFLOW ? 'ffffff' : '000000',
          shading: {
            fill: getLabelColour(labels[i]),
          },
          size: 16,
          font: FONTS.STANDARD_FONT.name,
        })
      )
      generatedLabels.push(
        new TextRun({
          text: ` `,
        })
      )
    }
    return generatedLabels
  }

  const generateDates = task => {
    let dateItems = []
    const noDates =
      !task.plannedStartDate &&
      !task.actualStartDate &&
      !task.plannedEndDate &&
      !task.actualEndDate
    if (noDates) {
      dateItems.push(
        new TextRun({
          text: t('exports.reportDownload.taskDetails.noDates'),
          break: 2,
          size: 22,
          font: FONTS.STANDARD_FONT.name,
        })
      )
    }
    if (noDates) {
      return dateItems
    }
    dateItems.push(
      new TextRun({
        text: t('exports.reportDownload.taskDetails.thisTask'),
        break: 2,
        size: 22,
        font: FONTS.STANDARD_FONT.name,
      })
    )

    if (task.plannedStartDate && !task.actualStartDate) {
      dateItems.push(
        new TextRun({
          text: t('exports.reportDownload.taskDetails.dueToStart'),
          size: 22,
          font: FONTS.STANDARD_FONT.name,
        })
      )
      dateItems.push(
        new TextRun({
          text: getDateDisplayString(
            task.plannedStartDate,
            DATE_FORMAT_FULL,
            true
          ),
          size: 22,
          font: FONTS.STANDARD_FONT.name,
          bold: true,
        })
      )
    }
    if (task.actualStartDate) {
      dateItems.push(
        new TextRun({
          text: t('exports.reportDownload.taskDetails.wasStartedOn'),
          size: 22,
          font: FONTS.STANDARD_FONT.name,
        })
      )
      dateItems.push(
        new TextRun({
          text: getDateDisplayString(
            task.actualStartDate,
            DATE_FORMAT_FULL,
            true
          ),
          size: 22,
          bold: true,
          font: FONTS.STANDARD_FONT.name,
        })
      )
    }
    if (task.plannedEndDate || task.actualEndDate) {
      if (task.plannedStartDate || task.actualStartDate) {
        dateItems.push(new TextRun({ text: ' and', size: 22 }))
      }
      if (task.plannedEndDate && !task.actualEndDate) {
        dateItems.push(
          new TextRun({
            text: t('exports.reportDownload.taskDetails.dueToBeFinished'),
            size: 22,
            font: FONTS.STANDARD_FONT.name,
          })
        )
        dateItems.push(
          new TextRun({
            text: getDateDisplayString(
              task.plannedEndDate,
              DATE_FORMAT_FULL,
              true
            ),
            size: 22,
            bold: true,
            font: FONTS.STANDARD_FONT.name,
          })
        )
      }
      if (task.actualEndDate) {
        dateItems.push(
          new TextRun({
            text: t('exports.reportDownload.taskDetails.finishedOn'),
            size: 22,
          })
        )
        dateItems.push(
          new TextRun({
            text: getDateDisplayString(
              task.actualEndDate,
              DATE_FORMAT_FULL,
              true
            ),
            size: 22,
            bold: true,
            font: FONTS.STANDARD_FONT.name,
          })
        )
      }
    }
    //no dates
    //due to start
    // due to fiinish
    //started o nand finished on
    return dateItems
  }

  const getPostsTable = (posts = [], includePosts = true) => {
    if (!includePosts) {
      return []
    }

    const getPeopleString = authors => {
      let returnString = []
      for (let i = 0; i < Math.min(2, authors.length); i++) {
        returnString.push(formatUserDisplayName(authors[i]))

        if (i === 0) {
          if (authors.length > 2) {
            returnString.push(', ')
          } else if (authors.length === 2) {
            returnString.push(' and ')
          }
        }
      }
      if (authors.length > 2) {
        returnString.push(
          ` and ${integerToWordLimitTen(authors.length - 2)} more`
        )
      }

      return returnString.join('')
    }

    const genericRow = post => {
      const showBrackets = post.privatePost || !post.finalised
      return new Paragraph({
        children: [
          new TextRun({
            text: post.type || 'Note',
            font: FONTS.STANDARD_FONT.name,
            break: 1,
            size: 20,
          }),
          new TextRun({
            text: ' : ',
            font: FONTS.STANDARD_FONT.name,
            size: 20,
          }),
          new TextRun({
            text: post.name,
            font: FONTS.STANDARD_FONT.name,
            size: 20,
          }),
          new TextRun({
            text: ' : ',
            font: FONTS.STANDARD_FONT.name,
            size: 20,
          }),
          new TextRun({
            text: getDateDisplayString(
              post.lastUpdated,
              DATE_FORMAT_FULL,
              true
            ),
            font: FONTS.STANDARD_FONT.name,
            size: 20,
          }),
          new TextRun({
            text: ' : ',
            font: FONTS.STANDARD_FONT.name,
            size: 20,
          }),
          new TextRun({
            text: getPeopleString(post.authors),
            font: FONTS.STANDARD_FONT.name,
            size: 20,
          }),
          new TextRun({
            font: FONTS.STANDARD_FONT.name,
            size: 20,
            text: showBrackets
              ? ` (${post.privatePost ? 'Private' : ''}${
                  post.privatePost && !post.finalised ? ' ' : ''
                }${!post.finalised ? 'Draft' : ''})`
              : '',
          }),
        ],
      })
    }

    const generateRows = posts => {
      let rows = []
      for (let i = 0; i < posts.length; i++) {
        rows.push(genericRow(posts[i]))
      }

      return rows
    }

    const postHeader = new Paragraph({
      children: [
        new TextRun({
          text: `This task contains ${integerToWordLimitTen(
            posts.length
          )} posts:`,
          break: 2,
          bold: true,
          size: 22,
          font: FONTS.STANDARD_FONT.name,
        }),
      ],
    })
    if (posts.length === 0 || !posts) {
      return [
        new Paragraph({
          children: [
            new TextRun({
              text: t('exports.reportDownload.taskDetails.noPosts'),
              break: 2,
              bold: true,
              size: 22,
              font: FONTS.STANDARD_FONT.name,
            }),
          ],
        }),
      ]
    }

    return [postHeader, ...generateRows(posts)]
  }

  const getTaskDetails = async () => {
    let details = []

    details.push(
      new Paragraph({
        children: [
          new TextRun({
            text: 'This task:',
            font: FONTS.STANDARD_FONT.name,
            break: 1,
            bold: true,
            size: 22,
          }),
        ],
      })
    )
    const tasks = task.tasks.filter(t => !t.isMilestone)
    let subtasks = [
      new TextRun({
        font: FONTS.STANDARD_FONT.name,
        text: `\thas ${
          tasks.length > 1
            ? integerToWordLimitTen(tasks.length)
            : tasks.length === 0
              ? 'no'
              : 'one'
        } direct subtasks${tasks.length > 0 ? ': ' : ''}`,
      }),
    ]
    if (tasks.length > 0) {
      for (let i = 0; i < tasks.length; i++) {
        if (i > 0 && i < tasks.length - 1) {
          subtasks.push(
            new TextRun({ text: ', ', font: FONTS.STANDARD_FONT.name })
          )
        }
        if (i === tasks.length - 1 && i > 0) {
          subtasks.push(
            new TextRun({ text: ' and ', font: FONTS.STANDARD_FONT.name })
          )
        }
        subtasks.push(
          new TextRun({
            text: tasks[i].name,
            bold: true,
            font: FONTS.STANDARD_FONT.name,
          })
        )
      }
    }
    details.push(
      new Paragraph({
        children: subtasks,
      })
    )
    const indirect = flatTaskListFromTree(task)
    if (
      indirect.filter(t => !t.isMilestone).length -
        task.tasks.filter(t => !t.isMilestone).length >
      0
    ) {
      details.push(
        new Paragraph({
          children: [
            new TextRun({
              font: FONTS.STANDARD_FONT.name,
              text: `\thas another ${integerToWordLimitTen(
                indirect.filter(t => !t.isMilestone).length -
                  task.tasks.filter(t => !t.isMilestone).length
              )} indirect subtasks`,
            }),
          ],
        })
      )
    }
    const milestones = indirect.filter(t => t.isMilestone)
    if (milestones.length > 0) {
      details.push(
        new Paragraph({
          children: [
            new TextRun({
              font: FONTS.STANDARD_FONT.name,
              text: `\tincludes ${integerToWordLimitTen(
                indirect.filter(t => t.isMilestone).length
              )} milestones`,
            }),
          ],
        })
      )
    }

    if (task.datesLinkedToSiblings) {
      let siblings = await getSiblings(matter.id, project.id, task.id)
      let linkedSiblings = []
      for (let i = 0; i < siblings.length; i++) {
        if (siblings[i].datesLinkedToSiblings) {
          if (linkedSiblings.length > 0) {
            linkedSiblings.push(
              new TextRun({ text: ', ', font: FONTS.STANDARD_FONT.name })
            )
          }
          linkedSiblings.push(
            new TextRun({
              text: siblings[i].name,
              bold: true,
              font: FONTS.STANDARD_FONT.name,
            })
          )
        }
      }
      if (linkedSiblings.length > 2) {
        linkedSiblings.splice(-2, 1, ' and ')
      }

      details.push(
        new Paragraph({
          children: [
            new TextRun({
              font: FONTS.STANDARD_FONT.name,
              text: `\thas dates linked to ${integerToWordLimitTen(
                getSiblingTaskCount(siblings)
              )} task${siblings.length > 1 ? 's' : ''}: `,
            }),
            ...linkedSiblings,
          ],
        })
      )

      // details = [...details, ...linkedSiblings]
    }
    return details
  }

  const generateTitle = task => {
    let children = [
      new TextRun({
        text: task.name,
        bold: true,
        font: FONTS.STANDARD_FONT.name,
        size: 48,
      }),
    ]
    children.push(
      new TextRun({
        break: 2,
        text: ` ${task.status} `,
        shading: {
          fill: getStatusColour(task.status),
        },
        size: 24,
        font: FONTS.STANDARD_FONT.name,
      })
    )
    if (task.labels && task.labels.length > 0) {
      children.push(
        new TextRun({
          break: 2,
          text: 'Labels: ',
          bold: true,
          font: FONTS.STANDARD_FONT.name,
          size: 16,
        })
      )
      children = [...children, ...generateLabels(task.labels)]
    }
    children = [...children, ...generateDates(task)]
    if (task.teamMembers.length > 0) {
      children = [...children, ...generateTeamMembers(task)]
    } else {
      children.push(
        new TextRun({
          text: t('exports.reportDownload.taskDetails.noAssignees'),
          font: FONTS.STANDARD_FONT.name,
        })
      )
    }

    return new Paragraph({
      children: children,
    })
  }

  // Construct header and main content

  const header = buildHeader(matter, project, task)
  // const content = buildC(t, task, posts)
  // Create Document
  const taskDetails = await getTaskDetails()

  const doc = new Document({
    title: `${task.name} ${formatReferenceNumber(task)}`,
    sections: [
      {
        properties: {
          page: {
            margin: EXPORT_MARGINS,
            size: {
              width:
                options.printType === 'A4'
                  ? convertMillimetersToTwip(210)
                  : convertMillimetersToTwip(216),
              height:
                options.printType === 'A4'
                  ? convertMillimetersToTwip(297)
                  : convertMillimetersToTwip(279),
            },
          },
        },
        children: [
          generateTitle(task),
          new Paragraph({
            children: [
              new TextRun({
                text: 'Task description',
                bold: true,
                size: 22,
                break: 2,
                font: FONTS.STANDARD_FONT.name,
              }),
              new TextRun({ text: '', break: 1 }),
            ],
          }),
          ...convertHTMLToDocX(task.description || ''),
          ...getPostsTable(posts, includePosts),
          ...taskDetails,
        ],
        headers: { default: header },
        footers: { default: buildFooter(t) },
      },
    ],
  })

  // Complete document and start download.
  Packer.toBlob(doc).then(blob => {
    saveAs(blob, downloadFilename)
  })

  return { filename: downloadFilename }
}

export default buildReport
