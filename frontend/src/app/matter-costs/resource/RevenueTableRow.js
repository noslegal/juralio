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

import React, { useState } from 'react'
import { Typography, Paper } from '@mui/material'
import { makeStyles } from 'tss-react/mui'
import '@glideapps/glide-data-grid/dist/index.css'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp'
import ResourceTaskChip from './ResourceTaskChip'
import { MattersIcon } from '../../../theme/navigation/CommonIcons'
import { getPricingIcon, getPricingType } from '../outcomes/pricingCardHelper'
import { useTranslation } from 'react-i18next'
import { getCostRatios, getTaskCounts } from './MatterCostsTableHelper'
import dayjs from 'dayjs'

const useStyles = makeStyles()(theme => ({
  row: {
    display: 'grid',
    gridTemplateColumns: '5% 75% 25%',
    minHeight: theme.spacing(10),
    borderRight: 'solid',
    borderWidth: '1px',
    borderColor: '#FFFFFF',
    borderRadius: '0',
  },
  expandButton: {
    cursor: 'pointer',
    color: 'white',
    backgroundColor: '#717BBC',
    '&:hover': {
      backgroundColor: '#484f7a',
    },
    height: 80,
  },
  expandButtonPricing: {
    cursor: 'pointer',
    color: 'white',
    backgroundColor: 'rgba(132, 150, 122, 1)',
    '&:hover': {
      backgroundColor: 'rgba(100, 118, 90, 1)',
    },
    height: 80,
  },
  workstreamDetailsContainer: {
    display: 'flex',
    paddingLeft: 8,
    paddingTop: 8,
  },
  leftColumn: {
    borderRight: 'solid',
    borderRightColor: '#717BBC',
    borderRightWidth: 6,
  },
  leftColumnPricing: {
    borderRight: 'solid',
    borderRightColor: 'rgba(132, 150, 122, 1)',
    borderRightWidth: 6,
  },
}))

const RevenueTableRow = props => {
  const { t } = useTranslation()
  const { classes } = useStyles()
  const { updateTaskDataRows } = props
  const [isExpanded, setIsExpanded] = useState(true)
  const durationStart = dayjs(props.fullPeriod.startDate).valueOf()
  const durationEnd = dayjs(props.fullPeriod.endDate).valueOf()

  const getCapHelperText = () => {
    switch (props.table) {
      case 1:
        return (
          'Projected fees would be ' +
          parseFloat(props.revenueData[0].uncappedTotal)
            .toFixed(0)
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, ',') +
          ' if uncapped'
        )
      case 2:
        return (
          'Projected profit would be ' +
          parseFloat(props.revenueData[0].uncappedTotal)
            .toFixed(0)
            .toString()
            .replace(/\B(?=(\d{3})+(?!\d))/g, ',') +
          ' if uncapped'
        )
      case 3:
        return (
          'Projected profit margin would be ' +
          parseFloat(props.revenueData[0].uncappedTotal).toFixed(0).toString() +
          '% if uncapped'
        )
      default:
        break
    }
  }

  return (
    <div>
      <Paper className={classes.row}>
        <div
          className={
            props.isMatterRow ? classes.leftColumn : classes.leftColumnPricing
          }
        >
          <div
            className={
              props.isMatterRow
                ? classes.expandButton
                : classes.expandButtonPricing
            }
            style={props.disableInteractions ? { pointerEvents: 'none' } : {}}
            onClick={() => {
              if (!props.disableInteractions) {
                if (isExpanded === true) {
                  setIsExpanded(false)
                  props.updatePricingDataRows(props.pricing, false)
                } else {
                  setIsExpanded(true)
                  props.updatePricingDataRows(props.pricing, true)
                }
              }
            }}
          >
            {!props.disableInteractions ? (
              isExpanded ? (
                <ArrowDropUpIcon />
              ) : (
                <ArrowDropDownIcon />
              )
            ) : (
              <></>
            )}
          </div>
        </div>
        <div>
          {props.isMatterRow ? (
            <div
              className={classes.workstreamDetailsContainer}
              style={{
                height: 71,
                backgroundColor: '#B3B8DB',
              }}
            >
              <MattersIcon />
              <Typography variant="h6">{props.matter.name}</Typography>
            </div>
          ) : (
            <div
              className={classes.workstreamDetailsContainer}
              style={{
                height: 71,
                backgroundColor: '#C8D4B4',
                maxHeight: 80,
              }}
            >
              {getPricingIcon(
                props.pricing.type,
                props.pricing.cap,
                props.pricing.reason,
                t
              )}
              <div>
                <Typography variant="h6">
                  {getPricingType(
                    props.pricing.type,
                    props.pricing.cap,
                    props.pricing.value
                  )}
                </Typography>
                {!props.costsTable &&
                  props.revenueData &&
                  props?.revenueData[0]?.passedCap && (
                    <Typography color={'error'}>
                      {getCapHelperText()}
                    </Typography>
                  )}
              </div>
            </div>
          )}

          <div style={{ paddingBottom: '1px' }}>
            {isExpanded &&
              !props.disableInteractions &&
              props.pricing.type === 0 &&
              props.tasks.map(t => {
                let diff = null
                let durationDiff = null
                let durationShift = null
                let durationPercent = null
                if (props.diffArray) {
                  diff = props.diffArray.find(item => {
                    return item.cteId === t.id
                  })
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
                      if (
                        dayjs(diff.task.startDate.__new) < dayjs(durationStart)
                      ) {
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
                    durationPercent = (durationDiff / originalDuration) * 100
                    if (durationDiff === 0) {
                      if (diff.task.startDate) {
                        //there is a diff but duration hasnt changed so must be a shift
                        durationShift = dayjs(diff.task.startDate.__new).diff(
                          dayjs(originalStartDate),
                          'd'
                        )
                      }
                    }
                  }
                }
                const taskObj = t.taskId ? t : t.task
                const { deliverableCount, assumptionCount } = getTaskCounts(
                  taskObj,
                  {
                    isSnapshot: props.isSnapshot,
                    matterTasks: props.matterTasks,
                    assumptionList: props.assumptionList,
                  }
                )
                return (
                  <ResourceTaskChip
                    task={taskObj}
                    updateTaskDataRows={updateTaskDataRows}
                    costRatios={getCostRatios(props.costRatios, t)}
                    costTable={props.costTable}
                    cte={t}
                    durationDiff={durationDiff ? durationDiff : null}
                    durationPercent={durationPercent ? durationPercent : null}
                    durationShift={diff ? durationShift : null}
                    deliverableCount={deliverableCount}
                    assumptionCount={assumptionCount}
                  />
                )
              })}
            {isExpanded &&
              !props.disableInteractions &&
              props.pricing.type > 0 &&
              props.tasks.map(t => {
                let diff = null
                let durationDiff = null
                let durationShift = null
                let durationPercent = null
                if (props.diffArray) {
                  diff = props.diffArray.find(item => {
                    return item.cteId === t.id
                  })
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
                      if (
                        dayjs(diff.task.startDate.__new) < dayjs(durationStart)
                      ) {
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
                    durationPercent = (durationDiff / originalDuration) * 100
                    if (durationDiff === 0) {
                      //there is a diff but duration hasnt changed so must be a shift
                      durationShift = dayjs(diff.task.startDate.__new).diff(
                        dayjs(originalStartDate),
                        'd'
                      )
                    }
                  }
                }

                const taskObj2 = t.taskId ? t : t.task
                const {
                  deliverableCount: deliverableCount2,
                  assumptionCount: assumptionCount2,
                } = getTaskCounts(taskObj2, {
                  isSnapshot: props.isSnapshot,
                  matterTasks: props.matterTasks,
                  assumptionList: props.assumptionList,
                })
                return (
                  <ResourceTaskChip
                    isRevenue={true}
                    task={taskObj2}
                    updateTaskDataRows={updateTaskDataRows}
                    costRatios={props.costRatios}
                    cte={t}
                    durationDiff={durationDiff ? durationDiff : null}
                    durationPercent={durationPercent ? durationPercent : null}
                    durationShift={diff ? durationShift : null}
                    deliverableCount={deliverableCount2}
                    assumptionCount={assumptionCount2}
                  />
                )
              })}
          </div>
        </div>
        <div
          style={
            props.isMatterRow
              ? { backgroundColor: '#B3B8DB', maxHeight: 79 }
              : {
                  backgroundColor: '#C8D4B4',
                  maxHeight: 79,
                }
          }
        ></div>
      </Paper>
    </div>
  )
}
export default RevenueTableRow
