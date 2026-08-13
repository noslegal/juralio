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

import { STYLES, styleRowRange, mergeRow } from './client-costs-styler'

// Every client-costs sheet opens with the same three-row banner: a coloured
// title band, a client/advisor line and a matter/reference/period meta line.
// Returns the index of the first free row after the header (incl. a spacer).
export const HEADER_ROWS = 4

export const pushSheetHeader = (content, model, title, width) => {
  const advisor = model.header.advisor
  const clientLine = [
    model.header.client ? `Client: ${model.header.client}` : '',
    advisor ? `Advisor: ${advisor}` : '',
  ]
    .filter(Boolean)
    .join('   ')
  const metaParts = [model.header.matterName, model.header.reference]
  if (model.header.periodLabel) metaParts.push(model.header.periodLabel)
  let meta = metaParts.filter(Boolean).join('  ·  ')
  if (model.header.exportedDate) {
    meta += `   ·   Exported: ${model.header.exportedDate}`
  }

  const blank = new Array(width + 1).fill('')
  content.push(['', title, ...new Array(Math.max(0, width - 1)).fill('')])
  content.push(['', clientLine, ...new Array(Math.max(0, width - 1)).fill('')])
  content.push(['', meta, ...new Array(Math.max(0, width - 1)).fill('')])
  content.push([...blank])
}

export const styleSheetHeader = (ws, width) => {
  const last = width // last content column index (B == 1)
  styleRowRange(ws, 0, 1, last, STYLES.titleBand)
  styleRowRange(ws, 1, 1, last, STYLES.subHeader)
  styleRowRange(ws, 2, 1, last, STYLES.meta)
  mergeRow(ws, 0, 1, last)
  mergeRow(ws, 1, 1, last)
  mergeRow(ws, 2, 1, last)
}
