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
import taskService from '../../../services/task/task-service'
import { CONFIG } from '../../constants'
import { showSnackbar } from '../../global-snackbar/global-snackbar-actions'
import {
  fetchProjectWithHierarchy,
  fetchProjectWithPostsAndTaskTeam,
} from '../../project/project-actions'
import { receiveTaskSuccess } from './selected-task-actions'

export const ARCHIVE_TASK = 'ARCHIVE_TASK'
export const ARCHIVE_TASK_SUCCESS = 'ARCHIVE_TASK_SUCCESS'
export const COPY_TASK = 'COPY_TASK'
export const COPY_TASK_SUCCESS = 'COPY_TASK_SUCCESS'

export const MOVE_TASK = 'MOVE_TASK'

export const SELECTED_TASK_RESET_STATE = 'SELECTED_TASK_RESET_STATE'

export const MOVE_TASK_FAILURE = 'MOVE_TASK_FAILURE'
export const CLEAR_MOVE_TASK_ERROR = 'CLEAR_MOVE_TASK_ERROR'
export const MOVE_TASK_KNOCK_ON_EFFECTS = 'MOVE_TASK_KNOCK_ON_EFFECTS'

const creators = {
  requestArchiveTask() {
    return {
      type: ARCHIVE_TASK,
    }
  },

  receiveArchiveTaskSuccess() {
    return {
      type: ARCHIVE_TASK_SUCCESS,
    }
  },

  requestMoveTask() {
    return {
      type: MOVE_TASK,
    }
  },

  receiveMoveTaskFailure(payload) {
    return {
      type: MOVE_TASK_FAILURE,
      error: payload,
    }
  },

  clearMoveTaskError() {
    return {
      type: CLEAR_MOVE_TASK_ERROR,
    }
  },

  requestCopyTask() {
    return {
      type: COPY_TASK,
    }
  },

  receiveCopyTaskSuccess(payload) {
    return {
      type: COPY_TASK_SUCCESS,
      task: payload,
    }
  },

  resetState() {
    return {
      type: SELECTED_TASK_RESET_STATE,
    }
  },
  recieveKnockOnEffect(payload) {
    return {
      type: MOVE_TASK_KNOCK_ON_EFFECTS,
      knockOnEffects: payload,
    }
  },
}

export const clearMoveTaskError = () => dispatch => {
  return dispatch(creators.clearMoveTaskError())
}

export const moveTask =
  (
    matterId,
    projectId,
    taskId,
    destinationType,
    destinationProjectId,
    destinationParentId,
    previousStatus,
    updateWithMovedTask,
    force = false,
    shouldShowSnackbar = true
  ) =>
  dispatch => {
    dispatch(creators.requestMoveTask())
    return taskService
      .moveTask(
        matterId,
        projectId,
        taskId,
        destinationType,
        destinationProjectId,
        destinationParentId,
        force
      )
      .then(response => {
        if (response.status === StatusCodes.CONFLICT) {
          return dispatch(creators.recieveKnockOnEffect(response.body))
        } else if (response.status === StatusCodes.OK) {
          let lastDispatch

          dispatch(fetchProjectWithPostsAndTaskTeam(matterId, projectId))

          if (projectId !== response.body.projectId) {
            if (shouldShowSnackbar)
              lastDispatch = dispatch(
                showSnackbar('Task moved. Any relevant dates have been updated')
              )
          }

          if (updateWithMovedTask) {
            lastDispatch = dispatch(receiveTaskSuccess(response.body))
          }

          return lastDispatch
        } else {
          return dispatch(creators.receiveMoveTaskFailure(response.body.text))
        }
      })
  }

export const archiveTask = (matterId, projectId, taskId) => dispatch => {
  dispatch(creators.requestArchiveTask())
  return taskService.archiveTask(matterId, projectId, taskId).then(response => {
    if (response.status === StatusCodes.OK) {
      dispatch(fetchProjectWithHierarchy(matterId, projectId))
      return dispatch(creators.receiveArchiveTaskSuccess())
    }
  })
}

export const denyTaskCopy = () => dispatch => {
  return dispatch(
    showSnackbar(
      `This task cannot be copied because its parent already has ${CONFIG.SUBTASK_LIMIT} subtasks`
    )
  )
}

export const denyALevelTaskCopy = () => dispatch => {
  return dispatch(
    showSnackbar(
      `This task cannot be copied because there are already ${CONFIG.LEVEL_A_TASK_LIMIT} level A tasks`
    )
  )
}

export const copyTask = (matterId, projectId, taskId, name) => dispatch => {
  dispatch(creators.requestCopyTask())
  return taskService
    .copyTask(matterId, projectId, taskId, name)
    .then(response => {
      if (response.status === StatusCodes.CREATED) {
        dispatch(fetchProjectWithHierarchy(matterId, projectId))

        dispatch(showSnackbar(i18n.t('copyTaskDialog.taskCopied')))

        return dispatch(creators.receiveCopyTaskSuccess(response.body))
      } else if (response.body.error_type === 'TASK_LIMIT') {
        return dispatch(showSnackbar(response.body.message))
      }
    })
}

export const clearState = () => dispatch => dispatch(creators.resetState())
