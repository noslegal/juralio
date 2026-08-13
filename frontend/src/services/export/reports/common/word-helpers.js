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
  AlignmentType,
  Footer,
  PageNumber,
  Paragraph,
  TableCell,
  TableRow,
  TextRun,
  VerticalAlign,
  WidthType,
} from 'docx'

import { NO_BORDERS } from './constants-word'
import { FONTS, FONT_SIZES } from './constants-reports'
import { getPrivilegedAndConfidentialText } from '../common/report-text-helpers'

const BLACK = '000000'

const DEFAULT_RUN_OPTIONS = {
  font: FONTS.STANDARD_FONT,
  fontSize: FONT_SIZES.NORMAL,
  fontColor: BLACK,
}

export const getPercentageWidth = width => {
  return {
    width: { size: width, type: WidthType.PERCENTAGE },
  }
}

export const getBlankParagraph = () => new Paragraph({ text: '' })

export const getBlankRow = (cellSpan = 1) => {
  return new TableRow({
    children: [
      new TableCell({
        columnSpan: cellSpan,
        borders: NO_BORDERS,
        children: [getBlankParagraph()],
      }),
    ],
  })
}

export const buildParagraphTextRun = (text, options = {}) => {
  const DEFAULT_PARA_OPTIONS = {
    font: FONTS.STANDARD_FONT,
    fontSize: FONT_SIZES.NORMAL,
  }

  options = Object.assign(DEFAULT_PARA_OPTIONS, options)

  return new Paragraph({
    children: [
      new TextRun({
        text: text,
        color: options.fontColor,
        size: options.fontSize,
        ...options,
      }),
    ],
  })
}

//------------------------------------------------------------

export const buildRawCell = (children, cellOptions = {}) => {
  const DEFAULT_CELL_OPTIONS = {
    alignment: AlignmentType.LEFT,
    borders: NO_BORDERS,
    font: FONTS.STANDARD_FONT,
    fontSize: FONT_SIZES.NORMAL,
    verticalAlign: VerticalAlign.TOP,
  }

  const options = Object.assign(DEFAULT_CELL_OPTIONS, cellOptions)

  return new TableCell({
    ...options,
    children: Array.isArray(children) ? children : [children],
  })
}

export const buildCell = (text, cellOptions = {}) => {
  const DEFAULT_CELL_OPTIONS = {
    font: FONTS.STANDARD_FONT,
    borders: NO_BORDERS,
    fontSize: FONT_SIZES.NORMAL,
    verticalAlign: VerticalAlign.TOP,
  }

  const options = { ...DEFAULT_CELL_OPTIONS, ...cellOptions }

  return new TableCell({
    ...options,
    children: [
      new Paragraph({
        alignment: options.alignment,
        children: [
          new TextRun({
            color: options.fontColor,
            font: options.font,
            size: options.fontSize,
            text: text,
            ...options.runOptions,
          }),
        ],
      }),
    ],
  })
}

//------------------------------------------------------------
export const buildImageCell = (image, options = {}) => {
  const DEFAULT_CELL_OPTIONS = {
    alignment: AlignmentType.CENTER,
    borders: NO_BORDERS,
    verticalAlign: VerticalAlign.TOP,
  }

  options = Object.assign(DEFAULT_CELL_OPTIONS, options)

  return new TableCell({
    borders: options.borders,
    margins: options.margins,
    verticalAlign: options.verticalAlign,
    width: options.width,
    children: [
      new Paragraph({
        alignment: options.alignment,
        children: [image],
      }),
    ],
  })
}
//------------------------------------------------------------
export const buildTextRun = (text, options = {}) => {
  options = Object.assign(DEFAULT_RUN_OPTIONS, options)

  return new TextRun({
    text: text,
    font: options.font,
    color: options.fontColor,
    size: options.fontSize,
    ...options,
  })
}

//------------------------------------------------------------

export const buildMultiLineCell = (lineList, options = {}) => {
  const DEFAULT_CELLS_OPTIONS = {
    fontColor: BLACK,
    font: FONTS.STANDARD_FONT,
    fontSize: FONT_SIZES.SMALL,
    alignment: AlignmentType.LEFT,
    borders: NO_BORDERS,
  }
  const content = []

  options = Object.assign(DEFAULT_CELLS_OPTIONS, options)

  lineList.forEach(line => {
    content.push(
      new Paragraph({
        children: [
          buildTextRun(line, {
            fontColor: options.fontColor,
            font: options.font,
            fontSize: options.fontSize,
          }),
        ],
        alignment: options.alignment,
      })
    )
  })

  return new TableCell({
    borders: options.borders,
    margins: options.margins,
    shading: options.shading,
    verticalAlign: options.verticalAlign,
    width: options.width,
    children: content,
  })
}

//------------------------------------------------------------

export const getStandardFooter = t => {
  const options = Object.assign(DEFAULT_RUN_OPTIONS, {})

  return new Footer({
    children: [
      new Paragraph({
        alignment: AlignmentType.LEFT,
        children: [
          buildTextRun(getPrivilegedAndConfidentialText(t), {
            fontColor: BLACK,
            fontSize: FONT_SIZES.SMALL,
          }),
        ],
      }),
      new Paragraph({
        alignment: AlignmentType.RIGHT,
        children: [
          new TextRun({
            children: ['', PageNumber.CURRENT],
            font: options.font,
            size: FONT_SIZES.SMALL,
          }),
          new TextRun({
            children: [` ${t('exports.common.of')} `, PageNumber.TOTAL_PAGES],
            font: options.font,
            size: FONT_SIZES.SMALL,
          }),
        ],
      }),
    ],
  })
}
