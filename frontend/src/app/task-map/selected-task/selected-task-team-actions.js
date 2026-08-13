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

import { StatusCodes } from 'http-status-codes'
import taskTeamService from '../../../services/task/task-team-service'
import { showSnackbar } from '../../global-snackbar/global-snackbar-actions'
import { Button } from '@mui/material'
import taskService from '../../../services/task/task-service'
import {
  isInImprovedTaskmapContext,
  isInTasklistContext,
} from '../../../services/helpers/route/route-context-helper'
import {
  fetchTaskmapContent,
  replaceTask,
} from '../../../redux/ducks/improved-taskmap'

export const ADD_TASK_TEAM_MEMBER_SUCCESS = 'ADD_TASK_TEAM_MEMBER_SUCCESS'
export const DELETE_TASK_TEAM_MEMBER_SUCCESS = 'DELETE_TASK_TEAM_MEMBER_SUCCESS'

function addTaskTeamMemberSuccess(payload) {
  return {
    type: ADD_TASK_TEAM_MEMBER_SUCCESS,
    user: payload,
  }
}

function deleteTaskTeamMemberSuccess(payload) {
  return {
    type: DELETE_TASK_TEAM_MEMBER_SUCCESS,
    user: payload,
  }
}

export const addTaskTeamMember =
  (matterId, projectId, taskId, user, includeTree = false, hasSubtasks) =>
  dispatch => {
    return taskTeamService
      .addTaskTeamMember(matterId, projectId, taskId, user, includeTree)
      .then(response => {
        if (response.status === StatusCodes.OK) {
          const name =
            user.firstname || user.lastname
              ? `${user.firstname} ${user.lastname}`
              : user.username
          dispatch(addTaskTeamMemberSuccess(response.body))
          dispatch(
            showSnackbar(
              `${name}${user.isExternal ? ' (limited)' : ''} ${
                includeTree
                  ? 'was added to all subtasks'
                  : 'was added to the team'
              }`,
              !includeTree && hasSubtasks ? (
                <Button
                  onClick={() => {
                    taskTeamService
                      .addTaskTeamMember(
                        matterId,
                        projectId,
                        taskId,
                        user,
                        true
                      )
                      .then(res => {
                        if (res.status === StatusCodes.OK) {
                          dispatch(addTaskTeamMemberSuccess(response.body))

                          if (
                            isInImprovedTaskmapContext() ||
                            isInTasklistContext()
                          ) {
                            dispatch(fetchTaskmapContent(matterId, projectId))
                            taskService
                              .getTaskById(matterId, projectId, taskId)
                              .then(response => {
                                if (response.status === 200) {
                                  dispatch(replaceTask(response.body))
                                }
                              })
                          }
                          dispatch(
                            showSnackbar(
                              `${name}${
                                user.isExternal ? ' (limited)' : ''
                              } ${'was added to all subtasks'}`
                            )
                          )
                        }
                      })
                  }}
                >
                  {'add to subtasks'}
                </Button>
              ) : null
            )
          )
        }
      })
  }

export const addTeamMemberToRedux = user => dispatch => {
  const name =
    user.firstname || user.lastname
      ? `${user.firstname} ${user.lastname}`
      : user.username
  dispatch(addTaskTeamMemberSuccess(user))
  dispatch(
    showSnackbar(
      `${name}${user.isExternal ? ' (limited)' : ''} ${'was added to the team'}`
    )
  )
}

export const deleteTaskTeamMember =
  (matterId, projectId, taskId, user, tree = false) =>
  dispatch => {
    return taskTeamService
      .deleteTaskTeamMember(matterId, projectId, taskId, user, tree)
      .then(response => {
        if (response.status === StatusCodes.NO_CONTENT) {
          const name =
            user.firstname || user.lastname
              ? `${user.firstname} ${user.lastname}`
              : user.username
          dispatch(deleteTaskTeamMemberSuccess(user))
          dispatch(
            showSnackbar(
              `${name}${
                user.isExternal ? ' (limited)' : ''
              } was removed from the team${tree ? ' and all subtasks' : ''}`
            )
          )
        }
      })
  }
