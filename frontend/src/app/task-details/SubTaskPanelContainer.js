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

import PropTypes from 'prop-types'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { reorder } from '../../services/helpers/array-helper'
import { TASK_STATUS } from '../constants'
import { updateTaskSubtasks } from '../task-map/selected-task/selected-task-actions'
import { updateTemplateTasks } from '../template-task-details/template-task-actions'
import SubTaskPanel, { SubTaskPanelSubsectionId } from './SubTaskPanel'
const SubTaskPanelContainer = props => {
  const projectId = useSelector(state => state.selectedTask.projectId)
  const dispatch = useDispatch()

  const parent = props.task
  const currentUser = useSelector(state => state.auth.data.details)

  const decoratedTasks = getTasksDecoratedWithProjectAndParent(
    parent,
    props.tasks,
    currentUser
  )
  const doneTasks = getTasksByStatus(decoratedTasks, TASK_STATUS.DONE)
  const inProgressTasks = getTasksByStatus(
    decoratedTasks,
    TASK_STATUS.IN_PROGRESS
  )
  const notStartedTasks = getTasksByStatus(
    decoratedTasks,
    TASK_STATUS.NOT_STARTED
  )
  const notRequiredTasks = getTasksByStatus(
    decoratedTasks,
    TASK_STATUS.NOT_REQUIRED
  )
  const templateTasks = getTemplateTasks(props.tasks)

  const onTemplateSubtaskDragEnd = (source, destination) => {
    const reorderedTasks = reorder(
      templateTasks,
      source.index,
      destination.index
    )

    dispatch(
      updateTemplateTasks(props.templateId, {
        parentTaskId: props.task.id,
        taskOrder: reorderedTasks,
      })
    )
  }

  const onSubtaskDragEnd = (source, destination) => {
    const statusGroupTasks = {
      [SubTaskPanelSubsectionId.Done]: doneTasks,
      [SubTaskPanelSubsectionId.InProgress]: inProgressTasks,
      [SubTaskPanelSubsectionId.NotStarted]: notStartedTasks,
    }

    const sourceStatusGroupTasks = statusGroupTasks[source.droppableId]
    const destinationStatusGroupTasks =
      statusGroupTasks[destination.droppableId]
    const newStatus = destinationStatusGroupTasks[0].status
    const updatedTask = { ...sourceStatusGroupTasks.splice(source.index, 1)[0] }
    updatedTask.status = newStatus
    destinationStatusGroupTasks.splice(destination.index, 0, updatedTask)

    const isTaskChangingStatus = source.droppableId !== destination.droppableId
    const statusChangeTargetTaskId = isTaskChangingStatus
      ? updatedTask.id
      : undefined
    const orderedTasks = [...doneTasks, ...inProgressTasks, ...notStartedTasks]
    const maintainTaskConsistencyUpdate = false

    dispatch(
      updateTaskSubtasks(
        props.matterId,
        projectId,
        statusChangeTargetTaskId,
        props.task.id,
        orderedTasks,
        maintainTaskConsistencyUpdate
      )
    )
  }

  const onDragEnd = operation => {
    const { source, destination } = operation

    if (!destination) return

    if (
      source.droppableId === SubTaskPanelSubsectionId.Template &&
      destination.droppableId === SubTaskPanelSubsectionId.Template
    ) {
      onTemplateSubtaskDragEnd(source, destination)
    } else {
      onSubtaskDragEnd(source, destination)
    }
  }

  const updateProjectTaskSubtasks = (name, taskId) => {
    if (taskId === -1) {
      //add
      props.saveTask(name)
    } else {
      const updatedTasks = props.tasks.map(task => ({
        ...task,
        name: task.id === taskId ? name : task.name,
      }))

      return dispatch(
        updateTaskSubtasks(
          props.matterId,
          projectId,
          taskId,
          props.task.id,
          updatedTasks,
          false
        )
      )
    }
  }

  const updateTemplateTaskSubtasks = (name, taskId) => {
    if (taskId === -1) {
      //add
      props.saveTask(name)
    } else {
      const updatedTasks = props.tasks.map(task => ({
        ...task,
        name: task.id === taskId ? name : task.name,
      }))
      dispatch(
        updateTemplateTasks(props.templateId, {
          parentTaskId: props.task.id,
          taskOrder: updatedTasks,
        })
      )
    }
  }

  return (
    <SubTaskPanel
      taskCount={props.tasks.length}
      currentLevel={props.task.level}
      doneTasks={doneTasks}
      inProgressTasks={inProgressTasks}
      notStartedTasks={notStartedTasks}
      templateTasks={templateTasks}
      notRequiredTasks={notRequiredTasks}
      matterId={props.matterId}
      handleAdd={props.addTask}
      projectId={projectId}
      templateId={props.templateId}
      onDragEnd={onDragEnd}
      updateNameHandler={
        projectId ? updateProjectTaskSubtasks : updateTemplateTaskSubtasks
      }
      onCollapseClick={props.onCollapseClick}
      isReadOnly={props.isReadOnly}
      viewOnly={props.viewOnly}
      removeTask={props.removeTask}
    />
  )
}

export function getTasksDecoratedWithProjectAndParent(
  parent,
  tasks,
  currentUser = null
) {
  return tasks.map(task => ({
    ...task,
    parent,
    teamMembers: task.teamMembers ? task.teamMembers : [currentUser],
    projectId: task.level === 1 ? parent.id : task.project?.id,
  }))
}

export function getTasksByStatus(tasks, status) {
  if (tasks && tasks.length > 0) {
    return tasks.filter(task => task.status && task.status === status)
  }

  return []
}

export function getTemplateTasks(tasks) {
  if (tasks && tasks.length > 0 && !tasks[0].status) {
    return tasks
  }

  return []
}

export default SubTaskPanelContainer

SubTaskPanelContainer.propTypes = {
  task: PropTypes.object.isRequired,
  tasks: PropTypes.array.isRequired,
  templateId: PropTypes.string,
  isMatterAdmin: PropTypes.bool,
  matterId: PropTypes.string,
  onCollapseClick: PropTypes.func,
  /** Flag for control being in read only mode */
  isReadOnly: PropTypes.bool,
}
