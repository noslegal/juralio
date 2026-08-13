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
import { getTypeObject } from '../../app/template/project-creation/action-helper'
import { getTemplateMapRedirectSnackbarAction } from '../../services/redirect/TemplateMapRedirectSnackbarAction'
import templateResouces from '../../services/template/template-resources-service'
import templateService from '../../services/template/template-service'
import { showSnackbar } from '../global-snackbar/global-snackbar-actions'
import { fetchTemplates } from '../template-list/template-list-actions'

export const REQUEST_TEMPLATE = 'REQUEST_TEMPLATE'
export const RECEIVE_TEMPLATE = 'RECEIVE_TEMPLATE'

export const REQUEST_TEMPLATE_OVERVIEW = 'REQUEST_TEMPLATE_OVERVIEW'
export const RECEIVE_TEMPLATE_OVERVIEW = 'RECEIVE_TEMPLATE_OVERVIEW'
export const RESET_TEMPLATE_OVERVIEW = 'RESET_TEMPLATE_OVERVIEW'

export const RECEIVE_TEMPLATE_TASKS = 'RECEIVE_TEMPLATE_TASKS'

export const CREATE_TEMPLATE = 'CREATE_TEMPLATE'
export const CREATE_TEMPLATE_SUCCESS = 'CREATE_TEMPLATE_SUCCESS'
export const CREATE_TEMPLATE_FAILURE = 'CREATE_TEMPLATE_FAILURE'
export const UPDATE_TEMPLATE_SUCCESS = 'UPDATE_TEMPLATE_SUCCESS'
export const UPDATE_TEMPLATE_FAILURE = 'UPDATE_TEMPLATE_FAILURE'
export const CLEAR_TEMPLATE_ERROR_MESSAGE = 'CLEAR_TEMPLATE_ERROR_MESSAGE'
export const VIEWED_ONCE_AFTER_CREATION = 'VIEWED_ONCE_AFTER_CREATION'

export const UPDATE_TEMPLATE_FAVOURITE_SUCCESS =
  'UPDATE_TEMPLATE_FAVOURITE_SUCCESS'
export const UPDATE_TEMPLATE_FAVOURITE_FAILURE =
  'UPDATE_TEMPLATE_FAVOURITE_FAILURE'

export const RESET_TEMPLATE_TASKS_STATE = 'RESET_TEMPLATE_TASKS_STATE'
export const SELECTION_MODE = 'SELECTION_MODE'
export const NORMAL_MODE = 'NORMAL_MODE'

export const SELECT_TASK_TO_MOVE = 'SELECT_TASK_TO_MOVE'
export const REQUEST_UPDATE_LEVEL_A_TEMPLATE_TASKS =
  'REQUEST_UPDATE_LEVEL_A_TEMPLATE_TASKS'
export const CLEAR_EDITING = 'CLEAR_EDITING'
export const ENTER_NAME_EDITING_TEMPLATE = 'ENTER_NAME_EDITING_TEMPLATE'
export const ENTER_DESCRIPTION_EDITING_TEMPLATE =
  'ENTER_DESCRIPTION_EDITING_TEMPLATE'
export const ENABLE_IMMEDIATE_ADD_TEMPLATE = 'ENABLE_IMMEDIATE_ADD_TEMPLATE'
export const DISABLE_IMMEDIATE_ADD_TEMPLATE = 'DISABLE_IMMEDIATE_ADD_TEMPLATE'
export const ADD_TEMPLATE_RESOURCE = 'ADD_TEMPLATE_RESOURCE'
export const SHOW_TEMPLATE_COPY_DIALOG = 'SHOW_TEMPLATE_COPY_DIALOG'
export const SHOW_TEMPLATE_DELETE_DIALOG = 'SHOW_TEMPLATE_DELETE_DIALOG'
export const SHOW_TEMPLATE_EXPORT_DIALOG = 'SHOW_TEMPLATE_EXPORT_DIALOG'
export const UPDATE_TEMPLATE_NAME_NO_FETCH = 'UPDATE_TEMPLATE_NAME_NO_FETCH'
export const UPDATE_TEMPLATE_IMAGE_NO_FETCH = 'UPDATE_TEMPLATE_IMAGE_NO_FETCH'
export const UPDATE_DELETED_RESOURCE = 'UPDATE_DELETED_RESOURCE'
const UPDATE_TEMPLATE_ERROR = i18n.t(
  'templateTaskActions.errorUpdatingTemplate'
)

export const updateTemplateNameNoFetch = name => {
  return {
    type: UPDATE_TEMPLATE_NAME_NO_FETCH,
    name: name,
  }
}
export const updateTemplateImageNoFetch = (url, urlCredit, urlCreditName) => {
  return {
    type: UPDATE_TEMPLATE_IMAGE_NO_FETCH,
    url: url,
    urlCredit: urlCredit,
    urlCreditName: urlCreditName,
  }
}

export const enterSelectionMode = () => dispatch =>
  dispatch({ type: SELECTION_MODE })

export const exitSelectionMode = () => dispatch =>
  dispatch({ type: NORMAL_MODE })

export const selectTaskToMove = taskId => dispatch =>
  dispatch({ type: SELECT_TASK_TO_MOVE, taskId })

const _clearEditing = () => getTypeObject(CLEAR_EDITING)
const _enterNameEditing = () => getTypeObject(ENTER_NAME_EDITING_TEMPLATE)
const _enterDescriptionEditing = () =>
  getTypeObject(ENTER_DESCRIPTION_EDITING_TEMPLATE)
const _enableImmediateAdd = () => getTypeObject(ENABLE_IMMEDIATE_ADD_TEMPLATE)
const _disableImmediateAdd = () => getTypeObject(DISABLE_IMMEDIATE_ADD_TEMPLATE)

function createTemplate() {
  return {
    type: CREATE_TEMPLATE,
  }
}

function createTemplateSuccess(json) {
  return {
    type: CREATE_TEMPLATE_SUCCESS,
    template: json,
  }
}

function createTemplateFailure() {
  return {
    type: CREATE_TEMPLATE_FAILURE,
  }
}

function updateTemplateSuccess(json) {
  return {
    type: UPDATE_TEMPLATE_SUCCESS,
    template: json,
  }
}

function updateTemplateFailure() {
  return {
    type: UPDATE_TEMPLATE_FAILURE,
    errorMessage: UPDATE_TEMPLATE_ERROR,
  }
}

function updateTemplateFavouriteSuccess(isFavourited) {
  return {
    type: UPDATE_TEMPLATE_FAVOURITE_SUCCESS,
    isFavourited: isFavourited,
  }
}

function updateTemplateFavouriteFailure() {
  return {
    type: UPDATE_TEMPLATE_FAVOURITE_FAILURE,
    errorMessage: UPDATE_TEMPLATE_ERROR,
  }
}

function resetState() {
  return {
    type: RESET_TEMPLATE_TASKS_STATE,
  }
}

function resetOverviewState() {
  return {
    type: RESET_TEMPLATE_OVERVIEW,
  }
}

function clearTemplateErrorMessage() {
  return {
    type: CLEAR_TEMPLATE_ERROR_MESSAGE,
  }
}

export const createNewTemplate = (projectId, name) => dispatch => {
  dispatch(createTemplate())
  return templateService.createTemplate(projectId, name).then(response => {
    if (response.status !== StatusCodes.CREATED) {
      return dispatch(createTemplateFailure())
    }
    dispatch(
      showSnackbar(
        'New template successfully created',
        getTemplateMapRedirectSnackbarAction(response.body.id)
      )
    )
    return dispatch(createTemplateSuccess(response.body))
  })
}

export const setViewedOnceAfterCreation = () => {
  return {
    type: VIEWED_ONCE_AFTER_CREATION,
  }
}

export const updateTemplate = (projectId, properties) => dispatch => {
  return templateService
    .updateTemplate(projectId, properties)
    .then(response => {
      if (response.status !== StatusCodes.OK) {
        dispatch(showSnackbar(i18n.t('templates.updateError')))
        return dispatch(updateTemplateFailure())
      }
      dispatch(fetchTemplates())
      return dispatch(updateTemplateSuccess(response.body))
    })
}

export const favouriteTemplate = (templateId, favourited) => dispatch => {
  return templateService
    .favouriteTemplate(templateId, favourited)
    .then(response => {
      if (response.status !== StatusCodes.OK) {
        return dispatch(updateTemplateFavouriteFailure())
      }
      return dispatch(updateTemplateFavouriteSuccess(favourited))
    })
}

export const fetchIsTemplateFavourited = templateId => dispatch => {
  return templateService.isTemplateFavourited(templateId).then(response => {
    if (response.status !== StatusCodes.OK) {
      return dispatch(updateTemplateFavouriteFailure())
    }
    return dispatch(
      updateTemplateFavouriteSuccess(response.body.isTemplateFavourited)
    )
  })
}

function requestTemplate() {
  return {
    type: REQUEST_TEMPLATE,
  }
}

export function requestUpdateLevelATemplateTasks(templateId, payload) {
  return {
    type: REQUEST_UPDATE_LEVEL_A_TEMPLATE_TASKS,
    templateId,
    ...payload,
  }
}

function requestTemplateOverview() {
  return {
    type: REQUEST_TEMPLATE_OVERVIEW,
  }
}

function receiveTemplate(json) {
  return {
    type: RECEIVE_TEMPLATE,
    template: json,
  }
}

function receiveTemplateOverview(json) {
  return {
    type: RECEIVE_TEMPLATE_OVERVIEW,
    template: json,
  }
}

export const fetchTemplate = templateId => dispatch => {
  dispatch(requestTemplate(templateId))
  return templateService
    .getTemplate(templateId)
    .then(response => dispatch(receiveTemplate(response.body)))
}

export const fetchTemplateOverview = templateId => dispatch => {
  dispatch(requestTemplateOverview(templateId))
  return templateService
    .getTemplateOverview(templateId)
    .then(response => dispatch(receiveTemplateOverview(response.body)))
}

export const fetchTemplateOverviewWithPosts = templateId => dispatch => {
  return templateService
    .getTemplateOverviewWithPosts(templateId)
    .then(response => dispatch(receiveTemplateOverview(response.body)))
}
export function receiveTemplateTasks(json) {
  return {
    type: RECEIVE_TEMPLATE_TASKS,
    templateTasks: json,
  }
}

export function updateDeletedResource(resourceId) {
  return {
    type: UPDATE_DELETED_RESOURCE,
    id: resourceId,
  }
}

export function addNewTemplateResource(resource) {
  return {
    type: ADD_TEMPLATE_RESOURCE,
    resource,
  }
}

export const deleteTemplateResource = (templateId, resourceId) => dispatch => {
  return templateResouces
    .deleteTemplateResource(templateId, resourceId)
    .then(res => {
      dispatch(updateDeletedResource(resourceId))
    })
}

export const addTemplateResource =
  (templateId, name, url, image) => dispatch => {
    return templateResouces
      .addTemplateResource(templateId, {
        name: name,
        url: url,
        image: image,
      })
      .then(res => {
        if (res.status === 201) {
          dispatch(addNewTemplateResource(res.body))
        } else {
          dispatch(showSnackbar(i18n.t('templates.cannotAddResource')))
        }
      })
  }

export const fetchTemplateTasks = templateId => dispatch => {
  return templateService
    .getTemplateTasks(templateId)
    .then(response => dispatch(receiveTemplateTasks(response.body)))
}

export const deleteTemplate = templateId => dispatch => {
  return templateService.deleteTemplate(templateId).then(() => {
    dispatch(showSnackbar(i18n.t('templates.templateDeleted')))
    dispatch(resetState())
  })
}

export const reset = () => dispatch => dispatch(resetState())
export const resetOverview = () => dispatch => dispatch(resetOverviewState())

export const resetTemplateErrorMessage = () => dispatch =>
  dispatch(clearTemplateErrorMessage())

export const enableImmediateAdd = () => dispatch =>
  dispatch(_enableImmediateAdd())

export const disableImmediateAdd = () => dispatch =>
  dispatch(_disableImmediateAdd())

export const editingActions = {
  enterDescriptionEditing: () => dispatch =>
    dispatch(_enterDescriptionEditing()),
  enterNameEditing: () => dispatch => dispatch(_enterNameEditing()),
  clearEditing: () => dispatch => dispatch(_clearEditing()),
}

export const showCopyTemplateDialog =
  (show = false) =>
  dispatch => {
    dispatch({
      type: SHOW_TEMPLATE_COPY_DIALOG,
      show: show,
    })
  }

export const showDeleteTemplateDialog =
  (show = false) =>
  dispatch => {
    dispatch({
      type: SHOW_TEMPLATE_DELETE_DIALOG,
      show: show,
    })
  }

export const showExportTemplateDialog =
  (show = false) =>
  dispatch => {
    dispatch({
      type: SHOW_TEMPLATE_EXPORT_DIALOG,
      show: show,
    })
  }
