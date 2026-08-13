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

import actions from './selectedTemplateTaskActions'
export const initialTemplateTaskState = {
  id: null,
  isLoaded: false,
  isDeleted: false,
  tasks: [],
  copiedTask: null,
}

export default function selectedTemplateTaskReducer(
  state = initialTemplateTaskState,
  action
) {
  let updatedState
  switch (action.type) {
    case actions.RECEIVE_TEMPLATE_TASK:
      return {
        ...state,
        ...action.templateTask,
        isLoaded: true,
      }
    case actions.DELETE_TEMPLATE_TASK_SUCCESS:
      updatedState = { ...state }
      updatedState.tasks = state.tasks.filter(
        task => task.id !== action.templateTaskId
      )
      return {
        ...updatedState,
        isDeleted: action.deletingSelectedTemplateTask,
      }
    case actions.REQUEST_UPDATE_TEMPLATE_TASKS:
      return {
        ...state,
        tasks: action.taskOrder,
      }
    case actions.CREATE_TEMPLATE_TASK_IN_TASK_CONTEXT_SUCCESS:
      updatedState = { ...state }
      updatedState.tasks = state.tasks.slice(0)
      updatedState.tasks.push(action.createdTask)
      action.createdTask.parent = { id: state.id, tasks: state.tasks }
      return updatedState
    case actions.CREATE_TEMPLATE_MILESTONE_IN_TASK_CONTEXT_SUCCESS:
      updatedState = { ...state }
      updatedState.tasks = state.tasks.slice(0)
      updatedState.tasks.push(action.createdTask)
      action.createdTask.parent = { id: state.id, tasks: state.tasks }
      return updatedState
    case actions.TEMPLATE_TASK_RESET_STATE:
      return initialTemplateTaskState
    case actions.UPDATE_TEMPLATE_TASKS: {
      return { ...state, ...action.templateTask }
    }
    case actions.SUBTASK_MOVED_SUCCESS: {
      updatedState = { ...state }
      updatedState.tasks = state.tasks.filter(
        task => task.id !== action.movedSubtaskId
      )
      return updatedState
    }
    case actions.COPY_TEMPLATE_TASK_SUCCESS:
      const newTask = action.templateTask
      newTask.parent = { id: state.id, tasks: state.tasks }
      return { ...state, copiedTask: newTask, tasks: [...state.tasks, newTask] }
    default:
      return state
  }
}
