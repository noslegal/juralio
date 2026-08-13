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
import i18n from 'i18next'
import { getProjectRedirectSnackbarAction } from '../../../../services/redirect/ProjectRedirectSnackbarAction'
import taskService from '../../../../services/task/task-service'
import { showSnackbar } from '../../../global-snackbar/global-snackbar-actions'

export const GET_ARCHIVED_TASK_SUCCESS = 'GET_ARCHIVED_TASK_SUCCESS'
export const RECEIVE_UNARCHIVE_TASK_SUCCESS = 'RECEIVE_UNARCHIVE_TASK_SUCCESS'
export const RECEIVE_UNARCHIVE_TASK_FAILURE = 'RECEIVE_UNARCHIVE_TASK_FAILURE'
export const CLEAR_UNARCHIVE_TASK_STATUS = 'CLEAR_UNARCHIVE_TASK_STATUS'
export const RESET_ARCHIVED_TASKS_STATUS = 'RESET_ARCHIVED_TASKS_STATUS'
export const UNARCHIVE_TASK_KNOCK_ON_EFFECTS = 'UNARCHIVE_TASK_KNOCK_ON_EFFECTS'
export const CLEAR_KNOCK_ON_EFFECTS = 'CLEAR_KNOCK_ON_EFFECTS'
const creators = {
  completeGetArchivedTasks(payload) {
    return {
      type: GET_ARCHIVED_TASK_SUCCESS,
      archiveTask: payload,
    }
  },
  receiveUnarchiveSuccess() {
    return {
      type: RECEIVE_UNARCHIVE_TASK_SUCCESS,
    }
  },
  receiveUnarchiveFailure(payload) {
    return {
      type: RECEIVE_UNARCHIVE_TASK_FAILURE,
      error: payload,
    }
  },
  clearUnarchiveStatus() {
    return {
      type: CLEAR_UNARCHIVE_TASK_STATUS,
    }
  },
  resetArchivedTasksStatus() {
    return {
      type: RESET_ARCHIVED_TASKS_STATUS,
    }
  },
  recieveKnockOnEffect(payload) {
    return {
      type: UNARCHIVE_TASK_KNOCK_ON_EFFECTS,
      knockOnEffects: payload,
    }
  },
  clearKnockOnEffects() {
    return {
      type: CLEAR_KNOCK_ON_EFFECTS,
    }
  },
}

export const getArchivedTasks = matterId => dispatch => {
  return taskService.getArchivedTasks(matterId).then(response => {
    if (response.status === StatusCodes.OK) {
      return dispatch(creators.completeGetArchivedTasks(response.body))
    }
  })
}

export const clearFormValidation = () => dispatch => {
  return dispatch(creators.clearUnarchiveStatus())
}

export const resetArchivedTasksStatus = () => dispatch => {
  return dispatch(creators.resetArchivedTasksStatus())
}

export const clearKnockOnEffects = () => dispatch => {
  return dispatch(creators.clearKnockOnEffects())
}

export const unarchiveTask =
  (
    matterId,
    projectId,
    taskId,
    destinationProjectId,
    destinationParentId,
    destinationType,
    redirectToMatterId,
    redirectToProjectId,
    redirectToTaskId,
    maintainTaskConsistency = false
  ) =>
  dispatch => {
    return taskService
      .unarchiveTask(
        matterId,
        projectId,
        taskId,
        destinationProjectId,
        destinationParentId,
        destinationType,
        maintainTaskConsistency
      )
      .then(response => {
        if (response.status === StatusCodes.CONFLICT) {
          return dispatch(creators.recieveKnockOnEffect(response.body))
        } else if (response.status === StatusCodes.OK) {
          dispatch(creators.receiveUnarchiveSuccess())
          return dispatch(
            showSnackbar(
              i18n.t('unarchiveActions.taskUnarchived'),
              getProjectRedirectSnackbarAction(
                redirectToMatterId,
                redirectToProjectId,
                redirectToTaskId
              )
            )
          )
        } else {
          return dispatch(creators.receiveUnarchiveFailure(response.body.text))
        }
      })
  }
