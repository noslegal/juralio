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
import Typography from '@mui/material/Typography'
import PropTypes from 'prop-types'
import React, { useState } from 'react'
import { makeStyles } from 'tss-react/mui'
import { TASK_MAP_VIEW_MODE_ENUM, TASK_STATUS } from '../../../app/constants'
import { isPlannedEndDateOverdue } from '../../../app/roadmap/helpers/task-dates-helper'
import MilestoneIcon from '../../../assets/images/JurMilestone'
import juralioColours from '../../../theme/juralio-colours'
import rawColours from '../../../theme/raw-colours'
import TaskReferenceNumber from '../task-reference-number/TaskReferenceNumber'
import TaskCellDates from './TaskCellDates'
import JurDeliverable from '../../../assets/images/JurDeliverable'

const useStyles = makeStyles()(theme => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    width: 'calc(100% - 8px)',
    paddingTop: theme.spacing(),
    paddingBottom: theme.spacing(),
    paddingLeft: theme.spacing(),
    height: theme.spacing(2),
  },
  taskName: {
    color: juralioColours.darkText.primary,
    lineHeight: theme.spacing(2.5),
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
  },
  nameWrapper: {
    marginBottom: theme.spacing(0.5),
    marginRight: theme.spacing(0.5),
    marginLeft: theme.spacing(1.5),
    marginTop: theme.spacing(1.25),
    overflow: 'auto',
    flexDirection: 'column',
    justifyContent: 'center',
  },
  optionsDropdown: {
    paddingRight: theme.spacing(1.5),
    color: juralioColours.darkText.secondary,
  },
  optionsWrapper: {
    display: 'flex',
    flexDirection: 'row',
    marginLeft: 'auto',
    paddingTop: '2px',
  },
  nameAndNumber: {
    display: 'flex',
    alignItems: 'center',
    paddingLeft: theme.spacing(),
  },
  hoverEye: {
    marginTop: theme.spacing(0.25),
    marginBottom: 'auto',
    color: juralioColours.darkText.secondary,
    opacity: 0,
    paddingBottom: theme.spacing(0.25),
    paddingLeft: theme.spacing(0.25),
    paddingRight: theme.spacing(0.25),
  },
  hoverEyeHover: {
    marginTop: theme.spacing(0.25),
    marginBottom: 'auto',
    color: juralioColours.darkText.secondary,
    paddingBottom: theme.spacing(0.25),
    paddingLeft: theme.spacing(0.25),
    paddingRight: theme.spacing(0.25),
    opacity: 1,
  },
}))

const TaskCellContentCompact = props => {
  const { classes } = useStyles()
  const task = props.item
  const [isHovering, setIsHovering] = useState(false)
  const isShowingOptions = props.showOptions

  return (
    <div
      onMouseEnter={() => setIsHovering(true)}
      onMouseLeave={() => setIsHovering(false)}
      className={classes.root}
    >
      {task.isMilestone && (
        <div style={{ marginTop: '10px' }}>
          <MilestoneIcon
            data-test="milestone-icon"
            style={{
              color:
                task.status === TASK_STATUS.NOT_STARTED &&
                isPlannedEndDateOverdue(task)
                  ? rawColours.error.primary
                  : task.status === TASK_STATUS.NOT_STARTED
                    ? juralioColours.taskStatus.notStarted
                    : task.status === TASK_STATUS.DONE
                      ? juralioColours.taskStatus.done
                      : rawColours.status.template.dark,
            }}
          />
        </div>
      )}

      {task.isDeliverable && (
        <div style={{ marginTop: '10px' }}>
          <JurDeliverable
            data-test="deliverable-icon"
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
        </div>
      )}
      <div
        style={
          window.location.href.includes('taskList')
            ? { width: '55%' }
            : { width: '75%' }
        }
        className={classes.nameWrapper}
      >
        <div className={classes.nameAndNumber}>
          <Typography
            style={
              props.renderDates ? { maxWidth: '100%' } : { maxWidth: '240px' }
            }
            variant="subtitle2"
            data-test="name"
            className={classes.taskName}
            noWrap
            data-task-name
            id={`task-cell-name-${task.id}`}
          >
            {task.name}
          </Typography>
          {!props.isTemplate() && <TaskReferenceNumber compact task={task} />}
        </div>
      </div>
      <div className={classes.optionsWrapper}>
        <div style={{ marginRight: '4px' }}>
          {!props.isReadOnly && !props.isTemplate() && props.renderDates && (
            <Visibility
              className={isHovering ? classes.hoverEyeHover : classes.hoverEye}
              data-test="task-preview-opener"
              id={`visibility-${task.id}`}
              onClick={props.handlePreviewClick}
            />
          )}
        </div>

        {props.renderDates && !props.isTemplate() && (
          <TaskCellDates
            task={task}
            plannedStartDate={task.plannedStartDate}
            plannedEndDate={task.plannedEndDate}
            actualEndDate={task.actualEndDate}
            isLinked={task.datesLinkedToSiblings}
            isRoadmap={props.isRoadmap}
            viewOnly={props.viewOnly}
            handleDateClick={props.handleDateClick}
            isDetailedMode={
              props.detailedView?.viewMode === TASK_MAP_VIEW_MODE_ENUM.DETAILED
            }
            compact={true}
          />
        )}

        {isShowingOptions && (
          <MoreVertIcon
            onClick={e => {
              e.stopPropagation()
              props.handleOptionsClick(e, task)
            }}
            data-test="options-dropdown"
            data-open-options-menu
            className={classes.optionsDropdown}
            id={`more-vert-icon-${task.id}`}
          />
        )}
      </div>
    </div>
  )
}

TaskCellContentCompact.propTypes = {
  showOptions: PropTypes.bool,
}

export default TaskCellContentCompact
