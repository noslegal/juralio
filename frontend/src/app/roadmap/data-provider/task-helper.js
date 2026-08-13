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
  getNearestEndDateOfChildren,
  getNearestStartDateOfChildren,
} from '../render/roadmap-tasks-helpers'

export const getLatestDateFromTask = task => {
  const dates = getTaskDates(task)

  return dates.length === 0 ? null : getLatestDateFromArray(dates)
}

export const getEarliestDateFromTask = task => {
  const dates = getTaskDates(task)

  return dates.length === 0 ? null : getEarliestDateFromArray(dates)
}

export const getLatestDateFromArray = a => {
  if (a.length === 0) return null
  return a.reduce((a, b) => (new Date(a) > new Date(b) ? a : b))
}

export const getEarliestDateFromArray = a => {
  if (a.length === 0) return null
  return a.reduce((a, b) => (new Date(a) < new Date(b) ? a : b))
}

const getTaskDates = task => {
  const dates = []
  if (task.plannedStartDate) dates.push(task.plannedStartDate)
  if (task.plannedEndDate) dates.push(task.plannedEndDate)
  if (task.actualStartDate) dates.push(task.actualStartDate)
  if (task.actualEndDate) dates.push(task.actualEndDate)
  if (!task.actualEndDate && !task.plannedEndDate) {
    let childrenDate = getNearestEndDateOfChildren(task)
    if (childrenDate) {
      dates.push(new Date(childrenDate).toISOString())
    }
    let date = new Date()
    date.setHours(0, 0, 0, 0)
    dates.push(date.toISOString())
  }
  if (!task.actualStartDate && !task.plannedStartDate) {
    let childrenDate = getNearestStartDateOfChildren(task)
    if (childrenDate) {
      dates.push(new Date(childrenDate).toISOString())
    }
    let date = new Date()
    date.setHours(0, 0, 0, 0)
    dates.push(date.toISOString())
  }
  return dates
}
