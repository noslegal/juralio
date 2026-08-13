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

import CalendarMonthIcon from '@mui/icons-material/CalendarMonth'
import CalendarTodayIcon from '@mui/icons-material/CalendarToday'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import InfoIcon from '@mui/icons-material/Info'
import PaymentsIcon from '@mui/icons-material/Payments'
import ExpandLess from '@mui/icons-material/ExpandLess'
import ExpandMore from '@mui/icons-material/ExpandMore'
import React, { useMemo, useState } from 'react'
import WarningIcon from '@mui/icons-material/Warning'
import { Collapse, Tooltip, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import JurAssumptions from '../../../assets/images/JurAssumptions'
import JurDeliverable from '../../../assets/images/JurDeliverable'
import { TaskIcon, WorkstreamIcon } from '../../../theme/navigation/CommonIcons'
import { DATE_VARIABLES, TASK_STATUS } from '../../constants'
import { filterValidTasks } from '../outcomes/revenueHelper'
import PhaseDateCell from '../resource/PhaseDateCell'
import PhaseItemList from './PhaseItemList'
import {
  currencyCode,
  describeArrangement,
  fmtMonthShort,
  formatNum,
  groupPhasesByWorkstream,
  monthsBetween,
  daysInRangeFromTask,
  phaseEndFromTask,
  phaseStartFromTask,
} from './helpers'

const PHASE_HEAD_STATUS_CLASS = {
  [TASK_STATUS.NOT_REQUIRED]: 'phaseHeadNotRequired',
  [TASK_STATUS.NOT_STARTED]: 'phaseHeadNotStarted',
  [TASK_STATUS.IN_PROGRESS]: 'phaseHeadInProgress',
  [TASK_STATUS.DONE]: 'phaseHeadDone',
}

const Step3 = ({
  classes,
  state,
  setState,
  onAddAssumption,
  onAddDeliverable,
  matterId,
  viewOnly = false,
}) => {
  const { t } = useTranslation()
  const [collapsed, setCollapsed] = useState({})
  const toggleSection = key =>
    setCollapsed(prev => ({ ...prev, [key]: !prev[key] }))
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
  const totalAssumptions = phases.reduce((n, p) => n + p.assumptions.length, 0)
  const totalDeliverables = phases.reduce(
    (n, p) => n + p.deliverables.length,
    0
  )
  const phasesWithAssumptions = phases.filter(
    p => p.assumptions.length > 0
  ).length
  const phasesWithDeliverables = phases.filter(
    p => p.deliverables.length > 0
  ).length
  const allHaveDeliverables = phases.every(p => p.deliverables.length > 0)
  const allHaveAssumptions = phases.every(p => p.assumptions.length > 0)
  const phaseLabel = count =>
    count === 1
      ? t('fixedFeeSetup.step3.phase')
      : t('fixedFeeSetup.step3.phases')
  const daysLabel = count =>
    count === 1 ? t('fixedFeeSetup.step3.day') : t('fixedFeeSetup.step3.days')
  const assumptionsTooltip = allHaveAssumptions
    ? t('fixedFeeSetup.step3.assumptionsHealthy')
    : t('fixedFeeSetup.step3.assumptionsWarn')
  const deliverablesTooltip = allHaveDeliverables
    ? t('fixedFeeSetup.step3.deliverablesHealthy')
    : t('fixedFeeSetup.step3.deliverablesWarn')

  const allTasks = allPhases.map(p => p.taskRaw).filter(Boolean)
  const handleTasksUpdate = updatedTasks => {
    setState({
      ...state,
      phases: allPhases.map(p => {
        const next = updatedTasks.find(tk => tk?.id === p.taskId)
        if (!next) return p
        return {
          ...p,
          taskRaw: next,
          start: phaseStartFromTask(next) ?? p.start,
          end: phaseEndFromTask(next) ?? p.end,
        }
      }),
    })
  }

  const desc = describeArrangement(state, t)

  return (
    <div className={classes.stepPane}>
      <Typography
        component="div"
        className={`${classes.sectionHeadingTitle} ${classes.step3SummaryHeading}`}
      >
        {t('fixedFeeSetup.step3.summary')}
      </Typography>
      <div className={classes.card}>
        <div className={classes.scopeSummary}>
          <div className={classes.scopeStatRow}>
            <div className={classes.scopeStatIcon}>
              <CalendarMonthIcon className={classes.scopeRowIcon} />
            </div>
            <Typography component="div" className={classes.scopeStatLabel}>
              {t('fixedFeeSetup.step3.duration')}
            </Typography>
            <Typography component="div" className={classes.scopeStatValue}>
              {fmtMonthShort(state.start)} – {fmtMonthShort(state.end)}
              <Typography
                component="span"
                variant="inherit"
                className={classes.scopeStatDurationSuffix}
              >
                {t('fixedFeeSetup.step3.durationMonthsSuffix', {
                  months: monthsBetween(state.start, state.end),
                })}
              </Typography>
            </Typography>
            <div />
          </div>
          <div className={classes.scopeStatRow}>
            <div className={classes.scopeStatIcon}>
              <PaymentsIcon className={classes.scopeRowIcon} />
            </div>
            <Typography component="div" className={classes.scopeStatLabel}>
              {t('fixedFeeSetup.step3.pricing')}
            </Typography>
            <Typography component="div" className={classes.scopeStatValue}>
              <Typography
                component="span"
                variant="inherit"
                className={classes.scopeStatMuted}
              >
                {desc.headline} · {desc.subline}
              </Typography>
              {desc.hasAmount && (
                <Typography
                  component="span"
                  variant="inherit"
                  className={classes.scopeStatAmount}
                >
                  · {currencyCode(state.currency)}{' '}
                  {formatNum(desc.primaryAmount)}
                </Typography>
              )}
            </Typography>
            <div />
          </div>
          <div className={classes.scopeStatRow}>
            <div className={classes.scopeStatIcon}>
              <TaskIcon className={classes.scopeRowIcon} />
            </div>
            <Typography component="div" className={classes.scopeStatLabel}>
              {t('fixedFeeSetup.step3.phasesInRange')}
            </Typography>
            <Typography component="div" className={classes.scopeStatValue}>
              {t('fixedFeeSetup.step3.phasesActive', {
                count: phases.length,
                phaseLabel: phaseLabel(phases.length),
                total: allPhases.length,
              })}
            </Typography>
            <div />
          </div>
          <div className={classes.scopeStatRow}>
            <div className={classes.scopeStatIcon}>
              <JurAssumptions
                className={`${classes.scopeRowIcon} ${classes.assumptionIcon}`}
              />
            </div>
            <Typography component="div" className={classes.scopeStatLabel}>
              {t('fixedFeeSetup.step3.assumptions')}
            </Typography>
            <Typography component="div" className={classes.scopeStatValue}>
              {t('fixedFeeSetup.step3.listValue', {
                total: totalAssumptions,
                count: phasesWithAssumptions,
                phaseLabel: phaseLabel(phasesWithAssumptions),
              })}
            </Typography>
            <Tooltip title={assumptionsTooltip}>
              <div
                className={`${classes.scopeStatBadge} ${
                  allHaveAssumptions
                    ? classes.scopeStatBadgeSuccess
                    : classes.scopeStatBadgeWarn
                }`}
              >
                {allHaveAssumptions ? <CheckCircleIcon /> : <WarningIcon />}
              </div>
            </Tooltip>
          </div>
          <div className={classes.scopeStatRow}>
            <div className={classes.scopeStatIcon}>
              <JurDeliverable
                className={`${classes.scopeRowIcon} ${classes.deliverableIcon}`}
              />
            </div>
            <Typography component="div" className={classes.scopeStatLabel}>
              {t('fixedFeeSetup.step3.deliverables')}
            </Typography>
            <Typography component="div" className={classes.scopeStatValue}>
              {t('fixedFeeSetup.step3.listValue', {
                total: totalDeliverables,
                count: phasesWithDeliverables,
                phaseLabel: phaseLabel(phasesWithDeliverables),
              })}
            </Typography>
            <Tooltip title={deliverablesTooltip}>
              <div
                className={`${classes.scopeStatBadge} ${
                  allHaveDeliverables
                    ? classes.scopeStatBadgeSuccess
                    : classes.scopeStatBadgeWarn
                }`}
              >
                {allHaveDeliverables ? <CheckCircleIcon /> : <WarningIcon />}
              </div>
            </Tooltip>
          </div>
        </div>
      </div>

      <div className={classes.sectionHeading}>
        <Typography component="div" className={classes.sectionHeadingTitle}>
          {t('fixedFeeSetup.step3.scopeDetails')}
        </Typography>
        <Typography component="div" className={classes.sectionHeadingMeta}>
          {phases.length}{' '}
          {phases.length === 1
            ? t('fixedFeeSetup.step3.itemSingular')
            : t('fixedFeeSetup.step3.itemPlural')}
        </Typography>
      </div>

      <div className={classes.infoAlert}>
        <InfoIcon className={classes.infoAlertIcon} />
        <Typography component="span" variant="inherit">
          {t('fixedFeeSetup.step3.scopeInfoAlert')}
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
                const warn =
                  p.deliverables.length === 0 || p.assumptions.length === 0
                const statusHeadClass =
                  classes[PHASE_HEAD_STATUS_CLASS[p.taskRaw?.status]] ||
                  classes.phaseHeadTemplate
                const phaseDays = daysInRangeFromTask(
                  p.taskRaw,
                  state.start,
                  state.end
                )
                return (
                  <div key={p.id} className={classes.phaseCard}>
                    <div className={`${classes.phaseHead} ${statusHeadClass}`}>
                      <Typography component="h3" className={classes.phaseTitle}>
                        <TaskIcon className={classes.phaseHeadIcon} />
                        <Typography component="span" variant="inherit">
                          {p.name}
                        </Typography>
                      </Typography>
                      <div className={classes.phaseHeadRight}>
                        {warn ? (
                          <Tooltip
                            title={t('fixedFeeSetup.step3.phaseWarnTooltip')}
                          >
                            <span className={classes.phaseBadgeWarn}>
                              <WarningIcon className={classes.phaseBadgeIcon} />
                            </span>
                          </Tooltip>
                        ) : (
                          <Tooltip
                            title={t('fixedFeeSetup.step3.phaseOkTooltip')}
                          >
                            <span className={classes.phaseBadgeOk}>
                              <CheckCircleIcon
                                className={classes.phaseBadgeIcon}
                              />
                            </span>
                          </Tooltip>
                        )}
                      </div>
                    </div>
                    <div className={classes.phaseBody}>
                      <div className={classes.phaseDates}>
                        <CalendarTodayIcon className={classes.phaseDateIcon} />
                        <PhaseDateCell
                          task={p.taskRaw}
                          dateType={DATE_VARIABLES.START}
                          matterId={matterId}
                          allTasks={allTasks}
                          taskIndex={allTasks.findIndex(
                            tk => tk?.id === p.taskId
                          )}
                          setTasks={handleTasksUpdate}
                          flatTaskList={allTasks}
                        />
                        <Typography
                          component="span"
                          className={classes.phaseRangeDash}
                        >
                          –
                        </Typography>
                        <PhaseDateCell
                          task={p.taskRaw}
                          dateType={DATE_VARIABLES.END}
                          matterId={matterId}
                          allTasks={allTasks}
                          taskIndex={allTasks.findIndex(
                            tk => tk?.id === p.taskId
                          )}
                          setTasks={handleTasksUpdate}
                          flatTaskList={allTasks}
                        />
                        <Typography
                          component="span"
                          className={classes.phaseDuration}
                        >
                          {t('fixedFeeSetup.step3.phaseDurationSuffix', {
                            count: phaseDays,
                            label: daysLabel(phaseDays),
                          })}
                        </Typography>
                      </div>
                      <div
                        className={classes.phaseSubsectionTitles}
                        onClick={() => toggleSection(p.id)}
                      >
                        <div className={classes.phaseSubsectionTitle}>
                          <JurAssumptions
                            className={`${classes.phaseSubsectionIcon} ${classes.assumptionIcon}`}
                          />
                          <Typography component="span" variant="inherit">
                            {t('fixedFeeSetup.step3.assumptions')} (
                            {p.assumptions.length})
                          </Typography>
                        </div>
                        <div className={classes.phaseSubsectionTitle}>
                          <JurDeliverable
                            className={`${classes.phaseSubsectionIcon} ${classes.deliverableIcon}`}
                          />
                          <Typography component="span" variant="inherit">
                            {t('fixedFeeSetup.step3.deliverables')} (
                            {p.deliverables.length})
                          </Typography>
                          {collapsed[p.id] ? (
                            <ExpandMore
                              className={classes.phaseSubsectionChevron}
                            />
                          ) : (
                            <ExpandLess
                              className={classes.phaseSubsectionChevron}
                            />
                          )}
                        </div>
                      </div>
                      <Collapse
                        in={!collapsed[p.id]}
                        timeout="auto"
                        unmountOnExit
                      >
                        <div className={classes.phaseGrid}>
                          <PhaseItemList
                            items={p.assumptions}
                            placeholder={t(
                              'fixedFeeSetup.step3.assumptionPlaceholder'
                            )}
                            onAdd={() => onAddAssumption(p.taskId)}
                            onItemClick={() => onAddAssumption(p.taskId)}
                          />
                          <PhaseItemList
                            items={p.deliverables}
                            placeholder={t(
                              'fixedFeeSetup.step3.deliverablePlaceholder'
                            )}
                            canAdd={!viewOnly && onAddDeliverable != null}
                            onAdd={() =>
                              onAddDeliverable && onAddDeliverable(p)
                            }
                          />
                        </div>
                      </Collapse>
                    </div>
                  </div>
                )
              })}
            </Collapse>
          </div>
        )
      })}

      {phases.length === 0 && (
        <Typography component="div" className={classes.noticeBar}>
          {t('fixedFeeSetup.step3.noPhasesNotice')}
        </Typography>
      )}
    </div>
  )
}

export default Step3
