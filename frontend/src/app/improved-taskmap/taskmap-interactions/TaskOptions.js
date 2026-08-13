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
import { useDispatch } from 'react-redux'
import { useLocation } from 'react-router'
import { getTemplateIdFromLocation } from '../../../components/navigation/common/location-context-helper'
import {
  fetchTaskmapStructure,
  fetchTemplateTaskmapStructure,
} from '../../../redux/ducks/improved-taskmap'
import {
  closeOptionsMenu,
  requestTaskRename,
} from '../../../redux/ducks/improved-taskmap-interactions'
import { TASK_MENU_CONTEXT } from '../../constants'
import TaskMenuContainer from '../../task-details/task-card-header/task-option-menu/TaskMenuContainer'
import TemplateMenuContainer from '../../task-details/task-card-header/template-option-menu/TemplateMenuContainer'

const TaskOptions = props => {
  let id = `more-vert-icon-${props.task.id}`
  let anchorEl = document.getElementById(id)
  const dispatch = useDispatch()
  const location = useLocation()
  const templateId = getTemplateIdFromLocation(location)
  const isTemplate = props.isTemplate
  if (isTemplate) {
    return (
      <TemplateMenuContainer
        handleRenameClick={() => {
          dispatch(closeOptionsMenu(false))
          dispatch(requestTaskRename(props.task.id))
        }}
        taskMenuContext={TASK_MENU_CONTEXT.TASK_MAP}
        task={props.task}
        anchor={anchorEl}
        closeHandler={() => {
          dispatch(closeOptionsMenu(false))
          dispatch(fetchTemplateTaskmapStructure(templateId, true, true))
        }}
      />
    )
  }
  return (
    <TaskMenuContainer
      anchor={anchorEl}
      closeHandler={() => {
        dispatch(closeOptionsMenu(false))
      }}
      matterId={props.task.matterId}
      task={props.task}
      taskMenuContext={TASK_MENU_CONTEXT.TASK_MAP}
      viewOnly={props.viewOnly}
      handleRenameClick={() => {
        dispatch(closeOptionsMenu(false))
        dispatch(requestTaskRename(props.task.id))
      }}
      updateProject={(matterId, projectId, fetchData) => {
        dispatch(fetchTaskmapStructure(matterId, projectId, fetchData))
      }}
    />
  )
}
export default TaskOptions
