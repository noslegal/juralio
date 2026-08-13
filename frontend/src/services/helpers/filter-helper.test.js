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

import { filterResults } from './filter-helper'
const exclusionComparator = function (itemToExclude, searchResult) {
  return itemToExclude.id === searchResult.id
}
describe('filter-helper', () => {
  describe('filterResults', () => {
    describe('results should be unaffected', () => {
      it('when resultsToExclude is null', () => {
        const searchResults = [{ id: 2 }]
        //clone the array [...results]
        expect(
          filterResults([...searchResults], null, exclusionComparator)
        ).toEqual(searchResults)
      })

      it('when resultsToExclude is an empty array', () => {
        const searchResults = [{ id: 1 }]
        expect(filterResults([...searchResults], [])).toEqual(searchResults)
      })

      it('when resultsToExclude is populated but searchResults is empty', () => {
        const searchResults = []
        const resultsToExclude = [{ id: 1 }]

        expect(
          filterResults(
            [...searchResults],
            resultsToExclude,
            exclusionComparator
          )
        ).toEqual(searchResults)
      })

      it('when nothing in searchResults is included in resultsToExclude', () => {
        const searchResults = [{ id: 666 }]
        const resultsToExclude = [{ id: 999 }]
        expect(
          filterResults(
            [...searchResults],
            resultsToExclude,
            exclusionComparator
          )
        ).toEqual(searchResults)
      })
    })

    describe('results should be filtered', () => {
      it('when items within searchResults are included in resultsToExlude', () => {
        const searchResults = [{ id: 1 }, { id: 666 }, { id: 888 }]
        const resultsToExclude = [{ id: 666 }, { id: 888 }, { id: 999 }]
        expect(
          filterResults(
            [...searchResults],
            [...resultsToExclude],
            exclusionComparator
          )
        ).toEqual([{ id: 1 }])
      })
    })
  })
})
