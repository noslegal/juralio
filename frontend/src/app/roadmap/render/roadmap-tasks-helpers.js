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

import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import ArrowDropUpIcon from '@mui/icons-material/ArrowDropUp'
import React from 'react'
import { getStatusColour } from '../../../services/helpers/task/task-status-colour-helper'
import { flatTaskListFromTree } from '../../../services/task/data-provider/task-list-data-provider'
import { ROADMAP_CONST, TASK_STATUS } from '../../constants'
import RoadmapConstants from '../helpers/roadmap-constants'
import {
  findParentStartDate,
  getEndDate,
  getStartDate,
  isPEDBeforeASD,
  isPlannedEndDateOverdue,
  isPlannedStartDateOverdue,
} from '../helpers/task-dates-helper'
import dayjs from 'dayjs'
import rawColours from '../../../theme/raw-colours'
import juralioColours from '../../../theme/juralio-colours'
export const getTaskLeftPosition = (
  task,
  timeScale,
  isMiniMap,
  populate,
  additionalOffset = 0,
  populateEndDate = null
) => {
  const sd = getStartDate(task, populate, populateEndDate)
  const ed = getEndDate(task, populate)
  let xPos = 0
  if (!sd && !ed) return timeScale(new Date(findParentStartDate(task)))
  if (!sd && ed) return timeScale(new Date(findParentStartDate(task)))
  if (sd) {
    xPos = timeScale(new Date(sd))
  } else if (ed) {
    return isMiniMap === true
      ? timeScale(new Date(ed))
      : timeScale(dayjs.utc(new Date()).startOf('day').toDate()) + 'px'
  }

  if (isMiniMap === true) {
    return xPos
  }

  return xPos + additionalOffset + 'px'
}

export const getNearestEndDateOfChildren = task => {
  if (task.tasks && task.tasks.length > 0) {
    let subtasks = flatTaskListFromTree(task)
      .map(t => getEndDate(t, false))
      .filter(t => t != null)
    if (subtasks && subtasks.length > 0) {
      return subtasks.sort().reverse()[0]
    }
  }
  return null
}

export const getNearestStartDateOfChildren = task => {
  if (task.tasks && task.tasks.length > 0) {
    let subtasks = flatTaskListFromTree(task)
      .map(t => getStartDate(t, false))
      .filter(t => t != null)
    if (subtasks && subtasks.length > 0) {
      return subtasks.sort().reverse()[0]
    }
  }
  return null
}

export const getNearestEndDateInTree = (
  task,
  tasks,
  ignoreParents = false,
  ignoreChildren = false
) => {
  if (task === null) {
    return null
  }
  let endDate = getEndDate(task, false)
  if (!ignoreParents) {
    let parent = task.parent ? tasks.find(t => t.id === task.parent.id) : null
    while (parent) {
      endDate = getEndDate(parent, false)

      if (endDate) return endDate

      parent = parent.parent
        ? tasks.find(pt => pt.id === parent.parent.id)
        : null
    }
  }
  if (!ignoreChildren) {
    let childrenDates = getNearestEndDateOfChildren(task)
    if (childrenDates) return childrenDates
  }
  if (endDate === null) {
    endDate = getEndDate(task, false)
  }

  return endDate
}

export const getNearestStartDateInTree = (
  task,
  tasks,
  ignoreChildren = false
) => {
  let startDate = getStartDate(task, false)
  let parents = []
  let parent = task.parent ? tasks.find(t => t.id === task.parent.id) : null
  while (parent) {
    startDate = getStartDate(parent, false)
    if (startDate) {
      parents.push(startDate)
    }
    parent = parent.parent ? tasks.find(pt => pt.id === parent.parent.id) : null
  }
  if (parents.length > 0) {
    return parents[0] //.sort()[0]
  } else {
    startDate = getStartDate(task, false)
  }
  if (!ignoreChildren) {
    let childrenDates = getNearestStartDateOfChildren(task)
    if (childrenDates) return childrenDates
  }
  return startDate
}

export const getTaskWidth = (
  task,
  timeScale,
  isMinimap,
  scaleX,
  populateStartDate = null,
  populateEndDate = null,
  useDefault = true
) => {
  const startDate = getStartDate(task, true, populateStartDate)
  const endDate = getEndDate(task, true, populateEndDate)
  let s = ''
  let e = ''
  if (startDate && typeof startDate === 'string') {
    s = startDate
      ? timeScale(dayjs(startDate.replace('Z', '')).startOf('day').toDate())
      : ''
  } else if (startDate) {
    s = timeScale(startDate)
  }
  if (endDate && typeof endDate === 'string') {
    e = endDate
      ? timeScale(dayjs(endDate.replace('Z', '')).endOf('day').toDate())
      : ''
  } else if (endDate) {
    e = timeScale(endDate)
  }

  let diff = 0
  if (s && e) diff = e - s

  if (isMinimap === true) {
    return diff > RoadmapConstants.TASK_WIDTH * scaleX
      ? diff
      : RoadmapConstants.TASK_WIDTH * scaleX
  } else {
    if (!useDefault) {
      return diff + 4
    }
    return diff > RoadmapConstants.TASK_WIDTH
      ? diff + 4
      : RoadmapConstants.TASK_WIDTH
  }
}

export const getBridgeLeftPosition = (
  task,
  timeScale,
  additionalOffset = 0,
  populatedStartDate,
  populatedEndDate
) => {
  const s = dayjs
    .utc(getStartDate(task, true, populatedStartDate))
    .startOf('day')
    .toDate()
  const e = getEndDate(task, true, populatedEndDate)

  if (task.status === TASK_STATUS.IN_PROGRESS) {
    if (isPEDBeforeASD(task)) {
      return (
        //this is the pin width, maybe?
        timeScale(
          dayjs(new Date(task.plannedEndDate.replace('Z', '')))
            .startOf('day')
            .toDate()
        ) +
        additionalOffset +
        12
      )
    }
  }

  if (dayjs(e).isBefore(dayjs(s))) {
    return timeScale(new Date(e)) - 5
  }

  if (s && e) {
    return timeScale(new Date(s))
  } else if (s) {
    return (
      timeScale(new Date(s)) -
      RoadmapConstants.PIN_WIDTH -
      RoadmapConstants.TASK_LEFT_EDGE_TO_DATE_PIN_DISTANCE +
      additionalOffset
    )
  } else if (e) {
    return timeScale(new Date(e)) + 2 + additionalOffset
  } else {
    return 0
  }
}

export const getBridgeWidth = (
  task,
  dimensions,
  timeScale,
  populatedStartDate,
  populatedEndDate
) => {
  const startDate = getStartDate(task, true, populatedStartDate)
  const endDate = getEndDate(task, true, populatedEndDate)

  let s = ''
  let e = ''
  if (startDate && typeof startDate === 'string') {
    s = startDate
      ? timeScale(dayjs(startDate.replace('Z', '')).startOf('day').toDate())
      : ''
  } else if (startDate) {
    s = timeScale(startDate)
  }
  if (endDate && typeof endDate === 'string') {
    e = endDate
      ? timeScale(dayjs(endDate.replace('Z', '')).endOf('day').toDate())
      : ''
  } else if (endDate) {
    e = timeScale(endDate)
  }

  if (task.status === TASK_STATUS.IN_PROGRESS) {
    if (isPEDBeforeASD(task)) {
      e = endDate
        ? timeScale(
            dayjs(
              typeof endDate === 'string' ? endDate.replace('Z', '') : endDate
            )
              .startOf('day')
              .toDate()
          )
        : e

      return s - e
    }
  }

  if (s && e) {
    //if end before start need to pad extra to cover pin
    let pad = e < s ? 20 : 0
    let diff = e - s
    return Math.abs(diff) + pad
  } else if (s || e) {
    return smallBridge()
  }

  return 0
}

function smallBridge() {
  return (
    RoadmapConstants.TASK_LEFT_EDGE_TO_DATE_PIN_DISTANCE +
    RoadmapConstants.PIN_WIDTH
  )
}

export const getRoadmapTasksWidth = () => {
  const width = document.getElementById('roadmap-tasks-wrapper')?.scrollWidth
  return width ? width : 0
}

export const getRoadmapTasksHeight = () => {
  const height = document.getElementById('roadmap-tasks-wrapper')?.scrollHeight
  return height ? height : 0
}

export const getRoadmapTasksLeftScroll = () => {
  const lscroll = document.getElementById('roadmap-tasks-wrapper')?.scrollLeft
  return lscroll ? lscroll : 0
}

export const getRoadmapTasksTopScroll = () => {
  const tscroll = document.getElementById('roadmap-tasks-wrapper')?.scrollTop
  return tscroll ? tscroll : 0
}

export const getRoadmapTasksLeftOffset = () => {
  const loffset = document.getElementById('roadmap-tasks-wrapper')?.offsetLeft
  return loffset ? loffset : 0
}

export const isTaskOnScreen = (task, dimensions) => {
  let current = getRoadmapTasksTopScroll()
  if (
    parseInt(task.style.top) < current + dimensions.height &&
    parseInt(task.style.top) > current
  ) {
    return undefined
  } else {
    let diff = parseInt(task.style.top) - current
    return diff - 100
  }
}

export const shouldShowFloatingTaskCell = (task, timeScale) => {
  const screenX = getRoadmapTasksLeftScroll()
  const taskCellWidth = getTaskWidth(task, timeScale)
  const taskCellLeftPos =
    timeScale(new Date(getStartDate(task))) - RoadmapConstants.PIN_WIDTH / 2

  if (
    screenX >= taskCellLeftPos &&
    screenX <= taskCellLeftPos + taskCellWidth
  ) {
    return true
  } else {
    return false
  }
}

export const allTasksAreFilteredOut = tasks => {
  const filteredTasks = tasks.filter(t => t.filteredOut)
  return filteredTasks && filteredTasks.length === tasks.length
}

export const shouldShowExpandable = task => {
  return (
    task.tasks.length &&
    task.tasks.length > 0 &&
    !allTasksAreFilteredOut(task.tasks)
  )
}

export const subTasksAreBeingDisplayed = (tasks, task) =>
  tasks.find(t => t?.id === task?.tasks[0]?.id)

export const expandIcon = (tasks, task) => {
  return shouldShowExpandable(task) ? (
    subTasksAreBeingDisplayed(tasks, task) ? (
      <ArrowDropUpIcon />
    ) : (
      <ArrowDropDownIcon />
    )
  ) : (
    ''
  )
}

export const expandText = (t, tasks, task) => {
  return shouldShowExpandable(task)
    ? subTasksAreBeingDisplayed(tasks, task)
      ? t('roadmapExpandableArea.collapse')
      : t('roadmapExpandableArea.expand')
    : t('roadmapExpandableArea.noSubtasks')
}

export const getBridgeColour = task => {
  const psdOverdue = isPlannedStartDateOverdue(task)
  const pedOverdue = isPlannedEndDateOverdue(task)

  if (task.status === TASK_STATUS.NOT_STARTED) {
    if (psdOverdue && pedOverdue) {
      return rawColours.roadmapPin.error.fill
    }
    if (psdOverdue || pedOverdue) {
      return rawColours.roadmapPin.error.fill
    }
  }

  if (task.status === TASK_STATUS.IN_PROGRESS) {
    if (isPEDBeforeASD(task)) {
      return rawColours.roadmapPin.error.fill
    }
  }

  return getStatusColour(task.status)
}

export const getSubtasksToDisplay = (project, currentTasks) => {
  //compares the list of tasks to get the tasks with any new data such as a date change then passes them down the tree
  const flatTaskList = flatTaskListFromTree(project)
  let listToDisplay = [...project.tasks]
  let taskIds = currentTasks.map(t => t.id)
  let subtasks = []
  //get the subtasks that need to displayed
  currentTasks.forEach(task => {
    if (
      task.parent &&
      taskIds.includes(task.parent.id) &&
      flatTaskList.find(t => t.id === task.id)
    ) {
      let parentChildrenTasks = flatTaskList.find(
        t => t.id === task.parent.id
      ).tasks
      parentChildrenTasks.forEach(child => (child.parent = task.parent))
      subtasks = [...subtasks, ...parentChildrenTasks]
    }
  })
  //filter to remove dupes
  subtasks = [...new Set(subtasks)]
  //loop over subtasks to add them in at the correct position
  subtasks.forEach(child => {
    let parentIndex = listToDisplay.indexOf(
      flatTaskList.find(t => t.id === child.parent.id)
    )
    let additionalIndex = 1
    while (
      parentIndex + additionalIndex < listToDisplay.length &&
      (listToDisplay[parentIndex + additionalIndex].id === child.parent.id ||
        listToDisplay[parentIndex + additionalIndex].parent?.id ===
          child.parent.id)
    ) {
      additionalIndex += 1
    }
    listToDisplay.splice(parentIndex + additionalIndex, 0, child)
  })
  listToDisplay = listToDisplay.filter(task => task !== -1)
  listToDisplay = [...new Set(listToDisplay)]

  return listToDisplay
}

export const getDatePinColour = (task, dateType, colourType) => {
  if (
    task.status === TASK_STATUS.DONE ||
    task.status === TASK_STATUS.DONE_MILESTONE
  ) {
    if (colourType === ROADMAP_CONST.FILL) {
      return rawColours.roadmapPin.done.fill
    } else {
      return rawColours.roadmapPin.done.stroke
    }
  }
  if (task.status === TASK_STATUS.IN_PROGRESS) {
    if (dateType === ROADMAP_CONST.START) {
      if (colourType === ROADMAP_CONST.FILL) {
        return rawColours.status.inProgress.dark
      } else {
        return rawColours.roadmapPin.inProgress.stroke
      }
    } else {
      if (colourType === ROADMAP_CONST.FILL) {
        return rawColours.roadmapPin.inProgress.fill
      } else {
        return rawColours.status.inProgress.dark
      }
    }
  }
  if (
    task.status === TASK_STATUS.NOT_STARTED ||
    task.status === TASK_STATUS.NOT_STARTED_MILESTONE
  ) {
    if (colourType === ROADMAP_CONST.FILL) {
      return rawColours.roadmapPin.notStarted.fill
    } else {
      return rawColours.roadmapPin.notStarted.stroke
    }
  }
  //if this is shown something has gone wrong
  return juralioColours.darkText.primary
}

export const isAtBoundText = (task, isStart) => {
  return 'Is at date boundary'
}
