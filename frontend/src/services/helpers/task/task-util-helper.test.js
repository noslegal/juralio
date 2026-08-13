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

import * as util from './task-util-helper'

describe('levelNumberToLetter', () => {
  describe('when passing', () => {
    it('the number 0, return error', () => {
      expect(util.levelNumberToLetter(0)).toBe(undefined)
    })
    it('the number 1, return A', () => {
      expect(util.levelNumberToLetter(1)).toBe('A')
    })
    it('the number 3, return C', () => {
      expect(util.levelNumberToLetter(3)).toBe('C')
    })
    it('the number 6, return F', () => {
      expect(util.levelNumberToLetter(6)).toBe('F')
    })
    it('the number 7, return error', () => {
      expect(util.levelNumberToLetter(7)).toBe(undefined)
    })
  })
})

describe('getLevelATaskCount', () => {
  describe('When passed an empty tasklist', () => {
    it('the function returns undefined', () => {
      expect(util.getLevelATaskCount({ tasks: [] })).toBe(0)
    })
  })
  describe('When passed a populated tasklist', () => {
    it('the function returns 1 for single level A task', () => {
      expect(
        util.getLevelATaskCount({
          tasks: [{ level: 1 }, { level: 2 }, { level: 3 }],
        })
      ).toBe(1)
    })
    it('the function returns 4 for 4 level A tasks', () => {
      expect(
        util.getLevelATaskCount({
          tasks: [
            { level: 1 },
            { level: 2 },
            { level: 3 },
            { level: 1 },
            { level: 1 },
            { level: 1 },
            { level: 2 },
            { level: 3 },
          ],
        })
      ).toBe(4)
    })
  })
})
