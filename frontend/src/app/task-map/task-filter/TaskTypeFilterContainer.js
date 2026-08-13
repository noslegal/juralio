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

import debounce from 'lodash/debounce'
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { taskFilterActions } from './task-filter-actions'
import TaskTypeSelector from '../../../components/inputs/task-type-selector/TaskTypeSelector'

const TaskStatusFilterContainer = props => {
  const dispatch = useDispatch()

  const statusMilesone = useSelector(
    state => state.taskMapFilter.statusMilestone
  )
  const statusDeliverable = useSelector(
    state => state.taskMapFilter.statusDeliverable
  )

  const handleMilestone = () => {
    dispatch(taskFilterActions.setStatusMilestone(statusMilesone))
    if (statusDeliverable) {
      dispatch(taskFilterActions.setStatusDeliverable(true))
    }
  }

  const handleDeliverable = () => {
    dispatch(taskFilterActions.setStatusDeliverable(statusDeliverable))
    if (statusMilesone) {
      dispatch(taskFilterActions.setStatusMilestone(true))
    }
  }

  const handleEverything = () => {
    if (statusDeliverable) {
      dispatch(taskFilterActions.setStatusDeliverable(true))
    }
    if (statusMilesone) {
      dispatch(taskFilterActions.setStatusMilestone(true))
    }
  }

  return (
    <TaskTypeSelector
      statusMilestone={statusMilesone}
      statusDeliverable={statusDeliverable}
      handleMilestone={debounce(handleMilestone, 500, { leading: false })}
      handleDeliverable={debounce(handleDeliverable, 500, { leading: false })}
      handleEverything={debounce(handleEverything, 500, { leading: false })}
    />
  )
}

export default TaskStatusFilterContainer
