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

import {
  filterOutLevelAndBelowTree,
  flatTaskListFromTree,
} from '../../../services/task/data-provider/task-list-data-provider'
import juralioColours from '../../../theme/juralio-colours'
import { TASK_STATUS } from '../../constants'
import cloneDeep from 'lodash/cloneDeep'

export const getBackgoundColour = task => {
  const taskCellColoursFilteredIn = {
    'task-not-required':
      juralioColours.taskCell.background.filteredIn.notRequired,
    'not-started': juralioColours.taskCell.background.filteredIn.notStarted,
    'in-progress': juralioColours.taskCell.background.filteredIn.inProgress,
    done: juralioColours.taskCell.background.filteredIn.done,
    undefined: juralioColours.taskCell.background.filteredIn.template, // Template task.
  }
  return taskCellColoursFilteredIn[task.status]
}

export const filterStructureByUser = (
  tasks,
  currentTask,
  flattenedTree,
  userId
) => {
  if (userId === 'UNASSIGNED') {
    if (
      tasks
        .filter(task => task.id === currentTask.id)[0]
        ?.teamMembers?.filter(u => u.enabled).length < 1
    ) {
      return true
    }
    if (flattenedTree.length > 0) {
      for (let i = 0; i < flattenedTree.length; i++) {
        const task = flattenedTree[i]
        if (
          tasks.find(t => t.id === task.id).teamMembers.filter(u => u.enabled)
            .length > 0
        ) {
          return false
        } else {
          return true
        }
      }
      return false
    }
  } else {
    if (
      tasks
        .filter(task => task.id === currentTask.id)[0]
        ?.teamMembers?.filter(u => u.enabled)
        ?.map(y => y.id)
        .includes(userId)
    ) {
      return true
    }
    if (flattenedTree.length > 0) {
      for (let i = 0; i < flattenedTree.length; i++) {
        let task = flattenedTree[i]
        if (
          tasks
            .find(t => t.id === task.id)
            .teamMembers?.filter(u => u.enabled)
            ?.map(y => y.id)
            .includes(userId)
        ) {
          return true
        }
      }
      return false
    }
  }

  return false
}

export const recursivleySpliceSiblings = (
  levelA,
  fullDetailTasks,
  taskMapFilter
) => {
  let index = levelA?.tasks?.length
  while (index >= 0) {
    let task = levelA.tasks[index]
    if (task) {
      if (task?.tasks?.length > 0) {
        recursivleySpliceSiblings(task, fullDetailTasks, taskMapFilter)
      }
      if (
        !taskMapFilter.statusDone &&
        task.status === TASK_STATUS.DONE &&
        !flatTaskListFromTree(task)
          .map(x => x.status === TASK_STATUS.DONE)
          .includes(true)
      ) {
        levelA.tasks.splice(index, 1)
      }
      if (
        !taskMapFilter.statusNotStarted &&
        task.status === TASK_STATUS.NOT_STARTED &&
        !flatTaskListFromTree(task)
          .map(x => x.status === TASK_STATUS.NOT_STARTED)
          .includes(true)
      ) {
        levelA.tasks.splice(index, 1)
      }
      if (
        !taskMapFilter.statusNotRequired &&
        task.status === TASK_STATUS.NOT_REQUIRED &&
        !flatTaskListFromTree(task)
          .map(x => x.status === TASK_STATUS.NOT_REQUIRED)
          .includes(true)
      ) {
        levelA.tasks.splice(index, 1)
      }

      if (
        taskMapFilter.statusMilestone &&
        !task.isMilestone &&
        !flatTaskListFromTree(task)
          .map(x => x.isMilestone)
          .includes(true)
      ) {
        levelA.tasks.splice(index, 1)
      }
      if (
        taskMapFilter.statusDeliverable &&
        !task.isDeliverable &&
        !flatTaskListFromTree(task)
          .map(x => x.isDeliverable)
          .includes(true)
      ) {
        levelA.tasks.splice(index, 1)
      }
      if (
        taskMapFilter.userFilter &&
        !filterStructureByUser(
          fullDetailTasks,
          task,
          flatTaskListFromTree(task),
          taskMapFilter.id
        )
      ) {
        levelA.tasks.splice(index, 1)
      }
      if (
        taskMapFilter.filterLabels?.length > 0 &&
        !filterStructureByLabels(
          fullDetailTasks,
          task,
          flatTaskListFromTree(task),
          taskMapFilter.filterLabels
        )
      ) {
        levelA.tasks.splice(index, 1)
      }
    }

    index -= 1
  }
}

export const recursivelyCollapseTasks = (
  taskList,
  expandCollapseTaskFilter
) => {
  taskList?.forEach(task => {
    if (expandCollapseTaskFilter.includes(task.id)) {
      task.tasks = []
    } else if (task?.tasks?.length > 0) {
      recursivelyCollapseTasks(task.tasks, expandCollapseTaskFilter)
    }
  })
}

export const getFilteredStructure = (
  taskMapFilter,
  taskmapStructure,
  tasks,
  levelFilter
) => {
  let firstFilter = cloneDeep(taskmapStructure).filter(ts => {
    if (taskMapFilter.statusNotRequired) {
      return true
    }
    if (!taskMapFilter.statusDone && ts.status === TASK_STATUS.DONE) {
      return false
    }
    if (
      !taskMapFilter.statusNotStarted &&
      ts.status === TASK_STATUS.NOT_STARTED
    ) {
      return false
    }

    return ts.status !== TASK_STATUS.NOT_REQUIRED
  })
  firstFilter.forEach(levelA => {
    recursivleySpliceSiblings(levelA, tasks, taskMapFilter)
  })
  recursivelyCollapseTasks(firstFilter, taskMapFilter.expandCollapseTaskFilter)
  let secondFilter = cloneDeep(firstFilter).filter(t => {
    let showTask = true
    if (
      taskMapFilter.statusMilestone &&
      !flatTaskListFromTree(t)
        .map(x => x.isMilestone)
        .includes(true) &&
      t.isMilestone !== true
    ) {
      showTask = false
    }
    if (
      taskMapFilter.statusDeliverable &&
      !flatTaskListFromTree(t)
        .map(x => x.isDeliverable)
        .includes(true) &&
      t.isDeliverable !== true
    ) {
      showTask = false
    }
    if (
      taskMapFilter.userFilter &&
      !filterStructureByUser(
        tasks,
        t,
        flatTaskListFromTree(t),
        taskMapFilter.id
      )
    ) {
      showTask = false
    }
    if (
      taskMapFilter?.filterLabels?.length > 0 &&
      !filterStructureByLabels(
        tasks,
        t,
        flatTaskListFromTree(t),
        taskMapFilter.filterLabels
      )
    ) {
      showTask = false
    }
    return showTask
  })
  if (levelFilter) {
    secondFilter = filterOutLevelAndBelowTree(
      secondFilter,
      taskMapFilter.levelFilter
    )
  }
  return secondFilter
}

export const filterStructureByLabels = (
  tasks,
  currentTask,
  flattenedTree,
  labels
) => {
  if (tasks.filter(task => task.id === currentTask.id)[0]?.labels) {
    let labelsInTask = tasks.filter(task => task.id === currentTask.id)[0]
      .labels
    for (let i = 0; i < labelsInTask.length; i++) {
      const label = labelsInTask[i]
      if (labels.includes(label.labelId)) {
        return true
      }
    }
  }
  if (flattenedTree.length > 0) {
    for (let i = 0; i < flattenedTree.length; i++) {
      const task = flattenedTree[i]
      const labelsInTask = tasks.find(t => t.id === task.id).labels
      if (labelsInTask) {
        for (let i = 0; i < labelsInTask.length; i++) {
          const label = labelsInTask[i]
          if (labels.includes(label.labelId)) {
            return true
          }
        }
        return false
      }
    }
    return false
  }
  return false
}

export const isPhaseGhost = (task, taskmapFilter) => {
  let isGhost = false
  if (taskmapFilter.statusMilestone && task.isMilestone !== true) {
    isGhost = true
  }
  if (taskmapFilter.statusDeliverable && task.isDeliverable !== true) {
    isGhost = true
  }
  if (
    taskmapFilter.userFilter &&
    !task.teamMembers.map(x => x.id).includes(taskmapFilter.id) &&
    taskmapFilter.id !== 'UNASSIGNED'
  ) {
    isGhost = true
  }
  if (
    taskmapFilter.userFilter &&
    task.teamMembers.length !== 0 &&
    taskmapFilter.id === 'UNASSIGNED'
  ) {
    isGhost = true
  }

  if (taskmapFilter?.filterLabels?.length > 0 && task.labels !== null) {
    let labelWasFound = false
    let labelsInTask = task.labels
    for (let i = 0; i < labelsInTask.length; i++) {
      const label = labelsInTask[i]
      if (taskmapFilter.filterLabels.includes(label.labelId)) {
        labelWasFound = true
      }
    }
    if (!labelWasFound) {
      isGhost = true
    }
  }

  if (taskmapFilter?.filterLabels?.length > 0 && task.labels === null) {
    isGhost = true
  }
  return isGhost
}
