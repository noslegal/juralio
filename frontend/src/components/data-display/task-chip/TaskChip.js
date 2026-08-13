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
import Visibility from '@mui/icons-material/Visibility'
import { Card, IconButton, Tooltip, Typography } from '@mui/material'
import classNames from 'classnames'
import dayjs from 'dayjs'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { withStyles } from 'tss-react/mui'
import {
  DATE_STRINGS,
  TASK_MENU_CONTEXT,
  TASK_STATUS,
} from '../../../app/constants'
import { isPlannedEndDateOverdue } from '../../../app/roadmap/helpers/task-dates-helper'
import {
  showTaskmapDatePickerForTask,
  showTaskPreview,
} from '../../../app/task-details/task-actions'
import TaskMenuContainer from '../../../app/task-details/task-card-header/task-option-menu/TaskMenuContainer'
import MilestoneIcon from '../../../assets/images/JurMilestone'
import JurDeliverable from '../../../assets/images/JurDeliverable'
import {
  getDateAtStartOfDay,
  getDateDisplayString,
} from '../../../services/helpers/date-helper'
import { getStatusColour } from '../../../services/helpers/task/task-status-colour-helper'
import { levelNumberToLetter } from '../../../services/helpers/task/task-util-helper'
import colorModifiers from '../../../theme/color-modifiers'
import juralioColours from '../../../theme/juralio-colours'
import rawColours from '../../../theme/raw-colours'
import {
  getTaskDetailsUrl,
  getTemplateTaskDetailsUrl,
} from '../../navigation/common/location-context-helper'
import utc from 'dayjs/plugin/utc'
dayjs.extend(utc)

const styles = theme => ({
  root: {
    display: 'flex',
    height: theme.spacing(3.5), //IE11
    minHeight: theme.spacing(3.5), //IE11
    maxHeight: theme.spacing(3.5), //IE11
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
  templateItemPip: {
    backgroundColor: juralioColours.taskCell.background.template,
    color: juralioColours.darkText.primary,
    borderRadius: theme.spacing(0.5),
    lineHeight: theme.spacing(2.5),
    textAlign: 'center',
    zIndex: '1 !important',
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
    display: 'flex',
    flexDirection: 'row-reverse',
  },
  taskPreview: {
    color: colorModifiers.primaryText(rawColours.primary.black.black),
    height: theme.spacing(3),
    cursor: 'pointer',
    marginRight: theme.spacing(),
  },
  dueDateWrapper: {
    background: colorModifiers.secondaryBackground(
      rawColours.primary.white.primary
    ),
    borderRadius: theme.spacing(0.5),
    margin: theme.spacing(0.5),
    display: 'flex',
    cursor: 'pointer',
    '&:hover': {
      background: colorModifiers.primaryBackground(
        rawColours.primary.white.primary
      ),
    },
  },
  dueDateWrapperNoInteraction: {
    borderRadius: theme.spacing(0.5),
    margin: theme.spacing(0.5),
    display: 'flex',
  },
  dueDate: {
    marginTop: 1,
    marginRight: theme.spacing(0.5),
    lineHeight: 'unset',
    minWidth: 104,
  },
  dateContext: {
    minWidth: 'fit-content',
    marginTop: 'auto',
    marginBottom: 'auto',
    color: colorModifiers.primaryText(rawColours.primary.black.black),
    overflow: 'none',
  },
})

const TaskChip = props => {
  const { classes, task } = props
  const [isHover, setIsHover] = useState(0)
  const [showOptions, setShowOptions] = useState(false)
  const [anchorEl, setanchorEl] = useState(null)
  const isTemplate = !task.status
  const dispatch = useDispatch()
  const history = useNavigate()
  const { t } = useTranslation()

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
        return classes.templateItemPip
    }
  }

  const getBorderStyle = () => {
    return {
      borderBottom: `3px solid ${
        isTemplate
          ? juralioColours.named.purple['300']
          : getStatusColour(task.status)
      }`,
    }
  }

  const renderNextDate = () => {
    if ([TASK_STATUS.NOT_REQUIRED, TASK_STATUS.DONE].includes(task.status)) {
      return null
    } else {
      const isStartOverdue = new Date() > new Date(task.plannedStartDate)
      const isOverdue =
        getDateAtStartOfDay(new Date()) > new Date(task.plannedEndDate)
      const isDueToday = new Date() > getDateAtStartOfDay(task.plannedEndDate)

      if (
        task.actualEndDate == null &&
        task.plannedEndDate &&
        !(props.forceStartDateIfDueToday && isStartOverdue && !isDueToday)
      ) {
        return (
          <>
            <div
              className={
                props.showInteractions
                  ? classes.dueDateWrapper
                  : classes.dueDateWrapperNoInteraction
              }
              id={`task-chip-due-date-${task.id}`}
              onClick={e => {
                if (props.showInteractions) {
                  e.stopPropagation()
                  dispatch(
                    showTaskmapDatePickerForTask({
                      task: task,
                      dateType: 'end',
                      showTaskPreview: false,
                    })
                  )
                }
              }}
            >
              <Typography
                className={classes.dueDate}
                data-test="task-chip-due-date"
                style={{
                  color: isOverdue
                    ? rawColours.primary.red.primary
                    : colorModifiers.primaryText(
                        rawColours.primary.black.black
                      ),
                  fontWeight:
                    getDateDisplayString(task.plannedEndDate) ===
                    DATE_STRINGS.TODAY
                      ? 'bold'
                      : '',
                }}
                variant="caption"
              >
                {getDateDisplayString(
                  dayjs.utc(task.plannedEndDate).startOf('day')
                )}
              </Typography>
            </div>
            <Typography
              className={classes.dateContext}
              data-test="task-chip-date-context"
              variant="caption"
            >
              {t('taskMapDates.finishText')}
            </Typography>
          </>
        )
      } else if (task.actualStartDate == null && task.plannedStartDate) {
        return (
          <>
            <div
              className={
                props.showInteractions
                  ? classes.dueDateWrapper
                  : classes.dueDateWrapperNoInteraction
              }
              id={`task-chip-due-date-${task.id}`}
              onClick={e => {
                if (props.showInteractions) {
                  e.stopPropagation()
                  dispatch(
                    showTaskmapDatePickerForTask({
                      task: task,
                      dateType: 'start',
                      showTaskPreview: false,
                    })
                  )
                }
              }}
            >
              <Typography
                className={classes.dueDate}
                data-test="task-chip-due-date"
                style={{
                  color: isStartOverdue
                    ? rawColours.primary.red.primary
                    : colorModifiers.primaryText(
                        rawColours.primary.black.black
                      ),
                  fontWeight:
                    getDateDisplayString(task.plannedEndDate) ===
                    DATE_STRINGS.TODAY
                      ? 'bold'
                      : '',
                }}
                variant="caption"
              >
                {getDateDisplayString(task.plannedStartDate)}
              </Typography>
            </div>
            <Typography
              className={classes.dateContext}
              data-test="task-chip-date-context"
              variant="caption"
            >
              {t('taskMapDates.startBy')}
            </Typography>
          </>
        )
      }
    }
    return null
  }

  const renderInteraction = () => {
    return (
      <>
        <Visibility
          className={classes.taskPreview}
          data-test="task-preview-icon"
          onClick={e => {
            e.stopPropagation()
            let nearestTaskCell = e.target.closest(
              '[data-test=juralio-chip-task]'
            )
            if (nearestTaskCell) {
              let coords = nearestTaskCell.getBoundingClientRect()
              dispatch(
                showTaskPreview(task, { left: coords.x, top: coords.y - 72 })
              )
            }
          }}
        />
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
        : props.matterId
          ? getTaskDetailsUrl(
              props.matterId,
              props.projectId,
              task.databaseUID ? task.databaseUID : task.id
            )
          : getTemplateTaskDetailsUrl(props.projectId, task.id)
    )
  }

  if (props.projectId) {
    task.projectId = props.projectId
  }

  const hasDates = task => {
    if (
      !task.plannedStartDate &&
      !task.plannedEndDate &&
      !task.actualStartDate &&
      !task.actualEndDate
    ) {
      return false
    } else {
      return true
    }
  }

  const getTaskNameWidth = task => {
    if (!props.showInteractions && !props.showDates) {
      return 'unset'
    } else if (props.showDates && !props.showInteractions) {
      return '190px'
    }
    if (
      [TASK_STATUS.NOT_REQUIRED, TASK_STATUS.DONE].includes(task.status) ||
      !hasDates(task)
    ) {
      return 'unset'
    }
    return '105px'
  }

  const renderTooltipIfMilestone = reactComponent => {
    return task.isMilestone ? (
      <Tooltip title={t('milestones.taskChipHover')}>{reactComponent}</Tooltip>
    ) : (
      <>{reactComponent}</>
    )
  }

  return (
    <div className={classes.root}>
      <Typography
        className={classNames(classes.pipBase, classes.letterLevel)}
        style={props.compact ? { fontSize: 12 } : {}}
      >
        {levelNumberToLetter(task.level)}
      </Typography>
      {renderTooltipIfMilestone(
        <Card
          elevation={props.noHover ? 0 : isHover}
          className={classes.card}
          onMouseOver={() => setIsHover(1)}
          onMouseLeave={() => setIsHover(0)}
          onClick={event => {
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
              className={classes.chipTask}
              onClick={navigateToTask}
              style={{ cursor: props.isLink ? 'pointer' : 'unset' }}
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
              {props.showInteractions && renderInteraction()}
              {(props.showInteractions || props.showDates) && renderNextDate()}
              <Typography
                className={classNames(classes.ellipsisText, classes.taskName)}
                data-test="task-name"
                style={
                  props.compact
                    ? {
                        fontSize: 12,
                        paddingTop: 4,
                        maxWidth: getTaskNameWidth(task),
                      }
                    : {
                        maxWidth: getTaskNameWidth(task),
                      }
                }
              >
                {task.name}
              </Typography>
              {task.isMilestone && (
                <MilestoneIcon
                  data-test="milestone-icon"
                  style={{
                    width: '20px',
                    height: '20px',
                    'margin-top': '4px',
                    'margin-left': '4px',
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
                <JurDeliverable
                  data-test="deliverable-icon"
                  scale="0.8"
                  stroke={
                    task.status === TASK_STATUS.NOT_STARTED &&
                    isPlannedEndDateOverdue(task)
                      ? rawColours.error.primary
                      : task.status === TASK_STATUS.NOT_STARTED
                        ? juralioColours.taskStatus.notStarted
                        : task.status === TASK_STATUS.IN_PROGRESS
                          ? juralioColours.taskStatus.inProgress
                          : task.status === TASK_STATUS.DONE
                            ? juralioColours.taskStatus.done
                            : rawColours.status.template.dark
                  }
                />
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
          matterId={props.matterId}
          task={task}
          taskMenuContext={TASK_MENU_CONTEXT.TASK_HEADER}
          hideRename={true}
          dontRedirect={true}
          updateProject={() => {}}
        />
      )}
    </div>
  )
}

export default withStyles(TaskChip, styles)
