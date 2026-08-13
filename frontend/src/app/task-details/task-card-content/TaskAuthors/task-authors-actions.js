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
import taskAuthorService from '../../../../services/task/task-author-service'
import { showSnackbar } from '../../../global-snackbar/global-snackbar-actions'

export const ADD_POST_AUTHOR_SUCCESS = 'ADD_POST_AUTHOR_SUCCESS'
export const DELETE_POST_AUTHOR_SUCCESS = 'DELETE_POST_AUTHOR_SUCCESS'

function addPostAuthorSuccess(payload) {
  return {
    type: ADD_POST_AUTHOR_SUCCESS,
    user: payload,
  }
}

function deletePostAuthorSuccess(payload) {
  return {
    type: DELETE_POST_AUTHOR_SUCCESS,
    user: payload.user,
    removedSelfFromPrivatePost: payload.removedSelfFromPrivatePost,
  }
}

export const addPostAuthor =
  (matterId, projectId, taskId, postId, user) => dispatch => {
    const hasNames = user.firstname || user.lastname
    const requestDetails = {
      firstname: hasNames ? user.firstname : user.username,
      lastname: user.lastname,
    }

    return taskAuthorService
      .addPostAuthor(matterId, projectId, taskId, postId, user)
      .then(response => {
        if (response.status === StatusCodes.OK) {
          dispatch(addPostAuthorSuccess(response.body))
          dispatch(
            showSnackbar(
              i18n.t('taskAuthorActions.addedPostAuthor', requestDetails)
            )
          )
        }
      })
  }

export const deletePostAuthor =
  (matterId, projectId, taskId, postId, user, removedSelfFromPrivatePost) =>
  dispatch => {
    const hasNames = user.firstname || user.lastname
    const requestDetails = {
      firstname: hasNames ? user.firstname : user.username,
      lastname: user.lastname,
    }

    return taskAuthorService
      .deletePostAuthor(matterId, projectId, taskId, postId, user)
      .then(response => {
        if (response.status === StatusCodes.NO_CONTENT) {
          dispatch(
            deletePostAuthorSuccess({ user, removedSelfFromPrivatePost })
          )
          dispatch(
            showSnackbar(
              i18n.t('taskAuthorActions.removedPostAuthor', requestDetails)
            )
          )
        }
      })
  }
