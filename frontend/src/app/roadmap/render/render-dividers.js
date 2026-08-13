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

import RoadmapConstants from '../helpers/roadmap-constants'

import './roadmap.css'
import { generateDataPoints } from '../roadmap-zoom'

export const getLabelText = (date, timePeriod) => {
  switch (timePeriod) {
    case 1:
      return date.toLocaleString('en-GB', {
        year: 'numeric',
        day: 'numeric',
        month: 'short',
      })
    case 2:
      return date.toLocaleString('en-GB', {
        year: 'numeric',
        day: 'numeric',
        month: 'short',
      })
    case 3:
      return date.toLocaleString('en-GB', {
        year: 'numeric',
        month: 'short',
      })
    default:
      return date.toLocaleString('en-GB', {
        year: 'numeric',
        month: 'short',
      })
  }
}

export const generateLabelData = (
  dimensions,
  startDate,
  endDate,
  timePeriod = RoadmapConstants.TIMESCALE_ENTIRE_INT
) => {
  const dataPoints = generateDataPoints(timePeriod, startDate, endDate)

  const datePointer = startDate
  const diffTime = Math.abs(endDate - startDate)
  const divCounter = Math.ceil(diffTime / (1000 * 60 * 60 * 24 * 31 * 12))
  const labelData = Array.apply(null, Array(dataPoints)).map((data, i) => {
    const out = new Date(datePointer)
    switch (timePeriod) {
      case 1:
        datePointer.setDate(datePointer.getDate() + 1)
        break
      case 2:
        datePointer.setDate(datePointer.getDate() + 4)
        break
      case 3:
        datePointer.setMonth(datePointer.getMonth() + 1, 1)
        break
      default:
        datePointer.setMonth(datePointer.getMonth() + divCounter, 1)
    }
    return out
  })
  return labelData.filter(
    t => new Date(t).getTime() <= new Date(endDate).getTime()
  )
}
