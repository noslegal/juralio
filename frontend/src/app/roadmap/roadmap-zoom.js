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

import RoadmapConstants from './helpers/roadmap-constants'
import dayjs from 'dayjs'
export const zoomToTimePeriod = (timePeriod, roadMapData) => {
  let offSetFromToday = 0
  switch (timePeriod) {
    case 0: //entire
      break
    case 1: //week
      offSetFromToday = 1
      break
    case 2: //month
      offSetFromToday = 3

      break
    case 3: //quarter
      offSetFromToday = 10
      break
    case 4: //year
      offSetFromToday = 30
      break
    default:
      break
  }
  if (!document.getElementById('roadmap-tasks-wrapper')) {
    return
  }
  return offSetFromToday
}

export const getTimescaleDivider = (timePeriod, dataPoints) => {
  switch (timePeriod) {
    case 1:
      return RoadmapConstants.TIMESCALE_WEEK
    case 2:
      return RoadmapConstants.TIMESCALE_MONTH
    case 3:
      return RoadmapConstants.TIMESCALE_QUARTER
    case 4:
      return RoadmapConstants.TIMESCALE_YEAR
    default:
      return dataPoints
  }
}

export const generateDataPoints = (timePeriod, startDate, endDate) => {
  return dayjs(endDate).diff(dayjs(startDate), 'day') + 1
}

export const getTodayPosition = (
  viewableWidth,
  totalDays,
  todayDayPosition,
  timescale,
  d
) => {
  return timescale(d)
}
