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

import React from 'react'
import { useDispatch, useSelector } from 'react-redux'

import MoveTemplateTaskDialog from './MoveTemplateTaskDialog'

import { CONFIG, TASK_MENU_CONTEXT } from '../../../../app/constants'
import { getTemplateTaskMapUrl } from '../../../../components/navigation/common/location-context-helper'
import { getLevelATaskCount } from '../../../../services/helpers/task/task-util-helper'
import withRouter from '../../../../services/navigation/WithRouter'
import {
  clearTemplateTaskState,
  moveTemplateTask,
} from '../../../template-task-details/template-task-actions'
import {
  fetchTemplateOverview,
  fetchTemplateTasks,
} from '../../template-actions'

const MoveTemplateTaskContainer = props => {
  const dispatch = useDispatch()
  const template = useSelector(state => state.template.template)
  const templateTasks = useSelector(state => state.improvedTaskmap.tasks)

  const checkIfLevelATaskCountAtCapacity = template =>
    getLevelATaskCount(template) === CONFIG.LEVEL_A_TASK_LIMIT

  const handleMove = (destinationParentType, destinationParentId) => {
    let shouldRedirectToTaskMap =
      props.taskMenuContext !== TASK_MENU_CONTEXT.SUBTASK_PANEL
    if (shouldRedirectToTaskMap === true) {
      shouldRedirectToTaskMap = !props.dontRedirect
    }

    dispatch(
      moveTemplateTask(
        template.id,
        props.task.id,
        destinationParentType,
        destinationParentId,
        false,
        !shouldRedirectToTaskMap
      )
    ).then(res => {
      if (props.taskMenuContext === TASK_MENU_CONTEXT.TASK_MAP) {
        dispatch(fetchTemplateTasks(template.id)).then(() =>
          props.cancelHandler()
        )
      } else if (
        props.taskMenuContext === TASK_MENU_CONTEXT.SUBTASK_PANEL &&
        props.task.level === 1
      ) {
        dispatch(fetchTemplateOverview(template.id)).then(() =>
          props.cancelHandler()
        )
      } else if (shouldRedirectToTaskMap) {
        dispatch(clearTemplateTaskState())
        props.router.navigate(getTemplateTaskMapUrl(template.id, props.task.id))
      } else {
        props.cancelHandler()
      }
    })
  }

  return (
    props.display && (
      <MoveTemplateTaskDialog
        task={props.task}
        template={template}
        templateTasks={templateTasks}
        taskMenuContext={props.taskMenuContext}
        handleMove={handleMove}
        cancelHandler={props.cancelHandler}
        levelAProjectTaskCountCheck={checkIfLevelATaskCountAtCapacity}
      />
    )
  )
}

export default withRouter(MoveTemplateTaskContainer)
