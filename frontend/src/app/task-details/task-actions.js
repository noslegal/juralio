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

import { StatusCodes } from 'http-status-codes'
import i18n from 'i18next'
import { addNewCreatedTask } from '../../redux/ducks/improved-taskmap'
import {
  isInImprovedTaskmapContext,
  isInSpecificProjectContext,
  isInSpecificTaskContext,
} from '../../services/helpers/route/route-context-helper'
import { getProjectRedirectSnackbarAction } from '../../services/redirect/ProjectRedirectSnackbarAction'
import { getTaskDetailsRedirectSnackbarAction } from '../../services/redirect/TaskDetailsRedirectSnackbarAction'
import taskService from '../../services/task/task-service'
import { CONFIG, TASK_STATUS } from '../constants'
import { showSnackbar } from '../global-snackbar/global-snackbar-actions'
import { fetchProjectWithPostsAndTaskTeam } from '../project/project-actions'

export const CREATE_TASK = 'CREATE_TASK'
export const CREATE_TASK_SUCCESS = 'CREATE_TASK_SUCCESS'
export const CREATE_TASK_FAILURE = 'CREATE_TASK_FAILURE'
export const SHOW_TASKMAP_DATE_PICKER = 'SHOW_TASKMAP_DATE_PICKER'
export const HIDE_TASKMAP_DATE_PICKER = 'HIDE_TASKMAP_DATE_PICKER'
export const SHOW_TASKMAP_ASSIGNEE_POPOVER = 'SHOW_TASKMAP_ASSIGNEE_POPOVER'
export const HIDE_TASKMAP_ASSIGNEE_POPOVER = 'HIDE_TASKMAP_ASSIGNEE_POPOVER'
export const SHOW_TASKMAP_TASK_PREVIEW = 'SHOW_TASKMAP_TASK_PREVIEW'
export const HIDE_TASKMAP_TASK_PREVIEW = 'HIDE_TASKMAP_TASK_PREVIEW'
export const CREATE_TASK_IN_TASK_CONTEXT_SUCCESS =
  'CREATE_TASK_IN_TASK_CONTEXT_SUCCESS'
export const CREATE_TASK_IN_PROJECT_CONTEXT_SUCCESS =
  'CREATE_TASK_IN_PROJECT_CONTEXT_SUCCESS'

export const UPDATE_PREVIEW_TASK_TEAM = 'UPDATE_PREVIEW_TASK_TEAM'

function createTask() {
  return {
    type: CREATE_TASK,
  }
}

function createTaskSuccess(json) {
  return {
    type: CREATE_TASK_SUCCESS,
    task: json,
  }
}

function createTaskFailure(message) {
  return {
    type: CREATE_TASK_FAILURE,
    message: message,
  }
}

function createTaskInTaskContextSuccess(payload) {
  return {
    type: CREATE_TASK_IN_TASK_CONTEXT_SUCCESS,
    createdTask: payload,
  }
}

function createTaskInProjectContextSuccess(payload) {
  return {
    type: CREATE_TASK_IN_PROJECT_CONTEXT_SUCCESS,
    createdTask: payload,
  }
}

export function showTaskmapDatePickerForTask(payload) {
  return {
    type: SHOW_TASKMAP_DATE_PICKER,
    selectedTask: payload.task,
    dateType: payload.dateType,
    showTaskPreview: payload.showTaskPreview,
  }
}

export function hideTaskmapDatePickerForTask() {
  return {
    type: HIDE_TASKMAP_DATE_PICKER,
  }
}

export const showTaskmapTaskAssigneeContainer = payload => {
  return {
    type: SHOW_TASKMAP_ASSIGNEE_POPOVER,
    selectedTask: payload.task,
    position: payload.position,
    showAssigneePopover: true,
  }
}

export const hideTaskmapTaskAssigneeContainer = () => {
  return {
    type: HIDE_TASKMAP_ASSIGNEE_POPOVER,
    selectedTask: null,
    showAssigneePopover: false,
  }
}

const showTaskCreatedSnackbar = (
  matterId,
  projectId,
  task,
  taskCount,
  isMilestone = false
) => {
  let type = (
    isMilestone ? i18n.t('entity.milestone') : i18n.t('entity.task')
  ).toLowerCase()

  if (task.status === TASK_STATUS.DONE && taskCount === CONFIG.SUBTASK_LIMIT) {
    return showSnackbar(
      i18n.t('taskActions.maxSubtasksDoneTaskCreated', { type: type }),
      getTaskDetailsRedirectSnackbarAction(matterId, projectId, task.id)
    )
  }

  if (task.status === TASK_STATUS.DONE) {
    return showSnackbar(
      i18n.t('taskActions.doneTaskCreated', { type: type }),
      getTaskDetailsRedirectSnackbarAction(matterId, projectId, task.id)
    )
  }

  if (taskCount === CONFIG.SUBTASK_LIMIT) {
    return showSnackbar(
      i18n.t('taskActions.maxSubtasksTaskCreated', { type: type }),
      getTaskDetailsRedirectSnackbarAction(matterId, projectId, task.id)
    )
  }

  return showSnackbar(
    i18n.t('taskActions.taskCreated', { type: type }),
    getTaskDetailsRedirectSnackbarAction(matterId, projectId, task.id)
  )
}

const showTasksCreatedInProjectSnackbar = (
  matterId,
  projectId,
  selectedTaskId,
  tasks
) => {
  let type = i18n.t('entity.task').toLowerCase()
  if (tasks && tasks[0].status === TASK_STATUS.DONE) {
    return showSnackbar(
      i18n.t('taskActions.doneTasksCreatedInProject', { type: type }),
      getProjectRedirectSnackbarAction(matterId, projectId, selectedTaskId)
    )
  }

  return showSnackbar(
    i18n.t('taskActions.tasksCreatedInProject', { type: type }),
    getProjectRedirectSnackbarAction(matterId, projectId, selectedTaskId)
  )
}

export const createNewTask =
  (matterId, projectId, parentId, status, name, isMilestone = false) =>
  dispatch => {
    dispatch(createTask())
    return taskService
      .createTask(matterId, projectId, parentId, status, name, isMilestone)
      .then(async response => {
        if (response.body.error_type === 'TASK_LIMIT') {
          return dispatch(createTaskFailure(response.body.message))
        }
        if (response.status !== StatusCodes.CREATED) {
          return dispatch(createTaskFailure())
        }
        if (parentId && isInSpecificTaskContext(parentId)) {
          response.body.createdInContext = true
          dispatch(createTaskInTaskContextSuccess(response.body))
          dispatch(fetchProjectWithPostsAndTaskTeam(matterId, projectId))
          return 1
        }

        if (isInSpecificProjectContext(projectId)) {
          dispatch(createTaskInProjectContextSuccess(response.body))
          if (isInImprovedTaskmapContext()) {
            dispatch(addNewCreatedTask(response.body))
          }
        } else {
          dispatch(createTaskSuccess(response.body))
        }

        if (parentId) {
          const parentTask = await taskService.getTaskById(
            matterId,
            projectId,
            parentId,
            true
          )

          if (isInSpecificProjectContext(projectId) === false) {
            return dispatch(
              showTaskCreatedSnackbar(
                matterId,
                projectId,
                response.body,
                parentTask.body.tasks.length,
                isMilestone
              )
            )
          }
        }

        if (isInSpecificProjectContext(projectId) === false) {
          return dispatch(
            showTaskCreatedSnackbar(
              matterId,
              projectId,
              response.body,
              null,
              isMilestone
            )
          )
        }

        return { action: { props: { taskId: response.body.id } } }
      })
  }

export const createTaskFromTemplateTask =
  (
    matterId,
    projectId,
    templateTaskId,
    parentTaskId,
    includePosts,
    includeDescriptions
  ) =>
  async dispatch => {
    const response = await taskService.createTaskFromTemplateTask(
      matterId,
      projectId,
      templateTaskId,
      parentTaskId,
      includePosts,
      includeDescriptions
    )
    if (response.status === StatusCodes.CREATED) {
      dispatch(createTaskSuccess(response.body))
      return dispatch(
        showTaskCreatedSnackbar(matterId, projectId, response.body, null)
      )
    } else if (response.body.error_type === 'TASK_LIMIT') {
      return dispatch(showSnackbar(response.body.message))
    }
  }

export const createTasksFromTemplateProject =
  (
    matterId,
    projectId,
    parentTaskId,
    templateProjectId,
    includePosts,
    includeDescriptions
  ) =>
  async dispatch => {
    const response = await taskService.createTasksFromTemplateProject(
      matterId,
      projectId,
      parentTaskId,
      templateProjectId,
      includePosts,
      includeDescriptions
    )
    if (response.status === StatusCodes.CREATED) {
      dispatch(createTaskSuccess(response.body))
      return dispatch(
        showTasksCreatedInProjectSnackbar(
          matterId,
          projectId,
          parentTaskId,
          response.body
        )
      )
    } else if (response.body.error_type === 'TASK_LIMIT') {
      return dispatch(showSnackbar(response.body.message))
    }
  }

export const showTaskPreview = (task, position, viewOnly) => {
  return {
    type: SHOW_TASKMAP_TASK_PREVIEW,
    selectedTask: task,
    position: position,
    viewOnly: viewOnly,
  }
}

export const hideTaskPreview = () => {
  return {
    type: HIDE_TASKMAP_TASK_PREVIEW,
  }
}

export const updatePreviewTaskTeam = team => {
  return {
    type: UPDATE_PREVIEW_TASK_TEAM,
    team: team,
  }
}
