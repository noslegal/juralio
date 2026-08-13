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

import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { makeStyles } from 'tss-react/mui'
import UserSearch from '../../../../components/inputs/user-search/UserSearch'
import { useUserDetailsData } from '../../../../hooks/user-hooks'
import {
  addIsActiveOnWorkstream,
  sortMatterViewersLast,
} from '../../../../services/helpers/user/user-helper'
import { checkIfPrivateWorkstreamMember } from '../../../../services/helpers/user/user-roles-helper'
import {
  fetchTaskDetails,
  unfollowTask,
} from '../../../task-map/selected-task/selected-task-actions'
import {
  addTaskTeamMember,
  deleteTaskTeamMember,
} from '../../../task-map/selected-task/selected-task-team-actions'
import placeholderService from '../../../../services/placeholders/placeholder-service'
import { Typography } from '@mui/material'
import { PeopleIcon } from '../../../../theme/navigation/CommonIcons'
import { t } from 'i18next'

const useStyles = makeStyles()(theme => ({
  root: {
    marginTop: theme.spacing(3),
  },
  viewOnly: {
    display: 'flex',
    marginTop: theme.spacing(2),
    marginBottom: '-18px',
  },
  peopleIcon: {
    marginRight: theme.spacing(1),
  },
}))

const TaskTeamMembersContainer = props => {
  const team = useSelector(state => state.matterTeam.mainPage.team)
  const selectedTask = useSelector(state => state.selectedTask)
  const [placeholders, setPlaceholders] = useState()

  team.map(t => {
    let sttm = selectedTask.teamMembers.filter(x => x.id === t.user.id)
    if (sttm.length > 0) {
      t.user.isOnAllSubtasks = sttm[0].isOnAllSubtasks
      t.user.isOnSomeSubtasks = sttm[0].isOnSomeSubtasks
    }
  })

  useEffect(() => {
    getPlaceholders()
  }, []) //eslint-disable-line

  const getPlaceholders = () => {
    placeholderService
      .getPlaceholders(selectedTask.matterId.toString())
      .then(res => {
        setPlaceholders(res.body)
      })
  }

  const workstream = useSelector(state => state.project)
  const dispatch = useDispatch()
  const userDetailsData = useUserDetailsData()
  const { classes } = useStyles()

  const addTeamMember = user => {
    if (user.isPlaceholder) {
      user.user.isPlaceholder = user.isPlaceholder
    }
    if (selectedTask.followers.map(f => f.id).includes(user.user.id)) {
      dispatch(
        unfollowTask(
          selectedTask.matterId,
          selectedTask.projectId,
          selectedTask.id,
          user.user.id
        )
      ).then(() => {
        dispatch(
          addTaskTeamMember(
            selectedTask.matterId,
            selectedTask.projectId,
            selectedTask.id,
            user.user,
            false,
            selectedTask?.tasks?.length > 0
          )
        )
      })
    } else {
      dispatch(
        addTaskTeamMember(
          selectedTask.matterId,
          selectedTask.projectId,
          selectedTask.id,
          user.user,
          false,
          selectedTask?.tasks?.length > 0
        )
      )
    }
  }

  const followerId = selectedTask.isFollower ? userDetailsData.id : 0

  const handleRemoveUser = (user, tree = false) => {
    dispatch(
      deleteTaskTeamMember(
        selectedTask.matterId,
        selectedTask.projectId,
        selectedTask.id,
        user,
        tree
      )
    )
  }
  const addToAllSubtasks = user => {
    dispatch(
      addTaskTeamMember(
        selectedTask.matterId,
        selectedTask.projectId,
        selectedTask.id,
        user,
        true
      )
    ).then(() => {
      dispatch(
        fetchTaskDetails(
          selectedTask.matterId,
          selectedTask.projectId,
          selectedTask.id
        )
      )
    })
  }

  if (props.isReadOnly && selectedTask.teamMembers.length === 0) {
    return (
      <div className={classes.viewOnly}>
        <PeopleIcon className={classes.peopleIcon}></PeopleIcon>
        <Typography
          style={{ marginTop: '8px', marginBottom: '8px' }}
          variant="caption"
        >
          {t('taskCardContent.teammembersViewOnly')}
        </Typography>
      </div>
    )
  }

  return (
    <div className={classes.root}>
      <UserSearch
        currentTeam={sortMatterViewersLast(
          addIsActiveOnWorkstream(selectedTask.teamMembers, workstream)
        )}
        availableUsers={team.filter(
          t =>
            !selectedTask.teamMembers?.map(u => u.id).includes(t.user.id) &&
            t.user.enabled &&
            (t.teamMemberId !== 0 || t.matterViewerId > 0 || t.isPlaceholder) &&
            t.user.id !== followerId &&
            checkIfPrivateWorkstreamMember(workstream, t.user)
        )}
        onSelect={addTeamMember}
        matterId={selectedTask.matterId}
        projectId={selectedTask.projectId}
        taskId={selectedTask.id}
        isReadOnly={props.isReadOnly}
        status={selectedTask.status}
        handleRemoveUser={handleRemoveUser}
        task={selectedTask}
        viewOnly={props.viewOnly}
        hideItemRole={true}
        addToAllSubtasks={addToAllSubtasks}
        isInPrivateWS={false}
        team={[]}
        showIcon={true}
        showAvatarList={true}
      />
    </div>
  )
}

export default TaskTeamMembersContainer
