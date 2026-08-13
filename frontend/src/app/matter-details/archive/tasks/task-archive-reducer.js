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

import {
  GET_ARCHIVED_TASK_SUCCESS,
  RECEIVE_UNARCHIVE_TASK_SUCCESS,
  RECEIVE_UNARCHIVE_TASK_FAILURE,
  CLEAR_UNARCHIVE_TASK_STATUS,
  RESET_ARCHIVED_TASKS_STATUS,
  UNARCHIVE_TASK_KNOCK_ON_EFFECTS,
  CLEAR_KNOCK_ON_EFFECTS,
} from './task-archive-actions'

const initialState = {
  unarchive: {
    archiveTask: undefined,
    error: undefined,
    knockOnEffects: undefined,
  },
}

const taskArchiveReducer = (state, action) => {
  if (!state) {
    return initialState
  }

  switch (action.type) {
    case RESET_ARCHIVED_TASKS_STATUS:
      return { ...initialState }
    case GET_ARCHIVED_TASK_SUCCESS:
      return {
        ...state,
        unarchive: {
          ...state.unarchive,
          archiveTask: action.archiveTask,
        },
      }
    case RECEIVE_UNARCHIVE_TASK_SUCCESS:
      return {
        ...state,
        unarchive: {
          ...state.unarchive,
          archiveTask: action.archiveTask,
          error: false,
          knockOnEffects: undefined,
        },
      }
    case RECEIVE_UNARCHIVE_TASK_FAILURE:
      return {
        ...state,
        unarchive: {
          ...state.unarchive,
          error: action.error,
          knockOnEffects: undefined,
        },
      }
    case CLEAR_UNARCHIVE_TASK_STATUS:
      return {
        ...state,
        unarchive: {
          ...state.unarchive,
          error: undefined,
          knockOnEffects: undefined,
        },
      }
    case UNARCHIVE_TASK_KNOCK_ON_EFFECTS:
      return { ...state, knockOnEffects: action.knockOnEffects }
    case CLEAR_KNOCK_ON_EFFECTS:
      return { ...state, knockOnEffects: undefined }

    default:
      return state
  }
}

export default taskArchiveReducer
