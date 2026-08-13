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

import { scaleTime } from 'd3-scale'
import dayjs from 'dayjs'

const getNow = () => {
  return dayjs().startOf('day')
}

/*
    If there is a task with no dates set

    tasks - list of tasks
 */
export const shouldIncludeToday = tasks => {
  const taskWithNoDates = tasks.find(
    task =>
      !task.plannedStartDate &&
      !task.plannedEndDate &&
      !task.actualStartDate &&
      !task.actualEndDate
  )
  return taskWithNoDates
}

/*
    Returns a scaleTime function.

    startDate - time stamp
    endDate   - time stamp
 */
export const getTimeScale = (startDate, endDate, width, shouldIncludeToday) => {
  let m_startDate = dayjs(startDate).startOf('day')
  let m_endDate = dayjs(endDate).startOf('day')

  if (!m_startDate.isValid() && !m_endDate.isValid()) {
    // Make range -+ 1 month from today
    m_startDate = getNow().subtract(1, 'months')
    m_endDate = getNow().add(1, 'months')
  } else if (shouldIncludeToday) {
    if (!m_startDate.isValid()) {
      m_startDate = getNow()
    } else if (!m_endDate.isValid()) {
      m_endDate = getNow()
    } else {
      if (dayjs() < m_startDate) {
        m_startDate = getNow()
      } else if (dayjs() > m_endDate) {
        m_endDate = getNow()
      }
    }
  }

  return scaleTime()
    .domain([m_startDate.toDate(), m_endDate.toDate()])
    .range([0, width])
}
/*
    Returns an x coordinate.

    timeScale - d3 time scale function
    date      - timestamp
 */
export const calcPositionX = (timeScale, date) => {
  let d = new Date()
  if (date) {
    d = new Date(date)
  }
  d.setHours(0, 0, 0, 0)

  return timeScale(d)
}
/*
    Returns a width for a task.

    timeScale - d3 time scale function
    startDate - timestamp
    endDate - timestamp
 */
export const calcWidth = (timeScale, startDate, endDate) => {
  const MINIMUM_WIDTH = 20 // px

  if (!startDate && !endDate) {
    return MINIMUM_WIDTH
  } else if (!startDate) {
    return MINIMUM_WIDTH
  } else if (!endDate) {
    return MINIMUM_WIDTH
  } else {
    let m_startDate = dayjs(startDate).startOf('day')
    let m_endDate = dayjs(endDate).startOf('day')
    const x_startDate = timeScale(m_startDate.toDate())
    const x_endDate = timeScale(m_endDate.toDate())
    const width = x_endDate - x_startDate
    if (width < MINIMUM_WIDTH) {
      return MINIMUM_WIDTH
    }
    return width
  }
}
