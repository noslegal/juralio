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
import {
  getTaskDetailsUrl,
  getWorkstreamTaskPostUrl,
} from '../../../../components/navigation/common/location-context-helper'
import { sortObjectArrayByDateField } from '../../../../services/helpers/date-helper'
import { isInSpecificTaskContext } from '../../../../services/helpers/route/route-context-helper'
import postService from '../../../../services/post/post-service'
import { API_ERROR_CODE } from '../../../constants'
import { showSnackbar } from '../../../global-snackbar/global-snackbar-actions'

export const REQUEST_TASK_POSTS = 'REQUEST_TASK_POSTS'
export const RECEIVE_TASK_POST_SUCCESS = 'RECEIVE_TASK_POST_SUCCESS'

export const REQUEST_POST_DETAILS = 'REQUEST_POST_DETAILS'
export const RECEIVE_POST_DETAILS_SUCCESS = 'RECEIVE_POST_DETAILS_SUCCESS'
export const RECEIVE_POST_DETAILS_FAIL = 'RECEIVE_POST_DETAILS_FAIL'

export const REQUEST_UPDATE_POST = 'REQUEST_UPDATE_POST'
export const UPDATE_POST_SUCCESS = 'UPDATE_POST_SUCCESS'

export const UPDATE_POST_SUCCESS_DONT_SET_POST =
  'UPDATE_POST_SUCCESS_DONT_SET_POST'

export const REQUEST_CREATE_POST = 'REQUEST_CREATE_POST'
export const CREATE_POST_IN_CONTEXT_SUCCESS = 'CREATE_POST_IN_CONTEXT_SUCCESS'
export const CREATE_POST_OUT_OF_CONTEXT_SUCCESS =
  'CREATE_POST_OUT_OF_CONTEXT_SUCCESS'

export const SELECT_ITEM_IN_LIST = 'SELECT_ITEM_IN_LIST'

export const SET_INITIAL_SELECTED_CONTENT_ITEM =
  'SET_INITIAL_SELECTED_CONTENT_ITEM'

export const CLEAR_INITIAL_SELECTED_CONTENT_ITEM =
  'CLEAR_INITIAL_SELECTED_CONTENT_ITEM'

export const CLEAR_SELECTED_ITEM = 'CLEAR_SELECTED_ITEM'

export const TASK_POSTS_RESET_STATE = 'TASK_POSTS_RESET_STATE'

export const CLEAR_NEW_CREATED = 'CLEAR_NEW_CREATED'

export const RESET_INITIAL_EDIT = 'RESET_INITIAL_EDIT'

export const ARCHIVE_POST_SUCCESS = 'REMOVE_POST_SUCCESS'

export const AUTO_SELECT_NEW_CREATED = 'AUTO_SELECT_NEW_CREATED'

export const UPDATE_POST_TEXT = 'UPDATE_POST_TEXT'

export const TOGGLE_EDIT_MODE = 'TOGGLE_EDIT_MODE'

export const CLEAR_SAVE_META = 'CLEAR_SAVE_META'

function requestTaskPosts(taskId) {
  return {
    type: REQUEST_TASK_POSTS,
    taskId,
  }
}

function receiveTaskPostSuccess(payload, taskId) {
  return {
    type: RECEIVE_TASK_POST_SUCCESS,
    posts: payload,
    taskId: taskId,
  }
}

function requestPostDetails(postId) {
  return {
    type: REQUEST_POST_DETAILS,
    postId,
  }
}

function receivePostDetailsSuccess(payload) {
  return {
    type: RECEIVE_POST_DETAILS_SUCCESS,
    post: payload,
  }
}

function receivePostDetailsFail() {
  return {
    type: RECEIVE_POST_DETAILS_FAIL,
  }
}

function requestUpdatePost(postId, isAutoSaving) {
  return {
    type: REQUEST_UPDATE_POST,
    postId,
    isAutoSaving,
  }
}

function updatePostSuccess(payload) {
  return {
    type: UPDATE_POST_SUCCESS,
    updatedPost: payload,
  }
}

function updatePostSuccessDontSetPost(payload) {
  return {
    type: UPDATE_POST_SUCCESS_DONT_SET_POST,
    updatedPost: payload,
  }
}

function requestCreatePost() {
  return {
    type: REQUEST_CREATE_POST,
  }
}

function createPostInContextSuccess(payload) {
  return {
    type: CREATE_POST_IN_CONTEXT_SUCCESS,
    createdPost: payload,
  }
}

function createPostOutOfContextSuccess(payload) {
  return {
    type: CREATE_POST_OUT_OF_CONTEXT_SUCCESS,
    createdPost: payload,
  }
}

function setInitialSelectedContentItem(itemId) {
  return {
    type: SET_INITIAL_SELECTED_CONTENT_ITEM,
    itemId: itemId,
  }
}

function clearInitialSelectedContentItem() {
  return { type: CLEAR_INITIAL_SELECTED_CONTENT_ITEM }
}

function selectItemInList(itemId) {
  return {
    type: SELECT_ITEM_IN_LIST,
    selectedItemId: itemId,
  }
}

function clearSelectedContentItem() {
  return {
    type: CLEAR_SELECTED_ITEM,
  }
}

function resetState() {
  return {
    type: TASK_POSTS_RESET_STATE,
  }
}

function clearNewCreated() {
  return {
    type: CLEAR_NEW_CREATED,
  }
}

function resetInitialEdit() {
  return {
    type: RESET_INITIAL_EDIT,
  }
}

function archivePostSuccess(postId) {
  return {
    type: ARCHIVE_POST_SUCCESS,
    postId,
  }
}

function _setAutoSelectNewCreated() {
  return {
    type: AUTO_SELECT_NEW_CREATED,
  }
}

function savePostTextToState(payload) {
  return {
    type: UPDATE_POST_TEXT,
    updatedPost: payload,
  }
}

function toggleEditModeState(payload) {
  return {
    type: TOGGLE_EDIT_MODE,
    editMode: payload,
  }
}

function clearSaveMetadataState() {
  return {
    type: CLEAR_SAVE_META,
  }
}

export const archivePost =
  (matterId, projectId, taskId, postId) => dispatch => {
    return postService
      .archivePost(matterId, projectId, taskId, postId)
      .then(() => {
        dispatch(archivePostSuccess(postId))
        dispatch(showSnackbar(i18n.t('entity.messages.successfullyArchived')))
      })
  }

export const reset = () => dispatch => dispatch(resetState())

export const setInitialContentItemSelection = itemId => dispatch =>
  dispatch(setInitialSelectedContentItem(itemId))
export const clearInitialContentItemSelection = () => dispatch =>
  dispatch(clearInitialSelectedContentItem())

export const selectItem =
  (history, matterId, projectId, taskId, postId) => dispatch => {
    dispatch(selectItemInList('' + postId))
    if (history) {
      const url = getWorkstreamTaskPostUrl(matterId, projectId, taskId, postId)
      if (history.location.pathname !== url) {
        history.navigate(url)
      }
    }
  }

export const clearItemSelection =
  (history, matterId, projectId, taskId) => dispatch => {
    dispatch(clearSelectedContentItem())
    if (history) {
      const url = getTaskDetailsUrl(matterId, projectId, taskId)
      if (history.location.pathname !== url) {
        history(url)
      }
    }
  }

export const resetNewCreated = () => dispatch => dispatch(clearNewCreated())

export const resetDetailsInitialEdit = () => dispatch =>
  dispatch(resetInitialEdit())

export const fetchTaskPosts = (matterId, projectId, taskId) => dispatch => {
  if (!matterId || !projectId || !taskId) return

  dispatch(requestTaskPosts(taskId))
  return postService
    .getPostsByTaskId(matterId, projectId, taskId, true)
    .then(response =>
      dispatch(
        receiveTaskPostSuccess(
          sortObjectArrayByDateField(response.body, 'dateCreated', true),
          taskId
        )
      )
    )
}

export const fetchPostDetails =
  (matterId, projectId, taskId, postId) => dispatch => {
    dispatch(requestPostDetails(postId))
    return postService
      .getPost(matterId, projectId, taskId, postId)
      .then(response => {
        if (response.status === StatusCodes.OK) {
          return dispatch(receivePostDetailsSuccess(response.body))
        }
        return dispatch(receivePostDetailsFail())
      })
  }

export const updatePostButDontFetch =
  (matterId, projectId, taskId, postId, properties, isAutoSaving) =>
  dispatch => {
    dispatch(requestUpdatePost(postId, isAutoSaving))
    return postService
      .updatePost(matterId, projectId, taskId, postId, properties)
      .then(response => {
        if (response.status === StatusCodes.OK) {
          return dispatch(updatePostSuccessDontSetPost(response.body))
        }
      })
  }

export const updatePost =
  (matterId, projectId, taskId, postId, properties, isAutoSaving) =>
  dispatch => {
    dispatch(requestUpdatePost(postId, isAutoSaving))
    return postService
      .updatePost(matterId, projectId, taskId, postId, properties)
      .then(response => {
        if (response.status === StatusCodes.OK) {
          return dispatch(updatePostSuccess(response.body))
        } else if (
          response.body &&
          response.body.errors &&
          response.body.errors.length > 0 &&
          response.body.errors[0] &&
          response.body.errors[0]?.message ===
            API_ERROR_CODE.POST_CONTENT_TOO_LONG.toString()
        ) {
          dispatch(showSnackbar(i18n.t('postDetails.errors')))
        }
      })
  }

export const createPost =
  (matterId, projectId, taskId, name, privatePost, type, url) => dispatch => {
    dispatch(requestCreatePost())
    return postService
      .createPost(matterId, projectId, taskId, name, privatePost, type, url)
      .then(response => {
        const entityType = response.body.type
          ? response.body.type
          : i18n.t('entity.note')
        const feedbackMessage = i18n.t('entity.messages.successfullyCreated', {
          type: entityType,
        })
        dispatch(showSnackbar(feedbackMessage))
        if (isInSpecificTaskContext(taskId)) {
          dispatch(_setAutoSelectNewCreated())
          return dispatch(createPostInContextSuccess(response.body))
        }

        return dispatch(createPostOutOfContextSuccess(response.body))
      })
  }

export const savePost = newPostText => dispatch => {
  return dispatch(savePostTextToState(newPostText))
}

export const toggleEditMode = editMode => dispatch => {
  return dispatch(toggleEditModeState(editMode))
}

export const clearSaveMetadata = () => dispatch => {
  return dispatch(clearSaveMetadataState())
}
