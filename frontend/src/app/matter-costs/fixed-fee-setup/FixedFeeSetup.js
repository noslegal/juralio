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

import ArrowBackIcon from '@mui/icons-material/ArrowBack'
import ArrowCircleRightOutlinedIcon from '@mui/icons-material/ArrowCircleRightOutlined'
import ArrowForwardIcon from '@mui/icons-material/ArrowForward'
import CheckIcon from '@mui/icons-material/Check'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import CloseIcon from '@mui/icons-material/Close'
import React, { useEffect, useState } from 'react'
import dayjs from 'dayjs'
import { Button, IconButton, Paper, Tooltip, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import costsService from '../../../services/costs/costs-service'
import matterCostsService from '../../../services/costs/matter-costs-service'
import taskService from '../../../services/task/task-service'
import { useDispatch } from 'react-redux'
import { fetchProjects } from '../../matter-details/projects/projects-actions'
import { flatTaskListFromTree } from '../../../services/task/data-provider/task-list-data-provider'
import BigDataSpinner from '../../../components/feedback/big-data-spinner/BigDataSpinner'
import AssumptionsList from '../AssumptionsList'
import CostsDashboardImg from '../CostsDashboardImg'
import CreatePhaseDeliverableDialog from './CreatePhaseDeliverableDialog'
import Step1 from './Step1'
import Step2 from './Step2'
import Step3 from './Step3'
import Step4 from './Step4'
import Stepper from './Stepper'
import useFixedFeeStyles from './useFixedFeeStyles'
import { FIXED_FEE_SETUP_STEP_KEYS } from '../../constants'
import {
  buildOutOfScopePayload,
  buildStep0SavedData,
  buildStep1SavedData,
  buildStep2SavedData,
  describeArrangement,
  fullCurrency,
  hasNum,
  outOfScopeFromDetails,
  phaseEndFromTask,
  phaseStartFromTask,
  phasesInScope,
  rateRowsFingerprint,
  resolveOutOfScopeRateRows,
  sameRateRowSet,
  savedDataEqual,
} from './helpers'

const INITIAL_STATE = {
  start: dayjs().startOf('month').toDate(),
  end: dayjs().add(2, 'month').endOf('month').toDate(),
  projectionPeriodId: null,
  rateTableDetailsId: null,
  pricingId: null,
  outOfScopeDetailsId: null,
  outOfScopeRatePeriodId: null,
  outOfScopeRateRows: [],
  outOfScopeRateCardLinkId: null,
  ctesSaved: false,
  step0SavedData: null,
  step1SavedData: null,
  step2SavedData: null,
  currency: '',
  amount: null,
  outOfScope: { approval: 'yes', postApproval: 'agreed' },
  modifiers: {},
  phases: [],
  rateCardId: '',
  rateSource: 'card',
  rates: [],
  rateModifier: { type: 0, value: '' },
}

const FixedFeeSetup = ({
  matterId,
  userPosition,
  freshFlow = false,
  targetProjectionPeriodId = null,
  skipWelcomeBack = false,
  liveEditMode = false,
  defaultStart = null,
  minStart = null,
  defaultCurrency = null,
  defaultOutOfScope = null,
  hasPreviousProjection = false,
  onClose = null,
  onConfirmed = null,
}) => {
  const { classes, cx } = useFixedFeeStyles()
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const [step, setStep] = useState(0)
  const [maxStep, setMaxStep] = useState(0)
  const [state, setState] = useState(() => {
    let s = INITIAL_STATE
    if (defaultStart) {
      const start = dayjs(defaultStart).startOf('month').toDate()
      const end = dayjs(start).add(2, 'month').endOf('month').toDate()
      s = { ...s, start, end }
    }
    if (defaultCurrency) s = { ...s, currency: fullCurrency(defaultCurrency) }
    if (defaultOutOfScope) s = { ...s, outOfScope: defaultOutOfScope }
    return s
  })
  const [confirmed, setConfirmed] = useState(false)
  const [savingStep, setSavingStep] = useState(false)
  const [rateTables, setRateTables] = useState([])
  const [orgGrades, setOrgGrades] = useState([])
  const [orgRateTypes, setOrgRateTypes] = useState([])
  const [selectedRateRows, setSelectedRateRows] = useState([])
  const [assumptionDrawerTaskId, setAssumptionDrawerTaskId] = useState(null)
  const [deliverableDialogPhase, setDeliverableDialogPhase] = useState(null)
  const [showWelcomeBack, setShowWelcomeBack] = useState(false)
  const [lastSavedStep, setLastSavedStep] = useState(-1)
  const [stageLoaded, setStageLoaded] = useState(freshFlow)
  const [isLatestProjectionPeriod, setIsLatestProjectionPeriod] =
    useState(false)

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [step])

  const refetchAssumptions = () => {
    if (!matterId) return
    matterCostsService.getAssumptions(matterId).then(res => {
      if (res?.status !== 200) return
      const byPhaseId = new Map()
      res.body.forEach(a => {
        const tid = a.task?.id
        if (tid == null) return
        const list = byPhaseId.get(tid) ?? []
        list.push(a)
        byPhaseId.set(tid, list)
      })
      setState(prev => ({
        ...prev,
        phases: prev.phases.map(p => {
          const raw = (byPhaseId.get(p.taskId) ?? [])
            .slice()
            .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
          return {
            ...p,
            assumptions: raw
              .map(a => a.summary || a.assumption)
              .filter(Boolean),
            assumptionsRaw: raw,
          }
        }),
      }))
    })
  }

  const refetchPhaseTasks = () => {
    if (!matterId) return
    taskService.getAllMatterTasks(matterId).then(tasksRes => {
      if (tasksRes?.status !== 200) return
      const taskById = new Map()
      tasksRes.body.forEach(t => taskById.set(t.id, t))
      setState(prev => ({
        ...prev,
        phases: prev.phases.map(p => {
          const fresh = taskById.get(p.taskId)
          if (!fresh) return p
          return {
            ...p,
            taskRaw: fresh,
            deliverables: flatTaskListFromTree(fresh)
              .filter(d => d.isDeliverable === true)
              .map(d => d.name),
          }
        }),
      }))
    })
  }

  const positionId = userPosition?.positionData?.id
  useEffect(() => {
    if (!matterId || !positionId) return
    Promise.all([
      taskService.getAllMatterTasks(matterId),
      matterCostsService.getAssumptions(matterId),
      dispatch(fetchProjects(matterId, false, false, true)),
    ]).then(([tasksRes, assumptionsRes, projectsAction]) => {
      if (tasksRes?.status !== 200) return
      const workstreamNameById = new Map()
      ;(projectsAction?.projects || []).forEach(p => {
        workstreamNameById.set(p.id, p.name)
      })
      const assumptionsByPhaseId = new Map()
      if (assumptionsRes?.status === 200) {
        assumptionsRes.body.forEach(a => {
          const tid = a.task?.id
          if (tid == null) return
          const list = assumptionsByPhaseId.get(tid) ?? []
          list.push(a)
          assumptionsByPhaseId.set(tid, list)
        })
      }
      const levelA = tasksRes.body
        .filter(t => t.level === 1)
        .map(t => {
          const phaseAssumptions = (assumptionsByPhaseId.get(t.id) ?? [])
            .slice()
            .sort((a, b) => (a.position ?? 0) - (b.position ?? 0))
            .map(a => a.summary || a.assumption)
            .filter(Boolean)
          return {
            id: `task-${t.id}`,
            taskId: t.id,
            taskRaw: t,
            name: t.name,
            workstreamId: t.projectId ?? null,
            workstreamName: workstreamNameById.get(t.projectId) || '',
            start: phaseStartFromTask(t),
            end: phaseEndFromTask(t),
            assumptions: phaseAssumptions,
            assumptionsRaw: (assumptionsByPhaseId.get(t.id) ?? [])
              .slice()
              .sort((a, b) => (a.position ?? 0) - (b.position ?? 0)),
            deliverables: flatTaskListFromTree(t)
              .filter(d => d.isDeliverable === true)
              .map(d => d.name),
          }
        })
      setState(prev => ({ ...prev, phases: levelA }))
    })
    costsService
      .getFilteredRateTableDetails({ removeDraft: true, position: positionId })
      .then(res => {
        if (res?.status !== 200) return
        setRateTables(res.body.map(w => w.rateTableDetails))
      })

    costsService.getGrades(positionId).then(res => {
      if (res?.status === 200) setOrgGrades(res.body)
    })

    costsService.getRateTypes(positionId).then(res => {
      if (res?.status === 200) setOrgRateTypes(res.body)
    })

    if (freshFlow) {
      // A follow-on projection (the matter already has a finalised projection)
      // reuses the matter's existing rate table details and rates. Load them so
      // step 1 shows the current rates and saving updates them in place rather
      // than creating a new rate set. The first projection has nothing to load.
      if (!hasPreviousProjection) return
      costsService
        .getMatterRateTableDetails(matterId)
        .catch(() => null)
        .then(rtdRes => {
          const rtd =
            rtdRes?.status === 200 ? rtdRes.body?.rateTableDetails : null
          const rtdId = rtd?.id ?? null
          if (!rtdId) return
          const linkedSourceRtdId = rtd.associated_id ?? null
          // getRateTable hits /rates/:id (getTable) which returns the RTD's own
          // rates directly. The matter-scoped getMatterTable endpoint returns
          // nothing for an unlinked RTD (setup=false) or only standard-type rates
          // (setup=true), so a previous projection's rates can come back empty.
          return costsService
            .getRateTable(rtdId)
            .catch(() => null)
            .then(ratesRes => {
              const rateRows =
                ratesRes?.status === 200 ? ratesRes.body || [] : []
              setState(prev => {
                // A follow-on projection always edits the matter rates inline,
                // so the rate source is always manual.
                const next = {
                  ...prev,
                  rateTableDetailsId: rtdId,
                  rateSource: 'manual',
                }
                if (linkedSourceRtdId) {
                  next.outOfScopeRateCardLinkId = linkedSourceRtdId
                }
                if (rateRows.length > 0) {
                  next.outOfScopeRatePeriodId = rateRows[0]?.periodId ?? null
                  next.outOfScopeRateRows = rateRows.map(r => ({
                    rateId: r.rateId,
                    gradeId: r.gradeId,
                    rateTypeId: r.rateTypeId,
                    rate: r.rate,
                  }))
                  next.rates = rateRows.map(r => ({
                    id: 'grade-' + r.gradeId,
                    gradeId: r.gradeId,
                    role: r.gradeName,
                    colour_idx: r.colour_idx ?? 0,
                    rate: r.rate != null ? String(r.rate) : '',
                    hidden: false,
                  }))
                }
                return next
              })
            })
        })
      return
    }

    matterCostsService.getClientCostStageData(matterId).then(stageRes => {
      if (stageRes?.status !== 200) {
        setStageLoaded(true)
        return
      }
      const body = stageRes.body || {}
      let projection = null
      if (targetProjectionPeriodId) {
        projection = (body.projectionStageList || []).find(
          p => p?.id === targetProjectionPeriodId
        )
        if (!projection) {
          setStageLoaded(true)
          return
        }
      } else {
        if (!body.hasProjectionPeriod) {
          setStageLoaded(true)
          return
        }
      }
      const period = projection?.period || body.projectionPeriod || {}
      const periodId = period.id ?? null

      // The end date of a projection period is only editable in live mode when
      // it is the matter's most recent (latest-starting) projection period.
      const allStages = body.projectionStageList || []
      const latestStage = allStages.reduce((best, p) => {
        const sd = p?.period?.startDate
        if (!sd) return best
        if (!best) return p
        return dayjs(sd).isAfter(dayjs(best.period.startDate)) ? p : best
      }, null)
      const latestPeriodId = latestStage?.period?.id ?? null
      setIsLatestProjectionPeriod(
        latestPeriodId == null ? true : latestPeriodId === periodId
      )
      const rtd = body.rateTableDetails || {}
      const rtdId = rtd.id ?? null
      const linkedSourceRtdId = rtd.associated_id ?? null
      const currency = fullCurrency(rtd.currency)
      const start = period.startDate
        ? dayjs(period.startDate).toDate()
        : undefined
      const end = period.endDate ? dayjs(period.endDate).toDate() : undefined
      const pricing = (projection ? projection.pricing : body.pricing) || null
      const hasPricing = projection
        ? !!projection.hasPricing
        : !!body.hasPricing
      const hasCostTimeEstimates = projection
        ? !!projection.hasCostTimeEstimates
        : !!body.hasCostTimeEstimates
      const hasSnapshot = projection
        ? !!projection.hasSnapshot
        : !!body.hasSnapshot
      const oosDetails =
        (projection
          ? projection.outOfScopeDetails
          : (body.projectionStageList || []).find(p => p?.id === periodId)
              ?.outOfScopeDetails) || null

      // getRateTable hits /rates/:id (getTable) which returns the RTD's own
      // rates directly. getMatterTable returns nothing for an unlinked RTD, so
      // a follow-on draft whose rates came from a previous projection — or any
      // matter that entered rates manually — would come back empty.
      const ratesFetch = rtdId
        ? costsService.getRateTable(rtdId).catch(() => null)
        : Promise.resolve(null)

      ratesFetch.then(ratesRes => {
        const rateRows = ratesRes?.status === 200 ? ratesRes.body || [] : []
        const ratePeriodId = rateRows[0]?.periodId ?? null
        const rehydratedRateRows = rateRows.map(r => ({
          rateId: r.rateId,
          gradeId: r.gradeId,
          rateTypeId: r.rateTypeId,
          rate: r.rate,
        }))
        const rateRowsFp = rateRowsFingerprint(rehydratedRateRows)
        const manualStateRates = rateRows.map(r => ({
          id: 'grade-' + r.gradeId,
          gradeId: r.gradeId,
          role: r.gradeName,
          colour_idx: r.colour_idx ?? 0,
          rate: r.rate != null ? String(r.rate) : '',
          hidden: false,
        }))

        setState(prev => {
          const nextStart = start || prev.start
          const nextEnd = end || prev.end
          const nextCurrency = currency || prev.currency
          const nextAmount =
            hasPricing && pricing && pricing.value != null
              ? String(pricing.value)
              : prev.amount
          const next = {
            ...prev,
            projectionPeriodId: periodId,
            rateTableDetailsId: rtdId,
            currency: nextCurrency,
            start: nextStart,
            end: nextEnd,
            step0SavedData: {
              start: nextStart ? dayjs(nextStart).valueOf() : null,
              end: nextEnd ? dayjs(nextEnd).valueOf() : null,
              currency: nextCurrency || '',
            },
          }
          if (hasPricing && pricing) {
            next.pricingId = pricing.id ?? null
            next.amount = nextAmount
            next.step1SavedData = { amount: (nextAmount || '').toString() }
          }
          if (oosDetails) {
            next.outOfScope = outOfScopeFromDetails(oosDetails)
            next.outOfScopeDetailsId = oosDetails.id ?? null
            if (next.step1SavedData) {
              next.step1SavedData = {
                ...next.step1SavedData,
                approval: next.outOfScope.approval,
                postApproval: next.outOfScope.postApproval,
                customNotes: next.outOfScope.customNotes,
              }
            }
          }
          if (rehydratedRateRows.length > 0) {
            next.outOfScopeRatePeriodId = ratePeriodId
            next.outOfScopeRateRows = rehydratedRateRows
            next.rateSource = 'manual'
            next.rates = manualStateRates
          }
          if (linkedSourceRtdId) {
            next.outOfScopeRateCardLinkId = linkedSourceRtdId
          }
          if (next.step1SavedData) {
            next.step1SavedData = {
              ...next.step1SavedData,
              rateSource: rehydratedRateRows.length > 0 ? 'manual' : 'card',
              rateCardId: '',
              rateModifierType: 0,
              rateModifierValue: '',
              rateRows: rateRowsFp,
              rateCardLinkId: '',
            }
          }
          if (hasCostTimeEstimates) {
            next.ctesSaved = true
          }
          return next
        })

        if (hasSnapshot && !liveEditMode) {
          setConfirmed(true)
        }
        // Cost time estimates are created on the backend as a side effect of
        // saving pricing, so hasCostTimeEstimates is not a distinct step in this
        // client fixed-fee flow. Deriving the resume point from it would always
        // push the user to step 4 once pricing is saved, so we resolve the stage
        // purely from period / pricing / snapshot.
        const hasPeriod = projection ? true : !!body.hasProjectionPeriod
        let resolvedStage = -1
        if (hasPeriod) resolvedStage = 0
        if (hasPricing) resolvedStage = Math.max(resolvedStage, 1)
        if (hasSnapshot) resolvedStage = Math.max(resolvedStage, 3)
        setLastSavedStep(resolvedStage)
        if (liveEditMode) {
          setStep(1)
          setMaxStep(FIXED_FEE_SETUP_STEP_KEYS.length - 1)
        } else if (skipWelcomeBack) {
          const resumeStep = Math.min(
            FIXED_FEE_SETUP_STEP_KEYS.length - 1,
            Math.max(resolvedStage, 0) + (resolvedStage < 0 ? 0 : 1)
          )
          setStep(resumeStep)
          setMaxStep(resumeStep)
        } else {
          setShowWelcomeBack(true)
        }
        setStageLoaded(true)
      })
    })
  }, [
    matterId,
    positionId,
    freshFlow,
    hasPreviousProjection,
    targetProjectionPeriodId,
    skipWelcomeBack,
    liveEditMode,
    dispatch,
  ])

  useEffect(() => {
    if (!state.rateCardId) {
      setSelectedRateRows([])
      return
    }
    costsService.getRateTable(state.rateCardId).then(res => {
      if (res?.status === 200) setSelectedRateRows(res.body)
    })
  }, [state.rateCardId])

  useEffect(() => {
    if (!state.ctesSaved) return
    if (state.step2SavedData) return
    if (!state.phases || state.phases.length === 0) return
    if (!state.start || !state.end) return
    const scopedPhases = phasesInScope({
      phases: state.phases,
      start: state.start,
      end: state.end,
    })
    setState(s => ({ ...s, step2SavedData: buildStep2SavedData(scopedPhases) }))
  }, [
    state.ctesSaved,
    state.phases,
    state.start,
    state.end,
    state.step2SavedData,
  ])

  const goNext = () =>
    setStep(s => {
      const n = Math.min(FIXED_FEE_SETUP_STEP_KEYS.length - 1, s + 1)
      setMaxStep(m => Math.max(m, n))
      return n
    })
  const goBack = () => setStep(s => Math.max(0, s - 1))

  const handleJump = target => {
    // In live mode, step-0 edits are held in state until Finalise, so navigating
    // away must not discard them. The fresh flow still reverts unsaved edits.
    if (!liveEditMode && step === 0 && target !== 0) {
      setState(s => {
        const saved = s.step0SavedData
        if (!saved) return s
        return {
          ...s,
          start: saved.start != null ? new Date(saved.start) : s.start,
          end: saved.end != null ? new Date(saved.end) : s.end,
          currency: saved.currency,
        }
      })
    }
    setStep(target)
  }

  const saveStep0 = () => {
    const current = buildStep0SavedData(state)
    if (state.projectionPeriodId && state.rateTableDetailsId) {
      if (savedDataEqual(current, state.step0SavedData)) {
        return Promise.resolve()
      }
      return Promise.all([
        costsService.editProjectionPeriod(state.projectionPeriodId, {
          matterId,
          startDate: dayjs(state.start).add(1, 'h'),
          endDate: dayjs.utc(state.end),
        }),
        costsService.updateRateTableDetail(state.rateTableDetailsId, {
          currency: state.currency,
        }),
      ]).then(() => {
        setState(s => ({ ...s, step0SavedData: current }))
      })
    }
    // A matter has a single RTD shared across its projections. On the first
    // save — or when starting a subsequent projection — create the new
    // projection period, but reuse the matter's existing RTD if it has one;
    // only create an RTD when none exists yet. The RTD is never deleted.
    return costsService
      .getMatterRateTableDetails(matterId)
      .catch(() => null)
      .then(rtdRes => {
        const existingRtdId =
          rtdRes?.status === 200
            ? (rtdRes.body?.rateTableDetails?.id ?? null)
            : null
        const rtdPromise = existingRtdId
          ? costsService
              .updateRateTableDetail(existingRtdId, {
                currency: state.currency,
              })
              .then(() => existingRtdId)
          : costsService
              .createRateTableDetail({
                currency: state.currency,
                work_type: 'Placeholder',
                location: 'Placeholder',
                client: false,
                draft: true,
                matter: matterId,
                position: userPosition?.positionData?.id,
              })
              .then(res => res?.body?.id ?? null)
        return Promise.all([
          costsService.createProjectionPeriod(matterId, {
            startDate: dayjs(state.start).add(1, 'h'),
            endDate: dayjs.utc(state.end),
            matterId,
          }),
          rtdPromise,
        ])
      })
      .then(([periodRes, rtdId]) => {
        setState(s => ({
          ...s,
          projectionPeriodId: periodRes?.body?.id ?? null,
          rateTableDetailsId: rtdId,
          step0SavedData: current,
        }))
      })
  }

  const saveStep1 = () => {
    const oosRateRows = resolveOutOfScopeRateRows(
      state,
      orgRateTypes,
      selectedRateRows
    )
    const current = buildStep1SavedData(state, oosRateRows)
    if (
      state.pricingId &&
      state.outOfScopeDetailsId &&
      savedDataEqual(current, state.step1SavedData)
    ) {
      return Promise.resolve()
    }
    const scopedPhases = phasesInScope(state)
    const fee =
      parseFloat((state.amount || '').toString().replace(/,/g, '')) || 0
    const pricingPayload = {
      matterId,
      value: fee,
      type: '1',
      reason: '0',
      period: state.projectionPeriodId,
      taskList: scopedPhases.map(p => p.taskRaw).filter(Boolean),
      cap: '0',
      fee,
      fullReason: null,
      type2control: '0',
    }
    const pricingPromise = state.pricingId
      ? matterCostsService.updatePricing(
          matterId,
          state.pricingId,
          pricingPayload
        )
      : matterCostsService.savePricing(matterId, [pricingPayload])

    const oosPayload = buildOutOfScopePayload(state)
    let oosPromise = Promise.resolve(null)
    if (state.projectionPeriodId) {
      oosPromise = state.outOfScopeDetailsId
        ? matterCostsService.updateOutOfScopeDetails(
            matterId,
            state.outOfScopeDetailsId,
            oosPayload
          )
        : matterCostsService.saveOutOfScopeDetails(matterId, oosPayload)
    }

    const ratesPromise = saveOutOfScopeRates()

    return Promise.all([pricingPromise, oosPromise, ratesPromise]).then(
      ([pricingRes, oosRes, ratesRes]) => {
        const savedPricing = Array.isArray(pricingRes?.body)
          ? pricingRes.body[0]
          : pricingRes?.body
        const savedOos = oosRes?.body
        setState(s => {
          const next = {
            ...s,
            pricingId: s.pricingId ?? savedPricing?.id ?? null,
            outOfScopeDetailsId: s.outOfScopeDetailsId ?? savedOos?.id ?? null,
            step1SavedData: current,
          }
          if (ratesRes) {
            if ('periodId' in ratesRes) {
              next.outOfScopeRatePeriodId = ratesRes.periodId
              next.outOfScopeRateRows = ratesRes.savedRows
            }
            if (ratesRes.linkId != null) {
              next.outOfScopeRateCardLinkId = ratesRes.linkId
            }
          }
          return next
        })
      }
    )
  }

  const createPeriodAndSaveRates = desiredRows =>
    costsService
      .createPeriod({
        name: 'initial period',
        startDate: null,
        endDate: null,
        rateTableDetailId: state.rateTableDetailsId,
        matterId,
      })
      .then(periodRes => {
        const periodId = periodRes?.body?.id
        if (!periodId) return null
        const payload = desiredRows.map(r => ({
          gradeId: r.gradeId,
          rateTypeId: r.rateTypeId,
          periodId,
          rate_table_detailsId: state.rateTableDetailsId,
          matterId,
          rate: r.rate,
        }))
        return costsService.bulkCreateRates(payload).then(createRes => {
          const savedRows = (createRes?.body || []).map(saved => ({
            rateId: saved.id,
            gradeId: saved.grade?.id ?? saved.gradeId,
            rateTypeId: saved.rateType?.id ?? saved.rateTypeId,
            rate: saved.rate,
          }))
          return { periodId, savedRows }
        })
      })

  const linkRateCardTemplate = () => {
    if (state.rateSource !== 'card') return Promise.resolve(null)
    const desiredLinkId = state.rateCardId ? Number(state.rateCardId) : null
    if (!desiredLinkId) return Promise.resolve(null)
    if (desiredLinkId === state.outOfScopeRateCardLinkId) {
      return Promise.resolve(desiredLinkId)
    }
    return costsService
      .updateRateTableDetail(state.rateTableDetailsId, {
        rateTableDetails: desiredLinkId,
      })
      .then(() => desiredLinkId)
  }

  const saveOutOfScopeRates = () => {
    if (!state.rateTableDetailsId) return Promise.resolve(null)
    const desiredRows = resolveOutOfScopeRateRows(
      state,
      orgRateTypes,
      selectedRateRows
    )
    const previousRows = state.outOfScopeRateRows || []
    const hasPeriod = state.outOfScopeRatePeriodId != null

    const withLink = rowsResult =>
      linkRateCardTemplate().then(linkId => {
        if (!rowsResult) return linkId != null ? { linkId } : null
        return { ...rowsResult, linkId }
      })

    if (!hasPeriod) {
      if (desiredRows.length === 0) return withLink(null)
      return createPeriodAndSaveRates(desiredRows).then(withLink)
    }

    if (sameRateRowSet(desiredRows, previousRows)) {
      const previousByKey = new Map(
        previousRows.map(r => [`${r.gradeId}:${r.rateTypeId}`, r])
      )
      const toUpdate = desiredRows.filter(r => {
        const prev = previousByKey.get(`${r.gradeId}:${r.rateTypeId}`)
        return prev && prev.rate !== r.rate
      })
      if (toUpdate.length === 0) return withLink(null)
      return Promise.all(
        toUpdate.map(r => {
          const prev = previousByKey.get(`${r.gradeId}:${r.rateTypeId}`)
          return costsService.updateRate(prev.rateId, {
            rate: r.rate,
            matterId,
          })
        })
      )
        .then(() => {
          const updatedByKey = new Map(
            toUpdate.map(r => [`${r.gradeId}:${r.rateTypeId}`, r.rate])
          )
          const savedRows = previousRows.map(r => {
            const k = `${r.gradeId}:${r.rateTypeId}`
            return updatedByKey.has(k) ? { ...r, rate: updatedByKey.get(k) } : r
          })
          return { periodId: state.outOfScopeRatePeriodId, savedRows }
        })
        .then(withLink)
    }

    return costsService
      .deletePeriod(state.outOfScopeRatePeriodId)
      .then(() => {
        if (desiredRows.length === 0) {
          return { periodId: null, savedRows: [] }
        }
        return createPeriodAndSaveRates(desiredRows)
      })
      .then(withLink)
  }

  const handleStepContinue = currentStep => {
    if (savingStep) return
    const saver =
      currentStep === 0 ? saveStep0 : currentStep === 1 ? saveStep1 : null
    if (!saver) {
      goNext()
      return
    }
    setSavingStep(true)
    saver()
      .then(() => {
        setLastSavedStep(s => Math.max(s, currentStep))
        setSavingStep(false)
        goNext()
      })
      .catch(() => {
        setSavingStep(false)
      })
  }

  const handleConfirm = () => {
    if (confirmed || savingStep) return
    if (!state.projectionPeriodId) {
      setConfirmed(true)
      if (onConfirmed) setTimeout(() => onConfirmed(), 1500)
      return
    }
    setSavingStep(true)
    // When re-finalising in live mode, tasks may have come into scope (by date)
    // since the projection was first finalised. Snapshots only include tasks
    // that have a cost time estimate, so ensure a CTE exists for every in-scope
    // task before snapshotting — otherwise newly in-scope phases are dropped.
    const syncCtes = () => {
      if (!liveEditMode) return Promise.resolve()
      const taskList = phasesInScope(state)
        .map(p => p.taskRaw)
        .filter(Boolean)
      if (taskList.length === 0) return Promise.resolve()
      return matterCostsService
        .syncCostTimeEstimates(matterId, {
          projectionPeriod: state.projectionPeriodId,
          taskList,
        })
        .catch(() => null)
    }
    // In live mode, page edits are held in state and only posted now. The
    // savers are idempotent (they no-op when nothing changed), and the period /
    // RTD / pricing IDs already exist for a re-finalise, so they can be chained
    // in order: persist config, then sync CTEs, then snapshot.
    const flushHeldEdits = () =>
      liveEditMode ? saveStep0().then(() => saveStep1()) : Promise.resolve()
    flushHeldEdits()
      .then(() => syncCtes())
      .then(() =>
        matterCostsService.saveCostSnapshot(matterId, {
          projectionPeriod: state.projectionPeriodId,
          cteRevenueList: [],
          totalCost: 0,
        })
      )
      .then(() => {
        setConfirmed(true)
        setSavingStep(false)
        if (onConfirmed) setTimeout(() => onConfirmed(), 1500)
      })
      .catch(() => {
        setSavingStep(false)
      })
  }

  const isLast = step === FIXED_FEE_SETUP_STEP_KEYS.length - 1
  const desc = describeArrangement(state, t)
  const canAdvance = (() => {
    if (step === 0) return !!(state.start && state.end && state.currency)
    if (step !== 1) return true
    return hasNum(state.amount)
  })()
  // In live mode Finalise can be triggered from any page, so it validates the
  // whole projection rather than just the current step.
  const canFinalise =
    !!(state.start && state.end && state.currency) && hasNum(state.amount)

  if (!stageLoaded) {
    return (
      <div className={classes.welcomeOuter}>
        <BigDataSpinner size={180} />
      </div>
    )
  }

  if (showWelcomeBack) {
    const resumeStep = Math.min(
      FIXED_FEE_SETUP_STEP_KEYS.length - 1,
      lastSavedStep + 1
    )
    return (
      <div className={classes.welcomeOuter}>
        <Paper className={classes.welcomeContainer}>
          <Typography className={classes.welcomeTitle} variant="h4">
            {t('fixedFeeSetup.welcomeBack.title')}
          </Typography>
          <div className={classes.welcomeBody}>
            <div className={classes.welcomeLeftCol}>
              <Typography variant="body1" className={classes.welcomeSubtitle}>
                {t('fixedFeeSetup.welcomeBack.subtitle')}
              </Typography>
              {lastSavedStep >= 0 && (
                <div className={classes.welcomeMeta}>
                  <Typography
                    variant="caption"
                    className={classes.welcomeMetaLabel}
                  >
                    {t('fixedFeeSetup.welcomeBack.lastSavedLabel')}
                  </Typography>
                  <Typography
                    variant="body1"
                    className={classes.welcomeMetaValue}
                  >
                    {t(
                      `fixedFeeSetup.steps.${FIXED_FEE_SETUP_STEP_KEYS[lastSavedStep]}`
                    )}
                  </Typography>
                </div>
              )}
            </div>
            <div className={classes.welcomeRightCol}>
              <CostsDashboardImg />
              <Button
                data-test="resume-fixed-fee-setup"
                className={classes.welcomeCtaButton}
                variant="contained"
                endIcon={<ArrowCircleRightOutlinedIcon />}
                onClick={() => {
                  setStep(resumeStep)
                  setMaxStep(resumeStep)
                  setShowWelcomeBack(false)
                }}
              >
                {t('fixedFeeSetup.welcomeBack.continue')}
              </Button>
            </div>
          </div>
        </Paper>
      </div>
    )
  }

  return (
    <div className={classes.shell}>
      <div className={classes.pageHeader}>
        <div className={classes.pageHeaderText}>
          <Typography component="h1" className={classes.pageTitle}>
            {liveEditMode
              ? t('fixedFeeSetup.liveTitle', 'Edit Fee Arrangement')
              : t('fixedFeeSetup.title')}
          </Typography>
          <Typography component="div" className={classes.pageSub}>
            {liveEditMode
              ? t(
                  'fixedFeeSetup.liveSubtitle',
                  'Adjust the live fee arrangement to meet the new scope'
                )
              : t('fixedFeeSetup.subtitle')}
          </Typography>
        </div>
        {onClose && (
          <Tooltip title={t('common.close', 'Close')}>
            <IconButton
              data-test="fixed-fee-setup-close"
              className={classes.closeButton}
              onClick={onClose}
              aria-label={t('common.close', 'Close')}
            >
              <CloseIcon />
            </IconButton>
          </Tooltip>
        )}
      </div>

      <Stepper
        current={step}
        maxStep={maxStep}
        onJump={handleJump}
        liveMode={liveEditMode}
      />

      {step === 0 && (
        <Step1
          classes={classes}
          state={state}
          setState={setState}
          hasPreviousProjection={hasPreviousProjection}
          minStart={minStart}
          defaultCurrency={defaultCurrency}
          rateTables={rateTables}
          readOnly={liveEditMode}
          canEditEnd={!liveEditMode || isLatestProjectionPeriod}
        />
      )}
      {step === 1 && (
        <Step2
          classes={classes}
          state={state}
          setState={setState}
          rateTables={rateTables}
          orgGrades={orgGrades}
          selectedRateRows={selectedRateRows}
          hasPreviousProjection={hasPreviousProjection}
          defaultOutOfScope={defaultOutOfScope}
        />
      )}
      {step === 2 && (
        <Step3
          classes={classes}
          state={state}
          setState={setState}
          matterId={matterId}
          onAddAssumption={taskId => setAssumptionDrawerTaskId(taskId)}
          onAddDeliverable={phase => setDeliverableDialogPhase(phase)}
          viewOnly={confirmed}
        />
      )}
      {step === 3 && (
        <Step4
          classes={classes}
          state={state}
          rateTables={rateTables}
          selectedRateRows={selectedRateRows}
        />
      )}

      <div className={classes.footerBar}>
        {step > 0 ? (
          <Button
            type="button"
            data-test="wizard-back"
            variant="text"
            disableElevation
            disableRipple
            className={cx(classes.btn, classes.btnGhost)}
            onClick={goBack}
          >
            <ArrowBackIcon className={classes.btnIcon} />{' '}
            <Typography component="span" variant="inherit">
              {t('fixedFeeSetup.back')}
            </Typography>
          </Button>
        ) : (
          <span />
        )}
        {liveEditMode ? (
          <div className={classes.continueGroup}>
            {!canFinalise && (
              <Typography component="span" className={classes.continueHint}>
                {t('fixedFeeSetup.continueHintAmount')}
              </Typography>
            )}
            <Button
              type="button"
              data-test="wizard-confirm"
              variant="text"
              disableElevation
              disableRipple
              className={cx(classes.btn, classes.btnConfirm)}
              disabled={confirmed || savingStep || !canFinalise}
              onClick={handleConfirm}
            >
              <CheckIcon className={classes.btnIcon} />{' '}
              <Typography component="span" variant="inherit">
                {savingStep
                  ? t('fixedFeeSetup.saving')
                  : t('fixedFeeSetup.confirmArrangement')}
              </Typography>
            </Button>
          </div>
        ) : !isLast ? (
          <div className={classes.continueGroup}>
            {step === 0 && !state.currency && (
              <Typography component="span" className={classes.continueHint}>
                {t('fixedFeeSetup.continueHintCurrency')}
              </Typography>
            )}
            {step === 1 && !canAdvance && (
              <Typography component="span" className={classes.continueHint}>
                {t('fixedFeeSetup.continueHintAmount')}
              </Typography>
            )}
            <Button
              type="button"
              data-test="wizard-continue"
              variant="text"
              disableElevation
              disableRipple
              className={cx(classes.btn, classes.btnPrimary)}
              disabled={!canAdvance || savingStep}
              onClick={() => handleStepContinue(step)}
            >
              <Typography component="span" variant="inherit">
                {savingStep
                  ? t('fixedFeeSetup.saving')
                  : t('fixedFeeSetup.continue')}
              </Typography>{' '}
              <ArrowForwardIcon className={classes.btnIcon} />
            </Button>
          </div>
        ) : (
          <Button
            type="button"
            data-test="wizard-confirm"
            variant="text"
            disableElevation
            disableRipple
            className={cx(classes.btn, classes.btnConfirm)}
            disabled={confirmed || savingStep}
            onClick={handleConfirm}
          >
            <CheckIcon className={classes.btnIcon} />{' '}
            <Typography component="span" variant="inherit">
              {savingStep
                ? t('fixedFeeSetup.saving')
                : t('fixedFeeSetup.confirmArrangement')}
            </Typography>
          </Button>
        )}
      </div>

      <div className={cx(classes.toast, confirmed && classes.toastShow)}>
        <CheckCircleIcon className={classes.toastIcon} />
        <Typography component="span" variant="inherit">
          {t('fixedFeeSetup.arrangementConfirmed', {
            headline: desc.headline,
          })}
        </Typography>
      </div>

      {assumptionDrawerTaskId !== null && (
        <AssumptionsList
          key={assumptionDrawerTaskId}
          phaseId={assumptionDrawerTaskId}
          matterId={matterId}
          assumptionsForPhase={
            state.phases.find(p => p.taskId === assumptionDrawerTaskId)
              ?.assumptionsRaw ?? []
          }
          isViewOnly={false}
          drawerOnly
          onClose={() => {
            setAssumptionDrawerTaskId(null)
            refetchAssumptions()
          }}
        />
      )}
      {deliverableDialogPhase && (
        <CreatePhaseDeliverableDialog
          open
          phase={deliverableDialogPhase}
          matterId={matterId}
          onClose={() => setDeliverableDialogPhase(null)}
          onCreated={() => {
            setDeliverableDialogPhase(null)
            refetchPhaseTasks()
          }}
        />
      )}
    </div>
  )
}

export default FixedFeeSetup
