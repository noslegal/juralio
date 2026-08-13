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
import { calcPositionX, calcWidth, getTimeScale } from './roadmap-helpers'

const getNow = () => dayjs().startOf('day').toDate()

describe('roadmap-helpers.test', () => {
  describe('getTimeScale()', () => {
    describe('when given time range of 01/01/2022 to 25/01/2022 with width 100px', () => {
      test('should return time scale with domain of 01/01/2022-25/01/2022 and range of 0-100px', () => {
        const data = {
          startDate: '2022-01-01T00:00:00.000Z',
          endDate: '2022-01-25T14:00:00.000Z',
          width: 100,
        }
        const result = getTimeScale(data.startDate, data.endDate, data.width)
        expect(result.domain()).toEqual([
          new Date(data.startDate),
          dayjs(data.endDate).startOf('day').toDate(),
        ])
        expect(result.range()).toEqual([0, data.width])
      })
    })
    describe('when given time range of 01/01/2022 to 25/01/2022 with width 100px but told to include today', () => {
      test("should return time scale with domain of 01/01/2022-(today's date) and range of 0-100px", () => {
        const data = {
          startDate: '2022-01-01T00:00:00.000Z',
          endDate: '2022-01-25T14:00:00.000Z',
          width: 100,
          shouldIncludeToday: true,
        }
        const now = getNow()
        const result = getTimeScale(
          data.startDate,
          data.endDate,
          data.width,
          data.shouldIncludeToday
        )
        expect(result.domain()).toEqual([new Date(data.startDate), now])
        expect(result.range()).toEqual([0, data.width])
      })
    })
    describe('when given time range of 01/01/3000 to 25/01/3000 with width 100px but told to include today', () => {
      test("should return time scale with domain of (today's date)-25/01/3000 and range of 0-100px", () => {
        const data = {
          startDate: '3000-01-01T00:00:00.000Z',
          endDate: '3000-01-25T14:00:00.000Z',
          width: 100,
          shouldIncludeToday: true,
        }
        const now = getNow()
        const result = getTimeScale(
          data.startDate,
          data.endDate,
          data.width,
          data.shouldIncludeToday
        )
        expect(result.domain()).toEqual([
          now,
          dayjs(data.endDate).startOf('day').toDate(),
        ])
        expect(result.range()).toEqual([0, data.width])
      })
    })
    describe('when given invalid dates', () => {
      test('should return time scale with domain of (a month before today)-(a month after today) and range of 0-100px', () => {
        const data = {
          startDate: '1990-13-81T00:00:00.000Z',
          endDate: '2981-90-99T14:00:00.000Z',
          width: 100,
          shouldIncludeToday: true,
        }
        let monthBeforeNow = dayjs()
          .subtract(1, 'months')
          .startOf('day')
          .toDate()
        let monthAfterNow = dayjs().add(1, 'months').startOf('day').toDate()
        const result = getTimeScale(
          data.startDate,
          data.endDate,
          data.width,
          data.shouldIncludeToday
        )
        expect(result.domain()).toEqual([monthBeforeNow, monthAfterNow])
        expect(result.range()).toEqual([0, data.width])
      })
    })
  })
  describe('calcPositionX()', () => {
    describe('when given a timescale 01/01/22-25/01/22 and a task date within the range', () => {
      test('should return a number within 0-100', () => {
        const data = {
          timeScale: scaleTime()
            .domain([new Date(2022, 0, 1), new Date(2022, 1, 25)])
            .range([0, 100]),
          date: '2022-01-05T00:00:00.000Z',
        }
        const result = calcPositionX(data.timeScale, data.date)
        expect(result).toBeGreaterThan(0)
        expect(result).toBeLessThan(100)
      })
    })
  })
  describe('calcWidth()', () => {
    describe('when given a timescale 01/01/22-25/01/22 and a task start and end dates within the range', () => {
      test('should return a number within 0-100', () => {
        const data = {
          timeScale: scaleTime()
            .domain([new Date(2022, 0, 1), new Date(2022, 1, 25)])
            .range([0, 100]),
          startDate: '2022-01-05T00:00:00.000Z',
          endDate: '2022-01-20T14:00:00.000Z',
        }
        const result = calcWidth(data.timeScale, data.startDate, data.endDate)
        expect(result).toBeGreaterThan(0)
        expect(result).toBeLessThan(100)
      })
    })
    describe('when given a timescale 01/01/22-25/01/22 and a task start and end dates outwith the range', () => {
      test('should return a number within 0-100', () => {
        const data = {
          timeScale: scaleTime()
            .domain([new Date(2022, 0, 1), new Date(2022, 1, 25)])
            .range([0, 100]),
          startDate: '3000-01-05T00:00:00.000Z',
          endDate: '3000-01-20T14:00:00.000Z',
        }
        const result = calcWidth(data.timeScale, data.startDate, data.endDate)
        expect(result).toBeGreaterThan(0)
        expect(result).toBeLessThan(100)
      })
    })
    describe('when given a timescale 01/01/22-25/01/22 and a task start and but NO end date', () => {
      test('should return the minimum width', () => {
        const data = {
          timeScale: scaleTime()
            .domain([new Date(2022, 0, 1), new Date(2022, 1, 25)])
            .range([0, 100]),
          startDate: '2022-01-05T00:00:00.000Z',
        }
        const result = calcWidth(data.timeScale, data.startDate, data.endDate)
        expect(result).toEqual(20)
      })
    })
    describe('when given a timescale 01/01/22-25/01/22 and a task end and but NO start date', () => {
      test('should return the minimum width', () => {
        const data = {
          timeScale: scaleTime()
            .domain([new Date(2022, 0, 1), new Date(2022, 1, 25)])
            .range([0, 100]),
          endDate: '2022-01-20T00:00:00.000Z',
        }
        const result = calcWidth(data.timeScale, data.startDate, data.endDate)
        expect(result).toEqual(20)
      })
    })
  })
})
