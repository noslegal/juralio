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
  RECEIVE_PROJECTS_SUCCESS,
  REQUEST_PROJECTS,
  RECEIVE_PROJECTS_FAILURE,
  CREATE_PROJECT_SUCCESS,
  CREATE_PROJECT_FAILURE,
  RESET_CREATE_VALIDATION,
  RESET_UPDATE_VALIDATION,
  UPDATE_PROJECT_IN_LIST_SUCCESS,
  UPDATE_PROJECT_NAME_FAILURE,
  UPDATE_PRIVATE_WORKSTREAM_TEAM,
} from './projects-actions'

const meta = (state = { isLoaded: false }, action) => {
  switch (action.type) {
    case REQUEST_PROJECTS:
      return { isLoaded: false }
    case RECEIVE_PROJECTS_SUCCESS: {
      const { projects, type, ...otherState } = action
      return { ...otherState, isLoaded: true, canViewProjects: true }
    }
    case RECEIVE_PROJECTS_FAILURE:
      return { isLoaded: true, canViewProjects: false }
    case CREATE_PROJECT_FAILURE:
      return {
        ...state,
        errorMessage: action.errorMessage,
      }
    case RESET_CREATE_VALIDATION:
      return { ...state, errorMessage: '' }
    default:
      return state
  }
}

const updatePrivateWorkstreamTeam = (
  projects,
  workstreamworkstreamToUpdate,
  newTeam
) => {
  return projects.map(projectInList =>
    projectInList.id === workstreamworkstreamToUpdate.id
      ? { ...workstreamworkstreamToUpdate, privateWorkstreamTeam: newTeam }
      : projectInList
  )
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
    case RECEIVE_PROJECTS_SUCCESS:
      return [...action.projects]
    case RECEIVE_PROJECTS_FAILURE:
      return []
    case CREATE_PROJECT_SUCCESS:
      return [action.project, ...state]
    case UPDATE_PROJECT_IN_LIST_SUCCESS:
      return updateProjectInList(state, action.project)
    case UPDATE_PRIVATE_WORKSTREAM_TEAM:
      return updatePrivateWorkstreamTeam(
        state,
        action.workstreamToUpdate,
        action.newTeam
      )
    case UPDATE_PROJECT_NAME_FAILURE:
      return appendErrorMessage(state, action)
    case RESET_UPDATE_VALIDATION:
      return clearUpdateErrorMessage(state, action)
    default:
      return state
  }
}

export default combineReducers({ items, meta })
