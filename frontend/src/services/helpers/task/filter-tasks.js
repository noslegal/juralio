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
import { filterTasksByUserId } from '../../../app/roadmap/helpers/filter-tasks'
import { flatTaskListFromTree } from '../../task/data-provider/task-list-data-provider'

export const filterOutLabels = (task, labels) => {
  return labels.some(l => task.labels?.map(label => label.labelId).includes(l))
}

export const filterTasks = (
  tasks,
  DONE,
  NOT_STARTED,
  NOT_REQUIRED,
  doneTasksToShow = [],
  labelsToShow = []
) => {
  if (!DONE) {
    if (tasks?.tasks) {
      tasks.tasks.forEach(item => {
        item.filteredOut =
          item.status === TASK_STATUS.DONE && !doneTasksToShow.includes(item.id)
        filterTasks(
          item,
          DONE,
          NOT_STARTED,
          NOT_REQUIRED,
          doneTasksToShow,
          labelsToShow
        )
      })
    }
  }
  if (!NOT_STARTED) {
    if (tasks?.tasks) {
      tasks.tasks = tasks.tasks.filter(
        item => item.status !== TASK_STATUS.NOT_STARTED
      )

      tasks.tasks.forEach(item => {
        filterTasks(
          item,
          DONE,
          NOT_STARTED,
          NOT_REQUIRED,
          doneTasksToShow,
          labelsToShow
        )
      })
    }
  }

  if (!NOT_REQUIRED) {
    if (tasks?.tasks) {
      tasks.tasks = tasks.tasks.filter(
        item => item.status !== TASK_STATUS.NOT_REQUIRED
      )
      tasks.tasks.forEach(item =>
        filterTasks(
          item,
          DONE,
          NOT_STARTED,
          NOT_REQUIRED,
          doneTasksToShow,
          labelsToShow
        )
      )
    }
  }
}

const equalsStatus = (
  DONE,
  NOT_STARTED,
  NOT_REQUIRED,

  status
) => {
  let filteredOut = false
  if (!DONE && status === TASK_STATUS.DONE) {
    filteredOut = true
  }
  if (!NOT_STARTED && status === TASK_STATUS.NOT_STARTED) {
    filteredOut = true
  }
  if (!NOT_REQUIRED && status === TASK_STATUS.NOT_REQUIRED) {
    filteredOut = true
  }

  return filteredOut
}

const equalsTaskType = (IS_MILESTONE, IS_DELIVERABLE, task) => {
  let filteredOut = false
  if (
    !flatTaskListFromTree(task)
      .map(x => x.isMilestone)
      .includes(true) &&
    task.isMilestone !== true &&
    IS_MILESTONE
  ) {
    filteredOut = true
  }
  if (
    !flatTaskListFromTree(task)
      .map(x => x.isDeliverable)
      .includes(true) &&
    task.isDeliverable !== true &&
    IS_DELIVERABLE
  ) {
    filteredOut = true
  }

  return filteredOut
}

const userInTask = (task, userId) => {
  const flattenedTree = flatTaskListFromTree(task)
  let filteredOut = true
  if (userId === 'UNASSIGNED') {
    if (flattenedTree.length > 0) {
      for (let i = 0; i < flattenedTree.length; i++) {
        const currTask = flattenedTree[i]
        if (
          currTask.teamMembers?.filter(u => u.enabled)?.length < 1 ||
          task.teamMembers?.filter(u => u.enabled)?.length < 1
        ) {
          filteredOut = false
        }
      }
    } else {
      if (task.teamMembers?.filter(u => u.enabled)?.length < 1) {
        filteredOut = false
      }
    }
  } else {
    if (flattenedTree.length > 0) {
      for (let i = 0; i < flattenedTree.length; i++) {
        const currTask = flattenedTree[i]
        if (
          currTask.teamMembers
            ?.filter(u => u.enabled)
            ?.map(y => y.id)
            .includes(userId) ||
          task.teamMembers
            ?.filter(u => u.enabled)
            ?.map(y => y.id)
            .includes(userId)
        ) {
          return false
        }
      }
    } else {
      if (
        task.teamMembers
          ?.filter(u => u.enabled)
          ?.map(y => y.id)
          .includes(userId)
      ) {
        return false
      }
    }
  }
  return filteredOut
}

const labelsOnTask = (task, labels) => {
  const flattenedTree = flatTaskListFromTree(task)
  let filteredOut = true
  if (flattenedTree.length === 0) {
    let parentLabels = task.labels.map(l => l.labelId)
    for (let i = 0; i < labels.length; i++) {
      const label = labels[i]
      if (parentLabels.includes(label)) {
        return false
      }
    }
  }
  for (let i = 0; i < flattenedTree.length; i++) {
    let currTask = flattenedTree[i]
    let labelsInTask = currTask.labels.map(l => l.labelId)
    let parentLabels = task.labels.map(l => l.labelId)
    for (let i = 0; i < labels.length; i++) {
      const label = labels[i]
      if (labelsInTask.includes(label) || parentLabels.includes(label)) {
        return false
      }
    }
  }
  return filteredOut
}

const filter = (
  task,
  DONE,
  NOT_STARTED,
  NOT_REQUIRED,
  IS_MILESTONE,
  IS_DELIVERABLE,
  FILTER_USER,
  USER_ID,
  labels = []
) => {
  task.filteredOut = equalsStatus(DONE, NOT_STARTED, NOT_REQUIRED, task.status)
  if (!task.filteredOut && (IS_MILESTONE || IS_DELIVERABLE)) {
    task.filteredOut = equalsTaskType(IS_MILESTONE, IS_DELIVERABLE, task)
  }
  if (!task.filteredOut && FILTER_USER) {
    task.filteredOut = userInTask(task, USER_ID)
  }
  if (!task.filteredOut && labels.length > 0) {
    task.filteredOut = labelsOnTask(task, labels)
  }
  task?.tasks?.forEach(t =>
    filter(
      t,
      DONE,
      NOT_STARTED,
      NOT_REQUIRED,
      IS_MILESTONE,
      IS_DELIVERABLE,
      FILTER_USER,
      USER_ID,
      labels
    )
  )
  return task
}

export const softFilterTasks = (
  tasks,
  DONE,
  NOT_STARTED,
  NOT_REQUIRED,
  IS_MILESTONE,
  IS_DELIVERABLE,
  FILTER_USER,
  USER_ID,
  labels = []
) => {
  tasks.forEach(task =>
    filter(
      task,
      DONE,
      NOT_STARTED,
      NOT_REQUIRED,
      IS_MILESTONE,
      IS_DELIVERABLE,
      FILTER_USER,
      USER_ID,
      labels
    )
  )
  return tasks
}

const expandTree = (
  task,
  labelsFilters = [],
  excludedChildrenId = [],
  taskMapFilter,
  matterTeam
) => {
  let userFilter = filterTasksByUserId(
    [task],
    taskMapFilter.id,
    taskMapFilter.email,
    matterTeam,
    {
      taskMemberOf: taskMapFilter.filterOptions.taskMemberOf,
      following: taskMapFilter.filterOptions.following,
      logicOperator: taskMapFilter.filterOptions.logicOperator,
    },
    false
  )

  //mark the task as shown if its labels match and its user filter matches
  const showTask =
    task.labels?.map(l => l.labelId).some(lid => labelsFilters.includes(lid)) ||
    (taskMapFilter.userFilter && userFilter.length > 0) ||
    (taskMapFilter.statusMilestone && task.isMilestone) ||
    (taskMapFilter.statusDeliverable && task.isDeliverable)
  if (task.tasks.filter(t => !excludedChildrenId.includes(t.id)).length === 0) {
    //id there are no valid children bail out early
    return { task: task, shown: showTask, children: [] }
  } else {
    //go map over the children
    let children = task.tasks
      .filter(tt => !excludedChildrenId.includes(tt.id))
      .map(ct =>
        expandTree(
          ct,
          labelsFilters,
          excludedChildrenId,
          taskMapFilter,
          matterTeam
        )
      )

    const shouldShow = showTask || children.map(c => c.shown).includes(true)
    if (children.map(c => c.shown).includes(true)) {
      //don't want to hide siblings on the expand, so show them all
      children = children.map(c => {
        c.shown = true
        return c
      })
    }
    return { task: task, shown: shouldShow, children: children }
  }
}

export const smartExpand = (
  tasks,
  labelsFilters,
  taskMapFilter,
  matterTeam
) => {
  let newTaskList = []
  let shownTaskId = tasks.map(t => t.id)
  for (let i = 0; i < tasks.length; i++) {
    let task = tasks[i]

    //children tasks that are already shown can be ignored
    let shownChildrenIds = flatTaskListFromTree(task)
      .filter(tt => shownTaskId.includes(tt.id))
      .map(i => i.id)

    let expandedTree = expandTree(
      task,
      labelsFilters,
      shownChildrenIds,
      taskMapFilter,
      matterTeam
    )
    let taskTree = [task]
    if (expandedTree.shown) {
      const addLevel = children => {
        for (let j = 0; j < children.length; j++) {
          let child = children[j]
          if (child.shown) {
            taskTree.push(child.task)
            if (child.children.length > 0) {
              addLevel(child.children)
            }
          }
        }
      }
      addLevel(expandedTree.children)
    }

    newTaskList = [...newTaskList, ...taskTree]
  }
  return newTaskList
}
