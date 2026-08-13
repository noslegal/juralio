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

import Typography from '@mui/material/Typography'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { makeStyles } from 'tss-react/mui'
import { useUserDetailsData } from '../../../../hooks/user-hooks'
import { getMilestoneOrTaskString } from '../../../../services/helpers/task/task-util-helper'
import {
  followTask,
  unfollowTask,
} from '../../../task-map/selected-task/selected-task-actions'
import { isUserInList } from '../../task-card-content/Helpers/team-follower-helper'
import FollowButton from '../../task-card-content/TaskFollowers/FollowButton'

const useStyles = makeStyles()(theme => ({
  root: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    marginLeft: theme.spacing(4.5),
  },
}))

const FollowButtonContainer = props => {
  const { task, projectId, matterId } = props
  const { t } = useTranslation()
  const { classes } = useStyles()
  const dispatch = useDispatch()
  const userData = useUserDetailsData()
  const type = getMilestoneOrTaskString(props.isMilestone, t)

  const isCurrentUserFollower = task.isFollower
  const isCurrentUserTeamMember = isUserInList(task.teamMembers, userData.id)
  const isMilestone = task.isMilestone

  return (
    <div className={classes.root}>
      {isCurrentUserFollower && (
        <Typography variant="caption">
          {t('taskCardContent.following.caption', { type: type })}
        </Typography>
      )}
      <FollowButton
        task={props.task}
        followClickHandler={() => {
          dispatch(followTask(matterId, projectId, task.id))
        }}
        unfollowClickHandler={() =>
          dispatch(unfollowTask(matterId, projectId, task.id, userData.id))
        }
        isCurrentUserFollower={isCurrentUserFollower}
        isCurrentUserTeamMember={isCurrentUserTeamMember}
        isMilestone={isMilestone}
        viewOnly={props.viewOnly}
      />
    </div>
  )
}

export default FollowButtonContainer
