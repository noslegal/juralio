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
import { additionalButton } from '../../services/helpers/snackbar-helper'
import projectService from '../../services/project/project-service'
import { showSnackbar } from '../global-snackbar/global-snackbar-actions'

export const CLEAR_EDITING = 'CLEAR_EDITING'
export const ENTER_NAME_EDITING_PROJECT = 'ENTER_NAME_EDITING_PROJECT'
export const ENTER_DESCRIPTION_EDITING_PROJECT =
  'ENTER_DESCRIPTION_EDITING_PROJECT'
export const EXIT_PROJECT_EDITING = 'EXIT_PROJECT_EDITING'
export const REQUEST_PROJECT = 'REQUEST_PROJECT'
export const REQUEST_PROJECT_OVERVIEW = 'REQUEST_PROJECT_OVERVIEW'
export const RECEIVE_PROJECT_OVERVIEW_SUCCESS =
  'RECEIVE_PROJECT_OVERVIEW_SUCCESS'
export const RECEIVE_PROJECT_OVERVIEW_FAILURE =
  'RECEIVE_PROJECT_OVERVIEW_FAILURE'
export const REQUEST_NEW_TASKS = 'REQUEST_NEW_TASKS'
export const RECEIVE_NEW_TASKS_SUCCESS = 'RECEIVE_NEW_TASKS_SUCCESS'
export const RECEIVE_NEW_TASKS_FAILURE = 'RECEIVE_NEW_TASKS_FAILURE'
export const RECEIVE_PROJECT_SUCCESS = 'RECEIVE_PROJECT_SUCCESS'
export const RECEIVE_PROJECT_FAILURE = 'RECEIVE_PROJECT_FAILURE'
export const CLEAR_PROJECT = 'CLEAR_PROJECT'
export const CLEAR_PROJECT_OVERVIEW = 'CLEAR_PROJECT_OVERVIEW'
export const UPDATE_PROJECT_NAME_SUCCESS = 'UPDATE_PROJECT_NAME_SUCCESS'
export const UPDATE_PROJECT_SUCCESS = 'UPDATE_PROJECT_SUCCESS'
export const UPDATE_PROJECT_NAME_FAILURE = 'UPDATE_PROJECT_NAME_FAILURE'
export const CLEAR_PROJECT_ERROR_MESSAGE = 'CLEAR_PROJECT_ERROR_MESSAGE'
export const REQUEST_UPDATE_LEVEL_A_TASKS = 'REQUEST_UPDATE_LEVEL_A_TASKS'
export const ENABLE_IMMEDIATE_ADD_PROJECT = 'ENABLE_IMMEDIATE_ADD_PROJECT'
export const DISABLE_IMMEDIATE_ADD_PROJECT = 'DISABLE_IMMEDIATE_ADD_PROJECT'
export const SET_PROJECT_DETAILS = 'SET_PROJECT_DETAILS'
export const UPDATE_WORKSTEAM_NAME_NO_FETCH = 'UPDATE_WORKSTEAM_NAME_NO_FETCH'
export const REQUEST_WORKSTREAM_OVERVIEW = 'REQUEST_WORKSTREAM_OVERVIEW'
export const RECEIVE_WORKSTREAM_OVERVIEW = 'RECEIVE_WORKSTREAM_OVERVIEW'
export const RECEIVE_WORKSTREAM_OVERVIEW_FAILURE =
  'RECEIVE_WORKSTREAM_OVERVIEW_FAILURE'

export const TASKMAP_SELECTION_MODE = 'TASKMAP_SELECTION_MODE'
export const TASKMAP_NORMAL_MODE = 'TASKMAP_NORMAL_MODE'
export const TASKMAP_SELECT_TASK_TO_MOVE = 'TASKMAP_SELECT_TASK_TO_MOVE'
export const UPDATE_TASK_INFO = 'UPDATE_TASK_INFO'

const _clearEditing = () => getTypeObject(CLEAR_EDITING)
const _enterNameEditing = () => getTypeObject(ENTER_NAME_EDITING_PROJECT)
const _enterDescriptionEditing = () =>
  getTypeObject(ENTER_DESCRIPTION_EDITING_PROJECT)
const _enableImmediateAdd = () => getTypeObject(ENABLE_IMMEDIATE_ADD_PROJECT)
const _disableImmediateAdd = () => getTypeObject(DISABLE_IMMEDIATE_ADD_PROJECT)

export const enterSelectionMode =
  (
    originalWorkstreamName,
    newWorkstreamName,
    isWorkstreamPrivate,
    privateWorkstreamUsers
  ) =>
  dispatch =>
    dispatch({
      type: TASKMAP_SELECTION_MODE,
      originalWorkstreamName,
      newWorkstreamName,
      isWorkstreamPrivate,
      privateWorkstreamUsers,
    })

export const exitSelectionMode = () => dispatch =>
  dispatch({ type: TASKMAP_NORMAL_MODE })

export const selectTaskToMove = (taskId, taskTree) => dispatch =>
  dispatch({ type: TASKMAP_SELECT_TASK_TO_MOVE, taskId, taskTree })

function requestProject() {
  return {
    type: REQUEST_PROJECT,
    loadingProject: true,
  }
}

function requestProjectOverview() {
  return {
    type: REQUEST_PROJECT_OVERVIEW,
  }
}

function requestNewTasks() {
  return {
    type: REQUEST_NEW_TASKS,
  }
}

export function receiveProjectSuccess(payload) {
  return {
    type: RECEIVE_PROJECT_SUCCESS,
    project: payload.project,
    matterId: payload.matterId,
    loadingProject: false,
  }
}

export function _setProjectDetails(payload) {
  return {
    type: SET_PROJECT_DETAILS,
    project: payload.project,
  }
}

export function updateWorksreamNameNoFetch(name) {
  return {
    type: UPDATE_WORKSTEAM_NAME_NO_FETCH,
    name: name,
  }
}

function receiveProjectOverviewSuccess(payload) {
  return {
    type: RECEIVE_PROJECT_OVERVIEW_SUCCESS,
    projectOverview: payload.project,
  }
}

function receiveProjectOverviewFailure(projectId) {
  return {
    type: RECEIVE_PROJECT_OVERVIEW_FAILURE,
    projectOverview: { id: projectId },
  }
}

function receiveNewTasksSuccess(payload) {
  return {
    type: RECEIVE_NEW_TASKS_SUCCESS,
    newTasks: payload.newTasks,
  }
}

function receiveNewTasksFailure() {
  return {
    type: RECEIVE_NEW_TASKS_FAILURE,
  }
}

export function requestUpdateLevelATasks(payload) {
  return {
    type: REQUEST_UPDATE_LEVEL_A_TASKS,
    ...payload,
  }
}

export function exitProjectEditing() {
  return {
    type: EXIT_PROJECT_EDITING,
  }
}

function receiveProjectFailure() {
  return {
    type: RECEIVE_PROJECT_FAILURE,
  }
}

function clearProject() {
  return {
    type: CLEAR_PROJECT,
  }
}
function clearProjectErrorMessage() {
  return {
    type: CLEAR_PROJECT_ERROR_MESSAGE,
  }
}

function completeUpdateProjectSuccess(project) {
  return {
    type: UPDATE_PROJECT_SUCCESS,
    project,
  }
}

function completeUpdateProjectNameFailure(projectId) {
  return {
    type: UPDATE_PROJECT_NAME_FAILURE,
    projectId,
    errorMessage: i18n.t('projectCreation.projectNameUniquePerMatter'),
  }
}

function completeUpdateProjectNameFailureBadPermissions(projectId) {
  return {
    type: UPDATE_PROJECT_NAME_FAILURE,
    projectId,
    errorMessage: i18n.t('projectCreation.noPermissionsToRename'),
  }
}

function requestWorkstreamOverview(id) {
  return {
    type: REQUEST_WORKSTREAM_OVERVIEW,
    id: id,
  }
}
function recieveWorkstreamOverview(overview) {
  return {
    type: RECEIVE_WORKSTREAM_OVERVIEW,
    overview: overview,
  }
}

function recieveWorkstreamOverviwFailure() {
  return {
    type: RECEIVE_WORKSTREAM_OVERVIEW_FAILURE,
  }
}

const projectAlreadyExist = error => {
  return (error.field = 'name' && error.codes.indexOf('unique') > -1)
}

function clearProjectOverview() {
  return {
    type: CLEAR_PROJECT_OVERVIEW,
  }
}

function updateRoadmapTaskInfo(task) {
  return {
    type: UPDATE_TASK_INFO,
    task: task,
  }
}

export const updateTaskInfo = task => dispatch => {
  dispatch(updateRoadmapTaskInfo(task))
}

export const fetchProjectWithHierarchy = (matterId, projectId) => dispatch =>
  fetchProject(matterId, projectId, { includeFullHierarchy: true })(dispatch)

export const fetchProjectWithTaskTeams = (matterId, projectId) => dispatch =>
  fetchProject(matterId, projectId, { includeTaskTeam: true })(dispatch)

export const fetchProjectWithPosts = (matterId, projectId) => dispatch => {
  fetchProject(matterId, projectId, { includePosts: true })(dispatch)
}

export const fetchWorkstreamOverview = (matterId, workstreamId) => dispatch => {
  dispatch(requestWorkstreamOverview(workstreamId))
  projectService.getWorkstreamOverview(matterId, workstreamId).then(res => {
    if (res.status === 200) {
      dispatch(recieveWorkstreamOverview(res.body))
    } else {
      dispatch(recieveWorkstreamOverviwFailure())
    }
  })
}

export const fetchProjectWithPostsAndTaskTeam =
  (matterId, projectId) => dispatch => {
    fetchProject(matterId, projectId, {
      includePosts: true,
      includeTaskTeam: true,
    })(dispatch)
  }

export const setProjectDetails =
  (project = {}) =>
  dispatch => {
    const modifiedProject = { ...project, id: null }
    return dispatch(
      _setProjectDetails({
        project: modifiedProject,
      })
    )
  }

export const fetchProject =
  (matterId, projectId, queryParameters) => dispatch => {
    dispatch(requestProject())
    return projectService
      .getProject(matterId, projectId, queryParameters)
      .then(response => {
        if (response.status !== StatusCodes.OK) {
          return dispatch(receiveProjectFailure())
        } else {
          return dispatch(
            receiveProjectSuccess({
              project: response.body,
              matterId: matterId,
            })
          )
        }
      })
  }

export const updateProject = (matterId, projectId, properties) => dispatch => {
  return projectService
    .updateProject(matterId, projectId, properties)
    .then(response => {
      if (response.status === StatusCodes.OK) {
        return dispatch(completeUpdateProjectSuccess(response.body))
      } else {
        if (
          response.body.message ===
          'Request did not specify any valid parameters.'
        ) {
          return dispatch(
            completeUpdateProjectNameFailureBadPermissions(projectId)
          )
        }
        if (projectAlreadyExist(response.body.errors[0])) {
          return dispatch(completeUpdateProjectNameFailure(projectId))
        }
      }
    })
}

export const fetchProjectOverview = (matterId, projectId) => dispatch => {
  dispatch(requestProjectOverview())
  return projectService
    .getProjectOverview(matterId, projectId)
    .then(response => {
      if (response.status === StatusCodes.OK) {
        return dispatch(
          receiveProjectOverviewSuccess({
            project: response.body,
          })
        )
      } else {
        return dispatch(receiveProjectOverviewFailure(projectId))
      }
    })
}

export const recordProjectVisit = (matterId, projectId) => dispatch => {
  dispatch(requestNewTasks())
  return projectService
    .recordProjectVisit(matterId, projectId)
    .then(response => {
      if (response.status === StatusCodes.OK) {
        return dispatch(
          receiveNewTasksSuccess({
            newTasks: response.body,
          })
        )
      } else {
        return dispatch(receiveNewTasksFailure())
      }
    })
}

export const recordTaskSeen = (matterId, projectId, taskId) => dispatch => {
  return projectService.recordTaskSeen(matterId, projectId, taskId)
}

export const getNewTasks = (matterId, projectId) => dispatch => {
  dispatch(requestNewTasks())
  return projectService.getNewTasks(matterId, projectId).then(response => {
    if (response.status === StatusCodes.OK) {
      dispatch(
        receiveNewTasksSuccess({
          newTasks: response.body,
        })
      )

      if (!response.body || !response.body.length) {
        return null
      }
      const taskmapRedirectUrl = `/matter/${response.body[0].matterId}/workstream/${response.body[0].projectId}/taskmap`
      const overviewUrl = `/matter/${response.body[0].matterId}/workstream/${response.body[0].projectId}/overview`
      if (
        !window.location.hash.includes(overviewUrl) ||
        parseInt(localStorage.getItem('hasSeenNewTaskDisplay')) === 1
      ) {
        return null
      }
      localStorage.setItem('hasSeenNewTaskDisplay', 1)
      return dispatch(
        showSnackbar(
          i18n.t('newTasks.newTask', {
            count: response.body.length,
          }),
          additionalButton('View', taskmapRedirectUrl)
        )
      )
    } else {
      return dispatch(receiveNewTasksFailure())
    }
  })
}

export const resetProjectErrorMessage = () => dispatch =>
  dispatch(clearProjectErrorMessage())

export const resetProject = () => dispatch => dispatch(clearProject())

export const resetProjectOverview = () => dispatch =>
  dispatch(clearProjectOverview())

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
