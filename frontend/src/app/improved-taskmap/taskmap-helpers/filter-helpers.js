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

import { filterOutLabels } from '../../../services/helpers/task/filter-tasks'
import { TASK_CELL_COLOUR, TASK_STATUS } from '../../constants'

export const shouldShow = (
  task,
  taskmapFilters,
  isInTransitionAnimation = false
) => {
  if (!task) {
    return false
  }
  // status
  if (task.status === TASK_STATUS.DONE && !taskmapFilters.statusDone) {
    if (isInTransitionAnimation) {
      return true
    }
    return false
  }
  if (
    task.status === TASK_STATUS.NOT_STARTED &&
    !taskmapFilters.statusNotStarted
  ) {
    return false
  }
  if (
    task.status === TASK_STATUS.NOT_REQUIRED &&
    !taskmapFilters.statusNotRequired
  ) {
    return false
  }
  return true
}

const filterByLabel = (task, filterLabels) => {
  if (filterOutLabels(task, filterLabels)) {
    return TASK_CELL_COLOUR.FILTERED_IN
  } else {
    return TASK_CELL_COLOUR.FILTERED_OUT
  }
}

export const getColourFilter = (task, taskmapFilters) => {
  if (taskmapFilters.statusMilestone && !task.isMilestone) {
    return TASK_CELL_COLOUR.FILTERED_OUT
  }
  if (taskmapFilters.statusDeliverable && !task.isDeliverable) {
    return TASK_CELL_COLOUR.FILTERED_OUT
  }
  if (taskmapFilters.filterLabels.length > 0) {
    return filterByLabel(task, taskmapFilters.filterLabels)
  }
  if (taskmapFilters.filterOn) {
    //filter by user
    if (taskmapFilters.id === 'UNASSIGNED') {
      if (
        task.teamMembers &&
        task.teamMembers.filter(t => t.enabled).length === 0
      ) {
        return TASK_CELL_COLOUR.FILTERED_IN
      } else {
        return TASK_CELL_COLOUR.FILTERED_OUT //Yes the name is backwards blame David
      }
    }
    if (taskmapFilters.id != null) {
      if (
        (task.teamMembers &&
          task.teamMembers.map(tm => tm.id).includes(taskmapFilters.id)) ||
        (task.isFollower && taskmapFilters.filterSelectionText === 'Your tasks')
      ) {
        return TASK_CELL_COLOUR.FILTERED_IN //''
      } else {
        return TASK_CELL_COLOUR.FILTERED_OUT //''
      }
    }
  }
  if (taskmapFilters.statusMilestone && task.isMilestone) {
    return TASK_CELL_COLOUR.FILTERED_IN
  }
  return TASK_CELL_COLOUR.NORMAL
}
