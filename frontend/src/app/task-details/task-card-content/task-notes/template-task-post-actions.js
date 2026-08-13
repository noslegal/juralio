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
  getTemplateTaskDetailsUrl,
  getTemplateTaskPostUrl,
} from '../../../../components/navigation/common/location-context-helper'
import { sortObjectArrayByDateField } from '../../../../services/helpers/date-helper'
import { isInSpecificTaskContext } from '../../../../services/helpers/route/route-context-helper'
import templatePostService from '../../../../services/post/template-post-service'
import { showSnackbar } from '../../../global-snackbar/global-snackbar-actions'

export const RESET_TEMPLATE_TASK_POST_LIST = 'RESET_TEMPLATE_TASK_POST_LIST'
export const REQUEST_TEMPLATE_TASK_POSTS = 'REQUEST_TEMPLATE_TASK_POSTS'
export const RECEIVE_TEMPLATE_TASK_POST_SUCCESS =
  'RECEIVE_TEMPLATE_TASK_POST_SUCCESS'
export const REQUEST_CREATE_TEMPLATE_POST = 'REQUEST_CREATE_TEMPLATE_POST'
export const CREATE_TEMPLATE_POST_IN_CONTEXT_SUCCESS =
  'CREATE_TEMPLATE_POST_IN_CONTEXT_SUCCESS'
export const CREATE_TEMPLATE_POST_OUT_OF_CONTEXT_SUCCESS =
  'CREATE_TEMPLATE_POST_OUT_OF_CONTEXT_SUCCESS'
export const SELECT_TEMPLATE_ITEM_IN_LIST = 'SELECT_TEMPLATE_ITEM_IN_LIST'
export const CLEAR_SELECTED_ITEM = 'CLEAR_SELECTED_ITEM'
export const REMOVE_TEMPLATE_POST_SUCCESS = 'REMOVE_TEMPLATE_POST_SUCCESS'

export const REQUEST_TEMPLATE_POST_DETAILS = 'REQUEST_TEMPLATE_POST_DETAILS'
export const RECEIVE_TEMPLATE_POST_DETAILS_SUCCESS =
  'RECEIVE_TEMPLATE_POST_DETAILS_SUCCESS'
export const UPDATE_TEMPLATE_POST = 'UPDATE_TEMPLATE_POST'
export const UPDATE_TEMPLATE_POST_SUCCESS = 'UPDATE_TEMPLATE_POST_SUCCESS'

export const UPDATE_POST_TEXT = 'UPDATE_POST_TEXT'

export const TOGGLE_EDIT_MODE = 'TOGGLE_EDIT_MODE'

export const CLEAR_SAVE_META = 'CLEAR_SAVE_META'

export const CLEAR_NEW_CREATED = 'CLEAR_NEW_CREATED'

export const RESET_INITIAL_EDIT = 'RESET_INITIAL_EDIT'

function clearNewCreated() {
  return {
    type: CLEAR_NEW_CREATED,
  }
}

function resetState() {
  return {
    type: RESET_TEMPLATE_TASK_POST_LIST,
  }
}

function resetInitialEdit() {
  return {
    type: RESET_INITIAL_EDIT,
  }
}

function removePostSuccess(postId) {
  return {
    type: REMOVE_TEMPLATE_POST_SUCCESS,
    postId: postId,
  }
}

function requestUpdateTemplatePost(isAutoSaving) {
  return {
    type: UPDATE_TEMPLATE_POST,
    isAutoSaving,
  }
}

function updateTemplatePostSuccess(post) {
  return {
    type: UPDATE_TEMPLATE_POST_SUCCESS,
    post: post,
  }
}

function clearSelectedContentItem() {
  return {
    type: CLEAR_SELECTED_ITEM,
  }
}

function requestTemplateTaskPosts(templateTaskId) {
  return {
    type: REQUEST_TEMPLATE_TASK_POSTS,
    templateTaskId,
  }
}

function receiveTemplateTaskPostSuccess(payload) {
  return {
    type: RECEIVE_TEMPLATE_TASK_POST_SUCCESS,
    posts: payload,
  }
}

function requestCreateTemplatePost() {
  return {
    type: REQUEST_CREATE_TEMPLATE_POST,
  }
}

function createTemplatePostInContextSuccess(payload) {
  return {
    type: CREATE_TEMPLATE_POST_IN_CONTEXT_SUCCESS,
    createdPost: payload,
  }
}

function createTemplatePostOutOfContextSuccess(payload) {
  return {
    type: CREATE_TEMPLATE_POST_OUT_OF_CONTEXT_SUCCESS,
    createdPost: payload,
  }
}

function selectItemInList(itemId) {
  return {
    type: SELECT_TEMPLATE_ITEM_IN_LIST,
    selectedItemId: itemId,
  }
}

function requestTemplatePostDetails(postId) {
  return {
    type: REQUEST_TEMPLATE_POST_DETAILS,
    postId,
  }
}

function receiveTemplatePostDetailsSuccess(payload) {
  return {
    type: RECEIVE_TEMPLATE_POST_DETAILS_SUCCESS,
    post: payload,
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

export const fetchTemplatePostDetails =
  (templateId, templateTaskId, postId) => dispatch => {
    dispatch(requestTemplatePostDetails(postId))
    return templatePostService
      .getTemplatePost(templateId, templateTaskId, postId)
      .then(response =>
        dispatch(receiveTemplatePostDetailsSuccess(response.body))
      )
  }

export const selectItem = (history, templateId, taskId, postId) => dispatch => {
  dispatch(selectItemInList('' + postId))
  if (history) {
    const url = getTemplateTaskPostUrl(templateId, taskId, postId)
    if (history.location.pathname !== url) {
      history.navigate(url)
    }
  }
}

export const clearItemSelection =
  (history, templateId, taskId, location) => dispatch => {
    dispatch(clearSelectedContentItem())
    if (history && location) {
      const url = getTemplateTaskDetailsUrl(templateId, taskId)

      if (location && location.pathname !== url) {
        history(url)
      }
    }
  }

export const resetTemplateTaskPostList = () => dispatch =>
  dispatch(resetState())

export const resetDetailsInitialEdit = () => dispatch =>
  dispatch(resetInitialEdit())

export const resetNewCreated = () => dispatch => dispatch(clearNewCreated())

export const fetchTemplateTaskPosts =
  (templateId, templateTaskId) => dispatch => {
    dispatch(requestTemplateTaskPosts)

    return templatePostService
      .getPostsByTemplateTaskId(templateId, templateTaskId)
      .then(response => {
        if (response.status === StatusCodes.OK) {
          dispatch(
            receiveTemplateTaskPostSuccess(
              sortObjectArrayByDateField(response.body, 'dateCreated', true)
            )
          )
        }
      })
  }

export const createTemplatePost =
  (
    templateId,
    templateTaskId,
    name,
    privatePost,
    type,
    url,
    startTime,
    endTime
  ) =>
  dispatch => {
    dispatch(requestCreateTemplatePost())
    return templatePostService
      .createTemplatePost(
        templateId,
        templateTaskId,
        name,
        privatePost,
        type,
        url,
        startTime,
        endTime
      )

      .then(response => {
        const entityType = response.body.type
          ? response.body.type
          : i18n.t('entity.note')
        const feedbackMessage = i18n.t('entity.messages.successfullyCreated', {
          type: entityType,
        })
        dispatch(showSnackbar(feedbackMessage))
        if (isInSpecificTaskContext(templateTaskId)) {
          return dispatch(createTemplatePostInContextSuccess(response.body))
        }

        return dispatch(createTemplatePostOutOfContextSuccess(response.body))
      })
  }

export const deleteTemplatePost =
  (templateId, templateTaskId, templatePostId) => dispatch => {
    return templatePostService
      .deletePost(templateId, templateTaskId, templatePostId)
      .then(() => {
        dispatch(removePostSuccess(templatePostId))
        dispatch(showSnackbar(i18n.t('entity.messages.successfullyDeleted')))
      })
  }

export const updateTemplatePost =
  (templateId, templateTaskId, templatePostId, payload, isAutoSaving) =>
  dispatch => {
    dispatch(requestUpdateTemplatePost(isAutoSaving))
    return templatePostService
      .updateTemplatePost(templateId, templateTaskId, templatePostId, payload)
      .then(response => {
        if (response.status === StatusCodes.OK) {
          return dispatch(updateTemplatePostSuccess(response.body))
        }
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
