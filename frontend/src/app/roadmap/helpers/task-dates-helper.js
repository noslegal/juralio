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

import { TASK_STATUS } from '../../constants'
import { isInThePast } from '../../../services/helpers/date-helper'
import dayjs from 'dayjs'

export const getStartDate = (
  data,
  populate = true,
  populateEndDate = findParentStartDate(data)
) => {
  if (!data) return null
  switch (data.status) {
    case TASK_STATUS.NOT_STARTED: {
      return data.plannedStartDate
        ? typeof data.plannedStartDate === 'string'
          ? data.plannedStartDate.replace('Z', '')
          : data.plannedStartDate
        : populate
          ? populateEndDate
          : null
    }
    case TASK_STATUS.IN_PROGRESS: {
      if (typeof data.actualStartDate === 'string') {
        return dayjs.utc(data.actualStartDate.replace('Z', '')).toDate()
      }
      return dayjs.utc(data.actualStartDate).toDate()
    }
    case TASK_STATUS.DONE: {
      if (typeof data.actualStartDate === 'string') {
        return dayjs
          .utc(data.actualStartDate.replace('Z', ''))
          .startOf('day')
          .toDate()
      }
      return dayjs.utc(data.actualStartDate).startOf('day').toDate()
    }
    case TASK_STATUS.NOT_REQUIRED: {
      return dayjs.utc(new Date()).startOf('day').toDate()
    }
    default:
      return null
  }
}
export const isPlannedStartDate = task =>
  task.status === TASK_STATUS.NOT_STARTED

export const isPlannedEndDate = task =>
  task.status === TASK_STATUS.NOT_STARTED ||
  task.status === TASK_STATUS.IN_PROGRESS

export const getEndDate = (
  data,
  populate = true,
  populateDate = dayjs(new Date()).endOf('day').toDate()
) => {
  if (data === null) return null
  switch (data.status) {
    case TASK_STATUS.NOT_STARTED: {
      return data.plannedEndDate
        ? typeof data.plannedEndDate === 'string'
          ? dayjs(data.plannedEndDate.replace('Z', '')).toDate()
          : dayjs(data.plannedEndDate).toDate()
        : populate
          ? populateDate
          : null
    }
    case TASK_STATUS.IN_PROGRESS: {
      return data.plannedEndDate
        ? typeof data.plannedEndDate === 'string'
          ? dayjs(data.plannedEndDate.replace('Z', '')).toDate()
          : dayjs(data.plannedEndDate).toDate()
        : populate
          ? populateDate
          : null
    }
    case TASK_STATUS.DONE: {
      return dayjs(data.actualEndDate.replace('Z', '')).endOf('day').toDate()
    }
    default:
      return null
  }
}

export const isPlannedStartDateOverdue = task =>
  isPlannedStartDate(task) && isInThePast(task.plannedStartDate)

export const isPlannedEndDateOverdue = task =>
  isPlannedEndDate(task) && isInThePast(task.plannedEndDate)

export const isPEDBeforeASD = task => {
  return (
    task.plannedEndDate &&
    task.actualStartDate &&
    dayjs(task.plannedEndDate).isBefore(dayjs(task.actualStartDate))
  )
}

export const findParentStartDate = task => {
  if (
    task.parent &&
    task.parent.plannedStartDate &&
    task.parent.status === TASK_STATUS.NOT_STARTED
  ) {
    return task.parent.plannedStartDate
  } else if (task.parent && task.parent.actualStartDate) {
    return task.parent.actualStartDate
  }
  if (task.parent) {
    return findParentStartDate(task.parent)
  }
  return dayjs.utc(new Date()).startOf('day').toDate()
}
