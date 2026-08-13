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

import CompareArrowsIcon from '@mui/icons-material/CompareArrows'
import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import React, { useMemo, useState } from 'react'
import ScheduleIcon from '@mui/icons-material/Schedule'
import { Collapse, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import OutOfScopeRatesCard from './OutOfScopeRatesCard'
import { TaskIcon, WorkstreamIcon } from '../../../theme/navigation/CommonIcons'
import { filterValidTasks } from '../outcomes/revenueHelper'
import { rateTableCalculateDiscountPercentage } from '../resource/MatterCostsTableHelper'
import {
  applyRateModifier,
  currencyCode,
  describeArrangement,
  fmtMonthShort,
  formatNum,
  groupPhasesByWorkstream,
  monthsBetween,
  daysInRangeFromTask,
} from './helpers'

const Step4 = ({ classes, state, rateTables, selectedRateRows }) => {
  const { t } = useTranslation()
  const [collapsed, setCollapsed] = useState({})
  const toggleSection = key =>
    setCollapsed(prev => ({ ...prev, [key]: !prev[key] }))
  const rateTableLabel = rt =>
    rt.client_name ||
    [rt.location, rt.work_type].filter(Boolean).join(' | ') ||
    `Rate table ${rt.id}`
  const months = monthsBetween(state.start, state.end)
  const allPhases = state.phases
  const phases = useMemo(() => {
    const inScopeIds = new Set(
      filterValidTasks(
        allPhases.map(p => p.taskRaw).filter(Boolean),
        state.start,
        state.end
      ).map(task => task.id)
    )
    return allPhases.filter(p => inScopeIds.has(p.taskRaw?.id))
  }, [allPhases, state.start, state.end])
  const workstreamGroups = useMemo(
    () => groupPhasesByWorkstream(phases),
    [phases]
  )
  const desc = describeArrangement(state, t)
  const formatted = formatNum(desc.primaryAmount)
  const oos = state.outOfScope || {}

  const ratesApplicable = oos.approval === 'yes' || oos.approval === 'no'
  const rateSource = state.rateSource || 'card'
  const modType = state.rateModifier?.type || 0
  const modValue = state.rateModifier?.value || ''
  const selectedRateTable =
    state.rateCardId &&
    (rateTables || []).find(r => String(r.id) === String(state.rateCardId))
  const usingRateCard =
    rateSource === 'card' &&
    !!state.rateCardId &&
    (selectedRateRows || []).length > 0
  const rateCardRows = (() => {
    if (!ratesApplicable) return []
    if (usingRateCard) {
      return selectedRateRows
        .filter(r => r.rate != null)
        .map((r, i) => {
          const agreedRate = applyRateModifier(r.rate, modType, modValue)
          const discount = rateTableCalculateDiscountPercentage(
            agreedRate,
            r.rate
          )
          return {
            id: r.id ?? 'c' + i,
            gradeName: r.gradeName || r.role || '',
            colour_idx: r.colour_idx,
            agreedRate,
            referenceRate: r.rate,
            discountPct: modType === 0 || discount === 'n/a' ? null : discount,
          }
        })
    }
    return (state.rates || [])
      .filter(r => !r.hidden && r.rate != null && String(r.rate).trim() !== '')
      .map((r, i) => ({
        id: r.id ?? 'm' + i,
        gradeName: r.role || '',
        colour_idx: r.colour_idx,
        agreedRate: r.rate,
      }))
  })()

  const postApprovalLabels = {
    agreed: t('fixedFeeSetup.postApproval.agreed'),
    rates: t('fixedFeeSetup.postApproval.rates'),
    custom: oos.customNotes
      ? `${t('fixedFeeSetup.postApproval.custom')}: ${oos.customNotes}`
      : t('fixedFeeSetup.postApproval.custom'),
  }

  return (
    <div className={classes.stepPane}>
      <div className={classes.feeHero}>
        <div>
          <Typography component="div" className={classes.feeHeroLabel}>
            {t('fixedFeeSetup.step4.fixedFee')}
          </Typography>
          {desc.hasAmount ? (
            <Typography component="div" className={classes.feeHeroAmount}>
              {currencyCode(state.currency)} {formatted}
            </Typography>
          ) : (
            <Typography
              component="div"
              className={`${classes.feeHeroAmount} ${classes.feeHeroAmountPlaceholder}`}
            >
              {t('fixedFeeSetup.step4.amountPlaceholder', {
                code: currencyCode(state.currency),
              })}
            </Typography>
          )}
        </div>
        <div className={classes.feeHeroAside}>
          <Typography component="span" className={classes.durationPill}>
            {t('fixedFeeSetup.step4.monthsValue', { months })}
          </Typography>
          <Typography component="div" className={classes.feeHeroDates}>
            {fmtMonthShort(state.start)} – {fmtMonthShort(state.end)}
          </Typography>
        </div>
      </div>

      <div className={classes.card}>
        <div className={classes.sectionTitleRow}>
          <TaskIcon className={classes.sectionTitleIcon} />
          <Typography component="div" className={classes.sectionTitleText}>
            {t('fixedFeeSetup.step4.scope')}
          </Typography>
        </div>
        {workstreamGroups.map(workstream => {
          const wsKey = `ws-${workstream.id}`
          const singleWorkstream = workstreamGroups.length === 1
          return (
            <div key={workstream.id} className={classes.workstreamGroup}>
              <div
                className={classes.workstreamHeader}
                onClick={() => toggleSection(wsKey)}
              >
                <WorkstreamIcon className={classes.workstreamHeaderIcon} />
                <Typography
                  component="span"
                  className={classes.workstreamHeaderTitle}
                >
                  {singleWorkstream
                    ? t('fixedFeeSetup.step3.workstreamFallback')
                    : workstream.name ||
                      t('fixedFeeSetup.step3.workstreamFallback')}
                </Typography>
                <Typography
                  component="span"
                  className={classes.workstreamHeaderCount}
                >
                  ({workstream.phases.length})
                </Typography>
                {collapsed[wsKey] ? (
                  <ExpandMore className={classes.workstreamChevron} />
                ) : (
                  <ExpandLess className={classes.workstreamChevron} />
                )}
              </div>
              <Collapse in={!collapsed[wsKey]} timeout="auto" unmountOnExit>
                {workstream.phases.map(p => {
                  const phaseDays = daysInRangeFromTask(
                    p.taskRaw,
                    state.start,
                    state.end
                  )
                  return (
                    <div key={p.id} className={classes.phasePillRow}>
                      <div className={classes.phasePillBody}>
                        <div>
                          <Typography
                            component="h4"
                            className={classes.phasePillTitle}
                          >
                            {p.name}
                          </Typography>
                          <Typography
                            component="div"
                            className={classes.phasePillMeta}
                          >
                            {t('fixedFeeSetup.step4.deliverableMeta', {
                              count: p.deliverables.length,
                              label:
                                p.deliverables.length === 1
                                  ? t('fixedFeeSetup.step4.deliverableSingular')
                                  : t('fixedFeeSetup.step4.deliverablePlural'),
                              assumptions: p.assumptions.length,
                              aLabel:
                                p.assumptions.length === 1
                                  ? t('fixedFeeSetup.step4.assumptionSingular')
                                  : t('fixedFeeSetup.step4.assumptionPlural'),
                            })}
                          </Typography>
                        </div>
                        <div className={classes.phasePillRight}>
                          <Typography
                            component="div"
                            className={classes.phasePillRange}
                          >
                            {fmtMonthShort(p.start) ||
                              t('fixedFeeSetup.step4.noStartDate')}{' '}
                            –{' '}
                            {fmtMonthShort(p.end) ||
                              t('fixedFeeSetup.step4.noEndDate')}
                          </Typography>
                          <Typography
                            component="div"
                            className={classes.phasePillRangeMeta}
                          >
                            {phaseDays}{' '}
                            {phaseDays === 1
                              ? t('fixedFeeSetup.step3.day')
                              : t('fixedFeeSetup.step3.days')}
                          </Typography>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </Collapse>
            </div>
          )
        })}
      </div>

      {oos.approval && (
        <div className={classes.card}>
          <div className={classes.sectionTitleRow}>
            <CompareArrowsIcon className={classes.sectionTitleIcon} />
            <Typography component="div" className={classes.sectionTitleText}>
              {t('fixedFeeSetup.step4.outOfScope')}
            </Typography>
          </div>
          <div className={classes.kvRow}>
            <Typography component="span" className={classes.kvKey}>
              {t('fixedFeeSetup.step4.writtenApprovalRequired')}
            </Typography>
            <Typography component="span" className={classes.kvVal}>
              {oos.approval === 'yes'
                ? t('fixedFeeSetup.step4.yes')
                : t('fixedFeeSetup.step4.no')}
            </Typography>
          </div>
          {oos.approval === 'yes' && oos.postApproval && (
            <div className={classes.kvRow}>
              <Typography component="span" className={classes.kvKey}>
                {t('fixedFeeSetup.step4.postApprovalPricing')}
              </Typography>
              <Typography component="span" className={classes.kvVal}>
                {postApprovalLabels[oos.postApproval]}
              </Typography>
            </div>
          )}
        </div>
      )}

      {ratesApplicable && (
        <div className={classes.card}>
          <div className={classes.sectionTitleRow}>
            <ScheduleIcon className={classes.sectionTitleIcon} />
            <Typography component="div" className={classes.sectionTitleText}>
              {t('fixedFeeSetup.step4.hourlyRates')}
              <Typography
                component="span"
                variant="inherit"
                className={classes.sectionTitleSuffix}
              >
                {t('fixedFeeSetup.step4.hourlyRatesSuffix')}
              </Typography>
            </Typography>
          </div>
          {rateCardRows.length > 0 ? (
            <OutOfScopeRatesCard
              currency={state.currency}
              basedOn={
                usingRateCard && selectedRateTable
                  ? {
                      label: rateTableLabel(selectedRateTable),
                      isClient: !!selectedRateTable.client,
                    }
                  : null
              }
              rows={rateCardRows}
              showReferenceColumn={usingRateCard}
              footerText={
                usingRateCard ? t('fixedFeeSetup.rateSource.preview') : null
              }
            />
          ) : (
            <Typography component="div" className={classes.kvValPlaceholder}>
              {t('fixedFeeSetup.step4.noRatesChosen')}
            </Typography>
          )}
        </div>
      )}
    </div>
  )
}

export default Step4
