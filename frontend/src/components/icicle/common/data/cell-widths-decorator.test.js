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

import { hierarchy } from 'd3-hierarchy'
import { decorateCellWidths } from './cell-widths-decorator'
import * as dataProviderUtils from './data-provider-utils'

describe('cell-widths-decorator.test', () => {
  describe('decorateCellWidths', () => {
    describe('when shouldHaveEqualWidths is passed as true', () => {
      let mockHierarchy

      beforeEach(() => {
        const data = {
          name: '1',
          children: [
            {
              name: '2-1',
              children: [{ name: '3-1' }, { name: '3-2' }, { name: '3-3' }],
            },
            { name: '2-2' },
          ],
        }

        mockHierarchy = hierarchy(data)
        decorateCellWidths(mockHierarchy, undefined, true)
      })

      it('root should have a value of 1', () => {
        expect(mockHierarchy.value).toBe(1)
      })

      it('2nd level items should have half the value of the root', () => {
        expect(mockHierarchy.children[0].value).toBe(0.5)
        expect(mockHierarchy.children[1].value).toBe(0.5)
      })

      it('3rd level items should have a value of a third of their parent', () => {
        const secondLevelItem = mockHierarchy.children[0]
        expect(secondLevelItem.children[0].value).toBe(0.16666666666666666)
        expect(secondLevelItem.children[1].value).toBe(0.16666666666666666)
        expect(secondLevelItem.children[2].value).toBe(0.16666666666666666)
      })
    })

    describe('when shouldHaveEqualWidths is passed as false', () => {
      let mockHierarchy

      beforeEach(() => {
        dataProviderUtils.getLeafResolver = jest
          .fn()
          .mockReturnValueOnce('mock_leaf_resolver')
        mockHierarchy = {
          sum: jest.fn(),
          count: jest.fn(),
        }
        decorateCellWidths(mockHierarchy, 'mock_child_property_name', false)
      })

      it('should call getLeafResolver on dataProviderUtils with the child property name', () => {
        expect(dataProviderUtils.getLeafResolver).toHaveBeenCalledWith(
          'mock_child_property_name'
        )
      })

      it('should call sum on the given hierarchy with the result of the getLeafResolver call', () => {
        expect(mockHierarchy.sum).toHaveBeenCalledWith('mock_leaf_resolver')
      })

      it('should call count on the given hierarchy', () => {
        expect(mockHierarchy.count).toHaveBeenCalled()
      })
    })
  })
})
