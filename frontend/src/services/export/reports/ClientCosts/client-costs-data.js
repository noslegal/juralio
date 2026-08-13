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

import dayjs from 'dayjs'
import { daysInRangeFromTask } from '../../../../app/matter-costs/fixed-fee-setup/helpers'
import { getMatterReferenceNumber } from '../workstream-task-list/header-details-helper'

const formatDate = value => {
  if (!value) return ''
  const d = dayjs(typeof value === 'string' ? value.replace('Z', '') : value)
  return d.isValid() ? d.format('D MMM YYYY') : ''
}

const formatLongDate = value => {
  if (!value) return ''
  const d = dayjs(typeof value === 'string' ? value.replace('Z', '') : value)
  return d.isValid() ? d.format('D MMMM YYYY') : ''
}

const formatAmount = (code, value) => {
  if (value == null || value === '') return ''
  const n = Number(String(value).replace(/,/g, ''))
  if (!Number.isFinite(n)) return String(value)
  const formatted = n.toLocaleString(undefined, { maximumFractionDigits: 0 })
  return code ? `${code} ${formatted}` : formatted
}

const monthsBetweenInclusive = (start, end) => {
  if (!start || !end) return 0
  const s = dayjs(typeof start === 'string' ? start.replace('Z', '') : start)
  const e = dayjs(typeof end === 'string' ? end.replace('Z', '') : end)
  if (!s.isValid() || !e.isValid()) return 0
  return Math.max(1, e.startOf('month').diff(s.startOf('month'), 'month') + 1)
}

const feeTypeLabel = (t, type) => {
  switch (parseInt(type)) {
    case 0:
      return t('exports.clientCosts.feeTypeTimeBased', 'Time-based')
    case 2:
      return t('exports.clientCosts.feeTypeNoFee', 'No fee')
    case 1:
    default:
      return t('exports.clientCosts.feeTypeFixed', 'Fixed')
  }
}

const postApprovalLabel = (t, reason) => {
  if (!reason) return ''
  if (reason === 'rates') {
    return t('exports.clientCosts.postApprovalRates', 'Hourly rates')
  }
  if (reason === 'agreed') {
    return t(
      'exports.clientCosts.postApprovalAgreed',
      'Must be expressly agreed'
    )
  }
  return reason
}

// Deduplicate the matter rates list down to one row per grade (mirrors the
// rateRows logic in ClientProjectionCard).
const buildRateRows = rates => {
  const byGrade = new Map()
  ;(rates || []).forEach(r => {
    if (r.gradeId == null || byGrade.has(r.gradeId)) return
    byGrade.set(r.gradeId, {
      grade: r.gradeName,
      rate: r.rateValue,
    })
  })
  return Array.from(byGrade.values())
}

// Normalise the raw snapshot + matter into a flat view model the sheet builders
// can render without re-deriving anything.
export const buildClientCostsModel = (t, reportData) => {
  const matter = reportData.matter || {}
  const code = (reportData.currency || '').slice(0, 3)
  const period = reportData.period || {}
  const workstreamNames = reportData.workstreamNames || {}

  const reference = getMatterReferenceNumber(t, matter)
  const periodLabel =
    period.startDate && period.endDate
      ? `${formatLongDate(period.startDate)} – ${formatLongDate(period.endDate)}`
      : ''

  const header = {
    matterName: matter.name || '',
    reference,
    client: matter.clientName || '',
    advisor: reportData.advisor || '',
    exportedDate: formatLongDate(new Date()),
    periodLabel,
  }

  const pricing = (reportData.pricingDTOList || [])[0] || null
  const feeAmount =
    reportData.revenueValuesDTO?.totalRevenue != null
      ? reportData.revenueValuesDTO.totalRevenue
      : (pricing?.value ?? null)
  // Only time-based (type 0) fees can be capped; `cap` is a boolean flag and
  // the cap limit itself is held in `value` (see pricingCardHelper
  // getPricingType: "Time-based, capped at {value}").
  const isCappedTimeBased =
    parseInt(pricing?.type) === 0 &&
    (pricing?.cap === true || pricing?.cap === '1')
  const fee = {
    type: feeTypeLabel(t, pricing?.type ?? 1),
    amount: formatAmount(code, feeAmount),
    cap: isCappedTimeBased ? formatAmount(code, pricing.value) : '',
  }

  const cteList = reportData.costTimeEstimateList || []
  const assumptionList = reportData.assumptionList || []
  const assumptionsForTask = taskId =>
    assumptionList
      .filter(a => (a.task?.id ?? a.taskId) === taskId)
      // `summary` is the assumption title; `assumption` is the longer description.
      .map(a => ({ title: a.summary || '', description: a.assumption || '' }))
      .filter(a => a.title || a.description)

  // Group phases by workstream, preserving the snapshot order.
  const groups = []
  const groupByKey = new Map()
  const assumptionsFlat = []
  cteList.forEach(cte => {
    const task = cte.task || {}
    const wsId = task.projectId ?? 'none'
    let group = groupByKey.get(wsId)
    if (!group) {
      group = { name: workstreamNames[wsId] || '', phases: [] }
      groupByKey.set(wsId, group)
      groups.push(group)
    }
    const deliverables = (task.deliverables || []).map(d => d.name || d)
    const phaseAssumptions = assumptionsForTask(task.id)
    group.phases.push({
      name: task.name || '',
      status: task.status || '',
      statusLabel: task.status ? t(`taskStatus.${task.status}`) : '',
      start: formatDate(task.startDate),
      end: formatDate(task.endDate),
      days: daysInRangeFromTask(task, period.startDate, period.endDate),
      months: monthsBetweenInclusive(task.startDate, task.endDate),
      deliverables,
      assumptions: phaseAssumptions,
    })
    phaseAssumptions.forEach(({ title, description }) =>
      assumptionsFlat.push({
        workstream: group.name,
        phase: task.name || '',
        title,
        description,
      })
    )
  })

  const oos = reportData.outOfScopeDetails || null
  const outOfScope = oos
    ? {
        writtenApproval: !!oos.writtenApprovalNeeded,
        postApproval: oos.writtenApprovalNeeded
          ? postApprovalLabel(t, oos.reason)
          : '',
      }
    : null

  return {
    code,
    header,
    duration: monthsBetweenInclusive(period.startDate, period.endDate),
    fee,
    groups,
    assumptionsFlat,
    outOfScope,
    rates: buildRateRows(reportData.matterRatesList),
    singleWorkstream: matter.numProjects === 1,
  }
}
