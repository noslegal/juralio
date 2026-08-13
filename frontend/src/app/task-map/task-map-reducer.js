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
  HIDE_TASKMAP_ASSIGNEE_POPOVER,
  HIDE_TASKMAP_DATE_PICKER,
  HIDE_TASKMAP_TASK_PREVIEW,
  SHOW_TASKMAP_ASSIGNEE_POPOVER,
  SHOW_TASKMAP_DATE_PICKER,
  SHOW_TASKMAP_TASK_PREVIEW,
} from '../task-details/task-actions'

const initialTaskState = {
  selectedTask: null,
  dateType: null,
  showAssigneePopover: false,
  showTaskPreview: false,
  position: { left: 0, top: 0 },
  previewPosition: { left: 0, top: 0 },
  viewOnly: false,
}

export default function taskMapReducer(state = initialTaskState, action) {
  switch (action.type) {
    case SHOW_TASKMAP_DATE_PICKER:
      return {
        ...state,
        selectedTask: action.selectedTask,
        dateType: action.dateType,
        showTaskPreview: action.showTaskPreview,
      }
    case HIDE_TASKMAP_DATE_PICKER:
      return {
        ...state,
        dateType: null,
      }
    case SHOW_TASKMAP_ASSIGNEE_POPOVER:
      return {
        ...state,
        selectedTask: action.selectedTask,
        position: action.position,
        showAssigneePopover: true,
        showTaskPreview: false,
      }
    case HIDE_TASKMAP_ASSIGNEE_POPOVER:
      return {
        ...state,
        selectedTask: null,
        position: { left: 0, top: 0 },
        showAssigneePopover: false,
      }
    case SHOW_TASKMAP_TASK_PREVIEW:
      return {
        ...state,
        showTaskPreview: true,
        previewPosition: action.position,
        selectedTask: action.selectedTask,
        viewOnly: action.viewOnly,
      }
    case HIDE_TASKMAP_TASK_PREVIEW:
      return {
        ...state,
        showTaskPreview: false,
        showAssigneePopover: false,
        selectedTask: null,
        previewPosition: { left: 0, top: 0 },
      }
    default:
      return state
  }
}
