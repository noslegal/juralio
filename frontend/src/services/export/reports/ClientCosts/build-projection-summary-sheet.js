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

const WIDTH = 3 // content columns B, C, D

export const buildProjectionSummarySheet = (t, model, wb, sheetName) => {
  const content = []
  pushSheetHeader(
    content,
    model,
    t('exports.clientCosts.summaryTitle', 'COST PROJECTION'),
    WIDTH
  )

  const bannerRows = []
  const labelRows = []
  // Zebra striping resets at the top of each section.
  let zebra = 0

  const pushBanner = text => {
    content.push(['', text, '', ''])
    bannerRows.push(content.length - 1)
    zebra = 0
  }
  const pushKv = (key, value, valueStyle) => {
    content.push(['', key, value, ''])
    labelRows.push({
      row: content.length - 1,
      tint: zebra % 2 === 1 ? TINTS.kv : TINTS.white,
      valueStyle: valueStyle || STYLES.value,
    })
    zebra += 1
  }

  pushBanner(t('exports.clientCosts.projectionPeriod', 'PROJECTION PERIOD'))
  pushKv(t('exports.clientCosts.period', 'Period'), model.header.periodLabel)
  pushKv(
    t('exports.clientCosts.duration', 'Duration'),
    model.duration
      ? t('exports.clientCosts.months', '{{count}} months', {
          count: model.duration,
        })
      : ''
  )
  pushKv(t('exports.clientCosts.currency', 'Currency'), model.code)
  content.push(['', '', '', ''])

  pushBanner(t('exports.clientCosts.feeStructure', 'FEE STRUCTURE'))
  pushKv(t('exports.clientCosts.feeType', 'Fee Type'), model.fee.type)
  pushKv(
    t('exports.clientCosts.feeAmount', 'Fee Amount'),
    model.fee.amount,
    STYLES.valueStrong
  )
  if (model.fee.cap) {
    pushKv(t('exports.clientCosts.cap', 'Cap'), model.fee.cap)
  }
  content.push(['', '', '', ''])

  const phases = model.groups.flatMap(g => g.phases)
  const totalDeliverables = phases.reduce(
    (sum, p) => sum + p.deliverables.length,
    0
  )
  const totalAssumptions = model.assumptionsFlat.length
  pushBanner(t('exports.clientCosts.scopeOverview', 'SCOPE OVERVIEW'))
  pushKv(
    t('exports.clientCosts.phasesInScope', 'Phases in Scope'),
    phases.length,
    STYLES.metric
  )
  pushKv(
    t('exports.clientCosts.totalDeliverables', 'Total Deliverables'),
    totalDeliverables,
    STYLES.metric
  )
  pushKv(
    t('exports.clientCosts.totalAssumptions', 'Total Assumptions'),
    totalAssumptions,
    STYLES.metric
  )
  content.push(['', '', '', ''])

  content.push(['', t('exports.clientCosts.summaryIntro', ''), '', ''])
  const introRow = content.length - 1

  const ws = createSheet(wb, sheetName, content)
  styleSheetHeader(ws, WIDTH)

  styleRowRange(ws, introRow, 1, WIDTH, withFill(STYLES.intro, TINTS.kv))
  mergeRow(ws, introRow, 1, WIDTH)

  bannerRows.forEach(r => {
    styleRowRange(ws, r, 1, WIDTH, STYLES.sectionBanner)
    mergeRow(ws, r, 1, WIDTH)
  })
  labelRows.forEach(({ row, tint, valueStyle }) => {
    styleRowRange(ws, row, 1, 1, withFill(STYLES.label, tint))
    styleRowRange(ws, row, 2, WIDTH, withFill(valueStyle, tint))
    mergeRow(ws, row, 2, WIDTH)
  })

  setColumns(ws, [22, 30, 18])
  return ws
}
