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

import { Typography } from '@mui/material'
import MenuItem from '@mui/material/MenuItem'
import React from 'react'
import { withStyles } from 'tss-react/mui'
import juralioColours from '../../../../theme/juralio-colours'
import { TASK_STATUS, TASK_STATUS_LABELS } from '../../../constants'

const styles = theme => ({
  legendDotStyle: {
    display: 'inline-block',
    borderRadius: '50%',
    width: 11,
    height: 11,
    marginRight: theme.spacing(2),
    verticalAlign: 'middle',
  },
  notRequiredDotStyle: {
    backgroundColor: juralioColours.taskStatus.notRequired,
  },
  notStartedDotStyle: {
    backgroundColor: juralioColours.taskStatus.notStarted,
  },
  inProgressDotStyle: {
    backgroundColor: juralioColours.taskStatus.inProgress,
  },
  doneDotStyle: {
    backgroundColor: juralioColours.taskStatus.done,
  },
  currentStatusStyle: {
    fontWeight: 'bold',
    color: juralioColours.darkText.primary,
  },
  menuText: {
    color: juralioColours.darkText.secondary,
  },
})

const StatusMenuItem = props => {
  const vanityTaskState = props.vanityTaskState
    ? props.vanityTaskState
    : props.taskState
  const isMatchingStatus = props.currentStatus === props.taskState

  const handleClick = e => {
    props.updateHandler(props.taskState, !isMatchingStatus)
    e.stopPropagation()
  }

  const getDotStyle = status => {
    switch (status) {
      case TASK_STATUS.NOT_REQUIRED:
        return props.classes.notRequiredDotStyle
      case TASK_STATUS.NOT_STARTED:
        return props.classes.notStartedDotStyle
      case TASK_STATUS.IN_PROGRESS:
        return props.classes.inProgressDotStyle
      case TASK_STATUS.DONE:
        return props.classes.doneDotStyle
      default:
        return null
    }
  }

  return (
    <MenuItem onClick={handleClick} disabled={props.disabled}>
      <div
        className={`${props.classes.legendDotStyle} ${getDotStyle(
          props.taskState
        )}`}
        data-test="status-selection-item-dot"
      >
        &nbsp;
      </div>
      <span data-test="task-card-option-menu">
        <Typography
          className={
            isMatchingStatus
              ? props.classes.currentStatusStyle
              : props.classes.menuText
          }
          variant="subtitle1"
          data-test="menu-text"
        >
          {isMatchingStatus
            ? TASK_STATUS_LABELS[vanityTaskState]
            : `Set to ${TASK_STATUS_LABELS[vanityTaskState].toLowerCase()}`}
        </Typography>
      </span>
    </MenuItem>
  )
}

export default withStyles(StatusMenuItem, styles)
