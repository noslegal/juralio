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
import { showSnackbar } from '../../app/global-snackbar/global-snackbar-actions'
import projectService from '../../services/project/project-service'
import taskService from '../../services/task/task-service'

export const GLOBAL_PROJECTS_REQUEST_PROJECTS =
  'GLOBAL_PROJECTS_REQUEST_PROJECTS'
export const GLOBAL_PROJECTS_RECEIVE_PROJECTS_SUCCESS =
  'GLOBAL_PROJECTS_RECEIVE_PROJECTS_SUCCESS'
export const GLOBAL_PROJECTS_RECEIVE_PROJECTS_FAILURE =
  'GLOBAL_PROJECTS_RECEIVE_PROJECTS_FAILURE'
export const GLOBAL_PROJECTS_CREATE_PROJECT = 'GLOBAL_PROJECTS_CREATE_PROJECT'
export const GLOBAL_PROJECTS_CREATE_PROJECT_SUCCESS =
  'GLOBAL_PROJECTS_CREATE_PROJECT_SUCCESS'
export const GLOBAL_PROJECTS_CREATE_PROJECT_FAILURE =
  'GLOBAL_PROJECTS_CREATE_PROJECT_FAILURE'
export const GLOBAL_PROJECTS_UPDATE_PROJECT = 'GLOBAL_PROJECTS_UPDATE_PROJECT'
export const GLOBAL_PROJECTS_UPDATE_PROJECT_IN_LIST_SUCCESS =
  'GLOBAL_PROJECTS_UPDATE_PROJECT_IN_LIST_SUCCESS'
export const GLOBAL_PROJECTS_UPDATE_PROJECT_NAME_FAILURE =
  'GLOBAL_PROJECTS_UPDATE_PROJECT_NAME_FAILURE'
export const GLOBAL_PROJECTS_RESET_CREATE_VALIDATION =
  'GLOBAL_PROJECTS_RESET_CREATE_VALIDATION'
export const GLOBAL_PROJECTS_RESET_UPDATE_VALIDATION =
  'GLOBAL_PROJECTS_RESET_UPDATE_VALIDATION'
export const GLOBAL_PROJECTS_REQUEST_ORG_PROJECTS =
  'GLOBAL_PROJECTS_REQUEST_ORG_PROJECTS'
export const GLOBAL_PROJECTS_RECEIVE_ORG_PROJECTS_SUCCESS =
  'GLOBAL_PROJECTS_RECEIVE_ORG_PROJECTS_SUCCESS'
export const GLOBAL_PROJECTS_UPDATE_PROJECT_IN_LIST_SUCCESS_ORG =
  'GLOBAL_PROJECTS_UPDATE_PROJECT_IN_LIST_SUCCESS_ORG'
export const GLOBAL_PROJECTS_BAIL_OUT = 'GLOBAL_PROJECTS_BAIL_OUT'

const DUPLICATE_WORKSTREAM_ERROR =
  'Workstream name must be unique within the matter.'
const USER_NOT_MATTER_ADMIN_CREATE_WORKSTREAM_ERROR =
  'You must be a matter admin to create workstreams.'

let requestedProjectsMatter = null

function requestProjects(matterId) {
  requestedProjectsMatter = matterId
  return {
    type: GLOBAL_PROJECTS_REQUEST_PROJECTS,
    matterId,
  }
}

function receiveProjectsSuccess(matterId, json) {
  if (matterId !== requestedProjectsMatter && requestedProjectsMatter != null) {
    return {
      type: GLOBAL_PROJECTS_BAIL_OUT,
    }
  } else {
    requestedProjectsMatter = null
    return {
      type: GLOBAL_PROJECTS_RECEIVE_PROJECTS_SUCCESS,
      matterId,
      projects: json,
    }
  }
}

function receiveProjectsFailure(matterId) {
  return {
    type: GLOBAL_PROJECTS_RECEIVE_PROJECTS_FAILURE,
    matterId,
  }
}

function startCreateProject() {
  return {
    type: GLOBAL_PROJECTS_CREATE_PROJECT,
  }
}

function completeCreateProjectSuccess(project) {
  return {
    type: GLOBAL_PROJECTS_CREATE_PROJECT_SUCCESS,
    project,
  }
}

function completeCreateProjectFailure() {
  return {
    type: GLOBAL_PROJECTS_CREATE_PROJECT_FAILURE,
    errorMessage: DUPLICATE_WORKSTREAM_ERROR,
  }
}

function completeCreateProjectFromTemplateFailure() {
  return {
    type: GLOBAL_PROJECTS_CREATE_PROJECT_FAILURE,
    errorMessage: USER_NOT_MATTER_ADMIN_CREATE_WORKSTREAM_ERROR,
  }
}

function startUpdateProject(projectId) {
  return {
    type: GLOBAL_PROJECTS_UPDATE_PROJECT,
    projectId,
  }
}

function completeUpdateProjectSuccess(project) {
  return {
    type: GLOBAL_PROJECTS_UPDATE_PROJECT_IN_LIST_SUCCESS,
    project,
  }
}

function completeUpdateProjectSuccessORG(project) {
  return {
    type: GLOBAL_PROJECTS_UPDATE_PROJECT_IN_LIST_SUCCESS_ORG,
    project,
  }
}

function completeUpdateProjectNameFailure(projectId) {
  return {
    type: GLOBAL_PROJECTS_UPDATE_PROJECT_NAME_FAILURE,
    projectId,
    errorMessage: DUPLICATE_WORKSTREAM_ERROR,
  }
}

function resetCreateValidation() {
  return {
    type: GLOBAL_PROJECTS_RESET_CREATE_VALIDATION,
  }
}

function resetUpdateValidation(projectId) {
  return {
    type: GLOBAL_PROJECTS_RESET_UPDATE_VALIDATION,
    projectId,
  }
}

function requestOrgProjects(matterId) {
  return {
    type: GLOBAL_PROJECTS_REQUEST_ORG_PROJECTS,
    matterId,
  }
}

function receiveOrgProjectsSuccess(json) {
  return {
    type: GLOBAL_PROJECTS_RECEIVE_ORG_PROJECTS_SUCCESS,
    projects: json,
  }
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
    project.tasks = tasks
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
  (matterId, name, shouldShowSnackbar = true) =>
  dispatch => {
    dispatch(startCreateProject())
    return projectService.createProject(matterId, name).then(response => {
      if (response.status === StatusCodes.CREATED) {
        if (shouldShowSnackbar) dispatch(showSnackbar(`${name} created`))
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
  (matterId, templateId, name, includePosts, includeDescriptions) =>
  async dispatch => {
    dispatch(startCreateProject())

    const response = await projectService.createProjectFromTemplate(
      matterId,
      { name: name },
      templateId,
      includePosts,
      includeDescriptions
    )
    return handleCreateProjectResponse(matterId, response, dispatch)
  }

export const createProjectFromTemplateTask =
  (matterId, templateTaskId, name, includePosts, includeDescriptions) =>
  async dispatch => {
    dispatch(startCreateProject())

    const response = await projectService.createProjectFromTemplateTask(
      matterId,
      name,
      templateTaskId,
      includePosts,
      includeDescriptions
    )
    return handleCreateProjectResponse(matterId, response, dispatch)
  }

const handleCreateProjectResponse = (matterId, response, dispatch) => {
  if (response.status === StatusCodes.CREATED) {
    dispatch(showSnackbar('New workstream successfully created from template'))
    return dispatch(completeCreateProjectSuccess(response.body))
  }
  if (response.status === StatusCodes.FORBIDDEN) {
    return dispatch(completeCreateProjectFromTemplateFailure())
  }
  return dispatch(completeCreateProjectFailure())
}
