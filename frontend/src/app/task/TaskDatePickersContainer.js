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
import { openDatePicker } from '../../redux/ducks/improved-taskmap-interactions'
import { isInImprovedTaskmapContext } from '../../services/helpers/route/route-context-helper'
import { showTaskmapDatePickerForTask } from '../task-details/task-actions'
import TaskDatePickers from './TaskDatePickers'

const TaskDatePickersContainer = props => {
  const dispatch = useDispatch()
  const { task } = props

  const showDatePicker = dateType => {
    dispatch(
      showTaskmapDatePickerForTask({
        task: task,
        dateType: dateType,
        showTaskPreview: true,
      })
    )
    if (isInImprovedTaskmapContext()) {
      dispatch(openDatePicker(task.id))
    }
  }

  return (
    <TaskDatePickers
      isTaskLinked={task.datesLinkedToSiblings}
      taskStatus={task.status}
      taskId={task.id}
      psd={task.plannedStartDate}
      ped={task.plannedEndDate}
      asd={task.actualStartDate}
      aed={task.actualEndDate}
      showDatePicker={showDatePicker}
      isMilestone={task.isMilestone}
      viewOnly={props.viewOnly}
    />
  )
}

export default TaskDatePickersContainer
