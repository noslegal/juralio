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
  STYLES,
  TINTS,
  withFill,
  styleRowRange,
  mergeRow,
  setColumns,
} from './client-costs-styler'
import { createSheet } from '../common/excel/sheet-builder'
import { pushSheetHeader, styleSheetHeader } from './build-sheet-header'

export const buildAssumptionsSheet = (t, model, wb, sheetName) => {
  const hideWorkstream = model.singleWorkstream
  const width = hideWorkstream ? 3 : 4 // content columns B, C, D (, E)

  const content = []
  pushSheetHeader(
    content,
    model,
    t('exports.clientCosts.assumptionsTitle', 'ASSUMPTIONS'),
    width
  )

  content.push(['', t('exports.clientCosts.assumptionsIntro', '')])
  const introRow = content.length - 1
  content.push([''])

  content.push(
    hideWorkstream
      ? [
          '',
          t('exports.clientCosts.colPhase', 'Phase'),
          t('exports.clientCosts.colAssumption', 'Assumption'),
          t('exports.clientCosts.colDescription', 'Description'),
        ]
      : [
          '',
          t('exports.clientCosts.colWorkstream', 'Workstream'),
          t('exports.clientCosts.colPhase', 'Phase'),
          t('exports.clientCosts.colAssumption', 'Assumption'),
          t('exports.clientCosts.colDescription', 'Description'),
        ]
  )
  const headerRow = content.length - 1

  const bodyRows = []
  let prevPhase = null
  model.assumptionsFlat.forEach((a, i) => {
    content.push(
      hideWorkstream
        ? ['', a.phase, a.title, a.description]
        : ['', a.workstream, a.phase, a.title, a.description]
    )
    bodyRows.push({
      row: content.length - 1,
      tint: i % 2 === 0 ? TINTS.table : TINTS.white,
      groupStart: a.phase !== prevPhase,
    })
    prevPhase = a.phase
  })

  const ws = createSheet(wb, sheetName, content)
  styleSheetHeader(ws, width)

  styleRowRange(ws, introRow, 1, width, STYLES.intro)
  mergeRow(ws, introRow, 1, width)
  styleRowRange(ws, headerRow, 1, width, STYLES.tableHeader)
  bodyRows.forEach(({ row, tint, groupStart }) => {
    // The leading label column is emphasised at the start of each phase block.
    styleRowRange(
      ws,
      row,
      1,
      1,
      withFill(groupStart ? STYLES.value : STYLES.body, tint)
    )
    styleRowRange(ws, row, 2, width, withFill(STYLES.body, tint))
  })

  setColumns(ws, hideWorkstream ? [26, 32, 52] : [20, 26, 32, 52])
  return ws
}
