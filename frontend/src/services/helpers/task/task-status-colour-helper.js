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

import { TASK_CELL_COLOUR, TASK_STATUS } from '../../../app/constants'
import juralioColours from '../../../theme/juralio-colours'
import rawColours from '../../../theme/raw-colours'

const taskCellColours = {
  'task-not-required': juralioColours.taskCell.background.notRequired,
  'not-started': juralioColours.taskCell.background.notStarted,
  'in-progress': juralioColours.taskCell.background.inProgress,
  done: juralioColours.taskCell.background.done,
  new: juralioColours.taskMap.newTasksHighlight,
  undefined: juralioColours.taskCell.background.template, // Template task.
}

const taskCellColoursWithOpacity = {
  'task-not-required':
    juralioColours.taskCell.background.withOpacity.notRequired,
  'not-started': juralioColours.taskCell.background.withOpacity.notStarted,
  'in-progress': juralioColours.taskCell.background.withOpacity.inProgress,
  done: juralioColours.taskCell.background.withOpacity.done,
  undefined: juralioColours.taskCell.background.withOpacity.template, // Template task.
}

const taskCellColoursFilteredOut = {
  'task-not-required':
    juralioColours.taskCell.background.filteredOut.notRequired,
  'not-started': juralioColours.taskCell.background.filteredOut.notStarted,
  'in-progress': juralioColours.taskCell.background.filteredOut.inProgress,
  done: juralioColours.taskCell.background.filteredOut.done,
  undefined: juralioColours.taskCell.background.filteredOut.template, // Template task.
}

const taskCellColoursFilteredIn = {
  'task-not-required':
    juralioColours.taskCell.background.filteredIn.notRequired,
  'not-started': juralioColours.taskCell.background.filteredIn.notStarted,
  'in-progress': juralioColours.taskCell.background.filteredIn.inProgress,
  done: juralioColours.taskCell.background.filteredIn.done,
  undefined: juralioColours.taskCell.background.filteredIn.template, // Template task.
}

export const getTaskCellColour = (task, colourMode) => {
  if (!task || task.matter || !task.id) return null
  switch (colourMode) {
    case TASK_CELL_COLOUR.NEW_TASKS:
      return taskCellColours.new
    case TASK_CELL_COLOUR.FILTERED_OUT:
      return taskCellColoursFilteredOut[task.status]
    case TASK_CELL_COLOUR.FILTERED_IN:
      return taskCellColoursFilteredIn[task.status]
    case TASK_CELL_COLOUR.NORMAL:
      return taskCellColours[task.status]
    default:
      return taskCellColours[task.status]
  }
}

export const getStatusColourLight = status => taskCellColours[status]

export const getStatusColour = status => {
  if (status) {
    if (status === TASK_STATUS.NOT_REQUIRED)
      return juralioColours.taskStatus.notRequired
    if (status === TASK_STATUS.NOT_STARTED)
      return juralioColours.taskStatus.notStarted
    if (status === TASK_STATUS.IN_PROGRESS)
      return juralioColours.taskStatus.inProgress
    if (status === TASK_STATUS.DONE) return juralioColours.taskStatus.done
  }
  return rawColours.status.template.dark
}

export const getStatusColourSelected = status => {
  if (status) {
    if (status === TASK_STATUS.NOT_REQUIRED)
      return juralioColours.taskStatus.notRequired
    if (status === TASK_STATUS.NOT_STARTED)
      return juralioColours.taskStatusSelected.notStarted
    if (status === TASK_STATUS.IN_PROGRESS)
      return juralioColours.taskStatusSelected.inProgress
    if (status === TASK_STATUS.DONE)
      return juralioColours.taskStatusSelected.done
  }
  return undefined
}

export const getStatusColourWithOpacity = status =>
  taskCellColoursWithOpacity[status]
