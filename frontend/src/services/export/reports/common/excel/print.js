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

import { encodeCell } from './refs'

const PAPER_SIZES = { A4: 9, A3: 8 }

// One footer section in header/footer script codes, e.g.
// '&L&8&K666361Privileged...&12&K000000' — size and colour codes, the text,
// then a reset to the defaults, matching the previous writer's output.
const footerSection = (code, part) => {
  if (!part || !part.w) {
    return ''
  }
  const style = part.s || {}
  let section = `&${code}`
  if (style.sz != null) section += `&${style.sz}`
  if (style.color?.rgb) section += `&K${style.color.rgb}`
  section += part.w
  if (style.sz != null || style.color?.rgb) section += '&12&K000000'
  return section
}

const buildFooter = footer =>
  footerSection('L', footer.left) +
  footerSection('C', footer.center) +
  footerSection('R', footer.right)

// Applies a print configuration in the legacy '!print' shape
// ({ area, margins, footer: { odd, even }, props }) to an ExcelJS worksheet.
export const setPrintConfig = (ws, { area, margins, footer, props = {} }) => {
  ws.pageSetup = {
    ...(margins && { margins }),
    ...(area && {
      printArea: `${encodeCell({ row: area.s.r + 1, col: area.s.c + 1 })}:${encodeCell({ row: area.e.r + 1, col: area.e.c + 1 })}`,
    }),
    ...(props.orientation && { orientation: props.orientation }),
    ...(props.paper && { paperSize: PAPER_SIZES[props.paper] ?? 9 }),
    ...(props.errors && { errors: 'NA' }),
    ...(props.centerX && { horizontalCentered: true }),
    ...(props.centerY && { verticalCentered: true }),
    ...(props.fit && {
      fitToPage: true,
      fitToWidth: props.fit.width,
      fitToHeight: props.fit.height,
    }),
  }

  if (footer) {
    const oddFooter = buildFooter(footer.odd || {})
    const evenFooter = buildFooter(footer.even || {})
    ws.headerFooter = { oddFooter }
    if (evenFooter !== oddFooter) {
      ws.headerFooter.differentOddEven = true
      ws.headerFooter.evenFooter = evenFooter
    }
  }
}
