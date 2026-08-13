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
  getEarliestDateFromListOfTasks,
  getLatestDateFromListOfTasks,
} from '../../../services/helpers/date-helper'
import { TASK_STATUS } from '../../constants'
import { getEndDate, getStartDate } from './task-dates-helper'
import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'
dayjs.extend(utc)

export const getErrorDate = (task, isStart) => {
  if (isStart) {
    //dates in past parents are errors
    let tasks = []
    let _task = task
    while (_task.parent != null) {
      tasks.push(_task.parent)
      _task = _task.parent
    }
    let dates = tasks.map(task => {
      return { plannedStartDate: getStartDate(task, false) }
    })
    return getLatestDateFromListOfTasks(dates)
  }
  if (!isStart) {
    //dates in future parents are errors
    let tasks = []
    let _task = task
    while (_task.parent != null) {
      tasks.push(_task.parent)
      _task = _task.parent
    }
    let dates = tasks.map(task => {
      return { plannedStartDate: getEndDate(task, false) }
    })
    if (task.status === TASK_STATUS.DONE) {
      dates.push({ plannedStartDate: dayjs.utc().toDate() })
    }
    return getEarliestDateFromListOfTasks(dates)
  }
  return null
}

export const checkIfVisible = rect => {
  return (
    rect.top >= 0 &&
    rect.left >= 0 &&
    rect.bottom <=
      (window.innerHeight || document.documentElement.clientHeight) &&
    rect.right <= (window.innerWidth || document.documentElement.clientWidth)
  )
}
export const checkIfPartiallyVisible = rect => {
  return (
    (rect.left > 0 && rect.left < window.innerWidth) ||
    (rect.right > 0 && rect.right <= window.innerWidth) ||
    (rect.left <= 0 && rect.right >= window.innerWidth)
  )
}

export const getAllSubTasks = task => {
  const getTaskFlatList = taskTree => {
    let flatList = []
    const children = taskTree.tasks || []
    children.forEach(task => walk(task))
    return flatList

    function walk(task) {
      flatList.push(task)
      if (!task.tasks || task.tasks.length === 0) return
      task.tasks.forEach(task => walk(task))
    }
  }
  let tasks = getTaskFlatList(task)
  return tasks
}
