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

import { getPartitionData } from '../../common/data/data-provider'
import { getNextAdjacentSibling } from './sibling_navigation_helper'

const getMockItemByName = (partitionData, name) =>
  partitionData.descendants().find(item => item.data.name === name)

describe('sibling_navigation_helper.test', () => {
  describe('getNextAdjacentSibling', () => {
    const mockHierarchy = {
      children: [
        {
          name: '1-1',
          children: [{ name: '1-1-1' }, { name: '1-1-2' }],
        },
        { name: '1-2' },
        {
          name: '1-3',
          children: [{ name: '1-3-1' }],
        },
      ],
    }
    let preparedData

    beforeEach(() => {
      preparedData = getPartitionData(mockHierarchy, 'children')
    })

    describe('when direction is given as "sibling_down"', () => {
      describe('and there is an available sibling', () => {
        it('should return the next available sibling with children "below" the given item', () => {
          const mockItem = getMockItemByName(preparedData, '1-1')
          const expectedAdjacentSibling = getMockItemByName(preparedData, '1-3')
          expect(
            getNextAdjacentSibling(mockItem, 'sibling_down', preparedData)
          ).toBe(expectedAdjacentSibling)
        })
      })

      describe('and there is NOT an available sibling', () => {
        it('should return undefined', () => {
          const mockItem = getMockItemByName(preparedData, '1-3')
          expect(
            getNextAdjacentSibling(mockItem, 'sibling_down', preparedData)
          ).toBeUndefined()
        })
      })
    })

    describe('when direction is given as "sibling_up" and there is an available sibling', () => {
      describe('and there is an available sibling', () => {
        it('should return the next available sibling with children "below" the given item', () => {
          const mockItem = getMockItemByName(preparedData, '1-3')
          const expectedAdjacentSibling = getMockItemByName(preparedData, '1-1')
          expect(
            getNextAdjacentSibling(mockItem, 'sibling_up', preparedData)
          ).toBe(expectedAdjacentSibling)
        })
      })

      describe('and there is NOT an available sibling', () => {
        it('should return undefined', () => {
          const mockItem = getMockItemByName(preparedData, '1-1')
          expect(
            getNextAdjacentSibling(mockItem, 'sibling_up', preparedData)
          ).toBeUndefined()
        })
      })
    })
  })
})
