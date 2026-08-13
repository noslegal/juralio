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

import React from 'react'
import {
  ACTIVITIES,
  DATE_FORMAT_FULL,
  ROADMAP_CONST,
  TASK_STATUS,
} from '../../constants'
import dayjs from 'dayjs'
import { getEndDate, getStartDate } from '../helpers/task-dates-helper'
import RoadmapConstants from '../helpers/roadmap-constants'
import {
  checkIfPartiallyVisible,
  checkIfVisible,
  getAllSubTasks,
  getErrorDate,
} from '../helpers/roadmap-helpers'
import {
  getDatePinColour,
  getNearestEndDateInTree,
  getNearestStartDateInTree,
  isAtBoundText,
} from './roadmap-tasks-helpers'
import { flatTaskListFromTree } from '../../../services/task/data-provider/task-list-data-provider'
import rawColours from '../../../theme/raw-colours'
import RoadmapPinStart from '../../../assets/images/RoadmapPinStart'
import RoadmapPinEnd from '../../../assets/images/RoadmapPinEnd'
import { useTranslation } from 'react-i18next'
import { Button, Popper, Typography } from '@mui/material'
import {
  getDateDisplayString,
  getEarliestDateFromListOfTasks,
  getLatestDateFromListOfTasks,
} from '../../../services/helpers/date-helper'
import { showTaskmapDatePickerForTask } from '../../task-details/task-actions'
import { openDatePicker } from '../../../redux/ducks/improved-taskmap-interactions'
import { useDispatch, useSelector } from 'react-redux'

import WarningIcon from '@mui/icons-material/WarningAmberOutlined'
import utc from 'dayjs/plugin/utc'
dayjs.extend(utc)

const RoadmapPin = props => {
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const matterDetails = useSelector(state => state.matterDetails.matter)
  const {
    i,
    status,
    date,
    error,
    offset = 0,
    task,
    isStartDate,
    dragValue,
    timeScale,
    project,
    tasks,
    isDragging,
    isDraggingStart,
    resetPins,
    dragLeft,
    dragChange,
    pinHoverStart,
    pinHoverEnd,
    startDragNode,
    endDragNode,
    hover,
    rowHeight,
    additionalHeight,
    isCompact,
    draggingId,
    dragDetails,
    setIsDragging,
    setIsDraggingStart,
    setResetPins,
    setDragLeft,
    setDragChange,
    setPinHoverStart,
    setPinHoverEnd,
    setStartDragNode,
    setShowDragConfirmation,
    setEndDragNode,
    setDraggingId,
    resizeOffScreenRight,
    resizeOffScreenLeft,
    handleDrag,
    classes,
    showDragConfirmation,
    viewOnly,
  } = props

  const renderPinHoverState = (
    task,
    isStart,
    isInError,
    dragValue,
    isAtBound
  ) => {
    let pin = document.getElementById(
      `roamdap-pin-${isStart ? ROADMAP_CONST.START : ROADMAP_CONST.END}-${
        task.id
      }`
    )

    let startDate = getStartDate(task, false)

    let endDate = getEndDate(task, false)
    let previousDate
    const isEditor =
      matterDetails &&
      matterDetails.activities.indexOf(ACTIVITIES.MATTER_TEAM_MEMBER) > -1

    const thisPinIsDragging =
      isDragging &&
      ((isDraggingStart && isStart) || (!isDraggingStart && !isStart))
    const hasDate =
      (isStart && startDate) ||
      (!isStart && endDate) ||
      (thisPinIsDragging && (dragLeft !== 0 || dragChange !== 0))
    if (pin) {
      let rect = pin.getBoundingClientRect()
      if (isStart && dragLeft) {
        previousDate = startDate
        let startDateToInvert
        if (previousDate === null) {
          let populateStartDate =
            getNearestStartDateInTree(task, flatTaskListFromTree(project)) ||
            dayjs.utc().toDate()

          startDateToInvert = new Date(
            getStartDate(task, true, populateStartDate)
          )
        } else {
          startDateToInvert = new Date(getStartDate(task, false))
        }
        startDate = timeScale.invert(timeScale(startDateToInvert) + dragLeft)
      }
      if (!isStart && dragChange) {
        previousDate = endDate
        let endDateToInvert
        if (previousDate === null && !startDate) {
          //We were always applying today in the case of no date, so we needed to expand to cover every case below
          let populateEndDate
          if (task.level > 1) {
            if (
              getNearestEndDateInTree(
                getNearestEndDateInTree(
                  task,
                  flatTaskListFromTree(project),
                  false,
                  true
                )
              )
            ) {
              populateEndDate = getNearestEndDateInTree(
                task,
                flatTaskListFromTree(project),
                false,
                true
              )
            } else if (
              getNearestStartDateInTree(
                task,
                flatTaskListFromTree(project),
                false,
                true
              )
            ) {
              populateEndDate = getNearestStartDateInTree(
                task,
                flatTaskListFromTree(project),
                false,
                true
              )
            } else {
              populateEndDate = dayjs.utc().toDate()
            }
          } else {
            if (getStartDate(task, false)) {
              populateEndDate = getStartDate(task, false)
            } else {
              populateEndDate = dayjs.utc().toDate()
            }
          }

          endDateToInvert = new Date(getEndDate(task, true, populateEndDate))
        } else if (previousDate === null && startDate) {
          let populateEndDate = startDate
          endDateToInvert = new Date(getEndDate(task, true, populateEndDate))
        } else {
          endDateToInvert = new Date(getEndDate(task, false))
        }

        endDate = timeScale.invert(timeScale(endDateToInvert) + dragChange)
      }
      const isVisible = checkIfVisible(rect)
      let taskVisible = true
      let taskElem
      if (!isVisible) {
        taskElem = document.querySelector(`[data-test=roadmap-task-${task.id}]`)
        if (taskElem) {
          taskVisible = checkIfPartiallyVisible(
            taskElem.getBoundingClientRect()
          )
        }
      }
      let leftOffset = 0
      let rightOffset = 0
      if (!isVisible && isStart && taskVisible) {
        leftOffset = Math.max(taskElem.getBoundingClientRect().left, 0)
      }
      if (!isVisible && !isStart && taskVisible) {
        let bounds = taskElem.getBoundingClientRect()
        let rightPos = bounds.left + bounds.width
        rightOffset = Math.max(window.innerWidth - rightPos, 0)
      }

      let duration
      let isBeingDragged =
        (isStart && isDraggingStart) || (!isStart && !isDraggingStart)
      if (startDate && endDate) {
        duration = dayjs(endDate).diff(dayjs(startDate), 'day')
      }
      let durationChange
      if (isDragging && isBeingDragged) {
        let realDuration = dayjs(getEndDate(task, false)).diff(
          dayjs(getStartDate(task, false)),
          'day'
        )
        durationChange = duration - realDuration
        if (durationChange > 0) {
          durationChange = '+' + durationChange
        }
      }

      if (isDragging) {
        let newDuration
        if (isStart) {
          newDuration = dayjs(endDate).diff(startDate, 'day')
          duration = newDuration
        } else {
          newDuration = dayjs(endDate).diff(startDate, 'day')
          duration = newDuration
        }
      }

      const getWarnDate = (task, isStart) => {
        if (isStart) {
          //dates in future subtasks are warns
          let tasks = flatTaskListFromTree(task)
          return getEarliestDateFromListOfTasks(tasks)
        }
        if (!isStart) {
          //dates in past subtasks are warms
          let tasks = flatTaskListFromTree(task)
          return getLatestDateFromListOfTasks(tasks)
        }
        return null
      }

      const warnDate = dayjs
        .utc(getWarnDate(task, isStart))
        .startOf('day')
        .toDate()
      const isInWarn = isStart ? warnDate < startDate : endDate < warnDate
      const needsReplanning = endDate < startDate
      const daysOverdue = dayjs(dayjs.utc().toDate()).diff(
        dayjs(isStart ? startDate : endDate),
        'days'
      )

      const getPlacement = () => {
        return isStart ? 'top-end' : 'bottom-start'
      }

      if (isDragging) {
        leftOffset = 0 + dragLeft
        let _rightOffset = window.innerWidth - (rect.left + rect.width)

        rightOffset = _rightOffset //- dragChange
      }

      let _node = pin
      if (isDragging && isDraggingStart && isStart && startDragNode) {
        _node = startDragNode
      } else if (isDragging && !isDraggingStart && !isStart && endDragNode) {
        _node = endDragNode
      }

      let _props = {
        open: true,
        anchorEl: isVisible && _node,
        style: {
          zIndex: 1004,
          position: isVisible || !taskVisible ? '' : 'absolute',
          top: isVisible || !taskVisible ? '' : rect.top,
          left: !isVisible && isStart && taskVisible ? leftOffset : '',
          right: !isVisible && !isStart && taskVisible ? rightOffset : '',
        },
        placement: getPlacement(),
      }

      let affectedSubtasksCount = 0
      if (isDragging) {
        if ((isDraggingStart && isStart) || (!isDraggingStart && !isStart)) {
          let subtasks = getAllSubTasks(task)
          let dates = subtasks
            .map(d => {
              let sd = getStartDate(d, false)
              let ed = getEndDate(d, false)
              if (sd && ed) {
                return isStart ? sd : ed
              }
              if (sd) {
                return sd
              }
              if (ed) {
                return ed
              }
              return null
            })
            .filter(d => d != null)
            .map(d => new Date(d).getTime())
          let newTime = new Date(startDate).getTime()
          affectedSubtasksCount = dates.filter(d =>
            isStart ? d < newTime : newTime < d
          ).length
        }
      }

      const handlePinClick = (task, dateType) => {
        dispatch(showTaskmapDatePickerForTask({ task, dateType }))
        dispatch(openDatePicker(task.id))
      }

      const cancelClick = () => {
        setStartDragNode(null)
        setEndDragNode(null)
        setShowDragConfirmation(false)
        setDragChange(0)
        setDragLeft(0)
        setIsDragging(false)
        setResetPins(true)
        props.setDraggingId(null)
        props.resetScale()
        let pinMask = document.getElementById('pin-mask')
        pinMask.remove()
      }

      const content = () => {
        return (
          <div
            className={
              (isDragging && isStart && isDraggingStart) ||
              (isDragging && !isStart && !isDraggingStart)
                ? classes.dragConfirmationDiv
                : ''
            }
          >
            <div
              style={{
                cursor: 'pointer',
                flexDirection: 'column',
              }}
              className={classes.pinHoverColumn}
              onClick={() => {
                if (!showDragConfirmation && !viewOnly) {
                  handlePinClick(
                    task,
                    isStart ? ROADMAP_CONST.START : ROADMAP_CONST.END
                  )
                }
              }}
            >
              <div
                className={classes.pinHoverDateInfoWrapper}
                style={{
                  marginLeft:
                    isStart || (daysOverdue > 0 && !isStart) ? 'auto' : '',
                }}
              >
                {!hasDate && (
                  <div className={classes.pinHoverDateWrapper}>
                    <Typography
                      className={classes.pinHoverNoDates}
                      data-test="pin-hover-no-date"
                    >
                      {t(
                        isStart
                          ? isEditor
                            ? 'project.overview.roadmap.setStartDate'
                            : 'project.overview.roadmap.noStartDateSet'
                          : isEditor
                            ? task.status === TASK_STATUS.IN_PROGRESS
                              ? 'project.overview.roadmap.setActualEndDate'
                              : 'project.overview.roadmap.setPlannedEndDate'
                            : 'project.overview.roadmap.noEndDateSet'
                      )}
                    </Typography>
                  </div>
                )}
                {hasDate && (
                  <div className={classes.pinHoverDetailsWrapper}>
                    <div className={classes.pinHoverDateWrapper}>
                      <Typography
                        className={classes.pinHoverDateType}
                        data-test="hover-date-type"
                      >
                        {isStart
                          ? task.status === TASK_STATUS.NOT_STARTED
                            ? t('exports.taskDetails.dates.plannedStart')
                            : t('exports.taskDetails.dates.startedOn')
                          : task.status === TASK_STATUS.DONE
                            ? t('exports.taskDetails.dates.endedOn')
                            : t('exports.taskDetails.dates.dueToEnd')}
                      </Typography>

                      <Typography
                        className={classes.pinHoverDate}
                        data-test="pin-hover-date"
                      >
                        {isStart
                          ? getDateDisplayString(
                              startDate,
                              DATE_FORMAT_FULL,
                              true
                            )
                          : getDateDisplayString(
                              endDate,
                              DATE_FORMAT_FULL,
                              true
                            )}
                      </Typography>
                    </div>
                    {duration > 0 && !durationChange && (
                      <Typography className={classes.pinHoverDuration}>
                        {duration} {t('taskChange.days')}
                      </Typography>
                    )}
                    {durationChange ? (
                      <Typography className={classes.pinHoverDuration}>
                        {duration} {t('taskChange.days')} ( {durationChange}{' '}
                        {t('taskChange.days')} )
                      </Typography>
                    ) : (
                      ''
                    )}
                  </div>
                )}
              </div>
              {isAtBound && (
                <div
                  className={
                    (isDragging && isStart && isDraggingStart) ||
                    (isDragging && !isStart && !isDraggingStart)
                      ? classes.pinHoverWarningWrapperOnConfirm
                      : classes.pinHoverWarningWrapper
                  }
                  style={{ marginLeft: isStart ? 'auto' : '' }}
                >
                  <WarningIcon />
                  <Typography
                    style={{
                      marginLeft: '8px',
                      marginRight: '8px',
                      fontSize: 12,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {isAtBoundText(task, isStart)}
                  </Typography>
                </div>
              )}
              {isInWarn && affectedSubtasksCount > 0 && (
                <div
                  className={
                    (isDragging && isStart && isDraggingStart) ||
                    (isDragging && !isStart && !isDraggingStart)
                      ? classes.pinHoverWarningWrapperOnConfirm
                      : classes.pinHoverWarningWrapper
                  }
                  style={{ marginLeft: isStart ? 'auto' : '' }}
                >
                  <WarningIcon />
                  <Typography className={classes.pinHoverShorteningText}>
                    {t('exports.roadmap.warning')}
                  </Typography>
                  <Typography className={classes.pinHoverWarningBold}>
                    {affectedSubtasksCount + ' '}
                    {t('common.subtask', {
                      s: affectedSubtasksCount > 1 ? 's' : '',
                    })}
                  </Typography>
                </div>
              )}
              {isInError && (daysOverdue > 0 || needsReplanning) && (
                <div
                  className={classes.pinHoverErrorWrapper}
                  style={{ marginLeft: isStart ? 'auto' : '' }}
                >
                  <Typography
                    className={classes.pinHoverOverdueText}
                    style={{
                      marginRight: isEditor && !needsReplanning ? '' : '8px',
                    }}
                  >
                    {needsReplanning &&
                      isEditor &&
                      t('exports.roadmap.needsReplanning')}
                    {!needsReplanning &&
                      (isEditor
                        ? t('exports.roadmap.editorOverdue', {
                            days: daysOverdue,
                            s: daysOverdue === 1 ? '' : 's',
                          })
                        : t('common.overdue'))}
                  </Typography>
                  {!needsReplanning && isEditor && (
                    <Typography
                      className={classes.pinHoverOverdueTextAdditional}
                    >
                      &nbsp;{t('exports.roadmap.selectToReplan')}
                    </Typography>
                  )}
                </div>
              )}
              {((showDragConfirmation && isStart && isDraggingStart) ||
                (showDragConfirmation && !isStart && !isDraggingStart)) && (
                <div
                  data-test="confirm-container"
                  style={{
                    display: 'block',
                    zIndex: 1004,
                    marginLeft:
                      isStart || (daysOverdue > 0 && !isStart) ? 'auto' : '',
                  }}
                  onClick={e => e.stopPropagation()}
                >
                  <Button
                    data-test="cancel-drag"
                    variant="outlined"
                    style={{
                      color: rawColours.primary.purple.secondary,
                      backgroundColor: 'white',
                      marginRight: '5px',
                    }}
                    onClick={() => {
                      cancelClick()
                    }}
                  >
                    {t('common.cancel')}
                  </Button>
                  <Button
                    variant="outlined"
                    className={classes.dragConfirmButton}
                    onClick={() => {
                      let pinMask = document.getElementById('pin-mask')
                      pinMask.remove()
                      props.onDragConfirm()
                    }}
                    data-test="confirm-drag"
                  >
                    {t('common.confirm')}
                  </Button>
                </div>
              )}
            </div>
          </div>
        )
      }

      let r = document.getElementById('roadmap-tasks-wrapper')
      let pinMask = document.getElementById('pin-mask')
      let d = document.createElement('div')
      d.style.width = '100vw'
      d.style.height = '100vh'
      d.style.zIndex = 10000
      d.style.position = 'fixed'
      d.style.opacity = '20%'
      d.style.backgroundColor = 'black'
      d.id = 'pin-mask'
      const x = cancelClick
      d.onclick = x

      if (showDragConfirmation && draggingId === task.id && !pinMask) {
        if (r) {
          r.appendChild(d)
        }
      }

      return (
        <>
          <Popper {..._props}>{content()}</Popper>
        </>
      )
    }
    return null
  }

  if (isStartDate && task.isMilestone) {
    return null
  }
  dayjs.extend(utc)
  if (status === TASK_STATUS.NOT_REQUIRED) return ''
  let pinPosition =
    timeScale(dayjs(new Date(date))) +
    offset -
    (offset > 0 ? RoadmapConstants.PIN_WIDTH + 2 : 0)
  if (
    error &&
    offset &&
    new Date(getStartDate(task, false)) > new Date(getEndDate(task, false))
  ) {
    pinPosition = timeScale(new Date(date)) - offset
  }

  let isChildOfDraggingTask = false
  if (draggingId) {
    let subtasks = getAllSubTasks(tasks.find(t => t.id === draggingId)).map(
      t => t.id
    )
    isChildOfDraggingTask = subtasks.includes(task.id)
  }

  if (isChildOfDraggingTask) {
    if (
      dragDetails.isStart &&
      timeScale.invert(pinPosition) < new Date(dragDetails.date)
    ) {
      pinPosition = timeScale(dragDetails.date)
    } else if (
      !dragDetails.isStart &&
      timeScale.invert(pinPosition) > new Date(dragDetails.date)
    ) {
      pinPosition = timeScale(dragDetails.date)
    }
  }

  let now = dayjs.utc().toDate()
  let tomorrow = dayjs.utc().add(1, 'day').toDate()
  let oneDayPx = timeScale(tomorrow) - timeScale(now)

  let leftBound =
    timeScale(getErrorDate(task, true)) -
    timeScale(
      new Date(
        getStartDate(
          task,
          true,
          getNearestStartDateInTree(task, flatTaskListFromTree(project))
        )
      )
    )
  let rightBound =
    timeScale(getErrorDate(task, false)) -
    timeScale(
      getEndDate(
        task,
        true,
        getNearestEndDateInTree(task, flatTaskListFromTree(project))
      )
    )
  if (
    timeScale(getErrorDate(task, false)) ===
      timeScale(
        getEndDate(
          task,
          true,
          getNearestEndDateInTree(task, flatTaskListFromTree(project))
        )
      ) &&
    getEndDate(task, false) === null
  ) {
    let dateToMinus
    if (task.level > 1) {
      //Need to cover every possible date  to use  and not just default to using today
      if (
        getNearestEndDateInTree(
          task,
          flatTaskListFromTree(project),
          false,
          true
        )
      ) {
        dateToMinus = getNearestStartDateInTree(
          task,
          flatTaskListFromTree(project),
          false,
          true
        )
      } else {
        dateToMinus = dayjs.utc().toDate()
      }
    } else {
      if (getStartDate(task, false)) {
        dateToMinus = getStartDate(task, false)
      } else {
        dateToMinus = dayjs.utc().toDate()
      }
    }
    rightBound =
      timeScale(getErrorDate(task, false)) -
      timeScale(dayjs(dateToMinus).toDate())
  }
  if (getEndDate(task, false) === null && getStartDate(task, false)) {
    rightBound =
      timeScale(getErrorDate(task, false)) -
      timeScale(new Date(getStartDate(task, false)))
  }

  if (isStartDate) {
    rightBound =
      timeScale(
        getEndDate(
          task,
          true,
          getNearestEndDateInTree(
            task,
            flatTaskListFromTree(project),
            false,
            true
          )
        )
      ) -
      timeScale(
        new Date(
          getStartDate(
            task,
            true,
            getNearestStartDateInTree(task, flatTaskListFromTree(project))
          ) || dayjs.utc().toDate()
        )
      )

    if (
      task.status === TASK_STATUS.IN_PROGRESS ||
      task.status === TASK_STATUS.DONE ||
      task.status === TASK_STATUS.DONE_MILESTONE
    ) {
      rightBound = !isNaN(rightBound)
        ? Math.min(
            rightBound,
            timeScale(dayjs.utc().toDate()) -
              timeScale(
                new Date(
                  getStartDate(
                    task,
                    true,
                    getNearestStartDateInTree(
                      task,
                      flatTaskListFromTree(project)
                    )
                  ) || dayjs.utc().toDate()
                )
              )
          )
        : timeScale(dayjs.utc().toDate()) -
          timeScale(
            new Date(
              getStartDate(
                task,
                true,
                getNearestStartDateInTree(task, flatTaskListFromTree(project))
              ) || dayjs.utc().toDate()
            )
          )
    }
  } else {
    if (getStartDate(task, false) === null && task.level > 1) {
      if (getEndDate(task, false)) {
        if (getNearestStartDateInTree(task, flatTaskListFromTree(project))) {
          leftBound =
            timeScale(
              new Date(
                getStartDate(
                  task,
                  true,
                  getNearestStartDateInTree(task, flatTaskListFromTree(project))
                )
              )
            ) - timeScale(new Date(getEndDate(task, false)))
        } else {
          leftBound =
            timeScale(new Date(getStartDate(task, true))) -
            timeScale(new Date(getEndDate(task, false)))
        }
      } else {
        //We can now default to zero for end dates as we dont position them under
        // their  parents endates anymore, and instead just position on their own start date
        leftBound = null
        rightBound =
          timeScale(
            getEndDate(
              task,
              true,
              getNearestEndDateInTree(
                task,
                flatTaskListFromTree(project),
                false,
                true
              )
            )
          ) -
          timeScale(
            new Date(
              getStartDate(
                task,
                true,
                getNearestStartDateInTree(task, flatTaskListFromTree(project))
              ) || dayjs.utc().toDate()
            )
          )
        rightBound = -1 + rightBound
      }
    } else {
      if (getEndDate(task, false)) {
        leftBound =
          timeScale(
            new Date(
              getStartDate(
                task,
                true,
                getNearestStartDateInTree(task, flatTaskListFromTree(project))
              )
            )
          ) -
          timeScale(
            new Date(
              getEndDate(
                task,
                true,
                getNearestEndDateInTree(task, flatTaskListFromTree(project))
              )
            )
          )
      } else {
        // same reason as above
        leftBound = 0
      }
    }
  }

  if (resetPins) {
    return null
  }

  let isAtBound = false

  if (
    isDragging &&
    ((isStartDate && isDraggingStart) || (!isStartDate && !isDraggingStart))
  ) {
    const d = Math.round((dragLeft + dragChange) * 100) / 100
    if (
      getNearestStartDateInTree(task, flatTaskListFromTree(project)) === null
    ) {
      isAtBound = d >= Math.round(rightBound * 100) / 100
    } else {
      isAtBound =
        d <= Math.round(leftBound * 100) / 100 ||
        d >= Math.round(rightBound * 100) / 100
    }

    //covers milestones not having a start date so are not effect by left bounds other than parents
    if (task.isMilestone) {
      leftBound =
        getNearestStartDateInTree(task, flatTaskListFromTree(project)) === null
          ? null
          : timeScale(
              new Date(
                getNearestStartDateInTree(task, flatTaskListFromTree(project))
              )
            ) -
            timeScale(
              new Date(
                getEndDate(
                  task,
                  true,
                  getNearestEndDateInTree(task, flatTaskListFromTree(project))
                )
              )
            )

      isAtBound = false
    }
  }

  return (
    <div
      className="pin"
      data-test="roadmap-task-pin"
      id={`roamdap-pin-${
        isStartDate ? ROADMAP_CONST.START : ROADMAP_CONST.END
      }-${task.id}`}
      onMouseEnter={() =>
        isStartDate ? setPinHoverStart(true) : setPinHoverEnd(true)
      }
      onMouseLeave={() =>
        isStartDate ? setPinHoverStart(false) : setPinHoverEnd(false)
      }
      key={i + date}
      style={{
        position: 'absolute',
        top: rowHeight + additionalHeight - (isCompact ? 30 : 40) - 8 + 'px',
        left: pinPosition + 'px',
        width: RoadmapConstants.PIN_WIDTH + 'px',
        zIndex: RoadmapConstants.Z_LAYER_INTERACTIVE,
      }}
    >
      {isStartDate ? (
        <RoadmapPinStart
          viewOnly={viewOnly}
          isDragging={isDragging && isDraggingStart}
          pinHover={pinHoverStart}
          dashed={getStartDate(task, false) === null ? true : false}
          fill={
            error
              ? rawColours.roadmapPin.error.fill
              : getDatePinColour(
                  task,
                  isStartDate ? ROADMAP_CONST.START : ROADMAP_CONST.END,
                  ROADMAP_CONST.FILL
                )
          }
          stroke={
            error
              ? rawColours.roadmapPin.error.stroke
              : getDatePinColour(
                  task,
                  isStartDate ? ROADMAP_CONST.START : ROADMAP_CONST.END,
                  ROADMAP_CONST.STROKE
                )
          }
          onDrag={(e, data) => {
            let x = data.x
            let deltaX = data.deltaX
            let pin = document.getElementById(
              `roamdap-pin-${
                isStartDate ? ROADMAP_CONST.START : ROADMAP_CONST.END
              }-${task.id}`
            )
            if (pin) {
              if (
                e.clientX > window.innerWidth - 100 &&
                pinPosition + x > window.innerWidth - 100
              ) {
                resizeOffScreenRight()
              }
              if (e.clientX < 100 && pinPosition + x < 100) {
                resizeOffScreenLeft()
              }
            }
            setDragLeft(x)
            handleDrag(timeScale.invert(pinPosition + x), true)
          }}
          leftBound={leftBound}
          rightBound={rightBound}
          oneDayPx={oneDayPx}
          onDragStart={(e, d) => {
            setShowDragConfirmation(false)
            setStartDragNode(d.node)
            setIsDraggingStart(true)

            setIsDragging(true)
            setDraggingId(task.id)
          }}
          onDragStop={(e, d) => {
            if (
              getEndDate(task, false) == null &&
              timeScale(
                getEndDate(
                  task,
                  true,
                  getNearestEndDateInTree(
                    task,
                    flatTaskListFromTree(project),
                    false,
                    true
                  )
                )
              ) -
                timeScale(
                  new Date(
                    getStartDate(
                      task,
                      true,
                      getNearestStartDateInTree(
                        task,
                        flatTaskListFromTree(project)
                      )
                    ) || dayjs.utc().toDate()
                  )
                ) <
                0 &&
              Math.abs(Math.round(dragChange * 1e5) / 1e5) <
                Math.abs(Math.round(oneDayPx * 1e5) / 1e5)
            ) {
              setShowDragConfirmation(false)
              setDragChange(0)
              setDragLeft(0)
              setIsDragging(false)
              setResetPins(true)
              setDraggingId(null)
              return
            }

            if (
              getStartDate(task, false) !== null &&
              Math.abs(Math.round(dragLeft * 1e5) / 1e5) <
                Math.abs(Math.round(oneDayPx * 1e5) / 1e5)
            ) {
              setShowDragConfirmation(false)
              setDragChange(0)
              setDragLeft(0)
              setIsDragging(false)
              setResetPins(true)
              setDraggingId(null)
              return
            }
            setShowDragConfirmation(1)
          }}
        />
      ) : (
        <RoadmapPinEnd
          viewOnly={viewOnly}
          isMilestone={task.isMilestone}
          isDragging={isDragging && !isDraggingStart}
          pinHover={pinHoverEnd}
          dashed={getEndDate(task, false) === null ? true : false}
          fill={
            error
              ? rawColours.roadmapPin.error.fill
              : getDatePinColour(
                  task,
                  isStartDate ? ROADMAP_CONST.START : ROADMAP_CONST.END,
                  ROADMAP_CONST.FILL
                )
          }
          stroke={
            error
              ? rawColours.roadmapPin.error.stroke
              : getDatePinColour(
                  task,
                  isStartDate ? ROADMAP_CONST.START : ROADMAP_CONST.END,
                  ROADMAP_CONST.STROKE
                )
          }
          onDrag={(e, data) => {
            let x = data.x
            let pin = document.getElementById(
              `roamdap-pin-${
                isStartDate ? ROADMAP_CONST.START : ROADMAP_CONST.END
              }-${task.id}`
            )
            if (pin) {
              if (
                e.clientX > window.innerWidth - 100 &&
                pinPosition + x > window.innerWidth - 100
              ) {
                resizeOffScreenRight()
              }
              if (e.clientX < 100 && pinPosition + x < 100) {
                resizeOffScreenLeft()
              }
            }
            handleDrag(timeScale.invert(pinPosition + x), false)

            setDragChange(x)
          }}
          onDragStart={(e, d) => {
            setEndDragNode(d.node)
            setIsDraggingStart(false)
            setIsDragging(true)
            setDraggingId(task.id)
          }}
          rightBound={rightBound}
          leftBound={leftBound}
          oneDayPx={oneDayPx}
          onDragStop={(e, d) => {
            if (
              getEndDate(task, false) == null &&
              timeScale(
                getEndDate(
                  task,
                  true,
                  getNearestEndDateInTree(
                    task,
                    flatTaskListFromTree(project),
                    false,
                    true
                  )
                )
              ) -
                timeScale(
                  new Date(
                    getStartDate(
                      task,
                      true,
                      getNearestStartDateInTree(
                        task,
                        flatTaskListFromTree(project)
                      )
                    ) || dayjs.utc().toDate()
                  )
                ) <
                0 &&
              Math.abs(Math.round(dragChange * 1e5) / 1e5) <
                Math.abs(Math.round(oneDayPx * 1e5) / 1e5)
            ) {
              setShowDragConfirmation(false)
              setDragChange(0)
              setDragLeft(0)
              setIsDragging(false)
              setResetPins(true)
              setDraggingId(null)
              return
            }

            if (
              getEndDate(task, false) !== null &&
              Math.abs(Math.round(dragChange * 1e5) / 1e5) <
                Math.abs(Math.round(oneDayPx * 1e5) / 1e5)
            ) {
              setShowDragConfirmation(false)
              setDragChange(0)
              setDragLeft(0)
              setIsDragging(false)
              setResetPins(true)
              setDraggingId(null)
              return
            }
            setShowDragConfirmation(2)
          }}
        />
      )}

      {(hover || isDragging) &&
        renderPinHoverState(task, isStartDate, error, dragValue, isAtBound)}
    </div>
  )
}

export default RoadmapPin
