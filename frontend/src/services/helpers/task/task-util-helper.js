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

import { TASK_STATUS } from '../../../app/constants'

import taskService from '../../../services/task/task-service'
import { formatReferenceNumber } from '../../../services/task/task-text-format-service'
import { flatTaskListFromTree } from '../../task/data-provider/task-list-data-provider'

export const levelNumberToLetter = levelNumber => {
  if (levelNumber > 0 && levelNumber < 7) {
    return String.fromCharCode(64 + levelNumber)
  }
}

export const getMilestoneOrTaskString = task =>
  task?.isMilestone ? 'milestone' : 'task'

export const getLevelATaskCount = project => {
  return (
    project &&
    project.tasks &&
    project.tasks.reduce(function (n, task) {
      return n + (task.level === 1)
    }, 0)
  )
}

export const buildTaskLevelName = task => {
  return (
    levelNumberToLetter(task.level) +
    '. ' +
    task.name +
    ' ' +
    formatReferenceNumber(task)
  )
}

export const getSiblings = (matterId, projectId, taskId) => {
  return taskService
    .getTaskSiblings(matterId, projectId, taskId)
    .then(result => result.body)
}

export const filterOutNotRequiredTasks = tasks => {
  if (tasks?.tasks) {
    tasks.tasks = tasks.tasks.filter(
      item => item.status !== TASK_STATUS.NOT_REQUIRED
    )
    tasks.tasks.forEach(item => filterOutNotRequiredTasks(item))
  }
  return tasks
}

export const getDeepestChildLevel = task => {
  if (task.tasks && task.tasks.length > 0) {
    let tasks = flatTaskListFromTree(task)
    tasks = tasks.map(t => t.level)
    tasks = tasks.sort(function (a, b) {
      return b - a
    })
    return tasks[0]
  }
  return task.level
}

export const filterTasksBasedOnFilter = (filter, tasks, matters) => {
  const mattersList = matters.matters
  let matchingMatters = []
  let matchingProjects = []
  //filter on task name, project name , matter name or client name
  return tasks.filter(task => {
    if (task.name.toLowerCase().includes(filter)) {
      return true
    }
    if (matchingMatters.includes(task.matterId)) {
      return true
    }
    if (matchingProjects.includes(task.projectId)) {
      return true
    }
    const matter = mattersList.find(m => m.id === task.matterId)
    if (!matter) {
      return false //error
    }
    if (matter.name.toLowerCase().includes(filter)) {
      matchingMatters.push(task.matterId)
      return true
    } else if (matter.clientName.toLowerCase().includes(filter)) {
      matchingMatters.push(task.matterId)
      return true
    }
    const project = matter.projects.find(p => p.id === task.projectId)
    if (!project) {
      return false //error
    }
    if (project.name.toLowerCase().includes(filter)) {
      matchingProjects.push(task.projectId)
      return true
    }

    return false
  })
}

// Maps a raw task-status value to its i18n key under `taskStatus.*`. Most raw
// values match their key directly; the not-yet-reached milestone value uses a
// camelCase key ('notYetReached') so it needs an explicit mapping.
const TASK_STATUS_LABEL_KEY = {
  [TASK_STATUS.NOT_STARTED_MILESTONE]: 'notYetReached',
}

export const getTaskStatusLabel = (t, status) =>
  t(`taskStatus.${TASK_STATUS_LABEL_KEY[status] ?? status}`)

export const convertTaskStatusString = (t, status) => {
  switch (status) {
    case TASK_STATUS.NOT_STARTED: {
      return t('taskStatus.not-started')
    }

    case TASK_STATUS.IN_PROGRESS: {
      return t('taskStatus.in-progress')
    }

    case TASK_STATUS.DONE: {
      return t('taskStatus.done')
    }
    case TASK_STATUS.NOT_REQUIRED: {
      return t('taskStatus.task-not-required')
    }
    default:
      break
  }
}

export const getSiblingTaskCount = siblings => {
  return siblings
    ? Math.max(siblings.filter(task => task.datesLinkedToSiblings).length, 0)
    : 0
}
