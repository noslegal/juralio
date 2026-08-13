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
import projectService from '../../../services/project/project-service'
import taskService from '../../../services/task/task-service'
import { showSnackbar } from '../../global-snackbar/global-snackbar-actions'

export const REQUEST_PROJECTS = 'REQUEST_PROJECTS'
export const RECEIVE_PROJECTS_SUCCESS = 'RECEIVE_PROJECTS_SUCCESS'
export const RECEIVE_PROJECTS_FAILURE = 'RECEIVE_PROJECTS_FAILURE'
export const CREATE_PROJECT = 'CREATE_PROJECT'
export const CREATE_PROJECT_SUCCESS = 'CREATE_PROJECT_SUCCESS'
export const CREATE_PROJECT_FAILURE = 'CREATE_PROJECT_FAILURE'
export const UPDATE_PROJECT = 'UPDATE_PROJECT'
export const UPDATE_PROJECT_IN_LIST_SUCCESS = 'UPDATE_PROJECT_IN_LIST_SUCCESS'
export const UPDATE_PROJECT_NAME_FAILURE = 'UPDATE_PROJECT_NAME_FAILURE'
export const RESET_CREATE_VALIDATION = 'RESET_CREATE_VALIDATION'
export const RESET_UPDATE_VALIDATION = 'RESET_UPDATE_VALIDATION'
export const REQUEST_ORG_PROJECTS = 'REQUEST_ORG_PROJECTS'
export const RECEIVE_ORG_PROJECTS_SUCCESS = 'RECEIVE_ORG_PROJECTS_SUCCESS'
export const UPDATE_PROJECT_IN_LIST_SUCCESS_ORG =
  'UPDATE_PROJECT_IN_LIST_SUCCESS_ORG'
export const BAIL_OUT = 'BAIL_OUT'
export const UPDATE_PRIVATE_WORKSTREAM_TEAM = 'UPDATE_PRIVATE_WORKSTREAM_TEAM'

const DUPLICATE_WORKSTREAM_ERROR =
  'Workstream name must be unique within the matter.'
const USER_NOT_MATTER_ADMIN_CREATE_WORKSTREAM_ERROR =
  'You must be a matter admin to create workstreams.'

let requestedProjectsMatter = null

function requestProjects(matterId) {
  requestedProjectsMatter = matterId
  return {
    type: REQUEST_PROJECTS,
    matterId,
  }
}

function receiveProjectsSuccess(matterId, json) {
  if (matterId !== requestedProjectsMatter && requestedProjectsMatter != null) {
    return {
      type: BAIL_OUT,
    }
  } else {
    requestedProjectsMatter = null
    return {
      type: RECEIVE_PROJECTS_SUCCESS,
      matterId,
      projects: json,
    }
  }
}

function receiveProjectsFailure(matterId) {
  return {
    type: RECEIVE_PROJECTS_FAILURE,
    matterId,
  }
}

function startCreateProject() {
  return {
    type: CREATE_PROJECT,
  }
}

function completeCreateProjectSuccess(project) {
  return {
    type: CREATE_PROJECT_SUCCESS,
    project,
  }
}

function _updatePrivateWorkstreamTeam(workstreamToUpdate, newTeam) {
  return {
    type: UPDATE_PRIVATE_WORKSTREAM_TEAM,
    workstreamToUpdate,
    newTeam,
  }
}

function completeCreateProjectFailure() {
  return {
    type: CREATE_PROJECT_FAILURE,
    errorMessage: DUPLICATE_WORKSTREAM_ERROR,
  }
}

function completeCreateProjectFromTemplateFailure() {
  return {
    type: CREATE_PROJECT_FAILURE,
    errorMessage: USER_NOT_MATTER_ADMIN_CREATE_WORKSTREAM_ERROR,
  }
}

function startUpdateProject(projectId) {
  return {
    type: UPDATE_PROJECT,
    projectId,
  }
}

function completeUpdateProjectSuccess(project) {
  return {
    type: UPDATE_PROJECT_IN_LIST_SUCCESS,
    project,
  }
}

function completeUpdateProjectSuccessORG(project) {
  return {
    type: UPDATE_PROJECT_IN_LIST_SUCCESS_ORG,
    project,
  }
}

function completeUpdateProjectNameFailure(projectId) {
  return {
    type: UPDATE_PROJECT_NAME_FAILURE,
    projectId,
    errorMessage: DUPLICATE_WORKSTREAM_ERROR,
  }
}

function resetCreateValidation() {
  return {
    type: RESET_CREATE_VALIDATION,
  }
}

function resetUpdateValidation(projectId) {
  return {
    type: RESET_UPDATE_VALIDATION,
    projectId,
  }
}

function requestOrgProjects(matterId) {
  return {
    type: REQUEST_ORG_PROJECTS,
    matterId,
  }
}

function receiveOrgProjectsSuccess(json) {
  return {
    type: RECEIVE_ORG_PROJECTS_SUCCESS,
    projects: json,
  }
}

export const fetchWorkstreamAdminList = matterId => dispatch => {
  dispatch(requestProjects(matterId))
  return projectService
    .getWorkstreamAdminListByMatterId(
      matterId,
      false,
      false,
      false,
      undefined,
      false,
      false,
      true
    )
    .then(response => {
      if (response.status === StatusCodes.FORBIDDEN) {
        return dispatch(receiveProjectsFailure())
      }
      return dispatch(receiveProjectsSuccess(matterId, response.body))
    })
}

export const fetchProjects =
  (matterId, limitToMTMs, levelATasksOnly, limitToActive) => dispatch => {
    dispatch(requestProjects(matterId))
    return projectService
      .getProjectsByMatterId(
        matterId,
        limitToActive,
        limitToMTMs,
        levelATasksOnly
      )
      .then(response => {
        if (response.status === StatusCodes.FORBIDDEN) {
          return dispatch(receiveProjectsFailure())
        }
        return dispatch(receiveProjectsSuccess(matterId, response.body))
      })
  }

export const fetchProjectsWithPostsAndTaskTeam =
  (matterId, limitToMTMs, levelATasksOnly, limitToActive) => dispatch => {
    dispatch(requestProjects(matterId))
    return projectService
      .getProjectsByMatterId(
        matterId,
        limitToActive,
        limitToMTMs,
        levelATasksOnly,
        true
      )
      .then(response => {
        if (response.status === StatusCodes.FORBIDDEN) {
          return dispatch(receiveProjectsFailure())
        }
        return dispatch(receiveProjectsSuccess(matterId, response.body))
      })
  }

export const fetchOrgProjects = matterId => dispatch => {
  dispatch(requestOrgProjects(matterId))
  return projectService.getOrgProjectsByMatterId(matterId).then(response => {
    return dispatch(receiveOrgProjectsSuccess(response.body))
  })
}

const getTasks = async (project, levelAOnly) => {
  const tasks = await taskService.getTasks(
    project.matter.id,
    project.id,
    undefined
  ).promise
  if (levelAOnly) {
    project.tasks = tasks.body.filter(t => t.level === 1)
  } else {
    project.tasks = tasks.body
  }
}

export const fetchProjectWithTasks =
  (matterId, limitToMTMs, levelAOnly, limitToActive) => dispatch => {
    dispatch(requestProjects(matterId))
    return projectService
      .getProjectsByMatterId(matterId, limitToActive, limitToMTMs, levelAOnly)
      .then(response => {
        if (response.status === StatusCodes.FORBIDDEN) {
          return dispatch(receiveProjectsFailure())
        }
        Promise.all(response.body.map(p => getTasks(p, levelAOnly))).then(
          () => {
            return dispatch(receiveProjectsSuccess(matterId, response.body))
          }
        )
      })
  }

const projectAlreadyExist = error => {
  return (error.field = 'name' && error.codes.indexOf('unique') > -1)
}

export const createProject =
  (
    matterId,
    options = { name: '', isPrivate: false },
    shouldShowSnackbar = true
  ) =>
  dispatch => {
    dispatch(startCreateProject())
    return projectService.createProject(matterId, options).then(response => {
      if (response.status === StatusCodes.CREATED) {
        if (shouldShowSnackbar)
          dispatch(showSnackbar(`${options.name} created`))
        return dispatch(completeCreateProjectSuccess(response.body))
      }

      if (projectAlreadyExist(response.body.errors[0])) {
        return dispatch(completeCreateProjectFailure())
      }

      if (response.status !== StatusCodes.OK) {
        return dispatch(completeCreateProjectFailure())
      }
    })
  }

export const updateProject = (matterId, projectId, properties) => dispatch => {
  dispatch(startUpdateProject(projectId))
  return projectService
    .updateProject(matterId, projectId, properties)
    .then(response => {
      if (response.status === StatusCodes.OK) {
        dispatch(completeUpdateProjectSuccessORG(response.body))
        return dispatch(completeUpdateProjectSuccess(response.body))
      }

      if (projectAlreadyExist(response.body.errors[0])) {
        return dispatch(completeUpdateProjectNameFailure(projectId))
      }
    })
}

export const clearErrorMessage = projectId => dispatch => {
  if (projectId) {
    return dispatch(resetUpdateValidation(projectId))
  }
  return dispatch(resetCreateValidation())
}

export const createProjectFromTemplate =
  (
    matterId,
    templateId,
    options = { name: '', isPrivate: false },
    includePosts,
    includeDescriptions = false,
    shouldShowSnackbar = true,
    includeResources
  ) =>
  async dispatch => {
    dispatch(startCreateProject())

    const response = await projectService.createProjectFromTemplate(
      matterId,
      options,
      templateId,
      includePosts,
      includeDescriptions,
      includeResources
    )
    return handleCreateProjectResponse(
      matterId,
      response,
      dispatch,
      shouldShowSnackbar
    )
  }

export const createProjectFromTemplateTask =
  (
    matterId,
    templateTaskId,
    options = { name: '', isPrivate: false },
    includePosts,
    includeDescriptions = false,
    shouldShowSnackbar = true
  ) =>
  async dispatch => {
    dispatch(startCreateProject())

    const response = await projectService.createProjectFromTemplateTask(
      matterId,
      options,
      templateTaskId,
      includePosts,
      includeDescriptions
    )
    return handleCreateProjectResponse(
      matterId,
      response,
      dispatch,
      shouldShowSnackbar
    )
  }

const handleCreateProjectResponse = (
  matterId,
  response,
  dispatch,
  shouldShowSnackbar
) => {
  if (response.status === StatusCodes.CREATED) {
    if (shouldShowSnackbar) {
      dispatch(
        showSnackbar('New workstream successfully created from template')
      )
    }
    return dispatch(completeCreateProjectSuccess(response.body))
  }
  if (response.status === StatusCodes.FORBIDDEN) {
    return dispatch(completeCreateProjectFromTemplateFailure())
  }
  return dispatch(completeCreateProjectFailure())
}

export const updatePrivateWorkstreamTeam =
  (workstreamToUpdate, newTeam) => dispatch =>
    dispatch(_updatePrivateWorkstreamTeam(workstreamToUpdate, newTeam))

export const createProjectFromTutorial =
  (templateId, options = { name: '', isPrivate: false }) =>
  async dispatch => {
    dispatch(startCreateProject())
    return projectService.createProjectFromTutorial(templateId, options)
  }
