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
  compareNumbers,
  compareNumbersDescending,
  compareStrings,
  compareStringsDescending,
  compareBools,
  compareBoolsDescending,
} from './juralio-table-sorting-helper'

describe('juralio-table-sorting-helper', () => {
  describe('When sorting strings', () => {
    it('Sorts case insensitive ascending', () => {
      let result = ['CAT', 'apple', 'moose', 'Bee'].sort(compareStrings)
      expect(result[0]).toEqual('apple')
      expect(result[1]).toEqual('Bee')
      expect(result[2]).toEqual('CAT')
      expect(result[3]).toEqual('moose')
    })
    it('Sorts case insensitive descending', () => {
      let result = ['CAT', 'apple', 'moose', 'Bee'].sort(
        compareStringsDescending
      )
      expect(result[0]).toEqual('moose')
      expect(result[1]).toEqual('CAT')
      expect(result[2]).toEqual('Bee')
      expect(result[3]).toEqual('apple')
    })
  })

  describe('When sorting numbers', () => {
    it('Sorts numbers ascending', () => {
      let result = [3, 2, 5, 555, 10, -1].sort(compareNumbers)
      expect(result[0]).toEqual(-1)
      expect(result[1]).toEqual(2)
      expect(result[2]).toEqual(3)
      expect(result[3]).toEqual(5)
      expect(result[4]).toEqual(10)
      expect(result[5]).toEqual(555)
    })
    it('Sorts numbers Descending', () => {
      let result = [3, 2, 5, 555, 10, -1].sort(compareNumbersDescending)
      expect(result[0]).toEqual(555)
      expect(result[1]).toEqual(10)
      expect(result[2]).toEqual(5)
      expect(result[3]).toEqual(3)
      expect(result[4]).toEqual(2)
      expect(result[5]).toEqual(-1)
    })
  })

  describe('When sorting bools', () => {
    it('Sorts bools ascending', () => {
      let result = [true, false, true, false, true].sort(compareBools)
      expect(result[0]).toEqual(true)
      expect(result[1]).toEqual(true)
      expect(result[2]).toEqual(true)
      expect(result[3]).toEqual(false)
      expect(result[4]).toEqual(false)
    })
    it('Sorts bools descending', () => {
      let result = [true, false, true, false, true].sort(compareBoolsDescending)
      expect(result[0]).toEqual(false)
      expect(result[1]).toEqual(false)
      expect(result[2]).toEqual(true)
      expect(result[3]).toEqual(true)
      expect(result[4]).toEqual(true)
    })
  })
})
