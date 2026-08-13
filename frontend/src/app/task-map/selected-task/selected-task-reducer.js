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

import { RECEIVE_PROJECT_SUCCESS } from '../../project/project-actions'
import {
  CREATE_TASK_IN_TASK_CONTEXT_SUCCESS,
  UPDATE_PREVIEW_TASK_TEAM,
} from '../../task-details/task-actions'
import {
  ADD_TASK_BLOCKED_ERROR,
  ADD_TASK_BLOCKED_NO_FETCH,
  ADD_TASK_BLOCKER_ERROR,
  ADD_TASK_BLOCKER_NO_FETCH,
  CANCEL_CONFIRMATION_DIALOG,
  CLEAR_BLOCKER_ERROR_MESSAGE,
  CLEAR_TASK,
  DELETE_TASK_BLOCKER_ERROR,
  DELETE_TASK_BLOCKER_NO_FETCH,
  FETCH_BLOCKERS_LIST,
  FETCH_BLOCKER_LIST_ERROR,
  FETCH_BLOCKER_LIST_SUCCESS,
  FOLLOW_TASK_CURRENT_USER,
  RECEIVE_TASK_FAILURE,
  RECEIVE_TASK_SUCCESS,
  REQUEST_UPDATE_SUBTASKS,
  SET_TASK_DATES_LINKED,
  START_EDITING_TASK_DESCRIPTION,
  START_EDITING_TASK_NAME,
  STOP_EDITING_TASK_DESCRIPTION,
  STOP_EDITING_TASK_NAME,
  UNFOLLOW_TASK_CURRENT_USER,
  UPDATE_TASK_LAST_UPDATED_DATE,
} from './selected-task-actions'
import {
  ADD_TASK_TEAM_MEMBER_SUCCESS,
  DELETE_TASK_TEAM_MEMBER_SUCCESS,
} from './selected-task-team-actions'

const initialTaskState = {
  isLoaded: false,
  isForbidden: false,
  isEditingName: false,
  teamMembers: [],
}

function removeTeamMember(user, teamMembers) {
  return teamMembers.filter(teamMember => {
    return teamMember.id !== user.id
  })
}
export default function selectedTaskReducer(state = initialTaskState, action) {
  switch (action.type) {
    case RECEIVE_TASK_SUCCESS:
      return {
        ...initialTaskState,
        ...action.task,
        isEditingDescription: state.isEditingDescription,
        isLoaded: true,
        previousTaskOrder: undefined,
      }

    case RECEIVE_PROJECT_SUCCESS:
      return {
        ...state,
        previousTaskOrder: undefined,
      }

    case RECEIVE_TASK_FAILURE:
      return { ...state, isLoaded: true, isForbidden: true }

    case CLEAR_TASK:
      return initialTaskState

    case CREATE_TASK_IN_TASK_CONTEXT_SUCCESS:
      let newState = { ...state }
      newState.tasks = state.tasks.slice(0)
      newState.tasks.push(action.createdTask)
      newState.lastUpdated = action.createdTask.lastUpdated
      return newState

    case REQUEST_UPDATE_SUBTASKS:
      return {
        ...state,
        previousTaskOrder: state.tasks,
        tasks: action.taskOrder,
      }
    case CANCEL_CONFIRMATION_DIALOG:
      return {
        ...state,
        ...(state.previousTaskOrder && { tasks: state.previousTaskOrder }),
      }
    case START_EDITING_TASK_NAME:
      return { ...state, isEditingName: true }
    case STOP_EDITING_TASK_NAME:
      return { ...state, isEditingName: false }
    case START_EDITING_TASK_DESCRIPTION:
      return { ...state, isEditingDescription: true }
    case STOP_EDITING_TASK_DESCRIPTION:
      return { ...state, isEditingDescription: false }
    case SET_TASK_DATES_LINKED:
      return { ...state, datesLinkedToSiblings: action.isLinked }
    case UPDATE_TASK_LAST_UPDATED_DATE:
      return { ...state, lastUpdated: action.date }
    case ADD_TASK_TEAM_MEMBER_SUCCESS:
      return {
        ...state,
        teamMembers: [action.user, ...state.teamMembers],
      }
    case DELETE_TASK_TEAM_MEMBER_SUCCESS:
      return {
        ...state,
        teamMembers: removeTeamMember(action.user, state.teamMembers),
      }
    case FOLLOW_TASK_CURRENT_USER:
      return { ...state, isFollower: true }
    case UNFOLLOW_TASK_CURRENT_USER:
      return { ...state, isFollower: false }
    case ADD_TASK_BLOCKER_NO_FETCH:
      return {
        ...state,
        blockers: state.blockers
          ? [action.newBlocker, ...state.blockers]
          : [action.newBlocker],
      }
    case ADD_TASK_BLOCKED_ERROR:
      return { ...state, blockerError: 'Unable to add blocker' }
    case ADD_TASK_BLOCKED_NO_FETCH:
      return {
        ...state,
        blockers: state.blockers
          ? [action.newBlocker, ...state.blockers]
          : [action.newBlocker],
      }
    case ADD_TASK_BLOCKER_ERROR:
      return { ...state, blockerError: 'Unable to add blocker' }

    case DELETE_TASK_BLOCKER_NO_FETCH:
      return {
        ...state,
        blockers: state.blockers.filter(t => t.id !== action.blockerId),
      }
    case DELETE_TASK_BLOCKER_ERROR:
      return { ...state, blockerError: 'Unable to delete blocker' }

    case CLEAR_BLOCKER_ERROR_MESSAGE:
      return { ...state, blockerError: null }

    case FETCH_BLOCKERS_LIST:
      return {
        ...state,
        blockers: state.blockers,
      }

    case FETCH_BLOCKER_LIST_SUCCESS:
      return {
        ...state,
        blockers: action.blockers,
      }

    case FETCH_BLOCKER_LIST_ERROR:
      return {
        ...state,
        blockerError: 'Unable to fetch blockers',
      }
    case UPDATE_PREVIEW_TASK_TEAM:
      return {
        ...state,
        teamMembers: action.team,
      }
    default:
      return state
  }
}
