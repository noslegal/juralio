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
  fetchTaskmapStructure,
  //fetchTaskmapStructure,
  fetchTemplateTaskmapStructure,
  updateTaskmapStructure,
} from './improved-taskmap'

const initialTaskmapInteractionsState = {
  rename: false,
  taskId: null,
  dragging: false,
  move: false,
  confirmed: false,
  preview: false,
  dates: false,
  options: false,
  complexMoveDetails: {},
}

const TASKMAP_ACTIONS = {
  REQUEST_RENAME: 'taskmap-interactions/REQUEST_RENAME',
  COMPLETE_RENAME: 'taskmap-interactions/COMPLETE_RENAME',
  REQUEST_DRAG: 'taskmap-interactions/REQUEST_DRAG',
  COMPLETE_DRAG: 'taskmap-interactions/COMPLETE_DRAG',
  INSTIGATE_MOVE: 'taskmap-interactions/INSTIGATE_MOVE',
  REQUEST_MOVE: 'taskmap-interactions/REQUEST_MOVE',
  PERFORM_MOVE: 'taskmap-interactions/PERFORM_MOVE',
  CANCEL_MOVE: 'taskmap-interactions/CANCEL_MOVE',
  REQUEST_PREVIEW: 'taskmap-interactions/REQUEST_PREVIEW',
  CLOSE_PREVIEW: 'taskmap-interactions/CLOSE_PREVIEW',
  REQUEST_DATE_PICKER: 'taskmap-interactions/REQUEST_DATE_PICKER',
  CLOSE_DATE_PICKER: 'taskmap-interactions/CLOSE_DATE_PICKER',
  REQUEST_OPTIONS: 'taskmap-interactions/REQUEST_OPTIONS',
  CLOSE_OPTIONS: 'taskmap-interactions/CLOSE_OPTIONS',
  REQUEST_MOVE_INTO_SIBLINGS: 'taskmap-interactions/REQUEST_MOVE_INTO_SIBLINGS',
}

export default function reducer(
  state = initialTaskmapInteractionsState,
  action = {}
) {
  switch (action.type) {
    case TASKMAP_ACTIONS.REQUEST_RENAME:
      return {
        ...state,
        rename: true,
        taskId: action.taskId,
      }
    case TASKMAP_ACTIONS.COMPLETE_RENAME:
      return {
        ...state,
        rename: false,
        taskId: null,
      }
    case TASKMAP_ACTIONS.REQUEST_DRAG:
      return {
        ...state,
        dragging: true,
        taskId: action.taskId,
      }
    case TASKMAP_ACTIONS.COMPLETE_DRAG:
      return {
        ...state,
        dragging: false,
        taskId: null,
      }
    case TASKMAP_ACTIONS.REQUEST_MOVE:
      return {
        ...state,
        move: true,
        taskId: action.taskId,
      }
    case TASKMAP_ACTIONS.INSTIGATE_MOVE:
      return {
        ...state,
        move: true,
        taskId: action.taskId,
        confirmed: true,
      }
    case TASKMAP_ACTIONS.PERFORM_MOVE:
      return {
        ...state,
        move: false,
        taskId: null,
        confirmed: false,
        complexMoveDetails: {},
      }
    case TASKMAP_ACTIONS.CANCEL_MOVE:
      return {
        ...state,
        move: false,
        taskId: false,
        confirmed: false,
        complexMoveDetails: {},
      }
    case TASKMAP_ACTIONS.REQUEST_PREVIEW:
      return {
        ...state,
        preview: true,
        taskId: action.taskId,
      }
    case TASKMAP_ACTIONS.CLOSE_PREVIEW:
      return { ...state, preview: false, taskId: null }
    case TASKMAP_ACTIONS.REQUEST_DATE_PICKER:
      return {
        ...state,
        dates: true,
        taskId: action.taskId,
      }
    case TASKMAP_ACTIONS.CLOSE_DATE_PICKER:
      return {
        ...state,
        dates: false,
      }
    case TASKMAP_ACTIONS.REQUEST_OPTIONS:
      return {
        ...state,
        options: true,
        taskId: action.taskId,
      }
    case TASKMAP_ACTIONS.CLOSE_OPTIONS:
      return {
        ...state,
        options: false,
        taskId: action.clearSelectedTask ? null : state.taskId,
      }
    case TASKMAP_ACTIONS.REQUEST_MOVE_INTO_SIBLINGS:
      return {
        ...state,
        move: true,
        taskId: action.taskId,
        complexMoveDetails: {
          newParentId: action.newParentId,
          insertIndex: action.insertIndex,
        },
      }
    default:
      return state
  }
}

const creators = {
  requestMoveIntoSiblings(taskId, newParentId, insertIndex) {
    return {
      type: TASKMAP_ACTIONS.REQUEST_MOVE_INTO_SIBLINGS,
      taskId: taskId,
      newParentId: newParentId,
      insertIndex: insertIndex,
    }
  },
  requestTaskRename(taskId) {
    return {
      type: TASKMAP_ACTIONS.REQUEST_RENAME,
      taskId: taskId,
    }
  },
  completeTaskRename() {
    return {
      type: TASKMAP_ACTIONS.COMPLETE_RENAME,
    }
  },
  requestTaskDrag(taskId) {
    return {
      type: TASKMAP_ACTIONS.REQUEST_DRAG,
      taskId: taskId,
    }
  },
  completeTaskDrag() {
    return {
      type: TASKMAP_ACTIONS.COMPLETE_DRAG,
    }
  },
  requestMove(taskId) {
    return {
      type: TASKMAP_ACTIONS.REQUEST_MOVE,
      taskId: taskId,
    }
  },
  instigateMove(taskId) {
    return {
      type: TASKMAP_ACTIONS.INSTIGATE_MOVE,
      taskId: taskId,
    }
  },
  performMove() {
    return {
      type: TASKMAP_ACTIONS.PERFORM_MOVE,
    }
  },
  cancelMove() {
    return {
      type: TASKMAP_ACTIONS.CANCEL_MOVE,
    }
  },
  requestPreview(taskId) {
    return {
      type: TASKMAP_ACTIONS.REQUEST_PREVIEW,
      taskId: taskId,
    }
  },
  closePreview() {
    return {
      type: TASKMAP_ACTIONS.CLOSE_PREVIEW,
    }
  },
  requestDates(taskId) {
    return {
      type: TASKMAP_ACTIONS.REQUEST_DATE_PICKER,
      taskId: taskId,
    }
  },
  closeDates() {
    return {
      type: TASKMAP_ACTIONS.CLOSE_DATE_PICKER,
    }
  },
  requestOptions(taskId) {
    return {
      type: TASKMAP_ACTIONS.REQUEST_OPTIONS,
      taskId: taskId,
    }
  },
  closeOptions(clearSelectedTask) {
    return {
      type: TASKMAP_ACTIONS.CLOSE_OPTIONS,
      clearSelectedTask: clearSelectedTask,
    }
  },
}

export const requestTaskRename = taskId => dispatch => {
  dispatch(creators.requestTaskRename(taskId))
}

export const completeTaskRename = () => dispatch => {
  dispatch(creators.completeTaskRename())
}

export const requestTaskDrag = taskId => dispatch => {
  dispatch(creators.requestTaskDrag(taskId))
}

export const completeTaskDrag = () => dispatch => {
  dispatch(creators.completeTaskDrag())
}

export const instigateMove = taskId => dispatch => {
  dispatch(creators.instigateMove(taskId))
}

export const requestMove = taskId => dispatch => {
  dispatch(creators.requestMove(taskId))
}

export const requestMoveIntoSiblings =
  (taskId, newParentId, insertIndex) => dispatch => {
    dispatch(creators.requestMoveIntoSiblings(taskId, newParentId, insertIndex))
  }

export const performMove =
  (matterId, workstreamId, structure, taskContent, force, doFetch) =>
  dispatch => {
    dispatch(creators.performMove())
    if (!force) {
      dispatch(
        updateTaskmapStructure(
          structure,
          matterId,
          workstreamId,
          true,
          taskContent
        )
      )
    } else if (doFetch) {
      dispatch(fetchTaskmapStructure(matterId, workstreamId, true, true))
    }
  }
export const performTemplateMove = templateId => dispatch => {
  dispatch(creators.performMove())
  dispatch(fetchTemplateTaskmapStructure(templateId))
}

export const cancelMove = () => dispatch => {
  dispatch(creators.cancelMove())
}

export const openPreview = taskId => dispatch => {
  dispatch(creators.requestPreview(taskId))
}
export const closePreview = () => dispatch => {
  dispatch(creators.closePreview())
}
export const openDatePicker = taskId => dispatch => {
  dispatch(creators.requestDates(taskId))
}
export const closeDatePicker = () => dispatch => {
  dispatch(creators.closeDates())
}
export const requestOptionsMenu = taskId => dispatch => {
  dispatch(creators.requestOptions(taskId))
}
export const closeOptionsMenu =
  (clearSelectedTask = true) =>
  dispatch => {
    dispatch(creators.closeOptions(clearSelectedTask))
  }
