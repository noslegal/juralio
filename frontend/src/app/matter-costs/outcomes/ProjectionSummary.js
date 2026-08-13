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

import React, { useState, useEffect } from 'react'
import { makeStyles } from 'tss-react/mui'
import { Grow, Paper, Tooltip, Typography } from '@mui/material'
import NewTaskChip from '../../../components/data-display/task-chip/NewTaskChip'
import { LinearProgress } from '@mui/material'
import { getPricingIcon } from './pricingCardHelper'
import rawColours from '../../../theme/raw-colours'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp'
import juralioColours from '../../../theme/juralio-colours'
import JuralioLogoImage from '../../../components/ftue/tip-images/JuralioLogoImage'
import dayjs from 'dayjs'
import {
  getProjectionTotalRevenue,
  getRevenueTableData,
  filterValidTasks,
} from './revenueHelper'
import { useTranslation } from 'react-i18next'
import {
  sortByTaskStatus,
  getTaskCounts,
} from '../resource/MatterCostsTableHelper'
import matterCostsService from '../../../services/costs/matter-costs-service'

const useStyles = makeStyles()(theme => ({
  root: {
    width: '95%',
    marginRight: 'auto',
    marginLeft: 'auto',
    marginBottom: theme.spacing(2),
    overflow: 'hidden',
  },
  pricingHeaderRow: {
    display: 'grid',
    gridTemplateColumns: '50% 50%',
    height: '80px',
    backgroundColor: '#C8D4B4',
  },
  taskRow: {
    display: 'grid',
    gridTemplateColumns: '50% 50%',
    height: theme.spacing(7),
    backgroundColor: '#ffffff',
    marginBottom: theme.spacing(0.5),
  },
  unassignedContainer: {
    height: '80px',
    backgroundColor: '#C8D4B4',
    display: 'grid',
    gridTemplateColumns: '50% 50%',
  },
  gridColumn: {
    display: 'flex',
    paddingLeft: theme.spacing(2.5),
    alignItems: 'center',
  },
  linearProgressHeader: {
    width: '75%',
    height: theme.spacing(1.5),
    backgroundColor: 'rgba(0,0,0,0.15)',
    borderRadius: theme.spacing(0.5),
    '& .MuiLinearProgress-bar': {
      backgroundColor: rawColours.primary.black[100],
      borderRadius: theme.spacing(0.5),
    },
  },
  linearProgressTask: {
    width: '75%',
    height: theme.spacing(1),
    backgroundColor: 'rgba(0,0,0,0.08)',
    borderRadius: theme.spacing(0.5),
    '& .MuiLinearProgress-bar': {
      backgroundColor: rawColours.primary.greenBlue.primary,
      borderRadius: theme.spacing(0.5),
    },
  },
  pricingOpenCloseDiv: {
    backgroundColor: 'rgba(132, 150, 122, 1)',
    height: '100%',
    width: theme.spacing(4),
    marginRight: theme.spacing(3),
    alignContent: 'center',
    color: juralioColours.whiteText.primary,
    flexShrink: 0,
    cursor: 'pointer',
  },
  arrowIcon: {
    marginLeft: 'auto',
    marginRight: 'auto',
    display: 'block',
  },
  headerTitle: {
    fontWeight: 700,
    lineHeight: 1.2,
  },
  headerSubtitle: {
    fontSize: '0.75rem',
    color: rawColours.primary.black[100],
    lineHeight: 1.2,
  },
  headerValue: {
    fontWeight: 700,
    fontSize: '1rem',
    marginLeft: theme.spacing(1),
    whiteSpace: 'nowrap',
  },
  pricingHeaderLeft: {
    alignItems: 'center',
    display: 'flex',
  },
  pricingLabelWrapper: {
    marginLeft: theme.spacing(2),
  },
  capExceededText: {
    color: juralioColours.error,
    fontSize: '0.75rem',
  },
  errorText: {
    color: juralioColours.error,
  },
  taskRowNew: {
    boxShadow: '0px 0px 5px 3px #5B15DF',
    backgroundColor: 'rgba(91, 21, 223, 0.20)',
  },
  taskRowRemoved: {
    backgroundColor: 'rgba(0,0,0,0.12)',
  },
  taskChipWrapper: {
    alignContent: 'center',
  },
  removedOpacity: {
    opacity: 0.6,
  },
  revenueValue: {
    marginLeft: theme.spacing(1),
  },
  revenueValueStrikethrough: {
    marginLeft: theme.spacing(1),
    textDecoration: 'line-through',
  },
  fixedFeeOverlayWrapper: {
    position: 'relative',
  },
  fixedFeeOverlay: {
    backgroundColor: rawColours.primary.grey.main,
    position: 'absolute',
    top: -30,
    width: '250px',
    alignContent: 'center',
    paddingLeft: theme.spacing(1.5),
  },
  flexRow: {
    display: 'flex',
  },
  flexRowCenter: {
    display: 'flex',
    alignItems: 'center',
  },
  logoSmall: {
    height: '20px',
    width: '80px',
  },
  unassignedCaption: {
    display: 'flex',
    marginLeft: theme.spacing(2),
  },
  unassignedTaskItem: {
    marginRight: theme.spacing(2.5),
  },
  unassignedPaper: {
    backgroundColor: rawColours.primary.grey.main,
    width: '65%',
    alignContent: 'center',
    marginTop: 'auto',
    marginBottom: 'auto',
  },
}))

const ProjectionSummary = props => {
  const {
    data,
    durationStart,
    durationEnd,
    matterTasks,
    matterId,
    isSnapshot,
    rates,
    rtd,
    liveMode,
  } = props
  const { t } = useTranslation()
  const { classes } = useStyles()
  const cteTaskList = data.costTimeEstimateList.map(cte => cte.task.id)
  const totalRevenue = data?.revenueValuesDTO?.totalRevenue
    ? data?.revenueValuesDTO?.totalRevenue
    : getProjectionTotalRevenue(data, rates, rtd)
  const [openPricing, setOpenPricing] = useState(
    data.pricingDTOList.map(x => x.id)
  )
  const [unassignedTasks, setUnassignedTasks] = useState([])
  const [showUnassignedTasks, setShowUnassignedTasks] = useState(true)
  const [assumptions, setAssumptions] = useState(data?.assumptionList || [])

  useEffect(() => {
    if (!isSnapshot) {
      matterCostsService.getAssumptions(matterId).then(r => {
        if (Array.isArray(r.body)) setAssumptions(r.body)
      })
    } else {
      setAssumptions(data?.assumptionList || [])
    }
    //eslint-disable-next-line
  }, [matterId, isSnapshot, data])

  const getDeliverableAndAssumptionCounts = task => {
    return getTaskCounts(task, {
      isSnapshot,
      matterTasks,
      assumptionList: assumptions,
    })
  }

  useEffect(() => {
    const validlist = filterValidTasks(matterTasks, durationStart, durationEnd)
    setUnassignedTasks(
      validlist.filter(task => {
        if (
          !data.pricingDTOList
            .map(pp => pp.taskList)
            .flatMap(x => x)
            .map(x => x.id)
            .includes(task.id)
        ) {
          return task
        }
      })
    )
    //eslint-disable-next-line
  }, [matterTasks])

  const getPricingString = (type, cap, value, fullReason) => {
    switch (parseInt(type)) {
      case 0:
        return (
          <div>
            <Typography className={classes.headerTitle}>
              {t('matterCosts.projectionSummary.timeBased')},{' '}
              {cap === '1' || cap === true
                ? `${t('matterCosts.projectionSummary.cap')} ${value
                    .toString()
                    .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
                : t('matterCosts.projectionSummary.uncapped')}
            </Typography>
          </div>
        )
      case 1:
        return (
          <div>
            <Typography className={classes.headerTitle}>
              {t('matterCosts.fixedFee')}
            </Typography>
          </div>
        )
      case 2:
        return (
          <div>
            <Typography className={classes.headerTitle}>
              {t('matterCosts.noFee')}
            </Typography>
            {fullReason && (
              <Typography className={classes.headerSubtitle}>
                {fullReason}
              </Typography>
            )}
          </div>
        )
      default:
        break
    }
  }

  return (
    <>
      <div>
        <Paper className={classes.root}>
          <>
            {data.pricingDTOList.map(pricing => {
              const currPricingCTEs = data.costTimeEstimateList.filter(
                cte => cte.pricingId === pricing.id
              )
              let uncappedRevenueValue, pricingRevenueValue, revenueData
              if (!liveMode) {
                const revenueValueList = currPricingCTEs.map(
                  cte => cte.revenueValue
                )

                uncappedRevenueValue = revenueValueList.reduce(
                  (partialSum, a) => partialSum + a,
                  0
                )
                pricingRevenueValue = uncappedRevenueValue
                if (pricing.value > 0 && pricingRevenueValue > pricing.value) {
                  pricingRevenueValue = pricing.value
                }
                if (pricing.type === 1) {
                  pricingRevenueValue = pricing.value
                }
              } else {
                pricingRevenueValue = 0
                uncappedRevenueValue = 0
                revenueData = getRevenueTableData(
                  data,
                  rates,
                  rtd,
                  false,
                  false
                )
                currPricingCTEs.forEach(cte => {
                  uncappedRevenueValue += revenueData.get(cte.task.id)[1]
                })
                pricingRevenueValue = uncappedRevenueValue
              }
              if (pricing.value > 0 && pricingRevenueValue > pricing.value) {
                pricingRevenueValue = pricing.value
              }
              if (pricing.type === 1) {
                pricingRevenueValue = pricing.value
              }
              return (
                <>
                  {data.pricingDTOList.length >= 1 && (
                    <div className={classes.pricingHeaderRow}>
                      <div className={classes.pricingHeaderLeft}>
                        <div
                          className={classes.pricingOpenCloseDiv}
                          onClick={() => {
                            const currOpenPricing = [...openPricing]
                            if (currOpenPricing.includes(pricing.id)) {
                              setOpenPricing(
                                currOpenPricing.filter(x => x !== pricing.id)
                              )
                            } else {
                              currOpenPricing.push(pricing.id)
                              setOpenPricing(currOpenPricing)
                            }
                          }}
                        >
                          {openPricing.includes(pricing.id) ? (
                            <ArrowDropUpIcon className={classes.arrowIcon} />
                          ) : (
                            <ArrowDropDownIcon className={classes.arrowIcon} />
                          )}
                        </div>
                        <div className={classes.pricingHeaderLeft}>
                          {getPricingIcon(
                            pricing.type,
                            pricing.cap,
                            pricing.fullReason,
                            t
                          )}
                          <div className={classes.pricingLabelWrapper}>
                            {getPricingString(
                              pricing.type,
                              pricing.cap,
                              pricing.value,
                              pricing.fullReason
                            )}
                            {pricing.value > 0 &&
                            pricing.value < uncappedRevenueValue ? (
                              <Typography className={classes.capExceededText}>
                                {t(
                                  'matterCosts.projectionSummary.wouldBeUncapped',
                                  {
                                    value: uncappedRevenueValue
                                      .toFixed(0)
                                      .toString()
                                      .replace(/\B(?=(\d{3})+(?!\d))/g, ','),
                                  }
                                )}
                              </Typography>
                            ) : null}
                          </div>
                        </div>
                      </div>

                      <div className={classes.gridColumn}>
                        <LinearProgress
                          className={classes.linearProgressHeader}
                          variant="determinate"
                          value={
                            ((pricingRevenueValue - 0) * 100) /
                            (totalRevenue - 0)
                          }
                        />
                        <Typography
                          className={`${classes.headerValue}${
                            pricing.value > 0 &&
                            pricing.value < pricingRevenueValue
                              ? ` ${classes.errorText}`
                              : ''
                          }`}
                        >
                          {pricing.cap && pricing.value < pricingRevenueValue
                            ? pricing.value
                                .toString()
                                .replace(/\B(?=(\d{3})+(?!\d))/g, ',')
                            : pricingRevenueValue
                                .toFixed(0)
                                .toString()
                                .replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                        </Typography>
                      </div>
                    </div>
                  )}
                  <Grow unmountOnExit in={openPricing.includes(pricing.id)}>
                    <div>
                      {pricing.taskList
                        .sort(sortByTaskStatus)
                        .map((task, index) => {
                          const { deliverableCount, assumptionCount } =
                            getDeliverableAndAssumptionCounts(task)
                          let cte
                          if (cteTaskList.includes(task.id)) {
                            cte = data.costTimeEstimateList.filter(
                              costTimeEstimate =>
                                costTimeEstimate.task.id === task.id
                            )
                          }
                          let diff = props.diffArray.find(item => {
                            return item.cteId === cte[0].id
                          })
                          let durationDiff = null
                          let durationPercent = null
                          let durationShift = null
                          if (
                            diff &&
                            diff.task &&
                            (diff.task.startDate || diff.task.endDate)
                          ) {
                            let originalStartDate = diff.task.startDate
                              ? diff.task.startDate.__old
                                ? diff.task.startDate.__old
                                : durationStart
                              : durationStart
                            let originalEndDate = diff.task.endDate
                              ? diff.task.endDate.__old
                                ? diff.task.endDate.__old
                                : durationEnd
                              : durationEnd

                            originalStartDate =
                              originalStartDate < durationStart
                                ? durationStart
                                : originalStartDate
                            originalEndDate =
                              originalEndDate > durationEnd
                                ? durationEnd
                                : originalEndDate

                            let originalDuration =
                              dayjs(originalEndDate).diff(
                                dayjs(originalStartDate),
                                'd'
                              ) + 1
                            let newDuration = 0
                            if (diff.task.startDate && diff.task.endDate) {
                              let s =
                                diff.task.startDate.__new < durationStart
                                  ? durationStart
                                  : diff.task.startDate.__new
                              let e =
                                diff.task.endDate.__new > durationEnd
                                  ? durationEnd
                                  : diff.task.endDate.__new
                              newDuration = dayjs(e).diff(dayjs(s), 'd') + 1
                            } else if (diff.task.startDate) {
                              if (diff.task.startDate.__new < durationStart) {
                                newDuration =
                                  dayjs(originalEndDate).diff(
                                    dayjs(durationStart),
                                    'd'
                                  ) + 1
                              } else {
                                newDuration =
                                  dayjs(originalEndDate).diff(
                                    dayjs(diff.task.startDate.__new),
                                    'd'
                                  ) + 1
                              }
                            } else if (diff.task.endDate) {
                              if (diff.task.endDate.__new > durationEnd) {
                                newDuration =
                                  dayjs(durationEnd).diff(
                                    dayjs(originalStartDate),
                                    'd'
                                  ) + 1
                              } else {
                                newDuration =
                                  dayjs(diff.task.endDate.__new).diff(
                                    dayjs(originalStartDate),
                                    'd'
                                  ) + 1
                              }
                            }
                            durationDiff = newDuration - originalDuration
                            durationPercent =
                              (durationDiff / originalDuration) * 100
                            if (durationDiff === 0) {
                              //there is a diff but duration hasnt changed so must be a shift
                              if (diff.task.startDate) {
                                durationShift = dayjs(
                                  diff.task.startDate.__new
                                ).diff(dayjs(originalStartDate), 'd')
                              } else if (diff.task.endDate) {
                                durationShift = dayjs(
                                  diff.task.endDate.__new
                                ).diff(dayjs(originalEndDate), 'd')
                              }
                            }
                          }

                          return (
                            <Tooltip
                              disableFocusListener={
                                !diff || (diff && !diff.removed)
                              }
                              disableHoverListener={
                                !diff || (diff && !diff.removed)
                              }
                              title={t(
                                'matterCosts.projectionSummary.changedOrMoved'
                              )}
                              placement="bottom-start"
                            >
                              <span>
                                <div
                                  className={`${classes.taskRow}${
                                    diff && diff.new
                                      ? ` ${classes.taskRowNew}`
                                      : diff && diff.removed
                                        ? ` ${classes.taskRowRemoved}`
                                        : ''
                                  }`}
                                >
                                  <div
                                    className={`${classes.taskChipWrapper}${
                                      diff && diff.removed
                                        ? ` ${classes.removedOpacity}`
                                        : ''
                                    }`}
                                  >
                                    <NewTaskChip
                                      task={task}
                                      diffDuration={diff ? durationDiff : null}
                                      diffPercent={
                                        diff ? durationPercent : null
                                      }
                                      durationShift={
                                        diff ? durationShift : null
                                      }
                                      strikethrough={!!(diff && diff.removed)}
                                      deliverableCount={deliverableCount}
                                      assumptionCount={assumptionCount}
                                    />
                                  </div>
                                  <div
                                    className={`${classes.gridColumn}${
                                      diff && diff.removed
                                        ? ` ${classes.removedOpacity}`
                                        : ''
                                    }`}
                                  >
                                    {pricing.type === 0 && (
                                      <>
                                        <LinearProgress
                                          className={classes.linearProgressTask}
                                          variant="determinate"
                                          value={
                                            cte[0].revenueValue
                                              ? ((cte[0].revenueValue - 0) *
                                                  100) /
                                                (totalRevenue - 0)
                                              : ((revenueData?.get(
                                                  cte[0].task.id
                                                )[1] -
                                                  0) *
                                                  100) /
                                                (totalRevenue - 0)
                                          }
                                        />
                                        <Typography
                                          className={
                                            diff && diff.removed
                                              ? classes.revenueValueStrikethrough
                                              : classes.revenueValue
                                          }
                                        >
                                          {cte[0].revenueValue
                                            ? cte[0].revenueValue
                                                .toFixed(0)
                                                ?.toString()
                                                .replace(
                                                  /\B(?=(\d{3})+(?!\d))/g,
                                                  ','
                                                )
                                            : revenueData
                                                ?.get(cte[0].task.id)[1]
                                                .toFixed(0)
                                                .toString()
                                                .replace(
                                                  /\B(?=(\d{3})+(?!\d))/g,
                                                  ','
                                                )}
                                        </Typography>
                                      </>
                                    )}
                                    {pricing.type !== 0 && index === 0 && (
                                      <>
                                        <div
                                          className={
                                            classes.fixedFeeOverlayWrapper
                                          }
                                        >
                                          <Paper
                                            className={classes.fixedFeeOverlay}
                                            style={{
                                              height:
                                                pricing.taskList.length * 50,
                                            }}
                                          >
                                            <div className={classes.flexRow}>
                                              <div
                                                className={classes.logoSmall}
                                              >
                                                <JuralioLogoImage />
                                              </div>
                                              <Typography>
                                                {pricing.type === 1
                                                  ? t(
                                                      'matterCosts.projectionSummary.noBreakdownFixed'
                                                    )
                                                  : t(
                                                      'matterCosts.projectionSummary.noBreakdownNoFee'
                                                    )}
                                              </Typography>
                                            </div>
                                          </Paper>
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </div>
                              </span>
                            </Tooltip>
                          )
                        })}
                    </div>
                  </Grow>
                </>
              )
            })}
          </>
          {unassignedTasks.length >= 1 && liveMode && (
            <>
              <div className={classes.unassignedContainer}>
                <div className={classes.pricingHeaderLeft}>
                  <div
                    onClick={() => {
                      setShowUnassignedTasks(!showUnassignedTasks)
                    }}
                    className={classes.pricingOpenCloseDiv}
                  >
                    {showUnassignedTasks ? (
                      <ArrowDropUpIcon className={classes.arrowIcon} />
                    ) : (
                      <ArrowDropDownIcon className={classes.arrowIcon} />
                    )}
                  </div>
                  <div>
                    <Typography className={classes.pricingLabelWrapper}>
                      {t('matterCosts.projectionSummary.unassignedPhasesTitle')}
                    </Typography>
                    <Typography
                      variant="caption"
                      className={classes.unassignedCaption}
                    >
                      {t(
                        'matterCosts.projectionSummary.unassignedPhasesSubtitle'
                      )}
                    </Typography>
                  </div>
                </div>

                <div className={classes.gridColumn}>
                  <></>
                </div>

                <div className={classes.gridColumn}>
                  <></>
                </div>
              </div>

              <Grow unmountOnExit in={showUnassignedTasks}>
                <div className={classes.flexRow}>
                  <div>
                    {unassignedTasks.map(task => {
                      return (
                        <div
                          className={`${classes.unassignedContainer} ${classes.unassignedTaskItem}`}
                        >
                          <div className={classes.taskChipWrapper}>
                            <NewTaskChip task={task} unassigned={true} />
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  <Paper
                    className={classes.unassignedPaper}
                    style={{ height: unassignedTasks.length * 50 }}
                  >
                    <div className={classes.flexRowCenter}>
                      <div
                        style={{
                          width:
                            unassignedTasks.length * 30 <= 150
                              ? unassignedTasks.length * 30
                              : 150,
                        }}
                      >
                        <JuralioLogoImage />
                      </div>
                      <Typography>
                        {t('matterCosts.projectionSummary.noDataUntilAssigned')}
                      </Typography>
                    </div>
                  </Paper>
                </div>
              </Grow>
            </>
          )}
        </Paper>
      </div>
    </>
  )
}

export default ProjectionSummary
