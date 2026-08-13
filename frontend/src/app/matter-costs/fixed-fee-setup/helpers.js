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
import { CURRENCIES, TASK_STATUS } from '../../constants'
import { filterValidTasks } from '../outcomes/revenueHelper'

export const currencyCode = currency => (currency || '').slice(0, 3)

export const fullCurrency = currency => {
  const code = currencyCode(currency)
  if (!code) return currency || ''
  const match = CURRENCIES.find(c => c.name.slice(0, 3) === code)
  return match ? match.name : currency
}

const isMY = x => x && x.m !== undefined && x.y !== undefined

const dateToMy = iso => {
  if (!iso) return null
  const d = dayjs(iso.replace('Z', ''))
  return { m: d.month(), y: d.year() }
}

export const groupPhasesByWorkstream = phases => {
  const groups = []
  const byId = new Map()
  ;(phases || []).forEach(p => {
    const id = p.workstreamId ?? 'none'
    let group = byId.get(id)
    if (!group) {
      group = { id, name: p.workstreamName || '', phases: [] }
      byId.set(id, group)
      groups.push(group)
    }
    group.phases.push(p)
  })
  return groups
}

export const phaseStartFromTask = task => {
  if (!task) return null
  return dateToMy(
    task.status === TASK_STATUS.NOT_STARTED
      ? task.plannedStartDate
      : task.actualStartDate || task.plannedStartDate
  )
}

export const phaseEndFromTask = task => {
  if (!task) return null
  return dateToMy(
    task.status === TASK_STATUS.DONE
      ? task.actualEndDate || task.plannedEndDate
      : task.plannedEndDate
  )
}

// Maps a persisted OutOfScopeDetails record to the wizard's out-of-scope state.
// The post-approval mode is inferred from the single reason column: the preset
// values 'agreed'/'rates' map to themselves, any other non-empty reason is
// treated as custom text.
export const outOfScopeFromDetails = oosDetails => {
  if (!oosDetails) return null
  const writtenApprovalNeeded = !!oosDetails.writtenApprovalNeeded
  let postApproval = 'agreed'
  let customNotes = ''
  if (writtenApprovalNeeded) {
    if (oosDetails.reason === 'agreed' || oosDetails.reason === 'rates') {
      postApproval = oosDetails.reason
    } else if (oosDetails.reason) {
      postApproval = 'custom'
      customNotes = oosDetails.reason
    }
  }
  return {
    approval: writtenApprovalNeeded ? 'yes' : 'no',
    postApproval,
    customNotes,
  }
}
const toDate = x => {
  if (!x) return null
  if (isMY(x)) return new Date(x.y, x.m, 1)
  return new Date(x)
}

export const fmtMonthShort = x => {
  const d = toDate(x)
  return d ? dayjs(d).format('MMM YYYY') : ''
}

export const monthsBetween = (a, b) => {
  const da = toDate(a)
  const db = toDate(b)
  if (!da || !db) return 0
  return (
    Math.abs(
      dayjs(db).startOf('month').diff(dayjs(da).startOf('month'), 'month')
    ) + 1
  )
}

const parseTaskDate = iso => {
  if (iso == null) return null
  if (typeof iso === 'number') return new Date(iso)
  const s = String(iso)
  if (/^\d+$/.test(s)) return new Date(Number(s))
  return new Date(s.replace('Z', ''))
}

const phaseStartDateFromTask = task => {
  if (!task) return null
  const iso =
    (task.status === TASK_STATUS.NOT_STARTED
      ? task.plannedStartDate
      : task.actualStartDate || task.plannedStartDate) || task.startDate
  return parseTaskDate(iso)
}

const phaseEndDateFromTask = task => {
  if (!task) return null
  const iso =
    (task.status === TASK_STATUS.DONE
      ? task.actualEndDate || task.plannedEndDate
      : task.plannedEndDate) || task.endDate
  return parseTaskDate(iso)
}

export const daysInRangeFromTask = (task, rangeStart, rangeEnd) => {
  const rs = toDate(rangeStart)
  const re = toDate(rangeEnd)
  if (!rs || !re) return 0
  const ps = phaseStartDateFromTask(task) || rs
  const pe = phaseEndDateFromTask(task) || re
  const start = dayjs(ps).isAfter(dayjs(rs), 'day') ? ps : rs
  const end = dayjs(pe).isBefore(dayjs(re), 'day') ? pe : re
  if (dayjs(start).isAfter(dayjs(end), 'day')) return 0
  return dayjs(end).startOf('day').diff(dayjs(start).startOf('day'), 'day') + 1
}

export const formatNum = s => {
  const n = parseFloat((s || '').toString().replace(/,/g, '')) || 0
  return Math.round(n).toLocaleString(undefined, { maximumFractionDigits: 0 })
}

export const formatRate = formatNum

export const applyRateModifier = (rate, modifierType, modifierValue) => {
  if (!rate || !modifierType) return rate
  const pct = parseFloat(modifierValue) || 0
  if (!pct) return rate
  const multiplier = modifierType === 1 ? 100 - pct : 100 + pct
  return parseFloat(((rate * multiplier) / 100).toFixed(2))
}

// True when a fee amount has been entered. Zero is a permitted fixed fee, so
// the only invalid states are an empty/blank field or unparseable input.
export const hasNum = s => {
  const trimmed = (s == null ? '' : s).toString().trim()
  if (trimmed === '') return false
  const n = parseFloat(trimmed.replace(/,/g, ''))
  return Number.isFinite(n) && n >= 0
}

const k = (t, key) => t(`fixedFeeSetup.arrangement.${key}`)

export const describeArrangement = (state, t) => ({
  headline: k(t, 'fixedFee'),
  subline: k(t, 'fixedPhasesAllPhases'),
  hasAmount: !!parseFloat((state.amount || '').replace(/,/g, '')),
  primaryAmount: state.amount,
  primaryAmountLabel: k(t, 'totalFixedFee'),
})

// Level-A phases whose task falls within the projection date range.
export const phasesInScope = state => {
  const allPhases = state.phases || []
  const inScopeIds = new Set(
    filterValidTasks(
      allPhases.map(p => p.taskRaw).filter(Boolean),
      state.start,
      state.end
    ).map(task => task.id)
  )
  return allPhases.filter(p => inScopeIds.has(p.taskRaw?.id))
}

const standardRateTypeId = orgRateTypes => {
  const rateType = (orgRateTypes || []).find(r => r.isStandard === true)
  return rateType?.id ?? null
}

// Out-of-scope rates as {gradeId, rateTypeId, rate}, drawn either from the
// selected rate card (with modifier applied) or the manually-entered rates.
export const resolveOutOfScopeRateRows = (
  state,
  orgRateTypes,
  selectedRateRows
) => {
  const standardId = standardRateTypeId(orgRateTypes)
  if (!standardId) return []
  const source = state.rateSource || 'card'
  if (source === 'card') {
    const modType = state.rateModifier?.type || 0
    const modValue = state.rateModifier?.value || ''
    return (selectedRateRows || [])
      .filter(r => r.rateTypeId === standardId && r.gradeId != null)
      .map(r => ({
        gradeId: r.gradeId,
        rateTypeId: standardId,
        rate: applyRateModifier(r.rate, modType, modValue),
      }))
      .filter(r => Number.isFinite(r.rate) && r.rate > 0)
  }
  return (state.rates || [])
    .filter(r => !r.hidden && r.gradeId != null)
    .map(r => ({
      gradeId: r.gradeId,
      rateTypeId: standardId,
      rate: parseFloat((r.rate || '').toString()),
    }))
    .filter(r => Number.isFinite(r.rate) && r.rate > 0)
}

// Order-independent fingerprint of a rate-row set, used to detect changes.
export const rateRowsFingerprint = rows =>
  (rows || [])
    .slice()
    .sort((a, b) => {
      if (a.gradeId !== b.gradeId) return a.gradeId - b.gradeId
      return (a.rateTypeId || 0) - (b.rateTypeId || 0)
    })
    .map(r => `${r.gradeId}:${r.rateTypeId}:${r.rate}`)
    .join('|')

export const buildStep0SavedData = state => ({
  start: state.start ? dayjs(state.start).valueOf() : null,
  end: state.end ? dayjs(state.end).valueOf() : null,
  currency: state.currency || '',
})

export const buildStep1SavedData = (state, oosRateRows) => ({
  amount: (state.amount || '').toString(),
  approval: state.outOfScope?.approval || '',
  postApproval: state.outOfScope?.postApproval || '',
  customNotes: state.outOfScope?.customNotes || '',
  rateSource: state.rateSource || 'card',
  rateCardId: state.rateCardId ? String(state.rateCardId) : '',
  rateModifierType: state.rateModifier?.type || 0,
  rateModifierValue: state.rateModifier?.value || '',
  rateRows: rateRowsFingerprint(oosRateRows),
  rateCardLinkId:
    state.rateSource === 'card' && state.rateCardId
      ? Number(state.rateCardId)
      : '',
})

export const buildStep2SavedData = scopedPhases => ({
  inScopeTaskIds: scopedPhases
    .map(p => p.taskId)
    .sort((a, b) => a - b)
    .join(','),
})

export const buildOutOfScopePayload = state => {
  const oos = state.outOfScope || {}
  const writtenApprovalNeeded = oos.approval === 'yes'
  let reason = null
  if (writtenApprovalNeeded) {
    reason =
      oos.postApproval === 'custom'
        ? oos.customNotes || 'custom'
        : oos.postApproval || null
  }
  if (reason && reason.length > 300) reason = reason.slice(0, 300)
  return {
    writtenApprovalNeeded,
    reason,
    projectionPeriodId: state.projectionPeriodId,
  }
}

export const savedDataEqual = (a, b) => {
  if (!a || !b) return false
  const keys = Object.keys(a)
  if (keys.length !== Object.keys(b).length) return false
  return keys.every(key => a[key] === b[key])
}

export const sameRateRowSet = (a, b) => {
  if (!Array.isArray(a) || !Array.isArray(b)) return false
  if (a.length !== b.length) return false
  const rowKey = r => `${r.gradeId}:${r.rateTypeId}`
  const aKeys = a.map(rowKey).sort()
  const bKeys = b.map(rowKey).sort()
  return aKeys.every((key, i) => key === bKeys[i])
}
