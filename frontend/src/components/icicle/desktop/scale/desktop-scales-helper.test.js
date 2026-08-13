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
  getWidthScaleOffset,
  parentCellWidth,
  getInteractiveContainerWidth,
  getInteractiveContainerHeight,
} from './desktop-scales-helper'

describe('desktop-scales-helper.test.js', () => {
  describe('parentCellWidth', () => {
    it('should have a parentCellWidth of 40', () => {
      expect(parentCellWidth).toBe(40)
    })
  })

  describe('getWidthScaleOffset', () => {
    let result

    describe('when getWidthScaleOffset is called with populated y0 property', () => {
      let mockData = {
        y0: 30,
      }
      beforeEach(() => {
        result = getWidthScaleOffset(mockData)
      })

      it('should return value of parentCellWidth', () => {
        expect(result).toBe(parentCellWidth)
      })
    })

    describe('when getWidthScaleOffset is called with a y0 property of 0', () => {
      let mockData = {
        y0: 0,
      }

      beforeEach(() => {
        result = getWidthScaleOffset(mockData)
      })

      it('should return 0', () => {
        expect(result).toBe(0)
      })
    })
  })

  describe('getInteractiveContainerWidth', () => {
    function executeTest(leaves, cellWidth) {
      let partitionData = {
        leaves: jest.fn().mockReturnValueOnce(leaves),
      }
      return getInteractiveContainerWidth(partitionData, cellWidth)
    }

    describe('when passed leaves with a max depth of 4 and a cellWidth of 40', () => {
      it('should return 160', () => {
        expect(
          executeTest(
            [{ depth: 2 }, { depth: 4 }, { depth: 1 }, { depth: 3 }],
            40
          )
        ).toBe(160)
      })
    })

    describe('when passed leaves with a max depth of 6 and a cellWidth of 30', () => {
      it('should return 180', () => {
        expect(
          executeTest(
            [{ depth: 2 }, { depth: 6 }, { depth: 1 }, { depth: 3 }],
            30
          )
        ).toBe(180)
      })
    })

    describe('when passed leaves with a max depth of 3 and a cellWidth of 70', () => {
      it('should return 210', () => {
        expect(
          executeTest(
            [{ depth: 3 }, { depth: 1 }, { depth: 2 }, { depth: 3 }],
            70
          )
        ).toBe(210)
      })
    })
  })

  describe('getInteractiveContainerHeight', () => {
    function executeTest(leaves, cellHeight) {
      let partitionData = {
        leaves: jest.fn().mockReturnValueOnce(leaves),
      }
      return getInteractiveContainerHeight(partitionData, cellHeight)
    }

    describe('when passed leaves with a length of 4 and a cellHeight of 40', () => {
      it('should return 160', () => {
        expect(executeTest(new Array(4), 40)).toBe(160)
      })
    })

    describe('when passed leaves with a length of of 6 and a cellHeight of 30', () => {
      it('should return 180', () => {
        expect(executeTest(new Array(6), 30)).toBe(180)
      })
    })

    describe('when passed leaves with a length of of 3 and a cellHeight of 70', () => {
      it('should return 210', () => {
        expect(executeTest(new Array(3), 70)).toBe(210)
      })
    })
  })
})
