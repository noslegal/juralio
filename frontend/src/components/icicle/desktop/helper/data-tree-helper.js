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

import { TASK_STATUS } from '../../../../app/constants'
import { TASKMAP_NEW_TASK_FLOW_STARTED } from '../../common/render/update/interaction/usability-applicator'

export const getTaskFlatList = taskTree => {
  let flatList = []
  const children = taskTree.children || []
  children.forEach(task => walk(task))
  return flatList

  function walk(task) {
    flatList.push(task)
    if (!task.children || task.children.length === 0) return
    task.children.forEach(task => walk(task))
  }
}

export const getStatusForSiblingTask = (previousTask, nextTask) => {
  if (previousTask) {
    if (nextTask) {
      if (
        previousTask.status === TASK_STATUS.NOT_STARTED ||
        nextTask.status === TASK_STATUS.NOT_STARTED
      ) {
        return TASK_STATUS.NOT_STARTED
      } else if (
        previousTask.status === TASK_STATUS.IN_PROGRESS ||
        nextTask.status === TASK_STATUS.IN_PROGRESS
      ) {
        return TASK_STATUS.IN_PROGRESS
      } else {
        return TASK_STATUS.DONE
      }
    }
    return previousTask.status
  } else if (nextTask) {
    return nextTask.status
  }

  return TASK_STATUS.NOT_STARTED
}

export const createNewTaskPlaceholder = (level, parent, projectId, status) => {
  const newTask = {
    activities: [],
    id: TASKMAP_NEW_TASK_FLOW_STARTED,
    level: level,
    name: '',
    parent: parent,
    projectId: projectId,
    referenceNumber: '',
    status: status,
    tasks: [],
  }

  return newTask
}
