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
import { Typography } from '@mui/material'
import React from 'react'
import { makeStyles } from 'tss-react/mui'
import { TASK_STATUS } from '../../../app/constants'
import MilestoneIcon from '../../../assets/images/JurMilestone'
import juralioColours from '../../../theme/juralio-colours'
import rawColours from '../../../theme/raw-colours'
import TaskReferenceNumber from '../task-reference-number/TaskReferenceNumber'
import JurDeliverable from '../../../assets/images/JurDeliverable'
import { isPlannedEndDateOverdue } from '../../../app/roadmap/helpers/task-dates-helper'

const styles = makeStyles()(theme => ({
  sticky: {
    position: 'sticky',
    marginTop: theme.spacing(0.5),
  },
  content: {
    display: 'flex',
    height: '100%',
    alignItems: 'center',
  },
  optionsDropdown: {
    right: 0,
    height: theme.spacing(2.5),
    width: theme.spacing(2.5),
    paddingRight: theme.spacing(1.5),
    verticalAlign: 'sub',
    display: 'inline',
    marginLeft: 'auto',

    color: juralioColours.darkText.primary,
    [theme.breakpoints.down('md')]: { display: 'none' },
  },
  labelIV: {
    color: juralioColours.darkText.primary,
    lineHeight: theme.spacing(2.5),
    marginLeft: theme.spacing(),
    marginRight: theme.spacing(),
  },
  icon: {
    marginLeft: theme.spacing(),
  },
}))

const CompactTaskCellContent = props => {
  const { classes } = styles()
  const task = props.task
  const getMilestoneColour = () => {
    if (props.isTemplate) {
      return { color: rawColours.primary.purple.secondary }
    }
    return task.status === TASK_STATUS.NOT_STARTED
      ? { color: juralioColours.taskStatus.notStarted }
      : { color: juralioColours.taskStatus.done }
  }
  return (
    <div className={classes.sticky} data-test="compact-task-cell-content">
      <div className={classes.content}>
        {task.isMilestone && (
          <MilestoneIcon
            data-test="milestone-icon"
            style={getMilestoneColour()}
            className={classes.icon}
          />
        )}
        {task.isDeliverable && (
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
                    : juralioColours.taskStatus.done
            }
          />
        )}
        <Typography
          variant="subtitle2"
          data-test="name"
          className={`${classes.labelIV} ${
            props.isNotRequired && classes.notRequiredLabel
          }`}
          noWrap
          data-task-name
          id={`task-cell-name-${task.id}`}
        >
          {task.name}
        </Typography>
        <TaskReferenceNumber compact task={task} />
        {!props.isReadOnly && props.showOptions && !props.selectionMode && (
          <MoreVertIcon
            ref={props.ref}
            onClick={e => {
              e.stopPropagation()
              props.handleOptionsClick(e, task, props.ref?.current)
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
export default CompactTaskCellContent
