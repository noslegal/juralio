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
import postService from '../../../../services/post/post-service'
import projectService from '../../../../services/project/project-service'
import { getTaskDetailsRedirectSnackbarAction } from '../../../../services/redirect/TaskDetailsRedirectSnackbarAction'
import taskService from '../../../../services/task/task-service'
import { showSnackbar } from '../../../global-snackbar/global-snackbar-actions'
import { setInitialContentItemSelection } from '../../../task-details/task-card-content/task-notes/task-posts-actions'

export const postArchiveActionTypes = {
  GET_ARCHIVED_POSTS: 'GET_ARCHIVED_POSTS',
  RECEIVE_ARCHIVED_POSTS_SUCCESS: 'RECEIVE_ARCHIVED_POSTS_SUCCESS',
  RESET_ARCHIVED_POSTS: 'RESET_ARCHIVED_POSTS',
  SHOW_RESTORE_POST_DIALOG: 'SHOW_RESTORE_POST_DIALOG',
  HIDE_RESTORE_POST_DIALOG: 'HIDE_RESTORE_POST_DIALOG',
  GET_TARGET_TASK: 'GET_TARGET_TASK',
  RECEIVE_TARGET_TASK_SUCCESS: 'RECEIVE_TARGET_TASK_SUCCESS',
  RESTORED_POST_SUCCESS: 'RESTORED_POST_SUCCESS',
}

const _getArchived = () => {
  return {
    type: postArchiveActionTypes.GET_ARCHIVED_POSTS,
  }
}

const _getTargetTask = targetDetails => {
  return {
    type: postArchiveActionTypes.GET_TARGET_TASK,
    targetDetails: targetDetails,
  }
}

const _resetArchivedPosts = () => {
  return {
    type: postArchiveActionTypes.RESET_ARCHIVED_POSTS,
  }
}

const _showRestorePostDialog = post => {
  return { type: postArchiveActionTypes.SHOW_RESTORE_POST_DIALOG, post: post }
}

const _hideRestorePostDialog = () => {
  return { type: postArchiveActionTypes.HIDE_RESTORE_POST_DIALOG }
}

const _receiveTargetTask = (task, project) => {
  return {
    type: postArchiveActionTypes.RECEIVE_TARGET_TASK_SUCCESS,
    task: task,
    project: project,
  }
}

const _restorePostSuccess = postId => {
  return { type: postArchiveActionTypes.RESTORED_POST_SUCCESS, postId }
}

const _receiveArchivedPostsHandler = payload => {
  return {
    type: postArchiveActionTypes.RECEIVE_ARCHIVED_POSTS_SUCCESS,
    archivedPosts: payload,
  }
}

export const getArchivedPosts = matterId => dispatch => {
  dispatch(_getArchived())
  return postService.getArchivedPosts(matterId).then(response => {
    if (response.status === StatusCodes.OK) {
      return dispatch(_receiveArchivedPostsHandler(response.body))
    }
  })
}

export const showRestorePostDialog = post => dispatch => {
  dispatch(_showRestorePostDialog(post))
}

export const hideRestorePostDialog = post => dispatch => {
  dispatch(_hideRestorePostDialog())
}

export const resetArchivedPosts = () => dispatch =>
  dispatch(_resetArchivedPosts())

export const restorePost = (post, targetDetails) => dispatch => {
  if (!targetDetails) {
    targetDetails = {
      matterId: post.matterWhenArchivedId,
      projectId: post.projectWhenArchivedId,
      taskId: post.taskWhenArchivedId,
      type: 'prevLocation',
    }
  }
  return postService.restorePost(post.id, targetDetails).then(response => {
    dispatch(_hideRestorePostDialog())
    dispatch(_restorePostSuccess(post.id))
    return dispatch(
      showSnackbar(
        i18n.t('postArchive.postUnarchived'),
        getTaskDetailsRedirectSnackbarAction(
          targetDetails.matterId,
          targetDetails.projectId,
          targetDetails.taskId,
          () => {
            dispatch(setInitialContentItemSelection(post.id))
          }
        )
      )
    )
  })
}

export const getTargetTask = targetDetails => dispatch => {
  dispatch(_getTargetTask(targetDetails))
  let task
  return taskService
    .getTaskById(
      targetDetails.matterId,
      targetDetails.projectId,
      targetDetails.taskId
    )
    .then(response => {
      if (response.status === StatusCodes.OK) {
        task = response.body

        return projectService
          .getProject(targetDetails.matterId, targetDetails.projectId)
          .then(response => {
            dispatch(_receiveTargetTask(task, response.body))
          })
      } else {
        dispatch(_receiveTargetTask({ invalidTarget: true }))
      }
    })
}
