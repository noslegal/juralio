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

import { combineReducers } from 'redux'
import {
  GLOBAL_PROJECTS_CREATE_PROJECT_FAILURE,
  GLOBAL_PROJECTS_CREATE_PROJECT_SUCCESS,
  GLOBAL_PROJECTS_RECEIVE_PROJECTS_FAILURE,
  GLOBAL_PROJECTS_RECEIVE_PROJECTS_SUCCESS,
  GLOBAL_PROJECTS_REQUEST_PROJECTS,
  GLOBAL_PROJECTS_RESET_CREATE_VALIDATION,
  GLOBAL_PROJECTS_RESET_UPDATE_VALIDATION,
  GLOBAL_PROJECTS_UPDATE_PROJECT_IN_LIST_SUCCESS,
  GLOBAL_PROJECTS_UPDATE_PROJECT_NAME_FAILURE,
} from '../actions/global-projects-actions'

const meta = (state = { isLoaded: false }, action) => {
  switch (action.type) {
    case GLOBAL_PROJECTS_REQUEST_PROJECTS:
      return { isLoaded: false }
    case GLOBAL_PROJECTS_RECEIVE_PROJECTS_SUCCESS: {
      const { projects, type, ...otherState } = action
      return { ...otherState, isLoaded: true, canViewProjects: true }
    }
    case GLOBAL_PROJECTS_RECEIVE_PROJECTS_FAILURE:
      return { isLoaded: true, canViewProjects: false }
    case GLOBAL_PROJECTS_CREATE_PROJECT_FAILURE:
      return {
        ...state,
        errorMessage: action.errorMessage,
      }
    case GLOBAL_PROJECTS_RESET_CREATE_VALIDATION:
      return { ...state, errorMessage: '' }
    default:
      return state
  }
}

const updateProjectInList = (projects, projectToUpdate) => {
  return projects.map(projectInList =>
    projectInList.id === projectToUpdate.id ? projectToUpdate : projectInList
  )
}

const appendErrorMessage = (projects, action) => {
  return projects.map(projectInList =>
    projectInList.id === action.projectId
      ? { ...projectInList, errorMessage: action.errorMessage }
      : projectInList
  )
}

const clearUpdateErrorMessage = (projects, action) => {
  return projects.map(projectInList =>
    projectInList.id === action.projectId
      ? { ...projectInList, errorMessage: undefined }
      : projectInList
  )
}

const items = (state = [], action) => {
  switch (action.type) {
    case GLOBAL_PROJECTS_RECEIVE_PROJECTS_SUCCESS:
      return [...action.projects]
    case GLOBAL_PROJECTS_RECEIVE_PROJECTS_FAILURE:
      return []
    case GLOBAL_PROJECTS_CREATE_PROJECT_SUCCESS:
      return [action.project, ...state]
    case GLOBAL_PROJECTS_UPDATE_PROJECT_IN_LIST_SUCCESS:
      return updateProjectInList(state, action.project)
    case GLOBAL_PROJECTS_UPDATE_PROJECT_NAME_FAILURE:
      return appendErrorMessage(state, action)
    case GLOBAL_PROJECTS_RESET_UPDATE_VALIDATION:
      return clearUpdateErrorMessage(state, action)
    default:
      return state
  }
}

export default combineReducers({ items, meta })
