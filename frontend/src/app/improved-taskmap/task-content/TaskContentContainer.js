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

import React, { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router'
import {
  getTaskDetailsUrl,
  getTemplateTaskDetailsUrl,
  isInTemplate,
} from '../../../components/navigation/common/location-context-helper'
import {
  openDatePicker,
  openPreview,
  requestOptionsMenu,
  requestTaskRename,
} from '../../../redux/ducks/improved-taskmap-interactions'
import { TASK_MAP_VIEW_MODE_ENUM } from '../../constants'
import { selectTaskToMove } from '../../project/project-actions'
import {
  showTaskmapDatePickerForTask,
  showTaskPreview,
} from '../../task-details/task-actions'
import { selectTaskToMove as selectTemplateTaskToMove } from '../../template/template-actions'
import { getColourFilter } from '../taskmap-helpers/filter-helpers'
import TaskContent from './TaskContent'
const TaskContentContainer = props => {
  const tasks = useSelector(state => state.improvedTaskmap.tasks)
  const history = useNavigate()
  const [task, setTask] = useState(tasks.find(t => t.id === props.id))
  const taskMapFilter = useSelector(state => state.taskMapFilter)
  const project = useSelector(state => state.project)
  const taskFromTemplate = useSelector(
    state => state.improvedTaskmap.taskFromTemplate
  )
  const template = useSelector(state => state.template)
  const isTemplate = isInTemplate(window.location.href)

  useEffect(() => {
    setTask(tasks.find(t => t.id === props.id))
  }, [tasks]) //eslint-disable-line

  const dispatch = useDispatch()

  const handleNameClick = () => {
    dispatch(requestTaskRename(props.id))
  }

  const handlePreviewClick = e => {
    e.stopPropagation()
    let cell = document.getElementById(`structure-item-${task.id}`)
    let left = 0
    let top = 0
    if (cell) {
      let bounds = cell.getBoundingClientRect()

      left =
        bounds.x +
        document.getElementById('improved-taskmap-wrapper')?.scrollLeft
      top =
        bounds.top -
        117 +
        +document.getElementById('improved-taskmap-wrapper')?.scrollTop
    }
    dispatch(showTaskPreview(task, { left: left, top: top }, false))
    dispatch(openPreview(props.id))
  }
  const handleOptionsClick = () => {
    dispatch(requestOptionsMenu(props.id))
  }

  const handleDateClick = (task, dateType) => {
    dispatch(showTaskmapDatePickerForTask({ task, dateType }))
    dispatch(openDatePicker(task.id))
  }

  const isCompact =
    taskMapFilter.detailedView[
      isInTemplate(window.location.href) ? 'templateViewMode' : 'viewMode'
    ] === 2
  const handleTaskCardClick = (matterId, projectId, taskId) => {
    if (taskId === undefined) {
      //isTemplate
      if (template.selectionMode) {
        dispatch(selectTemplateTaskToMove(projectId, template.template.tasks))
      } else {
        const newPath = getTemplateTaskDetailsUrl(matterId, projectId)
        history(newPath)
      }
      return
    }
    if (project.selectionMode) {
      if (taskFromTemplate) {
        return
      }
      dispatch(selectTaskToMove(taskId, project.tasks))
    } else {
      const newPath = taskId
        ? getTaskDetailsUrl(matterId, projectId, taskId)
        : getTemplateTaskDetailsUrl(matterId, projectId)

      history(newPath)
    }
  }

  const getColourMode = () => {
    return getColourFilter(task, taskMapFilter)
  }

  if (!task) return null

  const isSelectionMode = isTemplate
    ? template.selectionMode
    : project.selectionMode

  return (
    <TaskContent
      task={task}
      selectionMode={
        isTemplate ? template.selectionMode : project.selectionMode
      }
      handleNameClick={handleNameClick}
      handlePreviewClick={handlePreviewClick}
      handleOptionsClick={handleOptionsClick}
      detailedView={
        isSelectionMode
          ? { viewMode: TASK_MAP_VIEW_MODE_ENUM.COMPACT }
          : taskMapFilter.detailedView
      }
      handleDateClick={handleDateClick}
      isCompact={isCompact}
      handleTaskCardClick={handleTaskCardClick}
      getColourMode={getColourMode}
      isReadOnly={props.isReadOnly}
      isHighlighted={
        isSelectionMode
          ? isTemplate
            ? template.highlightList?.map(i => i.id).includes(task.id)
            : project.highlightList?.map(i => i.id).includes(task.id)
          : false
      }
    />
  )
}
export default TaskContentContainer
