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
  getLatestDateFromTask,
  getEarliestDateFromTask,
  getLatestDateFromArray,
  getEarliestDateFromArray,
} from './task-helper'
import RoadmapConstants from '../helpers/roadmap-constants'

export const generateRoadmapData = (
  projectTasks = [],
  nowDate,
  timePeriod = 0
) => {
  const roadmapData = {
    isEmptyProject: false,
    earliestDate: null, // Earliest date taken from Project data.
    latestDate: null, // Latest date taken from Project data.
    rangeStart: null, // Date at the start of range once minimum range check.
    rangeEnd: null, // Date at the end of range once minimum range check.
    daysInRange: -1, // Number of days in range.
    todayDayPosition: 0,
    today: dayjs(nowDate).toISOString(),
  }
  roadmapData.isEmptyProject = projectTasks?.length === 0

  ensureMinimumDateRange(roadmapData, projectTasks, nowDate, timePeriod)

  return roadmapData
}

const ensureMinimumDateRange = (
  roadmapData,
  projectTasks,
  nowDate,
  timePeriod
) => {
  const tasks = [...projectTasks]
  let earlyDates = []
  let latestDates = []

  tasks.forEach(task => {
    if (!task.filteredOut) {
      let ed = getEarliestDateFromTask(task)
      let ld = getLatestDateFromTask(task)
      earlyDates.push(ed)
      latestDates.push(ld)
    }
  })

  earlyDates = earlyDates.filter(date => date != null)
  latestDates = latestDates.filter(date => date != null)

  roadmapData.earliestDate = getEarliestDateFromArray(earlyDates)
  roadmapData.latestDate = getLatestDateFromArray(latestDates)

  roadmapData.rangeStart = null
  roadmapData.rangeEnd = null
  let minEnd = dayjs(
    roadmapData.latestDate !== null ? roadmapData.latestDate : new Date()
  )
  let minStart = dayjs(
    roadmapData.earliestDate !== null ? roadmapData.earliestDate : new Date()
  )
  roadmapData.rangeStart = minStart.toISOString()
  roadmapData.rangeEnd = minEnd.toISOString()

  let start = dayjs(roadmapData.rangeStart)
  let end = dayjs(roadmapData.rangeEnd)
  roadmapData.daysInRange = Math.abs(start.diff(end, 'day'))
  roadmapData.actualDaysInRange = roadmapData.daysInRange
  start = start.subtract(Math.ceil(roadmapData.daysInRange * 0.05), 'day')
  end = end.add(Math.ceil(roadmapData.daysInRange * 0.275), 'day')
  //this is where roadmap scale is calculated

  if (
    timePeriod === RoadmapConstants.TIMESCALE_ENTIRE_INT ||
    timePeriod === RoadmapConstants.TIMESCALE_QUARTER_INT ||
    timePeriod === RoadmapConstants.TIMESCALE_YEAR_INT
  ) {
    //round out the months
    start = start.startOf('month')
    end = end.endOf('month')
  }
  if (timePeriod === RoadmapConstants.TIMESCALE_MONTH_INT) {
    //round the week
    start = start.startOf('week')
    end = end.endOf('week')
  }
  roadmapData.daysInRange = Math.abs(start.diff(end, 'day'))
  roadmapData.todayDayPosition =
    Math.abs(start.diff(dayjs(new Date()), 'day')) + 1
  roadmapData.rangeStart = start.toISOString()
  roadmapData.rangeEnd = end.toISOString()
}
