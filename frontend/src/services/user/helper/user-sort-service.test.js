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

import { sortUserList, sortByName } from './user-sort-service'

describe('user-sort-service.test', () => {
  describe('sortByName', () => {
    const unsorted = [
      { firstname: 'David', lastname: 'Smith' },
      { firstname: 'Ryan', lastname: 'hurlington' },
      { firstname: 'David', lastname: 'Small' },
      { firstname: 'david', lastname: 'small' },
      { firstname: 'Cameron', lastname: "O'Donnell" },
      { firstname: 'John', lastname: 'Johnston' },
      { firstname: 'ryan', lastname: 'Hutcheon' },
      { firstname: 'William', lastname: 'gray' },
      { firstname: 'Alice', lastname: 'Simmons' },
    ]

    it('should sort by first and last name alphabetically ascending, case-insensitive', () => {
      expect(sortByName(unsorted)).toEqual([
        { firstname: 'Alice', lastname: 'Simmons' },
        { firstname: 'Cameron', lastname: "O'Donnell" },
        { firstname: 'David', lastname: 'Small' },
        { firstname: 'david', lastname: 'small' },
        { firstname: 'David', lastname: 'Smith' },
        { firstname: 'John', lastname: 'Johnston' },
        { firstname: 'Ryan', lastname: 'hurlington' },
        { firstname: 'ryan', lastname: 'Hutcheon' },
        { firstname: 'William', lastname: 'gray' },
      ])
    })
  })

  describe('sortUserList', () => {
    describe('when the user array does NOT contain the given user', () => {
      const usersOriginal = [{ id: 321 }, { id: 233 }, { id: 434 }]
      const usersParameter = [...usersOriginal]
      let result

      beforeEach(() => {
        result = sortUserList(123, usersParameter)
      })

      it('original array passed as parameter should be unaffected', () => {
        expect(usersParameter).toEqual(usersOriginal)
      })

      it('the resulting array should equal the input array', () => {
        expect(result).toEqual(usersOriginal)
      })
    })

    describe('when the user array DOES contain the given user', () => {
      const usersOriginal = [{ id: 321 }, { id: 233 }, { id: 434 }]
      const usersParameter = [...usersOriginal]
      let result

      beforeEach(() => {
        result = sortUserList(233, usersParameter)
      })

      it('original array passed as parameter should be unaffected', () => {
        expect(usersParameter).toEqual(usersOriginal)
      })

      it('the resulting array should contain the given user as the first item', () => {
        const expectedResult = [{ id: 233 }, { id: 321 }, { id: 434 }]
        expect(result).toEqual(expectedResult)
      })
    })
  })
})
