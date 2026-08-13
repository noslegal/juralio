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

import MoreVertIcon from '@mui/icons-material/MoreVert'
import { Card, IconButton, Tooltip, Typography } from '@mui/material'
import classNames from 'classnames'
import dayjs from 'dayjs'
import timezone from 'dayjs/plugin/timezone'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router-dom'
import { withStyles } from 'tss-react/mui'
import { useDispatch } from 'react-redux'
import {
  DATE_FORMAT_FULL,
  DATE_VARIABLES,
  TASK_MENU_CONTEXT,
  TASK_STATUS,
} from '../../../app/constants'
import { isPlannedEndDateOverdue } from '../../../app/roadmap/helpers/task-dates-helper'
import TaskMenuContainer from '../../../app/task-details/task-card-header/task-option-menu/TaskMenuContainer'
import MilestoneIcon from '../../../assets/images/JurMilestone'
import { getStatusColour } from '../../../services/helpers/task/task-status-colour-helper'
import { levelNumberToLetter } from '../../../services/helpers/task/task-util-helper'
import colorModifiers from '../../../theme/color-modifiers'
import juralioColours from '../../../theme/juralio-colours'
import rawColours from '../../../theme/raw-colours'
import { getTaskDetailsUrl } from '../../navigation/common/location-context-helper'
import DateField from '../../inputs/date-field/DateField'
import { updateTaskDetails } from '../../../app/task-map/selected-task/selected-task-actions'
import ConfirmDateTimeChangeContainer from '../../../app/task-details/task-card-content/TaskDates/ConfirmDateTimeChangeContainer'
import cloneDeep from 'lodash/cloneDeep'
import { getDateDisplayString } from '../../../services/helpers/date-helper'
import JurDeliverable from '../../../assets/images/JurDeliverable'
import JurAssumptions from '../../../assets/images/JurAssumptions'

import utc from 'dayjs/plugin/utc'
dayjs.extend(utc)

const styles = theme => ({
  root: {
    display: 'flex',
    width: '100%',
  },
  card: {
    borderRadius: theme.spacing(0.5),
    width: '100%',
  },
  pipBase: {
    marginRight: theme.spacing(0.5),
    color: `${rawColours.text.black} !important`,
    borderRadius: theme.spacing(0.5),
    lineHeight: theme.spacing(2.5),
    textAlign: 'center',
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
    width: theme.spacing(2.5),
    zIndex: '1 !important',
    height: theme.spacing(2.5),
    marginTop: theme.spacing(0.45),
  },
  ellipsisText: {
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  },
  doneItemPip: {
    backgroundColor: juralioColours.taskStatus.filteredOut.done,
  },
  inProgressItemPip: {
    backgroundColor: juralioColours.taskStatus.filteredOut.inProgress,
  },
  notStartedItemPip: {
    backgroundColor: juralioColours.taskStatus.filteredOut.notStarted,
  },
  notRequiredItemPip: {
    backgroundColor: juralioColours.taskStatus.filteredOut.notRequired,
  },

  divWrapper: {
    display: 'flex',
    width: '100%',
    height: '100%',
  },
  taskName: {
    backgroundColor: 'rgba(1,1,1,0)',
    color: juralioColours.darkText.primary,
    textAlign: 'left',
    marginRight: 'auto',
    marginLeft: theme.spacing(1),
    marginTop: theme.spacing(0.25),
    '&:hover': {
      'z-index': 2,
    },
  },
  optionsButton: {
    height: theme.spacing(3),
    width: theme.spacing(3),
    marginRight: theme.spacing(),
  },
  letterLevel: {
    backgroundColor: colorModifiers.filterOut(
      rawColours.status.notStarted.dark
    ),
    textOverflow: 'unset',
  },
  chipTask: {
    width: '100%',
  },
  field: {
    paddingLeft: 8,
    width: '100%',
  },
  diffChip: {
    marginLeft: 'auto',
    marginRight: '4px',
    width: 'fit-content',
    height: 'fit-content',
    paddingRight: '2px',
    paddingLeft: '2px',
    borderRadius: '25px',
    marginTop: 'auto',
    marginBottom: 'auto',
    minWidth: '90px',
  },
  countsWrapper: {
    display: 'flex',
    alignItems: 'center',
    gap: theme.spacing(1),
    marginLeft: 'auto',
    paddingRight: theme.spacing(0.5),
    flexShrink: 0,
  },
  countItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '2px',
  },
  countIcon: {
    width: '14px',
    height: '14px',
  },
  countText: {
    fontSize: '0.65rem',
    color: rawColours.primary.black.black,
  },
  taskNameRow: {
    display: 'flex',
    width: '100%',
  },
  dateText: {
    fontSize: '0.7rem',
  },
  taskChipDate: {
    display: 'flex',
  },
  taskChipDateCompact: {
    marginLeft: '12px',
  },
  endDateSection: {
    marginLeft: '6px',
  },
  pointerEventsNone: {
    pointerEvents: 'none',
  },
  inlineDates: {
    display: 'flex',
    alignItems: 'center',
    flexShrink: 0,
    marginLeft: 'auto',
    paddingRight: theme.spacing(0.5),
    gap: '2px',
  },
  unassignedHighlight: {
    boxShadow: '0px 0px 5px 3px #5B15DF',
  },
  compactPip: {
    fontSize: 12,
  },
  cursorPointer: {
    cursor: 'pointer',
  },
  cursorDefault: {
    cursor: 'unset',
  },
  taskNameCompact: {
    fontSize: 12,
    paddingTop: 4,
    maxWidth: '600px',
  },
  taskNameStandard: {
    maxWidth: '600px',
  },
  taskNameStrikethrough: {
    textDecoration: 'line-through',
  },
  diffChipPositive: {
    backgroundColor: '#5B15DF',
  },
  diffChipNegative: {
    backgroundColor: 'white',
    border: 'solid 1px #5B15DF',
  },
  diffChipTextPositive: {
    color: 'white',
  },
  diffChipTextNegative: {
    color: '#5B15DF',
  },
  diffChipShifted: {
    backgroundColor: '#5B15DF',
  },
  shiftedChipText: {
    marginLeft: '2px',
    marginRight: '2px',
    color: 'white',
  },
  milestoneIcon: {
    width: '20px',
    height: '20px',
    marginTop: '4px',
    marginLeft: '4px',
  },
  deliverableIconWrapper: {
    marginTop: '3px',
    marginLeft: '4px',
  },
  deliverableIcon: {
    width: '20px',
    height: '20px',
    marginTop: '8px',
    marginLeft: '4px',
  },
})

const NewTaskChip = props => {
  const { classes } = props
  const {
    deliverableCount,
    assumptionCount,
    matterId,
    projectId,
    showInteractions,
    compact,
  } = props
  const [task, setTask] = useState(props.task)
  const [isHover, setIsHover] = useState(0)
  const [showOptions, setShowOptions] = useState(false)
  const [anchorEl, setanchorEl] = useState(null)
  const history = useNavigate()
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const getDateValue = date => (date ? date : undefined)
  const startDate = task.startDate
    ? getDateValue(task.startDate)
    : task.status === TASK_STATUS.NOT_STARTED
      ? getDateValue(task.plannedStartDate?.replace('Z', ''))
      : getDateValue(task.actualStartDate?.replace('Z', ''))

  const endDate = task.endDate
    ? getDateValue(task.endDate)
    : task.status === TASK_STATUS.DONE
      ? getDateValue(task.actualEndDate?.replace('Z', ''))
      : getDateValue(task.plannedEndDate?.replace('Z', ''))

  const [showConfirmDateDialog, setShowConfirmDateDialog] = useState(false)

  useEffect(() => {
    setTask(props.task)
  }, [props.task])

  const getChipClass = () => {
    switch (task.status) {
      case TASK_STATUS.NOT_REQUIRED:
        return classes.notRequiredItemPip
      case TASK_STATUS.NOT_STARTED:
        return classes.notStartedItemPip
      case TASK_STATUS.IN_PROGRESS:
        return classes.inProgressItemPip
      case TASK_STATUS.DONE:
        return classes.doneItemPip
      default:
        return ''
    }
  }

  const getBorderStyle = () => {
    return {
      borderBottom: `3px solid ${getStatusColour(task.status)}`,
    }
  }

  const noOpFunc = () => {
    setShowConfirmDateDialog(false)
  }
  const updateTaskDate = properties => {
    return dispatch(
      updateTaskDetails(matterId, projectId, task.id, properties, false)
    ).then(res => {
      if (res.task !== undefined) {
        setTask(res.task)
        let tasks = cloneDeep(props.allTasks)
        tasks[props.taskIndex] = res.task
        props.setTasks(tasks)
      }
    })
  }

  const updateDate = (dateName, date) => {
    let _d = date
    let newDate
    if (date) {
      dayjs.extend(utc)
      dayjs.extend(timezone)
      newDate = dayjs(
        new Date(date.getFullYear(), date.getMonth(), date.getDate())
      ).utc(true)
    } else {
      newDate = dayjs(date)
    }
    if (dateName === DATE_VARIABLES.PLANNED_START_DATE) {
      newDate = newDate.startOf('day')
    }
    if (dateName === DATE_VARIABLES.PLANNED_END_DATE) {
      newDate = newDate.endOf('day')
    }
    if (date) {
      _d = newDate.toDate()
    }
    updateTaskDate(
      {
        [dateName]: _d ? _d.toISOString() : _d,
        dateCleared: _d === null,
      },
      _d,
      dateName
    )
  }

  const renderDateDisplay = () => {
    let startDate = task.startDate
    let endDate = task.endDate
    if (props.isSnapshot) {
      if (startDate) {
        startDate = new Date(task.startDate)
      }
      if (endDate) {
        endDate = new Date(task.endDate)
      }
    }

    const noDates =
      (startDate === null || startDate === undefined) &&
      (endDate === null || endDate === undefined)
    return (
      <>
        <div
          data-test="task-chip"
          className={classNames(classes.taskChipDate, {
            [classes.taskChipDateCompact]: compact,
          })}
        >
          <div>
            <Typography className={classes.dateText}>
              {noDates
                ? t('matterCosts.taskChip.noDatesSet')
                : t('matterCosts.taskChip.startDate', {
                    date:
                      startDate !== null && startDate !== undefined
                        ? getDateDisplayString(
                            dayjs(startDate).utc(),
                            DATE_FORMAT_FULL,
                            false
                          )
                        : t('matterCosts.taskChip.noDateSet'),
                  })}
            </Typography>
          </div>
          <div className={classes.endDateSection}>
            <Typography className={classes.dateText}>
              {noDates
                ? ''
                : t('matterCosts.taskChip.endDate', {
                    date:
                      endDate !== null && endDate !== undefined
                        ? getDateDisplayString(
                            dayjs(endDate).utc(),
                            DATE_FORMAT_FULL,
                            false
                          )
                        : t('matterCosts.taskChip.noDateSet'),
                  })}
            </Typography>
          </div>
        </div>
      </>
    )
  }

  const renderInlineDates = () => {
    return (
      <>
        <div className={classes.inlineDates}>
          <DateField
            task={task}
            dateType={DATE_VARIABLES.START}
            fullType={
              task.status === TASK_STATUS.NOT_STARTED
                ? DATE_VARIABLES.PSD
                : DATE_VARIABLES.ASD
            }
            onChange={date => {
              updateDate(
                task.status === TASK_STATUS.NOT_STARTED
                  ? DATE_VARIABLES.PLANNED_START_DATE
                  : DATE_VARIABLES.ACTUAL_START_DATE,
                date
              )
              setShowConfirmDateDialog(true)
            }}
            t={t}
            viewOnly={false}
            hideIcon={true}
            hideHeader={true}
            value={startDate}
            disabled={false}
          />
          <DateField
            task={task}
            dateType={DATE_VARIABLES.END}
            fullType={
              task.status === TASK_STATUS.DONE
                ? DATE_VARIABLES.AED
                : DATE_VARIABLES.PED
            }
            t={t}
            onChange={date => {
              updateDate(
                task.status === TASK_STATUS.DONE
                  ? DATE_VARIABLES.ACTUAL_END_DATE
                  : DATE_VARIABLES.PLANNED_END_DATE,
                date
              )
              setShowConfirmDateDialog(true)
            }}
            viewOnly={false}
            hideIcon={true}
            hideHeader={true}
            value={endDate}
            disabled={false}
          />
        </div>
        {showConfirmDateDialog && (
          <ConfirmDateTimeChangeContainer
            matterId={matterId}
            projectId={projectId}
            tasks={props.flatTaskList}
            task={task}
            onCancel={noOpFunc}
            isOOC={true}
            setTask={setTask}
            allTasks={props.allTasks}
            setTasks={props.setTasks}
            taskIndex={props.taskIndex}
          />
        )}
      </>
    )
  }

  const renderNextDate = () => {
    return (
      <>
        <div
          className={classNames(classes.taskChipDate, {
            [classes.pointerEventsNone]: !showInteractions,
          })}
        >
          <DateField
            task={task}
            dateType={DATE_VARIABLES.START}
            fullType={
              task.status === TASK_STATUS.NOT_STARTED
                ? DATE_VARIABLES.PSD
                : DATE_VARIABLES.ASD
            }
            onChange={date => {
              updateDate(
                task.status === TASK_STATUS.NOT_STARTED
                  ? DATE_VARIABLES.PLANNED_START_DATE
                  : DATE_VARIABLES.ACTUAL_START_DATE,
                date
              )
              setShowConfirmDateDialog(true)
            }}
            t={t}
            viewOnly={false}
            hideIcon={true}
            hideHeader={true}
            value={startDate}
            disabled={!showInteractions}
          />
          <DateField
            task={task}
            dateType={DATE_VARIABLES.END}
            fullType={
              task.status === TASK_STATUS.DONE
                ? DATE_VARIABLES.AED
                : DATE_VARIABLES.PED
            }
            t={t}
            onChange={date => {
              updateDate(
                task.status === TASK_STATUS.DONE
                  ? DATE_VARIABLES.ACTUAL_END_DATE
                  : DATE_VARIABLES.PLANNED_END_DATE,
                date
              )
              setShowConfirmDateDialog(true)
            }}
            viewOnly={false}
            hideIcon={true}
            hideHeader={true}
            value={endDate}
            disabled={!showInteractions}
          />
        </div>
        {showConfirmDateDialog && (
          <ConfirmDateTimeChangeContainer
            matterId={matterId}
            projectId={projectId}
            tasks={props.flatTaskList}
            task={task}
            onCancel={noOpFunc}
            isOOC={true}
            setTask={setTask}
            allTasks={props.allTasks}
            setTasks={props.setTasks}
            taskIndex={props.taskIndex}
          />
        )}
      </>
    )
  }

  const navigateToTask = () => {
    if (!props.isLink) {
      return null
    }
    if (props.context) {
      if (props.context === 'todo') {
      }
      if (props.context === 'recentlyViewed') {
      }
    }
    history(
      !task.id
        ? '#'
        : matterId
          ? getTaskDetailsUrl(
              matterId,
              projectId,
              task.databaseUID ? task.databaseUID : task.id
            )
          : ''
    )
  }

  if (projectId) {
    task.projectId = projectId
  }

  const renderTooltipIfMilestone = reactComponent => {
    return task.isMilestone ? (
      <Tooltip title={t('milestones.taskChipHover')}>{reactComponent}</Tooltip>
    ) : (
      <>{reactComponent}</>
    )
  }

  return (
    <div
      className={classNames(classes.field, {
        [classes.pointerEventsNone]: props.noHover && !showInteractions,
      })}
    >
      <div
        className={classNames(classes.root, {
          [classes.unassignedHighlight]: props.unassigned,
        })}
      >
        {props.showLevelLetter && (
          <Typography
            className={classNames(classes.pipBase, classes.letterLevel, {
              [classes.compactPip]: compact,
            })}
          >
            {levelNumberToLetter(task.level)}
          </Typography>
        )}

        {renderTooltipIfMilestone(
          <Card
            elevation={props.noHover ? 0 : isHover}
            className={classes.card}
            onMouseOver={() => setIsHover(1)}
            onMouseLeave={() => setIsHover(0)}
            onClick={event => {
              if (props.onClick) {
                props.onClick()
              }
              !props.allowBubble && event.stopPropagation()
            }}
            style={getBorderStyle()}
          >
            <div
              data-test="task-chip-wrapper"
              className={classNames(classes.divWrapper, getChipClass())}
            >
              <div
                data-test="juralio-chip-task"
                className={classNames(classes.chipTask, {
                  [classes.cursorPointer]: props.isLink,
                  [classes.cursorDefault]: !props.isLink,
                })}
                onClick={navigateToTask}
              >
                {props.showOptions && (
                  <IconButton
                    onClick={e => {
                      e.stopPropagation()
                      setanchorEl(e.currentTarget)
                      setShowOptions(true)
                    }}
                    className={classes.optionsButton}
                    size="large"
                  >
                    <MoreVertIcon />
                  </IconButton>
                )}
                <div className={classes.taskNameRow}>
                  <Typography
                    className={classNames(
                      classes.ellipsisText,
                      classes.taskName,
                      compact
                        ? classes.taskNameCompact
                        : classes.taskNameStandard,
                      { [classes.taskNameStrikethrough]: props.strikethrough }
                    )}
                    data-test="task-name"
                  >
                    {task.name}
                  </Typography>
                  {props.diffDuration !== 0 && props.diffPercent && (
                    <div
                      className={classNames(
                        classes.diffChip,
                        props.diffDuration > 0
                          ? classes.diffChipPositive
                          : classes.diffChipNegative
                      )}
                    >
                      <Tooltip
                        title={
                          props.diffDuration > 0
                            ? t('matterCosts.diffTooltips.moreDays')
                            : t('matterCosts.diffTooltips.lessDays')
                        }
                      >
                        <Typography
                          variant="caption"
                          className={
                            props.diffDuration > 0
                              ? classes.diffChipTextPositive
                              : classes.diffChipTextNegative
                          }
                        >
                          {t(
                            props.diffDuration > 0
                              ? 'matterCosts.taskChip.diffDurationPositive'
                              : 'matterCosts.taskChip.diffDurationNegative',
                            {
                              days: Math.abs(props.diffDuration),
                              percent: props.diffPercent.toFixed(0),
                            }
                          )}
                        </Typography>
                      </Tooltip>
                    </div>
                  )}
                  {(props.diffDuration === 0 || props.diffDuration === null) &&
                    props.durationShift > 0 && (
                      <div
                        className={classNames(
                          classes.diffChip,
                          classes.diffChipShifted
                        )}
                      >
                        <Tooltip title={t('matterCosts.diffTooltips.shifted')}>
                          <Typography
                            variant="caption"
                            className={classes.shiftedChipText}
                          >
                            {t('matterCosts.taskChip.movedDays', {
                              count: props.durationShift,
                            })}
                          </Typography>
                        </Tooltip>
                      </div>
                    )}
                  {props.showDatesInline && renderInlineDates()}
                  {(deliverableCount > 0 || assumptionCount > 0) && (
                    <Tooltip
                      title={
                        deliverableCount > 0 && assumptionCount > 0
                          ? t('milestones.deliverablesAndAssumptions', {
                              deliverableCount,
                              assumptionCount,
                            })
                          : deliverableCount > 0
                            ? t('milestones.deliverablesOnly', {
                                deliverableCount,
                              })
                            : t('milestones.assumptionsOnly', {
                                assumptionCount,
                              })
                      }
                    >
                      <div
                        data-test="deliverable-assumption-counts"
                        className={classes.countsWrapper}
                      >
                        {deliverableCount > 0 && (
                          <div className={classes.countItem}>
                            <JurDeliverable
                              stroke={rawColours.primary.black[100]}
                              className={classes.countIcon}
                            />
                            <Typography
                              variant="caption"
                              className={classes.countText}
                            >
                              {deliverableCount}
                            </Typography>
                          </div>
                        )}
                        {assumptionCount > 0 && (
                          <div className={classes.countItem}>
                            <JurAssumptions
                              color="#646464"
                              className={classes.countIcon}
                              strokeWeight={2}
                            />
                            <Typography
                              variant="caption"
                              className={classes.countText}
                            >
                              {assumptionCount}
                            </Typography>
                          </div>
                        )}
                      </div>
                    </Tooltip>
                  )}
                </div>

                {props.displayDates && renderDateDisplay()}

                {(showInteractions || props.showDates) && renderNextDate()}

                {task.isMilestone && (
                  <MilestoneIcon
                    data-test="milestone-icon"
                    className={classNames(classes.icon, classes.milestoneIcon)}
                    style={{
                      color:
                        task.status === TASK_STATUS.NOT_STARTED &&
                        isPlannedEndDateOverdue(task)
                          ? rawColours.error.primary
                          : task.status === TASK_STATUS.NOT_STARTED
                            ? juralioColours.taskStatus.notStarted
                            : juralioColours.taskStatus.done,
                    }}
                  />
                )}

                {task.isDeliverable && (
                  <div className={classes.deliverableIconWrapper}>
                    <JurDeliverable
                      data-test="deliverable-icon"
                      scale={'0.7'}
                      stroke={
                        task.status === TASK_STATUS.NOT_STARTED &&
                        isPlannedEndDateOverdue(task)
                          ? rawColours.error.primary
                          : task.status === TASK_STATUS.NOT_STARTED
                            ? juralioColours.taskStatus.notStarted
                            : task.status === TASK_STATUS.IN_PROGRESS
                              ? juralioColours.taskStatus.inProgress
                              : juralioColours.taskStatus.done
                      }
                      className={classNames(
                        classes.icon,
                        classes.deliverableIcon
                      )}
                    />
                  </div>
                )}
              </div>
            </div>
          </Card>
        )}
        {showOptions && (
          <TaskMenuContainer
            anchor={anchorEl}
            closeHandler={() => {
              setShowOptions(false)
              props.closeHandler()
            }}
            matterId={matterId}
            task={task}
            taskMenuContext={TASK_MENU_CONTEXT.TASK_HEADER}
            hideRename={true}
            dontRedirect={true}
            viewOnly={props.viewOnly}
          />
        )}
      </div>
    </div>
  )
}

export default withStyles(NewTaskChip, styles)
