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

import selectedTemplateTaskActions from '../template-task-details/selectedTemplateTaskActions'
import {
  ADD_TEMPLATE_RESOURCE,
  CLEAR_EDITING,
  CLEAR_TEMPLATE_ERROR_MESSAGE,
  DISABLE_IMMEDIATE_ADD_TEMPLATE,
  ENABLE_IMMEDIATE_ADD_TEMPLATE,
  ENTER_DESCRIPTION_EDITING_TEMPLATE,
  ENTER_NAME_EDITING_TEMPLATE,
  NORMAL_MODE,
  RECEIVE_TEMPLATE,
  RECEIVE_TEMPLATE_OVERVIEW,
  RECEIVE_TEMPLATE_TASKS,
  REQUEST_TEMPLATE,
  REQUEST_TEMPLATE_OVERVIEW,
  REQUEST_UPDATE_LEVEL_A_TEMPLATE_TASKS,
  RESET_TEMPLATE_OVERVIEW,
  RESET_TEMPLATE_TASKS_STATE,
  SELECTION_MODE,
  SELECT_TASK_TO_MOVE,
  SHOW_TEMPLATE_COPY_DIALOG,
  SHOW_TEMPLATE_DELETE_DIALOG,
  SHOW_TEMPLATE_EXPORT_DIALOG,
  UPDATE_DELETED_RESOURCE,
  UPDATE_TEMPLATE_FAILURE,
  UPDATE_TEMPLATE_FAVOURITE_FAILURE,
  UPDATE_TEMPLATE_FAVOURITE_SUCCESS,
  UPDATE_TEMPLATE_IMAGE_NO_FETCH,
  UPDATE_TEMPLATE_NAME_NO_FETCH,
  UPDATE_TEMPLATE_SUCCESS,
} from './template-actions'

const initialEditingState = {
  isEditingName: false,
  isEditingDescription: false,
}

const initialOverviewState = {
  errorMessage: '',
  isLoaded: false,
  isLoading: false,
}

const initialTemplateState = {
  immediateAddTask: false,
  areTasksLoaded: false,
  editingState: initialEditingState,
  highlightList: [],
  newTemplateTask: undefined,
  overview: initialOverviewState,
  selectionMode: false,
  template: {},
  templateTasks: [],
  showCopyDialog: false,
  showDeleteDialog: false,
  showExportDialog: false,
}

const getHighlightList = (taskId, taskTree) =>
  flatTaskList(searchTaskNode(taskId, taskTree))

const searchTaskNode = (matchingId, taskList) => {
  const stack = [...taskList]
  while (stack.length) {
    const node = stack.pop()
    if (node.id === matchingId) {
      return node
    }
    node.tasks?.length && stack.push(...node.tasks)
  }
}

const flatTaskList = taskNode => {
  const taskList = []
  const stack = [taskNode]

  while (stack.length) {
    const node = stack.pop()
    taskList.push(node)
    node.tasks?.length && stack.push(...node.tasks)
  }

  return taskList
}

export default function templateReducer(state = initialTemplateState, action) {
  let newState
  switch (action.type) {
    case ENTER_NAME_EDITING_TEMPLATE:
      return {
        ...state,
        editingState: { isEditingName: true, isEditingDescription: false },
      }
    case ENTER_DESCRIPTION_EDITING_TEMPLATE:
      return {
        ...state,
        editingState: { isEditingName: false, isEditingDescription: true },
      }
    case RECEIVE_TEMPLATE_TASKS:
      return {
        ...state,
        templateTasks: action.templateTasks,
        areTasksLoaded: true,
      }
    case REQUEST_TEMPLATE:
      return { ...state }
    case RECEIVE_TEMPLATE:
      return {
        ...state,
        isLoaded: true,
        template: { ...state.template, ...action.template },
      }
    case REQUEST_TEMPLATE_OVERVIEW:
      newState = {
        ...state,
        template: { ...state.template, ...action.template },
      }
      newState.overview = { isLoaded: false, isLoading: true }
      return newState
    case RESET_TEMPLATE_OVERVIEW:
      newState = { ...state }
      newState.overview = initialOverviewState
      newState.editingState = initialEditingState
      return newState
    case CLEAR_EDITING:
      return {
        ...state,
        editingState: initialEditingState,
      }
    case RECEIVE_TEMPLATE_OVERVIEW:
      newState = {
        ...state,
        template: { ...state.template, ...action.template },
      }
      newState.overview = { isLoaded: true, isLoading: false }
      return newState
    case REQUEST_UPDATE_LEVEL_A_TEMPLATE_TASKS:
      return {
        ...state,
        template: {
          ...(state.template ? state.template : {}),
          tasks: action.taskOrder,
        },
        templateTasks: action.taskOrder,
      }
    case RESET_TEMPLATE_TASKS_STATE:
      return {
        ...initialTemplateState,
        selectionMode: state.selectionMode,
        immediateAddTask: state.immediateAddTask,
      }
    case selectedTemplateTaskActions.CREATE_TEMPLATE_TASK_IN_TEMPLATE_CONTEXT_SUCCESS: {
      return {
        ...state,
        template: {
          ...state.template,
          tasks: [...state.template.tasks, action.createdTask],
        },
        newTemplateTask: action.createdTask,
      }
    }
    case selectedTemplateTaskActions.CREATE_TEMPLATE_MILESTONE_IN_TEMPLATE_CONTEXT_SUCCESS: {
      return {
        ...state,
        template: {
          ...state.template,
          tasks: [...state.template.tasks, action.createdTask],
        },
        newTemplateTask: action.createdTask,
      }
    }
    case SELECTION_MODE: {
      return {
        ...state,
        selectionMode: true,
      }
    }
    case NORMAL_MODE: {
      return {
        ...state,

        selectionMode: false,
        highlightList: [],
      }
    }
    case SELECT_TASK_TO_MOVE: {
      return {
        ...state,
        highlightList: getHighlightList(action.taskId, state.templateTasks),
      }
    }
    case UPDATE_TEMPLATE_SUCCESS: {
      return {
        ...state,
        template: {
          ...state.template,
          name: action.template.name,
          description: action.template.description,
          published: action.template.published,
        },
        overview: {
          ...state.overview,
        },
        editingState: initialEditingState,
      }
    }
    case UPDATE_TEMPLATE_FAILURE: {
      return {
        ...state,
        template: {
          ...state.template,
          errorMessage: action.errorMessage,
        },
        overview: {
          ...state.overview,
          errorMessage: action.errorMessage,
        },
      }
    }
    case UPDATE_TEMPLATE_FAVOURITE_SUCCESS: {
      return {
        ...state,
        template: {
          ...state.template,
          isFavourited: action.isFavourited,
        },
        overview: {
          ...state.overview,
        },
        editingState: initialEditingState,
      }
    }
    case UPDATE_TEMPLATE_FAVOURITE_FAILURE: {
      return {
        ...state,
        overview: {
          ...state.overview,
          errorMessage: action.errorMessage,
        },
      }
    }
    case CLEAR_TEMPLATE_ERROR_MESSAGE: {
      return {
        ...state,
        overview: {
          ...state.overview,
          errorMessage: '',
        },
      }
    }
    case ENABLE_IMMEDIATE_ADD_TEMPLATE: {
      return { ...state, immediateAddTask: true }
    }
    case DISABLE_IMMEDIATE_ADD_TEMPLATE: {
      return { ...state, immediateAddTask: false }
    }
    case SHOW_TEMPLATE_DELETE_DIALOG: {
      return {
        ...state,
        showDeleteDialog: action.show,
      }
    }
    case SHOW_TEMPLATE_COPY_DIALOG: {
      return {
        ...state,
        showCopyDialog: action.show,
      }
    }
    case SHOW_TEMPLATE_EXPORT_DIALOG: {
      return {
        ...state,
        showExportDialog: action.show,
      }
    }
    case UPDATE_TEMPLATE_NAME_NO_FETCH:
      return {
        ...state,
        template: {
          ...state.template,
          name: action.name,
        },
      }
    case UPDATE_TEMPLATE_IMAGE_NO_FETCH:
      return {
        ...state,
        template: {
          ...state.template,
          url: action.url,
          urlCredit: action.urlCredit,
          urlCreditName: action.urlCreditName,
        },
      }
    case UPDATE_DELETED_RESOURCE:
      return {
        ...state,
        template: {
          ...state.template,
          resources: state.template.resources.filter(
            resource => resource.id !== action.id
          ),
        },
      }
    case ADD_TEMPLATE_RESOURCE:
      return {
        ...state,
        template: {
          ...state.template,
          resources: [action.resource, ...state.template.resources],
        },
      }
    default:
      return state
  }
}
