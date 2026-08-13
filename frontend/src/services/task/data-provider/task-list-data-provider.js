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

import { TASK_MAP, TASK_MAP_LEVELS, TASK_STATUS } from '../../../app/constants'

export function flatTaskListFromTree(taskTree) {
  const flatList = []
  if (!taskTree || !taskTree.tasks) return []
  taskTree.tasks.forEach(task => walk(task))
  return flatList

  function walk(task) {
    flatList.push(task)
    if (!task?.tasks || task?.tasks.length === 0) return
    task.tasks.forEach(task => walk(task))
  }
}

const checkAllTasksAreFilteredOut = tasks => {
  let filteredTasks = tasks.filter(t => t.filteredOut)
  return filteredTasks && filteredTasks.length === tasks.length
}

export function getTaskDepthOfNonFilteredTasks(task) {
  let maxDepth = 1
  const nextLevel = 2
  if (checkAllTasksAreFilteredOut(task.tasks)) return maxDepth
  task.tasks.forEach(task => walk(task, nextLevel))
  return maxDepth

  function walk(task, depth) {
    maxDepth = Math.max(maxDepth, depth)
    if (checkAllTasksAreFilteredOut(task.tasks)) return
    if (!task.tasks || task.tasks.length === 0) return
    const nextLevel = depth + 1
    task.tasks.forEach(task => walk(task, nextLevel))
  }
}

export function getTaskDepth(task) {
  let maxDepth = 1
  const nextLevel = 2
  task.tasks.forEach(task => walk(task, nextLevel))
  return maxDepth

  function walk(task, depth) {
    maxDepth = Math.max(maxDepth, depth)
    if (!task.tasks || task.tasks.length === 0) return
    const nextLevel = depth + 1
    task.tasks.forEach(task => walk(task, nextLevel))
  }
}

export function filterOutAtLevelAndBelow(taskList, level) {
  return taskList.filter(i => i.level < level)
}

export function filterOutLevelAndBelowTree(tree, filterLevel) {
  tree.forEach(phase => {
    const nextLevel = 2
    if (filterLevel === 1) {
      phase.tasks = []
    } else if (phase.tasks) {
      phase.tasks.forEach(task => walk(task, nextLevel, filterLevel))
    }
  })
  return tree

  function walk(task, depth, filterLevel) {
    if (!task?.tasks || task?.tasks.length === 0) return
    if (filterLevel === depth) {
      task.tasks = []
      return
    }

    const nextLevel = depth + 1
    task.tasks.forEach(task => walk(task, nextLevel, filterLevel))
  }
}

export function filterOutTaskById(taskList, id) {
  return taskList.filter(i => i.id !== id)
}

export function getTaskById(taskList, id) {
  for (let i = 0; i < taskList.length; i++)
    if (taskList[i].id === id) return taskList[i]
}

export function getTaskByIdFromTree(taskTree, id) {
  let targetTask = undefined
  taskTree.tasks.forEach(task => {
    if (!targetTask) walk(task)
  })
  return targetTask

  function walk(task) {
    if (task.id === id) {
      targetTask = task
      return
    }
    if (targetTask !== undefined || !task.tasks || task.tasks.length === 0)
      return
    task.tasks.forEach(task => {
      walk(task)
    })
  }
}

export function filterOutSelfParentAndChildrenOfTask(
  taskList,
  taskTree,
  parentId
) {
  const flatChildList = flatTaskListFromTree(taskTree)
  flatChildList.forEach(childTask => {
    taskList = filterOutTaskById(taskList, childTask.id)
  })
  taskList = filterOutTaskById(taskList, taskTree.id)
  return parentId !== undefined
    ? filterOutTaskById(taskList, parentId)
    : taskList
}

const filterOutNotRequired = taskList => {
  return taskList.filter(task => task.status !== TASK_STATUS.NOT_REQUIRED)
}

const filterOutMilesstones = taskList => {
  return taskList.filter(task => !task.isMilestone)
}

export function buildValidTargetTaskList(
  taskTree,
  selectedTaskId,
  parentTaskId
) {
  const projecTaskTree = {
    tasks: taskTree,
  }
  const sourceTask = getTaskByIdFromTree(projecTaskTree, selectedTaskId)
  if (!sourceTask) {
    return null
  }

  const taskDepth = getTaskDepth(sourceTask)
  const filteredFlatList = filterOutSelfParentAndChildrenOfTask(
    flatTaskListFromTree(projecTaskTree),
    sourceTask,
    parentTaskId
  )
  const filteredOutNotRequired = filterOutNotRequired(filteredFlatList)
  const filteredOutMilestones = filterOutMilesstones(filteredOutNotRequired)
  return mapItemsDisabled(
    filteredOutMilestones,
    TASK_MAP.MAX_TASK_DEPTH - (taskDepth - 1)
  )
}

export const isLevelFTaskOrGreater = task => task.level > TASK_MAP_LEVELS.E

const mapItemsDisabled = (taskList, level) => {
  return taskList.map(item => {
    return {
      ...item,
      disabled: item.level >= level,
    }
  })
}
