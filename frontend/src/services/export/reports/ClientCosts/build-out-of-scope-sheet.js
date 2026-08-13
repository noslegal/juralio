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

const WIDTH = 2 // content columns B, C

const formatRate = (code, value) => {
  if (value == null || value === '') return ''
  const n = Number(String(value).replace(/,/g, ''))
  if (!Number.isFinite(n)) return String(value)
  const formatted = n.toLocaleString(undefined, { maximumFractionDigits: 0 })
  return code ? `${code} ${formatted}` : formatted
}

export const buildOutOfScopeSheet = (t, model, wb, sheetName) => {
  const content = []
  pushSheetHeader(
    content,
    model,
    t('exports.clientCosts.outOfScopeTitle', 'OUT-OF-SCOPE TERMS'),
    WIDTH
  )

  content.push(['', t('exports.clientCosts.outOfScopeIntro', ''), ''])
  const introRow = content.length - 1
  content.push(['', '', ''])

  const kvRows = []
  const pushKv = (key, value) => {
    content.push(['', key, value])
    kvRows.push(content.length - 1)
  }

  const oos = model.outOfScope || { writtenApproval: false, postApproval: '' }
  pushKv(
    t(
      'exports.clientCosts.writtenApprovalRequired',
      'Written Approval Required'
    ),
    oos.writtenApproval
      ? t('exports.clientCosts.yes', 'Yes')
      : t('exports.clientCosts.no', 'No')
  )
  if (oos.postApproval) {
    pushKv(
      t('exports.clientCosts.postApprovalPricing', 'Post-Approval Pricing'),
      oos.postApproval
    )
  }

  content.push(['', '', ''])
  content.push([
    '',
    t(
      'exports.clientCosts.hourlyRates',
      'HOURLY RATES - unless otherwise agreed'
    ),
    '',
  ])
  const bannerRow = content.length - 1

  content.push([
    '',
    t('exports.clientCosts.colRole', 'Role'),
    t('exports.clientCosts.colRatePerHour', 'Rate per Hour'),
  ])
  const rateHeaderRow = content.length - 1

  const rateRows = []
  if (model.rates.length > 0) {
    model.rates.forEach(r => {
      content.push(['', r.grade, formatRate(model.code, r.rate)])
      rateRows.push(content.length - 1)
    })
  } else {
    content.push([
      '',
      t('exports.clientCosts.noRates', 'No rates have been chosen'),
      '',
    ])
    rateRows.push(content.length - 1)
  }

  const ws = createSheet(wb, sheetName, content)
  styleSheetHeader(ws, WIDTH)

  styleRowRange(ws, introRow, 1, WIDTH, STYLES.intro)
  mergeRow(ws, introRow, 1, WIDTH)
  kvRows.forEach((r, i) => {
    const tint = i % 2 === 1 ? TINTS.kv : TINTS.white
    styleRowRange(ws, r, 1, 1, withFill(STYLES.label, tint))
    styleRowRange(ws, r, 2, 2, withFill(STYLES.value, tint))
  })
  styleRowRange(ws, bannerRow, 1, WIDTH, STYLES.sectionBanner)
  mergeRow(ws, bannerRow, 1, WIDTH)
  styleRowRange(ws, rateHeaderRow, 1, WIDTH, STYLES.tableHeader)
  rateRows.forEach((r, i) => {
    const tint = i % 2 === 0 ? TINTS.table : TINTS.white
    styleRowRange(ws, r, 1, 1, withFill(STYLES.body, tint))
    styleRowRange(ws, r, 2, 2, withFill(STYLES.bodyCenter, tint))
  })

  setColumns(ws, [32, 48])
  return ws
}
