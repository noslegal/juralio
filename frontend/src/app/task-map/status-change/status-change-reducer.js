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
  CANCEL_CONFIRMATION_DIALOG,
  CLEAR_TASK,
  CONFIRM_STATUS_CHANGE_FOR_ACTIVE_AND_DONE_CHILDREN,
  CONFIRM_STATUS_CHANGE_FOR_BLOCKED_BY,
  CONFIRM_STATUS_CHANGE_FOR_DONE_PARENTS,
  CONFIRM_STATUS_CHANGE_FOR_DONE_PARENTS_AND_DONE_CHILDREN,
  CONFIRM_STATUS_CHANGE_FOR_NOT_DONE_CHILDREN,
  CONFIRM_STATUS_CHANGE_FOR_NOT_REQUIRED_CHILDREN,
  CONFIRM_STATUS_CHANGE_FOR_NOT_REQUIRED_PARENTS,
  CONFIRM_STATUS_CHANGE_FOR_NOT_REQUIRED_PARENTS_AND_CHILDREN,
  CONFIRM_STATUS_CHANGE_FOR_NOT_STARTED_PARENTS,
  CONFIRM_STATUS_CHANGE_FOR_NOT_STARTED_PARENTS_AND_NOT_DONE_CHILDREN,
  RECEIVE_TASK_FAILURE,
  RECEIVE_TASK_SUCCESS,
} from '../selected-task/selected-task-actions'

const initialTaskState = {
  isLoaded: false,
  isForbidden: false,
}

export default function statusChangeReducer(state = initialTaskState, action) {
  switch (action.type) {
    case RECEIVE_TASK_SUCCESS:
    case RECEIVE_PROJECT_SUCCESS:
      return {
        ...state,
        isLoaded: true,
        isForbidden: false,
        handleNotRequiredParents: false,
        handleNotRequiredParentsAndChildren: false,
        handleNotRequiredChildren: false,
        handleNotStartedParents: false,
        handleNotDoneChildren: false,
        handleDoneParents: false,
        handleActiveAndDoneChildren: false,
        handleNotStartedParentsAndDoneChildren: false,
        handleDoneParentsAndDoneChildren: false,
        statusChangeTargetTaskId: undefined,
        handleBlockedByTask: false,
        affectedTasks: [],
      }

    case RECEIVE_TASK_FAILURE:
      return { ...state, isLoaded: true, isForbidden: true }

    case CLEAR_TASK:
      return initialTaskState

    case CONFIRM_STATUS_CHANGE_FOR_NOT_REQUIRED_PARENTS:
      return {
        ...state,
        handleNotRequiredParents: true,
        statusChangePayload: action.payload,
        statusChangeTargetTaskId: action.statusChangeTargetTaskId,
        affectedTasks: action.body,
      }
    case CONFIRM_STATUS_CHANGE_FOR_NOT_REQUIRED_PARENTS_AND_CHILDREN:
      return {
        ...state,
        handleNotRequiredParentsAndChildren: true,
        statusChangePayload: action.payload,
        statusChangeTargetTaskId: action.statusChangeTargetTaskId,
        affectedTasks: action.body,
      }
    case CONFIRM_STATUS_CHANGE_FOR_NOT_REQUIRED_CHILDREN:
      return {
        ...state,
        handleNotRequiredChildren: true,
        statusChangePayload: action.payload,
        statusChangeTargetTaskId: action.statusChangeTargetTaskId,
        affectedTasks: action.body,
      }
    case CONFIRM_STATUS_CHANGE_FOR_NOT_STARTED_PARENTS:
      return {
        ...state,
        handleNotStartedParents: true,
        statusChangePayload: action.payload,
        statusChangeTargetTaskId: action.statusChangeTargetTaskId,
        affectedTasks: action.body,
      }

    case CONFIRM_STATUS_CHANGE_FOR_NOT_DONE_CHILDREN:
      return {
        ...state,
        handleNotDoneChildren: true,
        statusChangePayload: action.payload,
        statusChangeTargetTaskId: action.statusChangeTargetTaskId,
        affectedTasks: action.body,
      }

    case CONFIRM_STATUS_CHANGE_FOR_DONE_PARENTS:
      return {
        ...state,
        handleDoneParents: true,
        statusChangePayload: action.payload,
        statusChangeTargetTaskId: action.statusChangeTargetTaskId,
        affectedTasks: action.body,
      }

    case CONFIRM_STATUS_CHANGE_FOR_ACTIVE_AND_DONE_CHILDREN:
      return {
        ...state,
        handleActiveAndDoneChildren: true,
        statusChangePayload: action.payload,
        statusChangeTargetTaskId: action.statusChangeTargetTaskId,
        affectedTasks: action.body,
      }

    case CONFIRM_STATUS_CHANGE_FOR_NOT_STARTED_PARENTS_AND_NOT_DONE_CHILDREN:
      return {
        ...state,
        handleNotStartedParentsAndDoneChildren: true,
        statusChangePayload: action.payload,
        statusChangeTargetTaskId: action.statusChangeTargetTaskId,
        affectedTasks: action.body,
      }

    case CONFIRM_STATUS_CHANGE_FOR_DONE_PARENTS_AND_DONE_CHILDREN:
      return {
        ...state,
        handleDoneParentsAndDoneChildren: true,
        statusChangePayload: action.payload,
        statusChangeTargetTaskId: action.statusChangeTargetTaskId,
        affectedTasks: action.body,
      }

    case CONFIRM_STATUS_CHANGE_FOR_BLOCKED_BY:
      return {
        ...state,
        handleBlockedByTask: true,
        statusChangePayload: action.payload,
        statusChangeTargetTaskId: action.statusChangeTargetTaskId,
        affectedTasks: action.body,
      }

    case CANCEL_CONFIRMATION_DIALOG:
      return {
        ...state,
        handleNotRequiredParents: false,
        handleNotRequiredParentsAndChildren: false,
        handleNotRequiredChildren: false,
        handleNotStartedParents: false,
        handleNotDoneChildren: false,
        handleDoneParents: false,
        handleActiveAndDoneChildren: false,
        handleNotStartedParentsAndDoneChildren: false,
        handleDoneParentsAndDoneChildren: false,
        statusChangeTargetTaskId: undefined,
      }

    default:
      return state
  }
}
