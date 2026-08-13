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
import {
  isInSpecificTaskContext,
  isInTaskmapContext,
} from '../../services/helpers/route/route-context-helper'
import { getTemplateTaskDetailsRedirectSnackbarAction } from '../../services/redirect/TemplateTaskDetailsRedirectSnackbarAction'
import templateService from '../../services/template/template-service'
import { showSnackbar } from '../global-snackbar/global-snackbar-actions'
import { getTypeObject } from '../template/project-creation/action-helper'
import {
  fetchTemplate,
  fetchTemplateOverviewWithPosts,
  requestUpdateLevelATemplateTasks,
} from '../template/template-actions'
import actions from './selectedTemplateTaskActions'
import { templateMapRedirectPath } from '../../services/redirect/TemplateMapRedirect'
import { Button } from '@mui/material'

const resetState = () => getTypeObject(actions.TEMPLATE_TASK_RESET_STATE)
const createTemplateTask = () => getTypeObject(actions.CREATE_TEMPLATE_TASK)
const requestTemplateTask = () => getTypeObject(actions.REQUEST_TEMPLATE_TASK)
const deleteTemplateTasks = () => getTypeObject(actions.DELETE_TEMPLATE_TASK)

const subTaskMovedSuccess = movedSubtaskData =>
  getTypeObject(actions.SUBTASK_MOVED_SUCCESS, movedSubtaskData)

const deleteTemplateTaskSuccess = (
  deletingSelectedTemplateTask,
  templateTaskId
) =>
  getTypeObject(actions.DELETE_TEMPLATE_TASK_SUCCESS, {
    deletingSelectedTemplateTask,
    templateTaskId,
  })
const copyTemplateTasks = () => getTypeObject(actions.COPY_TEMPLATE_TASK)
const requestMoveTemplateTask = () =>
  getTypeObject(actions.REQUEST_MOVE_TEMPLATE_TASK)
const copyTemplateTaskSuccess = json =>
  getTypeObject(actions.COPY_TEMPLATE_TASK_SUCCESS, {
    templateTask: json,
  })
const receiveTemplateTask = json =>
  getTypeObject(actions.RECEIVE_TEMPLATE_TASK, {
    templateTask: json,
  })
const requestUpdateTemplateTasks = (templateId, payload) =>
  getTypeObject(actions.REQUEST_UPDATE_TEMPLATE_TASKS, {
    ...payload,
  })
const updateTemplateTasksAction = json =>
  getTypeObject(actions.UPDATE_TEMPLATE_TASKS, {
    templateTask: json,
  })

const createTemplateTaskInTaskContextSuccess = payload =>
  getTypeObject(actions.CREATE_TEMPLATE_TASK_IN_TASK_CONTEXT_SUCCESS, {
    createdTask: payload,
  })

const createTemplateMilestoneInTaskContextSuccess = payload =>
  getTypeObject(actions.CREATE_TEMPLATE_MILESTONE_IN_TASK_CONTEXT_SUCCESS, {
    createdTask: payload,
  })

const createTemplateTaskInTemplateContextSuccess = payload =>
  getTypeObject(actions.CREATE_TEMPLATE_TASK_IN_TEMPLATE_CONTEXT_SUCCESS, {
    createdTask: payload,
  })

const createTemplateMilestoneInTemplateContextSuccess = payload =>
  getTypeObject(actions.CREATE_TEMPLATE_MILESTONE_IN_TEMPLATE_CONTEXT_SUCCESS, {
    createdTask: payload,
  })

export const fetchTemplateTask = (templateId, templateTaskId) => dispatch => {
  dispatch(requestTemplateTask())
  return templateService
    .getTemplateTask(templateId, templateTaskId)
    .then(response => dispatch(receiveTemplateTask(response.body)))
}

export const updateTemplateTaskDescription =
  (templateId, taskId, description) => dispatch => {
    return templateService
      .updateTemplateTask(templateId, taskId, {
        noticeboardText: description,
      })
      .then(response => {
        switch (response.status) {
          case StatusCodes.OK:
            return dispatch(receiveTemplateTask(response.body))
          default:
            return Promise.reject()
        }
      })
  }

export const updateTemplateTaskDetails =
  (templateId, taskId, properties) => dispatch => {
    return templateService
      .updateTemplateTask(templateId, taskId, properties)
      .then(response => {
        switch (response.status) {
          case StatusCodes.OK:
            return dispatch(receiveTemplateTask(response.body))
          default:
            return Promise.reject()
        }
      })
  }

export const updateTemplateLevelATasks =
  (templateId, properties) => dispatch => {
    dispatch(requestUpdateLevelATemplateTasks(templateId, properties))

    return templateService
      .updateTemplateTasks(templateId, properties)
      .then(response => {
        if (response.status === StatusCodes.OK) {
          dispatch(fetchTemplateOverviewWithPosts(templateId))
          return dispatch(fetchTemplate(templateId))
        }

        return Promise.reject()
      })
  }

export const updateTemplateTasks = (templateId, properties) => dispatch => {
  dispatch(requestUpdateTemplateTasks(templateId, properties))

  return templateService
    .updateTemplateTasks(templateId, properties)
    .then(response => {
      if (response.status === StatusCodes.OK) {
        return dispatch(updateTemplateTasksAction(response.body))
      }

      return Promise.reject()
    })
}

const showTemplateTaskCreatedSnackbar = (templateId, task) => {
  return showSnackbar(
    i18n.t('templateTaskActions.templateTaskCreated'),
    getTemplateTaskDetailsRedirectSnackbarAction(templateId, task.id)
  )
}

const showTemplateMilestoneCreatedSnackbar = (templateId, task) => {
  return showSnackbar(
    i18n.t('templateTaskActions.templateMilestoneCreated'),
    getTemplateTaskDetailsRedirectSnackbarAction(templateId, task.id)
  )
}

export const clearTemplateTaskState = () => dispatch => dispatch(resetState())

export const createNewTemplateMilestone =
  (templateId, parentId, name) => dispatch => {
    dispatch(createTemplateTask())
    return templateService
      .createTemplateMilestone(templateId, parentId, name)
      .then(response => {
        if (response.body.error_type === 'TASK_LIMIT') {
          return response
        }
        if (parentId && isInSpecificTaskContext(parentId)) {
          response.body.createdInContext = true
          dispatch(createTemplateMilestoneInTaskContextSuccess(response.body))
          dispatch(fetchTemplate(templateId))
        } else {
          if (isInTaskmapContext(templateId)) {
            dispatch(
              createTemplateMilestoneInTemplateContextSuccess(response.body)
            )
          } else {
            dispatch(
              showTemplateMilestoneCreatedSnackbar(templateId, response.body)
            )
          }
        }
        return response.body
      })
  }

export const createNewTemplateTask =
  (templateId, parentId, name) => dispatch => {
    dispatch(createTemplateTask())
    return templateService
      .createTemplateTask(templateId, parentId, name)
      .then(response => {
        if (response.body.error_type === 'TASK_LIMIT') {
          return response
        }
        if (parentId && isInSpecificTaskContext(parentId)) {
          response.body.createdInContext = true
          dispatch(createTemplateTaskInTaskContextSuccess(response.body))
          dispatch(fetchTemplate(templateId))
        } else {
          if (isInTaskmapContext(templateId)) {
            dispatch(createTemplateTaskInTemplateContextSuccess(response.body))
          } else {
            dispatch(showTemplateTaskCreatedSnackbar(templateId, response.body))
          }
        }
        return response.body
      })
  }

export const deleteTemplateTask =
  (templateId, taskId, isDeletingSelectedTemplateTask) => dispatch => {
    dispatch(deleteTemplateTasks())
    return templateService
      .deleteTemplateTask(templateId, taskId)
      .then(response => {
        if (response.status === StatusCodes.NO_CONTENT) {
          dispatch(fetchTemplate(templateId))
          return dispatch(
            deleteTemplateTaskSuccess(isDeletingSelectedTemplateTask, taskId)
          )
        }
      })
  }

export const copyTemplateTask =
  (templateId, taskId, name, targetId, copyType) => dispatch => {
    dispatch(copyTemplateTasks())

    return templateService
      .copyTemplateTask(templateId, taskId, name, targetId, copyType)
      .then(response => {
        if (response.status === StatusCodes.CREATED) {
          dispatch(
            showSnackbar(
              'Template task has been copied',
              <Button
                onClick={() => {
                  if (targetId) {
                    window.location.href =
                      window.location.href.split('/template/')[0] +
                      templateMapRedirectPath(response.body.projectTemplateId) +
                      '?id=' +
                      response.body.id +
                      'h'
                  }
                }}
              >
                {'Go to'}
              </Button>
            )
          )
          dispatch(fetchTemplate(templateId))
          return dispatch(copyTemplateTaskSuccess(response.body))
        } else if (response.body.error_type === 'TASK_LIMIT') {
          return dispatch(showSnackbar(response.body.message))
        }
      })
  }

export const moveTemplateTask =
  (
    templateId,
    taskId,
    destinationParentType,
    destinationParentId,
    updateWithMovedTask,
    subTaskMove
  ) =>
  dispatch => {
    dispatch(requestMoveTemplateTask())
    return templateService
      .moveTemplateTask(
        templateId,
        taskId,
        destinationParentType,
        destinationParentId
      )
      .then(response => {
        if (response.status === StatusCodes.OK) {
          let lastDispatch = dispatch(
            showSnackbar(i18n.t('templateTaskActions.templateTaskMoved'))
          )

          if (subTaskMove) {
            dispatch(fetchTemplate(templateId))
            dispatch(subTaskMovedSuccess({ movedSubtaskId: taskId }))
          }

          if (updateWithMovedTask)
            lastDispatch = dispatch(receiveTemplateTask(response.body))

          return lastDispatch
        } else {
          return response
        }
      })
  }
