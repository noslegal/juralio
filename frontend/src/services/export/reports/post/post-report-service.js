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
import { DATE_FORMAT_FULL, NOTE_TYPES } from '../../../../app/constants'
import {
  getDateDisplayString,
  getTimeDisplayString,
  getTimeStampUTC,
} from '../../../helpers/date-helper'
import { formatUserDisplayName } from '../../../user/helper/user-format-service'
import { EXPORT_FORMATS, FONTS, FONT_SIZES } from '../common/constants-reports'
import { EXPORT_MARGINS } from '../common/constants-word'
import { sanitiseFilename } from '../common/file-name-helpers'
import { buildFooter } from '../common/report-footer'
import { buildHeader } from '../workstream-task-details/build-header'
import { convertHTMLToDocX } from './html-to-docx-conversion-helpers'

const generatePostDownloadFilename = (post, fileExtension) => {
  const filename = `${post.name} - (${getTimeStampUTC(
    new Date()
  )} UTC).${fileExtension}`
  return sanitiseFilename(filename)
}

const generateTitle = (post, t) => {
  const children = [
    new TextRun({
      text: post.name,
      bold: true,
      font: FONTS.STANDARD_FONT.name,
      size: 48,
    }),
  ]
  post.privatePost &&
    children.push(
      new TextRun({
        break: 2,
        text: ' Private ',
        highlight: 'black',
        color: '#FFFFFF',
        size: 24,
        font: FONTS.STANDARD_FONT.name,
      })
    )
  post.privatePost &&
    children.push(
      new TextRun({
        text: '  ',
      })
    )
  !post.finalised &&
    children.push(
      new TextRun({
        break: post.privatePost ? 0 : 2,
        text: ' Draft ',
        shading: {
          fill: 'fff2cc',
        },
        size: 24,
        font: FONTS.STANDARD_FONT.name,
      })
    )

  for (let i = 0; i < post.authors.length; i++) {
    children.push(
      new TextRun({
        break: i > 0 ? 0 : 1,
        text: `${formatUserDisplayName(post.authors[i].user)}${
          i < post.authors.length - 2 ? ', ' : ''
        }${i === post.authors.length - 2 ? ' and ' : ''}`,
        font: FONTS.STANDARD_FONT.name,
        bold: true,
      })
    )
  }
  children.push(
    new TextRun({
      text:
        post.authors.length > 1
          ? t('exports.reportDownload.post.areEditors')
          : t('exports.reportDownload.post.isEditor'),
      font: FONTS.STANDARD_FONT.name,
    })
  )
  return new Paragraph({
    children: children,
  })
}

const buildReport = (t, reportData, options) => {
  const { matter, project, post, task } = reportData
  const downloadFilename = generatePostDownloadFilename(
    post,
    EXPORT_FORMATS.WORD
  )

  const header = buildHeader(matter, project, task, post)
  const footer = buildFooter(t)

  const generateNoteBody = post => {
    return new Paragraph({
      children: [
        new TextRun({
          text: post.finalised
            ? t('exports.reportDownload.post.finalisedOn')
            : t('exports.reportDownload.post.noteLastEdited'),
          font: FONTS.STANDARD_FONT.name,
          bold: true,
          size: 22,
          break: 2,
        }),
        new TextRun({
          text: getDateDisplayString(post.lastUpdated, DATE_FORMAT_FULL, true),
          font: FONTS.STANDARD_FONT.name,
          bold: true,
          size: 22,
        }),
        new TextRun({
          text: '',
          break: 1,
        }),
      ],
    })
  }

  const generateMeetingNoteBody = post => {
    let children = [
      new TextRun({
        text:
          t('exports.reportDownload.post.meetingOn') +
          getDateDisplayString(post.startTime) +
          t('exports.reportDownload.post.from') +
          getTimeDisplayString(post.startTime) +
          t('exports.reportDownload.post.to') +
          getTimeDisplayString(post.endTime),
        font: FONTS.STANDARD_FONT.name,
        bold: true,
        size: 22,
        break: 2,
      }),
      new TextRun({
        text: t('exports.reportDownload.post.attendedBy'),
        break: 1,
        font: FONTS.STANDARD_FONT.name,
        size: 22,
      }),
    ]

    for (let i = 0; i < post.members.length; i++) {
      children.push(
        new TextRun({
          text: `${post.members[i].firstname} ${post.members[i].lastname}${
            i < post.members.length - 2 ? ', ' : ''
          }${i === post.members.length - 2 ? ' and ' : ''}`,
          font: FONTS.STANDARD_FONT.name,
          size: 22,
        })
      )
    }
    children.push(
      new TextRun({
        text: '',
        break: 1,
      })
    )

    return new Paragraph({
      children: children,
    })
  }

  const getLinkText = post => {
    if (post.type === NOTE_TYPES.ATLASSIAN) {
      return 'Atlassian Link'
    }
    if (post.type === NOTE_TYPES.FIGMA) {
      return 'Figma Link'
    }
    if (post.type === NOTE_TYPES.MIRO) {
      return 'Miro Link'
    }
    if (post.type.includes('Google')) {
      return 'Google Link'
    }
    if (post.type === NOTE_TYPES.DOCUMENT) {
      return 'Document link'
    }
    return 'Link'
  }
  const generateLinkBody = post => {
    const isSpecialLink = ['Google', NOTE_TYPES.MIRO, NOTE_TYPES.FIGMA].some(
      e => post.type.includes(e)
    )
    let children = [
      new TextRun({
        text: `${getLinkText(post, isSpecialLink)}: ${post.url}`,
        break: 1,
        font: FONTS.STANDARD_FONT.name,
        bold: true,
        size: 22,
      }),
      new TextRun({
        text: post.finalised
          ? t('exports.reportDownload.post.finalisedOn')
          : t('exports.reportDownload.post.noteLastEdited'),
        break: 1,
        font: FONTS.STANDARD_FONT.name,
        bold: true,
        size: 22,
      }),
      new TextRun({
        text: getDateDisplayString(post.lastUpdated, DATE_FORMAT_FULL, true),
        font: FONTS.STANDARD_FONT.name,
        bold: true,
        size: 22,
      }),
    ]
    if (isSpecialLink) {
      children.push(
        new TextRun({
          text: t('exports.reportDownload.post.iframe', { url: post.url }),
          break: 2,
          font: FONTS.STANDARD_FONT.name,
          size: 18,
        })
      )
    }

    if (!isSpecialLink && post.description === null) {
      children.push(
        new TextRun({
          text: t('exports.reportDownload.post.noDescription', {
            url: post.url,
          }),
          break: 2,
          font: FONTS.STANDARD_FONT.name,
          size: 18,
        })
      )
    }
    return new Paragraph({ children: children })
  }

  const generatePostBody = post => {
    switch (post.type) {
      case null:
        return generateNoteBody(post)
      case NOTE_TYPES.MEETING:
        return generateMeetingNoteBody(post)
      default:
        return generateLinkBody(post)
    }
  }

  // Create Document
  const doc = new Document({
    title: `${task.referenceNumber} ${task.name}`,
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
        headers: { default: header },
        footers: { default: footer },
        children: [
          generateTitle(post, t),
          generatePostBody(post),
          ...convertHTMLToDocX(post.description || ''),
        ],
      },
    ],
    styles: {
      characterStyles: [
        {
          id: 'External Link',
          name: 'External Link',
          basedOn: 'Normal',
          next: 'Normal',
          quickFormat: true,
          run: {
            size: FONT_SIZES.NORMAL,
            underline: true,
            color: '1155CC',
            font: FONTS.STANDARD_FONT.name,
          },
          paragraph: {
            spacing: {
              after: 120,
            },
          },
        },
      ],
    },
  })

  const hyperlinkIndex = doc.styles.root.findIndex(
    r => r?.root[0]?.root?.styleId === 'Hyperlink'
  )

  const newStyle = doc.styles.root.pop()

  if (hyperlinkIndex !== -1) {
    doc.styles.root[hyperlinkIndex] = newStyle
    doc.styles.root[hyperlinkIndex].root[0].root.styleId = 'Hyperlink'
  }

  Packer.toBlob(doc).then(blob => {
    saveAs(blob, downloadFilename)
  })

  return { filename: downloadFilename }
}

export default buildReport
