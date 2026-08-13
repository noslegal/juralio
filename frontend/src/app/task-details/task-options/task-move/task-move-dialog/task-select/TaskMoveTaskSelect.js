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

import TaskSelectBase from '../../../../../../components/inputs/task-select/base/TaskSelectBase'
import { buildValidTargetTaskList } from '../../../../../../services/task/data-provider/task-list-data-provider'
import uniqBy from 'lodash/uniqBy'

/** Task selection for the Task and Template task move dialogs.*/
const TaskMoveTaskSelect = props => {
  const performSearch = searchTerm => {
    const items = props.validTargetTasks || []
    return Promise.resolve(
      items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
  }

  return (
    <TaskSelectBase
      performSearch={performSearch}
      onChange={props.selectionChangeHandler}
      placeholder={props.placeholderText}
      error={props.error}
      disabledItemFilter={item => item.disabled}
      filterOutMilestones={true}
    />
  )
}

TaskMoveTaskSelect.propTypes = {
  /** The Task to be moved.*/
  selectedTask: PropTypes.object.isRequired,
  /** The Tasks in the project.*/
  validTargetTasks: PropTypes.array.isRequired,
  /** The handler for when the selected Task changes.*/
  selectionChangeHandler: PropTypes.func.isRequired,
  /** The error flag.*/
  error: PropTypes.bool,
  /** The placeholder text.*/
  placeholderText: PropTypes.string.isRequired,
}

export default TaskMoveTaskSelect

export const getValidTargetTasks = (task, taskTree) => {
  if (!taskTree) return []

  const tasks = taskTree.tasks
  if (tasks.length === 0) return []
  const validTargets = buildValidTargetTaskList(
    tasks,
    task.id,
    task.parent ? task.parent.id : undefined
  )
  return uniqBy(validTargets, 'id')
}
