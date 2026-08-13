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
  getLatestDateFromTask,
  getEarliestDateFromTask,
  getLatestDateFromArray,
  getEarliestDateFromArray,
} from './task-helper'

const taskWithNoDates = {
  plannedStartDate: null,
  plannedEndDate: null,
  actualStartDate: null,
  actualEndDate: null,
}

const taskWithPSD = {
  plannedStartDate: '2019-01-25T00:00:00.000Z',
  plannedEndDate: null,
  actualStartDate: null,
  actualEndDate: null,
}

const taskWithPED = {
  plannedStartDate: null,
  plannedEndDate: '2019-01-25T00:00:00.000Z',
  actualStartDate: null,
  actualEndDate: null,
}

const taskWithASD = {
  plannedStartDate: null,
  plannedEndDate: null,
  actualStartDate: '2019-01-25T00:00:00.000Z',
  actualEndDate: null,
}

const taskWithAED = {
  plannedStartDate: null,
  plannedEndDate: null,
  actualStartDate: null,
  actualEndDate: '2019-01-25T00:00:00.000Z',
}

const taskWithActualsOnly = {
  plannedStartDate: null,
  plannedEndDate: null,
  actualStartDate: '2019-01-20T00:00:00.000Z',
  actualEndDate: '2019-01-25T00:00:00.000Z',
}

const today = new Date()
today.setHours(0, 0, 0, 0)

describe('task-helper.test', () => {
  describe('getLatestDateFromTask', () => {
    describe('When passed a task with no dates', () => {
      it('should return today', () => {
        expect(getLatestDateFromTask(taskWithNoDates)).toBe(today.toISOString())
      })
    })
    describe('When passed a task with PSD only ', () => {
      it('should return the PSD', () => {
        expect(getLatestDateFromTask(taskWithPSD)).toBe(today.toISOString())
      })
    })
    describe('When passed a task with PED only ', () => {
      it('should return the PED', () => {
        expect(getLatestDateFromTask(taskWithPED)).toBe(today.toISOString())
      })
    })

    describe('When passed a task with ASD only ', () => {
      it('should return the ASD', () => {
        expect(getLatestDateFromTask(taskWithASD)).toBe(today.toISOString())
      })
    })
    describe('When passed a task with AED only ', () => {
      it('should return the AED', () => {
        expect(getLatestDateFromTask(taskWithAED)).toBe(today.toISOString())
      })
    })
    describe('When passed a task with Actuals only ', () => {
      it('should return the AED', () => {
        expect(getLatestDateFromTask(taskWithActualsOnly)).toBe(
          taskWithActualsOnly.actualEndDate
        )
      })
    })
  })

  describe('getEarliestDateFromTask', () => {
    describe('When passed a task with no dates', () => {
      it('should return null', () => {
        expect(getEarliestDateFromTask(taskWithNoDates)).toBe(
          today.toISOString()
        )
      })
    })
    describe('When passed a task with PSD only ', () => {
      it('should return the PSD', () => {
        expect(getEarliestDateFromTask(taskWithPSD)).toBe(
          taskWithPSD.plannedStartDate
        )
      })
    })
    describe('When passed a task with PED only ', () => {
      it('should return the PED', () => {
        expect(getEarliestDateFromTask(taskWithPED)).toBe(
          taskWithPED.plannedEndDate
        )
      })
    })

    describe('When passed a task with ASD only ', () => {
      it('should return the ASD', () => {
        expect(getEarliestDateFromTask(taskWithASD)).toBe(
          taskWithASD.actualStartDate
        )
      })
    })
    describe('When passed a task with AED only ', () => {
      it('should return the AED', () => {
        expect(getEarliestDateFromTask(taskWithAED)).toBe(
          taskWithAED.actualEndDate
        )
      })
    })
    describe('When passed a task with Actuals only ', () => {
      it('should return the ASD', () => {
        expect(getEarliestDateFromTask(taskWithActualsOnly)).toBe(
          taskWithActualsOnly.actualStartDate
        )
      })
    })
  })

  const a_dates = [
    '2019-01-25T00:00:00.000Z',
    '1945-01-25T00:00:00.000Z',
    '1919-01-25T00:00:00.000Z',
  ]
  describe('getLatestDateFromArray', () => {
    describe('When passed an array of dates', () => {
      it('should return the Latest date', () => {
        expect(getLatestDateFromArray(a_dates)).toBe('2019-01-25T00:00:00.000Z')
      })
    })
    describe('When passed an empty array', () => {
      it('should return', () => {
        expect(getLatestDateFromArray([])).toBe(null)
      })
    })
  })

  describe('getEarliestDateFromArray', () => {
    describe('When passed an array of dates', () => {
      it('should return the ASD', () => {
        expect(getEarliestDateFromArray(a_dates)).toBe(
          '1919-01-25T00:00:00.000Z'
        )
      })
    })
    describe('When passed an empty array', () => {
      it('should return', () => {
        expect(getEarliestDateFromArray([])).toBe(null)
      })
    })
  })
})
