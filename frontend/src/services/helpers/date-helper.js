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

import dayjs from 'dayjs'
import {
  DATE_FORMAT_FULL,
  DATE_FORMAT_MONTH_YEAR,
  DATE_STRINGS,
  DAY_MONTH_FORMAT,
  TASK_STATUS,
  TIME_FORMAT_HOURS_MINUTES,
  TIME_FORMAT_HOURS_MINUTES_SECONDS,
  TIME_STAMP_FORMAT_FULL,
} from '../../app/constants'
import { getTaskAncestors } from '../../components/data-display/task-path/task-path-helper'
import utc from 'dayjs/plugin/utc'
dayjs.extend(utc)

export function calculateStartDate(days) {
  return dayjs().subtract(days, 'day').startOf('day').toISOString()
}

export function calculateEndDate(days) {
  return dayjs().add(days, 'day').endOf('day').toISOString()
}

export const getMonthYearDisplayString = date =>
  dayjs(date).format(DATE_FORMAT_MONTH_YEAR)

export function getTimeStampUTC(date) {
  return dayjs(date).utc().format(TIME_STAMP_FORMAT_FULL)
}

export function getDateDisplayStringUTC(date) {
  return dayjs(date).utc().format(DATE_FORMAT_FULL)
}
export function getTimeDisplayStringUTC(date) {
  return dayjs(date).utc().format(TIME_FORMAT_HOURS_MINUTES)
}

export function getTimeDisplayStringSecondsUTC(date) {
  return dayjs(date).utc().format(TIME_FORMAT_HOURS_MINUTES_SECONDS)
}

export function getDateDisplayString(date, dateFormat, fulldateOnly) {
  if (!date) {
    return undefined
  }
  if (!dateFormat) {
    dateFormat = DATE_FORMAT_FULL
  }
  const currentDate = dayjs().utc().startOf('day')

  const endDate = dayjs(date).utc(true).startOf('day') //.add(1, 'millisecond')
  const comparison = endDate.diff(currentDate, 'day')

  if (!fulldateOnly) {
    if (comparison === 0) return DATE_STRINGS.TODAY
    //if (comparison === 1) return 'Tomorrow'
    //if (comparison === -1) return 'Yesterday'
  }
  return dayjs(date).format(dateFormat)
}

export function getDatePostList(date, t) {
  if (!date) {
    return undefined
  }

  const currentDate = new Date(Date.now())
  const endDate = dayjs(dayjs(date)).startOf('day')
  const comparison = endDate.diff(currentDate, 'day')

  if (comparison === 0) return DATE_STRINGS.TODAY
  if (comparison === -1) return 'Yesterday'
  if (comparison < -1 && comparison > -15) {
    return Math.abs(comparison) + t('timePeriodAgo.day')
  }
  if (comparison < -14 && comparison > -61) {
    const weekDiff = endDate.diff(currentDate, 'week')
    return Math.abs(weekDiff) + t('timePeriodAgo.week')
  }
  if (comparison < -60) {
    const monthDiff = endDate.diff(currentDate, 'month')
    return Math.abs(monthDiff) + t('timePeriodAgo.month')
  }
}

export function getTimeDisplayString(date) {
  if (date) {
    return dayjs(date).format(TIME_FORMAT_HOURS_MINUTES)
  }
}
export function getDayMonthDisplayString(date) {
  if (date) {
    return dayjs(date).format(DAY_MONTH_FORMAT)
  }
}

export function isInThePast(date) {
  if (!date) return false
  return getDateAtStartOfDay(new Date()).getTime() > new Date(date).getTime()
}

export function isInThePastOrToday(date) {
  return dayjs(dayjs(date)).startOf('day') <= dayjs().startOf('day')
}

export function actualStartDateIsValid(asd, selectedTask) {
  let subtaskHasAEDLaterThanASD = selectedTask.tasks.filter(
    subtask =>
      subtask.actualEndDate && dayjs(subtask.actualEndDate).isBefore(dayjs(asd))
  )

  return !subtaskHasAEDLaterThanASD || subtaskHasAEDLaterThanASD.length === 0
}

export function isSameDay(startDate, endDate) {
  if (!startDate || !endDate) {
    return false
  }
  const start = dayjs(dayjs(startDate)).startOf('day')
  const end = dayjs(dayjs(endDate)).startOf('day')

  return end.diff(start, 'day') === 0
}

export function sortObjectArrayByDateField(
  objects,
  fieldName,
  sortNewestFirst
) {
  if (!objects || objects.length < 1) {
    return []
  }
  let result = objects.sort(function (a, b) {
    return new Date(a[fieldName]) - new Date(b[fieldName])
  })
  if (sortNewestFirst) result = result.reverse()
  return result
}

export const getDateTimeDisplayStrings = (
  date,
  dateFormat = DATE_FORMAT_FULL,
  fulldateOnly = false
) => {
  return {
    date: getDateDisplayString(date, dateFormat, fulldateOnly),
    time: getTimeDisplayString(date, dateFormat, fulldateOnly),
  }
}

export const getActualMinMaxDatesFromList = tasks => {
  let minDate = undefined
  let maxDate = undefined

  tasks.forEach(task => {
    if (task.actualStartDate) {
      if (!minDate) {
        minDate = task.actualStartDate
      } else if (task.actualStartDate < minDate) {
        minDate = task.actualStartDate
      }
    }
    if (task.actualEndDate) {
      if (!maxDate) {
        maxDate = task.actualEndDate
      } else if (task.actualEndDate > maxDate) {
        maxDate = task.actualEndDate
      }
    }
  })

  return {
    minDate,
    maxDate,
  }
}

export const getBestMinMaxDatesFromList = tasks => {
  let minDate = undefined
  let maxDate = undefined
  let actualSDate = undefined
  tasks.forEach(task => {
    if (task.plannedStartDate) {
      if (!minDate) {
        minDate = task.plannedStartDate
      } else if (task.plannedStartDate < minDate) {
        minDate = task.plannedStartDate
      }
    }
    if (task.plannedEndDate) {
      if (!maxDate) {
        maxDate = task.plannedEndDate
      } else if (task.plannedEndDate > maxDate) {
        maxDate = task.plannedEndDate
      }
    }
    if (task.actualStartDate) {
      if (!actualSDate) {
        actualSDate = task.actualStartDate
      } else if (task.actualStartDate > actualSDate) {
        actualSDate = task.actualStartDate
      }
    }
  })
  if (actualSDate) {
    minDate = actualSDate
  }

  return {
    minDate,
    maxDate,
  }
}

export const getMilestoneDateLimits = milestone => {
  let minDate, maxDate
  const ancestors = getTaskAncestors(milestone)
  if (milestone.status === TASK_STATUS.DONE) {
    const actualLimits = getActualMinMaxDatesFromList(ancestors)
    minDate = actualLimits.minDate ? actualLimits.minDate : undefined
    maxDate = actualLimits.maxDate ? actualLimits.maxDate : new Date()
  } else {
    const plannedLimits = getBestMinMaxDatesFromList(ancestors)
    minDate = plannedLimits.minDate
      ? plannedLimits.minDate
      : new Date().setFullYear(1900)
    maxDate = plannedLimits.maxDate
      ? plannedLimits.maxDate
      : new Date().setFullYear(2099)
  }
  return {
    minDate,
    maxDate,
  }
}

export const getEarliestDateFromListOfTasks = tasks => {
  let earliestDate = null
  let dates = tasks
    .map(task => [
      task.plannedStartDate,
      task.plannedEndDate,
      task.actualStartDate,
      task.actualEndDate,
    ])
    .flat()
    .filter(t => t !== null && t !== undefined)
    .map(t => new Date(t))
  dates.forEach(date => {
    if (earliestDate === null) {
      earliestDate = date
    } else {
      if (date < earliestDate) {
        earliestDate = date
      }
    }
  })
  return earliestDate
}

export const getLatestDateFromListOfTasks = tasks => {
  let latestDate = null
  let dates = tasks
    .map(task => [
      task.plannedStartDate,
      task.plannedEndDate,
      task.actualStartDate,
      task.actualEndDate,
    ])
    .flat()
    .filter(t => t !== null && t !== undefined)
    .map(t => new Date(t))

  dates.forEach(date => {
    if (latestDate === null) {
      latestDate = date
    } else {
      if (date > latestDate) {
        latestDate = date
      }
    }
  })
  return latestDate
}

export const getDateAtStartOfDay = date => {
  let startOfDay = new Date(date)
  startOfDay.setHours(0)
  startOfDay.setMinutes(0)
  startOfDay.setSeconds(0)
  startOfDay.setMilliseconds(0)
  return startOfDay
}
