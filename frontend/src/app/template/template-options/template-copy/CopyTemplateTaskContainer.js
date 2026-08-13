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
import {
  getTemplateIdFromLocation,
  getTemplateTaskMapUrl,
} from '../../../../components/navigation/common/location-context-helper'
import IsWidthDown from '../../../../hooks/width-helper'
import { TASK_MENU_CONTEXT } from '../../../constants'
import CopyTaskDialog from '../../../task-details/task-options/task-copy/task-copy-dialog/CopyTaskDialog'
import { doesParentHaveCapacityToCopy } from '../../../task-details/TaskCardCommon'
import { copyTemplateTask } from '../../../template-task-details/template-task-actions'
import {
  fetchTemplateOverview,
  fetchTemplateTasks,
} from '../../template-actions'
import { useLocation, useNavigate } from 'react-router'

const CopyTemplateTaskContainer = props => {
  const location = useLocation()
  const history = useNavigate()
  const dispatch = useDispatch()
  const copiedTask = useSelector(state => state.selectedTemplateTask.copiedTask)
  const template = useSelector(state => state.template.template)
  const templateTasks = useSelector(state => state.improvedTaskmap.tasks)

  const copyTemplateTaskHandler = (newName, targetId, copyType, templateId) => {
    dispatch(
      copyTemplateTask(
        getTemplateIdFromLocation(location),
        props.task.id,
        newName,
        targetId,
        copyType
      )
    ).then(result => {
      if (props.taskMenuContext === TASK_MENU_CONTEXT.TASK_MAP) {
        dispatch(fetchTemplateTasks(getTemplateIdFromLocation(location))).then(
          () => props.closeHandler()
        )
      } else if (props.taskMenuContext === TASK_MENU_CONTEXT.SUBTASK_PANEL) {
        if (props.task.level === 1) {
          dispatch(fetchTemplateOverview(getTemplateIdFromLocation(location)))
        }

        props.closeHandler()
      } else if (!props.dontRedirect) {
        const targetTemplate = templateId
          ? templateId
          : getTemplateIdFromLocation(location)
        history(getAfterCopyUrl(targetTemplate))
      } else if (props.dontRedirect) {
        dispatch(fetchTemplateTasks(getTemplateIdFromLocation(location))).then(
          () => {
            props.closeHandler()
          }
        )
      }
    })
  }

  const copyToAnotherTemplateOnly = () =>
    !doesParentHaveCapacityToCopy(
      props.task,
      props.taskMenuContext === TASK_MENU_CONTEXT.TASK_MAP
        ? { tasks: templateTasks }
        : template
    )

  const getAfterCopyUrl = templateId => getTemplateTaskMapUrl(templateId)

  return (
    props.display && (
      <CopyTaskDialog
        task={props.task}
        taskName={props.task.name}
        taskLevel={props.task.level}
        hasSubtasks={props.task.tasks?.length > 0}
        cancelHandler={props.cancelHandler}
        fullScreen={IsWidthDown('sm', props.width)}
        taskMenuContext={props.taskMenuContext}
        copyTaskHandler={copyTemplateTaskHandler}
        mountHandler={() => {}}
        copiedTask={copiedTask}
        isTemplate={true}
        cannotCopyHere={copyToAnotherTemplateOnly}
      />
    )
  )
}

export default CopyTemplateTaskContainer
