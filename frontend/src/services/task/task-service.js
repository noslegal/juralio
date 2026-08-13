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

import makeCancellable from '../helpers/cancellable-promise-helper'
import api from '../helpers/fetch/fetch-helper'

export default {
  getTaskById(matterId, projectId, taskId, skipRecency) {
    let url = `matter/${matterId}/workstreams/${projectId}/task/${taskId}`
    if (skipRecency) {
      url = `${url}?skipRecency=1`
    }
    return api(url)
  },

  createTask(
    matterId,
    projectId,
    parentId,
    status,
    name,
    isMilestone = false,
    isDeliverable
  ) {
    let payload = {
      matterId: matterId,
      project: projectId,
      status: status,
      name: name,
      isMilestone: isMilestone,
      isDeliverable: isDeliverable,
    }
    if (parentId !== null) payload.phase = parentId
    return api(
      `matter/${matterId}/workstreams/${projectId}/tasks`,
      'POST',
      payload
    )
  },

  checkUpdateConsistency(matterId, projectId, taskId, properties = {}) {
    return api(
      `matter/${matterId}/workstreams/${projectId}/task/${taskId}/checkConsistency`,
      'POST',
      properties
    )
  },

  checkDateConsistency(matterId, projectId, taskId, properties = {}) {
    return api(
      `matter/${matterId}/workstreams/${projectId}/task/${taskId}/checkDateConsistency`,
      'POST',
      properties
    )
  },

  getProblemDates(matterId, projectId, taskId, properties = {}) {
    return api(
      `matter/${matterId}/workstreams/${projectId}/task/${taskId}/problemDates`,
      'POST',
      properties
    )
  },

  createTasksFromTemplateProject(
    matterId,
    projectId,
    parentTaskId,
    templateProjectId,
    includePosts,
    includeDescriptions = false
  ) {
    let payload = {
      project: projectId,
      phase: parentTaskId,
      includePosts,
      includeDescriptions,
    }
    return api(
      `matter/${matterId}/workstreams/${projectId}/tasks?templateProjectId=${templateProjectId}`,
      'POST',
      payload
    )
  },

  createTaskFromTemplateTask(
    matterId,
    projectId,
    templateTaskId,
    parentTaskId,
    includePosts,
    includeDescriptions = false
  ) {
    let payload = {
      project: projectId,
      phase: parentTaskId,
      includePosts,
      includeDescriptions,
    }
    return api(
      `matter/${matterId}/workstreams/${projectId}/tasks?templateTaskId=${templateTaskId}`,
      'POST',
      payload
    )
  },

  updateTask(
    matterId,
    projectId,
    taskId,
    properties,
    maintainTaskConsistencyUpdate
  ) {
    const payload = {
      ...properties,
    }

    let url = `matter/${matterId}/workstreams/${projectId}/task/${taskId}`

    if (maintainTaskConsistencyUpdate) {
      url = `${url}?maintainTaskConsistencyUpdate=true`
    }

    return api(`${url}`, 'PATCH', payload)
  },

  archiveTask(matterId, projectId, taskId) {
    return api(
      `matter/${matterId}/workstreams/${projectId}/task/${taskId}/archive`,
      'POST',
      {}
    )
  },

  moveTask(
    matterId,
    projectId,
    taskId,
    destinationType,
    destinationProjectId,
    destinationParentId,
    maintainTaskConsistency = false
  ) {
    let payload = {
      destinationParentType: destinationType,
      maintainTaskConsistency: maintainTaskConsistency,
    }

    // undefined because this can be 0 (Level A) and miss this
    if (destinationParentId !== undefined && destinationParentId !== '') {
      payload.destinationParentId = destinationParentId
    }

    if (destinationProjectId) {
      payload.destinationProjectId = destinationProjectId
    }

    return api(
      `matter/${matterId}/workstreams/${projectId}/task/${taskId}/move`,
      'POST',
      payload
    )
  },

  copyTask(matterId, projectId, taskId, name) {
    return api(
      `matter/${matterId}/workstreams/${projectId}/task/${taskId}/copy`,
      'POST',
      { name: name }
    )
  },

  followTask(matterId, projectId, taskId) {
    return api(
      `matter/${matterId}/workstreams/${projectId}/task/${taskId}/followers`,
      'POST'
    )
  },

  unfollowTask(matterId, projectId, taskId, userId) {
    return api(
      `matter/${matterId}/workstreams/${projectId}/task/${taskId}/followers/${userId}`,
      'DELETE'
    )
  },

  updateTaskSubtasks(
    matterId,
    projectId,
    parentTaskId,
    orderedTasks,
    maintainTaskConsistencyUpdate
  ) {
    let url = `matter/${matterId}/workstreams/${projectId}/tasks`

    if (maintainTaskConsistencyUpdate) {
      url = `${url}?maintainTaskConsistencyUpdate=true`
    }

    return api(url, 'PATCH', {
      ...(parentTaskId
        ? { parentTask: parentTaskId }
        : { parentProject: projectId }),
      taskOrder: orderedTasks.map(t => ({
        id: t.id,
        status: t.status,
        ...(t.name && { name: t.name }),
      })),
    })
  },

  getAffectedTasks(parentTaskId, properties) {
    const url = 'tasksAffected'
    return api(url, 'POST', {
      id: parentTaskId,
      properties: properties,
    })
  },
  getMinMaxBoundsUpTree(matterId, workstreamId, taskId) {
    let url = `matter/${matterId}/workstreams/${workstreamId}/tasks/${taskId}/getMinMaxBoundsUpTree`
    return api(url, 'GET')
  },

  applyDateOffsetToSubtasks(matterId, projectId, taskId, dateKey, offset) {
    const url = `matter/${matterId}/workstreams/${projectId}/task/${taskId}?updateSubtaskDates=true`
    return api(url, 'PATCH', { dateKey: dateKey, offset: offset })
  },

  getTasks(matterId, projectId, searchTerm) {
    let url = `matter/${matterId}/workstreams/${projectId}/tasks`

    if (searchTerm) {
      url = `${url}?name=${searchTerm}`
    }

    return makeCancellable(api(url))
  },

  getRecentTasks() {
    return makeCancellable(api('tasks/recent'))
  },

  getArchivedTasks(matterId) {
    return api(`matter/${matterId}/tasks/archived`)
  },

  linkTaskWithSiblings(matterId, projectId, taskId, shouldLink) {
    return api(
      `matter/${matterId}/workstreams/${projectId}/task/${taskId}/link`,
      'POST',
      { linkedWithSiblings: shouldLink }
    )
  },

  linkTaskList(matterId, projectId, tasks) {
    return api(`matter/${matterId}/workstreams/${projectId}/link`, 'POST', {
      tasks: tasks.map(t => t.id),
      isLinked: tasks.map(t => t.datesLinkedToSiblings),
    })
  },

  linkAllSiblings(matterId, projectId, taskId, shouldLink) {
    return api(
      `matter/${matterId}/workstreams/${projectId}/task/${taskId}/linkAllSiblings`,
      'POST',
      { linkedWithSiblings: shouldLink }
    )
  },

  unarchiveTask(
    matterId,
    projectId,
    taskId,
    destinationProjectId,
    destinationParentId,
    destinationType,
    maintainTaskConsistency = false
  ) {
    let payload = {
      destinationParentType: destinationType,
      maintainTaskConsistency: maintainTaskConsistency,
    }

    if (destinationProjectId) {
      payload.destinationProjectId = destinationProjectId
    }

    // undefined because this can be 0 (Level A) and miss this
    if (destinationParentId !== undefined && destinationParentId !== '') {
      payload.destinationParentId = destinationParentId
    }

    return api(
      `matter/${matterId}/workstreams/${projectId}/task/${taskId}/unarchive`,
      'POST',
      payload
    )
  },

  getTaskTodos(userId) {
    return api(`user/${userId}/todo`)
  },

  getTaskSiblings(matterId, projectId, taskId) {
    return api(
      `matter/${matterId}/workstreams/${projectId}/task/${taskId}/siblings`
    )
  },

  getTaskChildren(matterId, projectId, taskId) {
    return api(
      `matter/${matterId}/workstreams/${projectId}/task/${taskId}/children`
    )
  },

  shiftTaskDates(matterId, projectId, taskId, daysShifted, shiftType) {
    let payload = {
      amount: daysShifted,
      directionInTime: shiftType,
    }
    return api(
      `matter/${matterId}/workstreams/${projectId}/task/${taskId}/shift`,
      'PATCH',
      payload
    )
  },

  bulkShiftTaskDates(matterId, projectId, daysShifted, shiftType, tasks) {
    let payload = {
      amount: daysShifted,
      directionInTime: shiftType,
      tasks: tasks,
    }
    return api(
      `matter/${matterId}/workstreams/${projectId}/bulkShift`,
      'PATCH',
      payload
    )
  },

  getAllMatterTasks(matter_id) {
    return api(`matter/${matter_id}/tasks`, 'GET')
  },
}
