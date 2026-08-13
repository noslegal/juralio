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
  statusStyle,
  styleRowRange,
  mergeRow,
  setColumns,
} from './client-costs-styler'
import { createSheet } from '../common/excel/sheet-builder'
import { pushSheetHeader, styleSheetHeader } from './build-sheet-header'

const WIDTH = 7 // content columns B..H

export const buildScopeSheet = (t, model, wb, sheetName) => {
  const content = []
  pushSheetHeader(
    content,
    model,
    t(
      'exports.clientCosts.scopeTitle',
      'SCOPE OF WORK — PHASES & DELIVERABLES'
    ),
    WIDTH
  )

  // Column header row.
  content.push([
    '',
    t('exports.clientCosts.colPhaseName', 'Phase name'),
    t('exports.clientCosts.colDeliverables', 'Deliverables'),
    t('exports.clientCosts.colStatus', 'Status'),
    t('exports.clientCosts.colStart', 'Start'),
    t('exports.clientCosts.colEnd', 'End'),
    t('exports.clientCosts.colDays', 'Days'),
    t('exports.clientCosts.colAssumptions', 'Assumptions'),
  ])
  const headerRow = content.length - 1

  const groupRows = []
  const phaseRows = []
  const deliverableRows = []
  // Phase rows alternate white / tint across the whole table.
  let phaseCount = 0

  model.groups.forEach(group => {
    if (group.name && !model.singleWorkstream) {
      content.push(['', group.name.toUpperCase(), '', '', '', '', '', ''])
      groupRows.push(content.length - 1)
    }
    group.phases.forEach(phase => {
      content.push([
        '',
        phase.name,
        t('exports.clientCosts.deliverablesCount', '{{count}} Deliverables', {
          count: phase.deliverables.length,
        }),
        phase.statusLabel,
        phase.start || '-',
        phase.end || '-',
        phase.days,
        phase.assumptions.length,
      ])
      phaseRows.push({
        row: content.length - 1,
        status: phase.status,
        tint: phaseCount % 2 === 1 ? TINTS.kv : TINTS.white,
      })
      phaseCount += 1
      phase.deliverables.forEach(name => {
        content.push(['', '', `    ↳  ${name}`, '', '', '', '', ''])
        deliverableRows.push(content.length - 1)
      })
    })
  })

  const ws = createSheet(wb, sheetName, content)
  styleSheetHeader(ws, WIDTH)

  styleRowRange(ws, headerRow, 1, WIDTH, STYLES.tableHeader)
  groupRows.forEach(r => {
    styleRowRange(ws, r, 1, WIDTH, STYLES.workstream)
    mergeRow(ws, r, 1, WIDTH)
  })
  phaseRows.forEach(({ row, status, tint }) => {
    // Phase name (B), then centred data cells (E..H) carry the zebra tint.
    styleRowRange(ws, row, 1, 1, withFill(STYLES.value, tint))
    styleRowRange(ws, row, 4, WIDTH, withFill(STYLES.bodyCenter, tint))
    // Deliverable count (C) stays white, status (D) carries its status colour.
    styleRowRange(ws, row, 2, 2, withFill(STYLES.bodyCenter, TINTS.white))
    styleRowRange(ws, row, 3, 3, statusStyle(status))
  })
  deliverableRows.forEach(r => {
    styleRowRange(ws, r, 1, WIDTH, STYLES.deliverable)
    mergeRow(ws, r, 2, WIDTH)
  })

  setColumns(ws, [25, 26, 12, 12, 12, 8, 14])
  return ws
}
