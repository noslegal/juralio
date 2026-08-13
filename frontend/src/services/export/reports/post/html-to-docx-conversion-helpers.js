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

import { Paragraph, Table, TableCell, TableRow, TextRun } from 'docx'
import { FONTS, FONT_SIZES } from '../common/constants-reports'
import { buildTextRun, getBlankParagraph } from '../common/word-helpers'

const getTagName = (sourceString, tagStart, tagEnd) =>
  sourceString
    .slice(tagStart + 1, tagEnd)
    .split(/(\s+)/)[0]
    .trim()
    .toLowerCase()

const getStyle = (sourceString, tagEnd) => {
  if (sourceString.includes('style="')) {
    let splitStyle = sourceString.split('style="')
    if (splitStyle[0].length > tagEnd) return null
    return splitStyle[1].split(';')[0]
  }
}

const getHref = (sourceString, tagEnd) => {
  if (sourceString.includes('href="')) {
    let splitStyle = sourceString.split('href="')
    if (splitStyle[0].length > tagEnd) return null
    return splitStyle[1].split('"')[0]
  }
}

const getNextTag = (input, startIndex, endIndex) => {
  const focus = input.slice(startIndex, endIndex)

  const nextTagEnd = focus.indexOf('</')
  const nextTagStart = focus.indexOf('<')

  // we're at the end of a tag with content e.g. "<p>Content!</p>"
  if (nextTagEnd !== -1 && nextTagEnd <= nextTagStart) {
    const tagCloserEnd = focus.indexOf('>')

    return {
      tagName: getTagName(focus, nextTagStart, tagCloserEnd),
      style: getStyle(focus, tagCloserEnd),
      href: getHref(focus, tagCloserEnd),
      outerStart: nextTagStart,
      outerEnd: tagCloserEnd,
      isContentCloser: true,
    }
  } else {
    // nextTagStart < nextTagEnd

    const closer = focus.indexOf('>', nextTagStart)

    if (focus[closer - 1] === '/') {
      // we're a self-closer e.g. "<br/>"
      return {
        tagName: getTagName(focus, nextTagStart, closer - 1),
        style: getStyle(focus, closer - 1),
        href: getHref(focus, closer - 1),
        outerStart: nextTagStart,
        outerEnd: closer,
        isSelfCloser: true,
      }
    }

    // we're the start of a tag with content e.g. "<p>Content!</p>"
    return {
      tagName: getTagName(focus, nextTagStart, closer),
      style: getStyle(focus, closer),
      href: getHref(focus, closer),
      outerStart: nextTagStart,
      outerEnd: closer,
      isContentOpener: true,
    }
  }
}

const applyLineBreaksToParagraphContent = (paragraphContent, options) => {
  const result = []
  for (let i = 0; i < paragraphContent.length; ) {
    let nextNullIndex = paragraphContent.indexOf(null, i)

    if (nextNullIndex === -1) {
      result.push(
        new Paragraph({
          children: paragraphContent.slice(i),
          ...options,
        })
      )
      i = paragraphContent.length
    } else {
      result.push(
        new Paragraph({
          children: paragraphContent.slice(i, nextNullIndex),
          ...options,
        })
      )

      i = nextNullIndex + 1
    }
  }

  return result
}

const tryAddParagraphToContent = (
  content,
  paragraphContent,
  stackDepth,
  bulletsActive
) => {
  if (paragraphContent?.length > 0) {
    const options =
      bulletsActive > 0
        ? {
            bullet: {
              level: Math.min(Math.max(0, Math.floor((stackDepth - 2) / 2)), 8),
            },
          }
        : {}

    content.push(
      ...applyLineBreaksToParagraphContent(paragraphContent, options)
    )

    return true
  }

  return false
}

const tryAddLinkToContent = (outputStack, href) => {
  const DEFAULT_PARA_OPTIONS = {
    font: FONTS.STANDARD_FONT,
    fontSize: FONT_SIZES.NORMAL,
  }

  const paragraphContent = outputStack.pop()

  paragraphContent.push(
    new TextRun({
      text: ` (${href})`,
      color: DEFAULT_PARA_OPTIONS.fontColor,
      size: DEFAULT_PARA_OPTIONS.fontSize,
      font: DEFAULT_PARA_OPTIONS.font,
    })
  )
  outputStack.push(paragraphContent)
}

const tryUpdateStyleFromTag = (tagName, isTagOpening, style) => {
  const applicationCoefficient = isTagOpening ? 1 : -1
  const fixedTagName = isTagOpening ? '/' + tagName : tagName
  if (fixedTagName === '/b' || fixedTagName === '/strong') {
    style.boldActive += applicationCoefficient
  } else if (fixedTagName === '/i' || fixedTagName === '/em') {
    style.italicActive += applicationCoefficient
  } else if (fixedTagName === '/u') {
    style.underlineActive += applicationCoefficient
  } else {
    return false
  }

  return true
}

export const convertHTMLToDocX = html => {
  let tagStack = []
  let lastTag
  const style = {
    boldActive: 0,
    italicActive: 0,
    underlineActive: 0,
  }
  let styles = {
    indentationLevel: 0,
  }
  let bulletsActive = 0
  let outputStack = [[]]
  const content = []

  let tableRows = []
  let tableRowCols = []
  let href = ''

  for (let index = 0; index < html.length; ) {
    const nextTag = getNextTag(html, index, html.length)
    nextTag.outerStart += index
    nextTag.outerEnd += index

    if (nextTag.tagName === 'br') {
      nextTag.isSelfCloser = true
    }

    if (lastTag) {
      let betweenTags = html.slice(lastTag.outerEnd + 1, nextTag.outerStart)

      if (betweenTags) {
        let options = {
          bold: style.boldActive > 0,
          italics: style.italicActive > 0,
          underline: style.underlineActive > 0,
        }
        if (
          ['h1', 'h2', 'h3', 'h4', 'h5', 'h6'].includes(lastTag.tagName) &&
          ['/h1', '/h2', '/h3', '/h4', '/h5', '/h6'].includes(nextTag.tagName)
        ) {
          const num = lastTag.tagName.substring(1)
          switch (num) {
            case '1':
              options.size = 64
              break
            case '2':
              options.size = 46
              break
            case '3':
              options.size = 48
              break
            case '4':
              options.size = 40
              break
            case '5':
              options.size = 32
              break
            case '6':
              options.size = 24
              break
            default:
              options.size = 20
          }
        } else {
          options.size = 20
        }

        if (styles.indentationLevel > 0) {
          betweenTags = ' '.repeat(styles.indentationLevel) + betweenTags
        }

        outputStack[outputStack.length > 0 ? outputStack.length - 1 : 0].push(
          buildTextRun(betweenTags.replace('&nbsp;', ' '), options)
        )
      }
    }

    if (nextTag.isContentOpener || nextTag.isSelfCloser) {
      // need to transform spaces between tags e.g. <p>Hi <b>bold</b> hello</p>
      // needs to capture Paragraph(TextRun('Hi '), TextRun('bold'), TextRun(' hello))
      tagStack.push(nextTag)

      if (
        nextTag.tagName === 'p' ||
        nextTag.tagName === 'ul' ||
        nextTag.tagName === 'ol' ||
        nextTag.tagName === 'li'
      ) {
        const stackDepth = outputStack.length - 1
        const paragraphContent = outputStack.pop()

        styles.indentationLevel = 0
        if (nextTag.style) {
          if (nextTag.style.includes('margin-left')) {
            let marginLeft = nextTag.style
              .split('margin-left:')[1]
              .split('px')[0]
            styles.indentationLevel = Math.ceil(parseInt(marginLeft) / 5)
          }
        }

        tryAddParagraphToContent(
          content,
          paragraphContent,
          stackDepth,
          bulletsActive
        )
        outputStack.push(null)
        outputStack.push([])
        bulletsActive +=
          nextTag.tagName === 'ul' || nextTag.tagName === 'ol' ? 1 : 0
      } else if (nextTag.tagName === 'table') {
        tableRows = []
        tableRowCols = [[]]
      } else if (nextTag.tagName === 'tr') {
        tableRowCols = []
      } else if (nextTag.tagName === 'td') {
        //
      } else if (nextTag.tagName === 'a') {
        href = nextTag.href
      } else {
        tryUpdateStyleFromTag(nextTag.tagName, true, style)
      }
    }

    if (nextTag.isContentCloser || nextTag.isSelfCloser) {
      tagStack.pop()

      if (nextTag.tagName === '/a') {
        tryAddLinkToContent(outputStack, href)
      }
      if (
        nextTag.tagName === '/p' ||
        nextTag.tagName === '/ul' ||
        nextTag.tagName === '/ol' ||
        nextTag.tagName === '/li' ||
        nextTag.tagName === 'br'
      ) {
        const stackDepth = outputStack.length - 1
        const paragraphContent = outputStack.pop()

        if (nextTag.tagName === 'br') {
          paragraphContent.push(null)
          outputStack.push(paragraphContent)
        } else if (
          !tryAddParagraphToContent(
            content,
            paragraphContent,
            stackDepth,
            bulletsActive
          ) &&
          paragraphContent !== null
        ) {
          content.push(getBlankParagraph())
        }

        outputStack.push([])

        bulletsActive -=
          nextTag.tagName === '/ul' || nextTag.tagName === '/ol' ? 1 : 0
      } else if (nextTag.tagName === '/table') {
        const table = new Table({
          rows: tableRows,
        })

        content.push(table) // to do
      } else if (nextTag.tagName === '/tr') {
        tableRows.push(
          new TableRow({
            children: tableRowCols,
          })
        )
      } else if (nextTag.tagName === '/td') {
        const stackDepth = outputStack.length - 1
        const paragraphContent = outputStack.pop()

        let cellContent = []
        tryAddParagraphToContent(
          cellContent,
          paragraphContent,
          stackDepth,
          bulletsActive
        )
        outputStack.push([])
        bulletsActive += nextTag.tagName === 'ul' ? 1 : 0

        tableRowCols.push(
          new TableCell({
            children: cellContent,
          })
        )
      } else {
        tryUpdateStyleFromTag(nextTag.tagName, false, style)
      }
    }

    lastTag = nextTag
    index = nextTag.outerEnd + 1
  }

  return content
}
