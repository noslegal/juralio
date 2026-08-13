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

import PersonAddIcon from '@mui/icons-material/PersonAdd'
import PersonAddDisabledIcon from '@mui/icons-material/PersonAddDisabled'
import AvatarGroup from '@mui/material/AvatarGroup'
import { Avatar, Tooltip, Typography } from '@mui/material'
import classNames from 'classnames'
import React from 'react'
import { useDispatch } from 'react-redux'
import {
  showTaskmapTaskAssigneeContainer,
  showTaskPreview,
} from '../../../app/task-details/task-actions'
import TaskMapAssigneeToolTip from '../../../app/task-map/task-assignees/TaskMapAssigneeToolTip'
import { openPreview } from '../../../redux/ducks/improved-taskmap-interactions'
import {
  isInImprovedTaskmapContext,
  isInRoadmapContext,
  isInTasklistContext,
} from '../../../services/helpers/route/route-context-helper'
import {
  compareNumbers,
  compareStrings,
} from '../../../services/helpers/table/juralio-table-sorting-helper'
import { avatarInitials } from '../../../services/user/helper/user-format-service'
import juralioColours from '../../../theme/juralio-colours'
import { JuralioAvatarColours } from '../../../theme/juralio-named-colours'
import rawColours from '../../../theme/raw-colours'
import { avatarImages } from '../../data-display/user/avatars/avatar-helper'
import { makeStyles } from 'tss-react/mui'
const styles = makeStyles()(theme => ({
  zeroAssigneeIcons: {
    color: juralioColours.named.black[200],
    margin: 'auto',
    width: theme.spacing(2),
    height: theme.spacing(2),
  },
  userAvatar: {
    width: theme.spacing(3),
    height: theme.spacing(3),
    color: 'white !important',
    fontSize: theme.spacing(1.5),
  },
  zeroStateAvatar: {
    width: `calc(${theme.spacing(3)} - 2px)`,
    height: `calc(${theme.spacing(3)} - 2px)`,
    background: 'rgba(0,0,0,0) !important',
    fontSize: theme.spacing(1.5),
    border: '2px dashed rgb(140, 136, 125) !important',
    '&:hover': {
      backgroundColor: `${juralioColours.taskCell.assignee.hover} !important`,
    },
  },
  additionalUsers: {
    background: `${juralioColours.named.beige.main}`,
    width: theme.spacing(3),
    height: theme.spacing(3),
    color: juralioColours.darkText.secondary,
    border: 'solid 2px white',
    fontSize: theme.spacing(1.5),
  },

  autoAvatarMedium: {
    width: theme.spacing(3),
    height: theme.spacing(3),
    backgroundSize: `${theme.spacing(3)} ${theme.spacing(3)}`,
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
  },
  initials: {
    color: rawColours.text.black,
  },
  initialsCompact: {
    fontSize: theme.spacing(2),
  },
  initialsMedium: {
    fontSize: theme.spacing(3),
  },
  initialsLarge: {
    fontSize: theme.spacing(3),
  },
  initialsExtraLarge: {
    fontSize: theme.spacing(5),
  },
}))

const ZeroAssignees = props => {
  const { classes } = props
  return (
    <Avatar
      key="zero-state-avatar"
      data-test="task-cell-zero-assignee-chip"
      className={classes.zeroStateAvatar}
    >
      {props.viewOnly ? (
        <PersonAddDisabledIcon
          className={classes.zeroAssigneeIcons}
          style={{
            color: juralioColours.named.black[200],
            margin: 'auto',
            width: '16px',
            height: '16px',
          }}
        />
      ) : (
        <PersonAddIcon
          className={classes.zeroAssigneeIcons}
          style={{
            color: juralioColours.named.black[200],
            margin: 'auto',
            width: '16px',
            height: '16px',
          }}
        />
      )}
    </Avatar>
  )
}

const TaskCellAssigneeChip = props => {
  const dispatch = useDispatch()

  const { classes } = styles()

  let sortedAssignees = props.assignees || []
  if (sortedAssignees.length > 0) {
    sortedAssignees
      .sort((a, b) => compareNumbers(a.id, b.id))
      .sort((a, b) => compareStrings(a.firstname, b.firstname))
      .sort((a, b) => compareStrings(a.lastname, b.lastname))
  }
  const getAvatar = (user, index) => {
    if (!user.isPlaceholder) {
      return (
        <Avatar
          key={'user-avatar-' + index}
          data-test="task-cell-assignee-avatar"
          id={`task-cell-assignee-avatar-${props.task.id}`}
          className={classNames([classes.userAvatar])}
          style={JuralioAvatarColours[user.avatarColorIndex]}
        >
          <div
            className={classNames(classes.autoAvatar, classes.autoAvatarMedium)}
            style={{
              backgroundImage: `url(${avatarImages[user.avatarImageIndex]})`,
            }}
            data-test={`${user.firstname}-${user.lastname}`}
          >
            {user.avatarImageIndex !== -1 ? ' ' : ''}
            {user.avatarImageIndex === -1 && (
              <Typography className={classes.initials}>
                {avatarInitials(user)}
              </Typography>
            )}
          </div>
        </Avatar>
      )
    } else {
      return (
        <Avatar
          className={classNames([classes.userAvatar])}
          data-test="placeholder-avatar"
        >
          <Typography variant="caption" className={classes.initials}>
            {avatarInitials(user)}
          </Typography>
        </Avatar>
      )
    }
  }

  const getTitle = viewOnly => {
    return (
      <TaskMapAssigneeToolTip
        teamMembers={props.task.teamMembers}
        viewOnly={viewOnly}
        task={props.task}
      />
    )
  }

  return (
    <div className="assignee-chip">
      <Tooltip title={getTitle(props.viewOnly)}>
        <AvatarGroup
          max={2}
          classes={{ avatar: classes.additionalUsers }}
          data-test={`task-cell-assignee-chip`}
          style={{ marginRight: '8px' }}
          spacing={5}
          onClick={e => {
            e.stopPropagation()
            if (
              (isInImprovedTaskmapContext() ||
                isInRoadmapContext() ||
                isInTasklistContext()) &&
              !props.viewOnly
            ) {
              let cell
              let left = 0
              let top = 0
              if (isInImprovedTaskmapContext()) {
                cell = document.getElementById(
                  `structure-item-${props.task.id}`
                )
                if (cell) {
                  let bounds = cell.getBoundingClientRect()

                  left =
                    bounds.x +
                    document.getElementById('improved-taskmap-wrapper')
                      .scrollLeft
                  top =
                    bounds.top -
                    117 +
                    +document.getElementById('improved-taskmap-wrapper')
                      .scrollTop
                }
              } else if (isInTasklistContext()) {
                cell = document.getElementById(
                  `list-item-${props.task.id}-team-chip`
                )
                let bounds = cell.getBoundingClientRect()
                left = bounds.x
                top = bounds.top - 117
              } else if (isInRoadmapContext()) {
                cell = document.getElementById(`${props.task.id}`)
                if (cell) {
                  let bounds = cell.getBoundingClientRect()
                  left = bounds.left
                  top = bounds.top
                }
              }
              if (
                props.task.teamMembers &&
                props.task.teamMembers.length > 0 &&
                !isInTasklistContext()
              ) {
                dispatch(
                  showTaskPreview(props.task, { left: left, top: top }, false)
                )
                dispatch(openPreview(props.task.id))
              } else {
                dispatch(
                  showTaskmapTaskAssigneeContainer({
                    task: props.task,
                    position: { left: left - 10, top: top + 31 },
                  })
                )
              }
            }
          }}
        >
          {sortedAssignees.filter(a => a !== null).length === 0 && (
            <ZeroAssignees classes={classes} viewOnly={props.viewOnly} />
          )}
          {sortedAssignees
            .filter(a => a !== null && a.enabled)
            .sort((a, b) => a.id - b.id)
            .map((user, i) => getAvatar(user, i))}
        </AvatarGroup>
      </Tooltip>
    </div>
  )
}

export default TaskCellAssigneeChip
