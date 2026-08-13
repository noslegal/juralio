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
  RECEIVE_ORG_PROJECTS_SUCCESS,
  REQUEST_ORG_PROJECTS,
  UPDATE_PROJECT_IN_LIST_SUCCESS_ORG,
} from '../matter-details/projects/projects-actions'
import { CREATE_TASK_IN_PROJECT_CONTEXT_SUCCESS } from '../task-details/task-actions'
import { CANCEL_CONFIRMATION_DIALOG } from '../task-map/selected-task/selected-task-actions'
import {
  CLEAR_EDITING,
  CLEAR_PROJECT,
  CLEAR_PROJECT_ERROR_MESSAGE,
  CLEAR_PROJECT_OVERVIEW,
  DISABLE_IMMEDIATE_ADD_PROJECT,
  ENABLE_IMMEDIATE_ADD_PROJECT,
  ENTER_DESCRIPTION_EDITING_PROJECT,
  ENTER_NAME_EDITING_PROJECT,
  EXIT_PROJECT_EDITING,
  RECEIVE_NEW_TASKS_FAILURE,
  RECEIVE_NEW_TASKS_SUCCESS,
  RECEIVE_PROJECT_FAILURE,
  RECEIVE_PROJECT_OVERVIEW_FAILURE,
  RECEIVE_PROJECT_OVERVIEW_SUCCESS,
  RECEIVE_PROJECT_SUCCESS,
  RECEIVE_WORKSTREAM_OVERVIEW,
  RECEIVE_WORKSTREAM_OVERVIEW_FAILURE,
  REQUEST_NEW_TASKS,
  REQUEST_PROJECT,
  REQUEST_PROJECT_OVERVIEW,
  REQUEST_UPDATE_LEVEL_A_TASKS,
  REQUEST_WORKSTREAM_OVERVIEW,
  SET_PROJECT_DETAILS,
  TASKMAP_NORMAL_MODE,
  TASKMAP_SELECTION_MODE,
  TASKMAP_SELECT_TASK_TO_MOVE,
  UPDATE_PROJECT_NAME_FAILURE,
  UPDATE_PROJECT_NAME_SUCCESS,
  UPDATE_PROJECT_SUCCESS,
  UPDATE_TASK_INFO,
  UPDATE_WORKSTEAM_NAME_NO_FETCH,
} from './project-actions'

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

const getHighlightList = (taskId, taskTree) =>
  flatTaskList(searchTaskNode(taskId, taskTree))

const noRefreshTaskUpdate = (task, tasks) => {
  const flatList = flatTaskList(task)
  flatList.forEach(t => {
    let _task = searchTaskNode(t.id, tasks)
    if (_task) {
      _task.plannedStartDate = t.plannedStartDate
      _task.plannedEndDate = t.plannedEndDate
      _task.actualStartDate = t.actualStartDate
      _task.actualEndDate = t.actualEndDate
    }
  })
  return tasks
}

const initialEditingState = {
  isEditingName: false,
  isEditingDescription: false,
}

const initialOverviewState = {
  isLoaded: false,
  isLoading: false,
  isForbidden: false,
  errorMessage: '',
}

const initialNewTasksState = {
  isLoaded: false,
  isLoading: false,
}

const initialProjectState = {
  immediateAddTask: false,
  isLoaded: false,
  isLoading: false,
  isForbidden: false,
  editingState: initialEditingState,
  overview: initialOverviewState,
  newTasks: initialNewTasksState,
  orgProjects: [],
  selectionMode: false,
  workstreamOverview: undefined,
}

const updateProjectInListORG = (projects, projectToUpdate) => {
  return projects.map(projectInList =>
    projectInList.id === projectToUpdate.id ? projectToUpdate : projectInList
  )
}

export default function projectReducer(state = initialProjectState, action) {
  let newProjectState
  switch (action.type) {
    case ENTER_NAME_EDITING_PROJECT:
      return {
        ...state,
        editingState: { isEditingName: true, isEditingDescription: false },
      }
    case ENTER_DESCRIPTION_EDITING_PROJECT:
      return {
        ...state,
        editingState: { isEditingName: false, isEditingDescription: true },
      }
    case EXIT_PROJECT_EDITING:
      return {
        ...state,
        editingState: { isEditingName: false, isEditingDescription: false },
      }
    case REQUEST_PROJECT:
      return {
        ...state,
        isLoaded: false,
        isForbidden: false,
        isLoading: true,
        description: '',
      }
    case REQUEST_PROJECT_OVERVIEW:
      return {
        ...state,
        overview: {
          ...state.overview,
          isLoaded: false,
          isLoading: true,
        },
      }
    case REQUEST_NEW_TASKS:
      return {
        ...state,
        newTasks: {
          ...state.newTasks,
          isLoaded: false,
          isLoading: true,
        },
      }
    case RECEIVE_PROJECT_SUCCESS:
      newProjectState = {
        ...state,
        ...action.project,
        matterId: action.matterId,
        isLoaded: true,
        isForbidden: false,
        isLoading: false,
        previousTaskOrder: undefined,
      }
      return newProjectState
    case SET_PROJECT_DETAILS:
      return {
        ...state,
        ...action.project,
      }
    case REQUEST_UPDATE_LEVEL_A_TASKS:
      return {
        ...state,
        previousTaskOrder: [...state.tasks],
        tasks: action.taskOrder,
      }
    case CANCEL_CONFIRMATION_DIALOG:
      return {
        ...state,
        ...(state.previousTaskOrder && { tasks: state.previousTaskOrder }),
      }
    case RECEIVE_PROJECT_OVERVIEW_SUCCESS:
      newProjectState = {
        ...state,
        ...action.projectOverview,
        overview: {
          ...state.overview,
          isLoaded: true,
          isLoading: false,
          isForbidden: false,
        },
      }
      return newProjectState
    case RECEIVE_NEW_TASKS_SUCCESS:
      return {
        ...state,
        newTasks: {
          ...state.newTasks,
          newTasks: action.newTasks,
          isLoaded: true,
          isLoading: false,
        },
      }
    case RECEIVE_PROJECT_OVERVIEW_FAILURE:
      newProjectState = {
        ...state,
        ...action.projectOverview,
        overview: {
          ...state.overview,
          isLoaded: true,
          isLoading: false,
          isForbidden: true,
        },
      }
      return newProjectState
    case RECEIVE_NEW_TASKS_FAILURE:
      return {
        ...state,
        newTasks: {
          ...state.newTasks,
          newTasks: action.newTasks,
          isLoaded: true,
          isLoading: false,
        },
      }
    case RECEIVE_PROJECT_FAILURE:
      return { ...state, isLoaded: true, isForbidden: true, isLoading: false }
    case CLEAR_PROJECT:
      newProjectState = initialProjectState
      newProjectState.overview = state.overview
      newProjectState.immediateAddTask = state.immediateAddTask
      return newProjectState
    case CLEAR_PROJECT_OVERVIEW:
      return {
        ...state,
        overview: initialOverviewState,
        editingState: initialEditingState,
      }
    case CLEAR_EDITING:
      return {
        ...state,
        editingState: initialEditingState,
      }
    case CREATE_TASK_IN_PROJECT_CONTEXT_SUCCESS:
      return { ...state, newTask: action.createdTask }
    case UPDATE_PROJECT_SUCCESS:
      newProjectState = {
        ...state,
        name: action.project.name,
        description: action.project.description,
        overview: {
          ...state.overview,
        },
        editingState: initialEditingState,
      }
      return newProjectState
    case UPDATE_PROJECT_NAME_SUCCESS:
      newProjectState = {
        ...state,
        name: action.project.name,
        overview: {
          ...state.overview,
        },
      }
      return newProjectState
    case UPDATE_PROJECT_NAME_FAILURE:
      return {
        ...state,
        overview: {
          ...state.overview,
          errorMessage: action.errorMessage,
        },
      }
    case CLEAR_PROJECT_ERROR_MESSAGE:
      return {
        ...state,
        overview: {
          ...state.overview,
          errorMessage: '',
        },
      }
    case ENABLE_IMMEDIATE_ADD_PROJECT: {
      return { ...state, immediateAddTask: true }
    }
    case DISABLE_IMMEDIATE_ADD_PROJECT: {
      return { ...state, immediateAddTask: false }
    }
    case REQUEST_ORG_PROJECTS:
      return { ...state }
    case RECEIVE_ORG_PROJECTS_SUCCESS:
      return { ...state, orgProjects: [...action.projects] }
    case UPDATE_PROJECT_IN_LIST_SUCCESS_ORG:
      return {
        ...state,
        orgProjects: updateProjectInListORG(state.orgProjects, action.project),
      }
    case TASKMAP_SELECTION_MODE: {
      return {
        ...state,
        selectionMode: true,
        originalWorkstreamName: action.originalWorkstreamName,
        newWorkstreamName: action.newWorkstreamName,
        isWorkstreamPrivate: action.isWorkstreamPrivate,
        privateWorkstreamUsers: action.privateWorkstreamUsers,
      }
    }
    case TASKMAP_NORMAL_MODE: {
      return {
        ...state,

        selectionMode: false,
        highlightList: [],
      }
    }
    case TASKMAP_SELECT_TASK_TO_MOVE: {
      return {
        ...state,
        highlightList: getHighlightList(action.taskId, action.taskTree),
      }
    }
    case UPDATE_WORKSTEAM_NAME_NO_FETCH: {
      return {
        ...state,
        name: action.name,
      }
    }
    case REQUEST_WORKSTREAM_OVERVIEW:
      if (action.id !== state.overview?.id) {
        return { ...state, workstreamOverview: undefined }
      } else {
        return { ...state }
      }
    case RECEIVE_WORKSTREAM_OVERVIEW:
      return {
        ...state,
        workstreamOverview: action.overview,
      }
    case RECEIVE_WORKSTREAM_OVERVIEW_FAILURE:
      return {
        ...state,
        workstreamOverview: { isForbidden: true },
      }
    case UPDATE_TASK_INFO:
      return {
        ...state,
        tasks: noRefreshTaskUpdate(action.task, state.tasks),
      }
    default:
      return state
  }
}
