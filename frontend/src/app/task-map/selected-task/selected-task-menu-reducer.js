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
  ARCHIVE_TASK,
  ARCHIVE_TASK_SUCCESS,
  MOVE_TASK_FAILURE,
  COPY_TASK_SUCCESS,
  SELECTED_TASK_RESET_STATE,
  CLEAR_MOVE_TASK_ERROR,
  MOVE_TASK_KNOCK_ON_EFFECTS,
} from './selected-task-menu-actions'

const initialMenuState = {
  archiveComplete: false,
  copiedTask: undefined,
  error: '',
  knockOnEffects: undefined,
}

export default function selectedTaskMenuReducer(
  state = initialMenuState,
  action
) {
  switch (action.type) {
    case ARCHIVE_TASK:
      return { ...state, archiveComplete: false }
    case ARCHIVE_TASK_SUCCESS:
      return {
        ...state,
        archiveComplete: true,
      }
    case MOVE_TASK_FAILURE:
      return { ...state, error: action.error }
    case CLEAR_MOVE_TASK_ERROR:
      return { ...state, error: '' }
    case COPY_TASK_SUCCESS:
      return { ...state, copiedTask: action.task }
    case SELECTED_TASK_RESET_STATE:
      return initialMenuState
    case MOVE_TASK_KNOCK_ON_EFFECTS:
      return { ...state, knockOnEffects: action.knockOnEffects }
    default:
      return state
  }
}
