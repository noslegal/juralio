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

import { Header, Paragraph, TextRun } from 'docx'
import { TASK_MAP_LEVELS_INTEGER_LOOKUP } from '../../../../app/constants'
import { FONTS } from '../common/constants-reports'

export const buildHeader = (matter, project, task, post) => {
  let children = [
    new TextRun({ text: `Client: `, font: FONTS.STANDARD_FONT.name, size: 16 }),
    new TextRun({
      text: `${matter.clientName}`,
      bold: true,
      font: FONTS.STANDARD_FONT.name,
      size: 16,
    }),
    new TextRun({
      text: `Matter: `,
      break: 1,
      font: FONTS.STANDARD_FONT.name,
      size: 16,
    }),
    new TextRun({
      text: `${matter.name} `,
      bold: true,
      font: FONTS.STANDARD_FONT.name,
      size: 16,
    }),
    new TextRun({
      text: `/ ${matter.userDefinedReferenceNumber}`,
      font: FONTS.STANDARD_FONT.name,
      size: 16,
    }),
  ]
  if (matter.projects.length > 1) {
    children.push(
      new TextRun({
        break: 1,
        text: `${project.isPrivate ? 'Private ' : ''}Workstream: `,
        font: FONTS.STANDARD_FONT.name,
        size: 16,
      })
    )
    children.push(
      new TextRun({
        text: `${project.name}`,
        bold: true,
        font: FONTS.STANDARD_FONT.name,
        size: 16,
      })
    )
  }
  children.push(
    new TextRun({
      text: `This is a Juralio `,
      break: 2,
      font: FONTS.STANDARD_FONT.name,
      size: 16,
    })
  )
  if (post) {
    children.push(
      new TextRun({
        text: `${post.type !== null ? post.type : 'post'}`,
        bold: true,
        font: FONTS.STANDARD_FONT.name,
        size: 16,
      })
    )
    children.push(
      new TextRun({ text: ' in ', font: FONTS.STANDARD_FONT.name, size: 16 })
    )
    children.push(
      new TextRun({
        text: `${task.name}`,
        bold: true,
        font: FONTS.STANDARD_FONT.name,
        size: 16,
      })
    )
    children.push(
      new TextRun({
        text: ', task number ',
        font: FONTS.STANDARD_FONT.name,
        size: 16,
      })
    )
    children.push(
      new TextRun({
        text: `#${task.referenceNumber.substring(3)}`,
        bold: true,
        font: FONTS.STANDARD_FONT.name,
        size: 16,
      })
    )
    children.push(
      new TextRun({
        text: ' within this matter',
        font: FONTS.STANDARD_FONT.name,
        size: 16,
      })
    )
  }
  if (task && !post) {
    children.push(
      new TextRun({
        text: `level ${TASK_MAP_LEVELS_INTEGER_LOOKUP[task.level]}`,
        bold: true,
        font: FONTS.STANDARD_FONT.name,
        size: 16,
      })
    )
    children.push(
      new TextRun({
        text: ' task. Its number is ',
        font: FONTS.STANDARD_FONT.name,
        size: 16,
      })
    )
    children.push(
      new TextRun({
        text: `#${task.referenceNumber.substring(3)}`,
        bold: true,
        font: FONTS.STANDARD_FONT.name,
        size: 16,
      })
    )

    children.push(
      new TextRun({
        text: ' within this matter',
        font: FONTS.STANDARD_FONT.name,
        size: 16,
      })
    )
  }

  return new Header({
    children: [new Paragraph({ children: children })],
  })
}
