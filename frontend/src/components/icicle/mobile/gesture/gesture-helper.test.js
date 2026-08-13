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
  determinePanDirection,
  getTranslation,
  handleSwipe,
  determineFocusedItemFromGesture,
} from './gesture-helper'
import * as siblingNavigationHelper from './sibling_navigation_helper'
import each from 'jest-each'

describe('gesture-helper.test', () => {
  const getEvent = (x, y) => ({
    transform: {
      x,
      y,
    },
  })

  describe('determinePanDirection', () => {
    each`
      event               | expectedResult 
      ${getEvent(0, 0)}   | ${'vertical'}
      ${getEvent(0, 1)}   | ${'vertical'}      
      ${getEvent(3, 5)}   | ${'vertical'}     
      ${getEvent(0, -1)}  | ${'vertical'} 
      ${getEvent(-3, -4)} | ${'vertical'}  
    `.test(
      'should return "vertical" when given x value is further from zero than the y value',
      ({ event, expectedResult }) => {
        expect(determinePanDirection(event)).toBe(expectedResult)
      }
    )

    each`
      event               | expectedResult 
      ${getEvent(1, 0)}   | ${'horizontal'}      
      ${getEvent(5, 3)}   | ${'horizontal'}     
      ${getEvent(-1, 0)}  | ${'horizontal'} 
      ${getEvent(-4, -3)} | ${'horizontal'}      
    `.test(
      'should return "horizontal" when given y value is further from zero than the x value',
      ({ event, expectedResult }) => {
        expect(determinePanDirection(event)).toBe(expectedResult)
      }
    )
  })

  describe('getTranslation', () => {
    const mockTransform = { x: 'mock_x', y: 'mock_y' }

    describe('when direction is given as "horizontal"', () => {
      it('should return an object containing the x transform value and 0', () => {
        expect(getTranslation('horizontal', mockTransform)).toEqual({
          x: 'mock_x',
          y: 0,
        })
      })
    })

    describe('when direction is given as "vertical"', () => {
      it('should return an object containing the y transform value and 0', () => {
        expect(getTranslation('vertical', mockTransform)).toEqual({
          x: 0,
          y: 'mock_y',
        })
      })
    })

    describe('when direction is given as an unrecognised value', () => {
      it('should return an object containing the 0 for both x and y', () => {
        expect(getTranslation('unknown', mockTransform)).toEqual({
          x: 0,
          y: 0,
        })
      })
    })
  })

  describe('handleSwipe', () => {
    let mockSwipedElement

    beforeEach(() => {
      mockSwipedElement = {
        datum: jest.fn().mockReturnValueOnce('mock_swiped_datum'),
      }
    })

    describe('when the given swipedElement is undefined', () => {
      it('the callback should no be invoked', () => {
        const mockCallback = jest.fn()
        handleSwipe(
          'mock_container',
          'mock_event_transform',
          undefined,
          mockCallback
        )
        expect(mockCallback).not.toHaveBeenCalled()
      })
    })

    describe('when eventTransform.x is greater than xThreshold', () => {
      const mockContainer = { clientWidth: 400 }
      const mockEventTransform = { x: 201 }
      const mockCallback = jest.fn()

      beforeEach(() => {
        handleSwipe(
          mockContainer,
          mockEventTransform,
          mockSwipedElement,
          mockCallback
        )
      })

      it('should invoke the callback with the swiped element and "parent"', () => {
        expect(mockCallback).toHaveBeenCalledWith('mock_swiped_datum', 'parent')
      })
    })

    describe('when eventTransform.x is less than negative xThreshold', () => {
      const mockContainer = { clientWidth: 400 }
      const mockEventTransform = { x: -201 }
      const mockCallback = jest.fn()

      beforeEach(() => {
        handleSwipe(
          mockContainer,
          mockEventTransform,
          mockSwipedElement,
          mockCallback
        )
      })

      it('should invoke the callback with the swiped element and "child"', () => {
        expect(mockCallback).toHaveBeenCalledWith('mock_swiped_datum', 'child')
      })
    })

    describe('when eventTransform.y is greater than yThreshold', () => {
      const mockContainer = { clientHeight: 400 }
      const mockEventTransform = { y: 101 }
      const mockCallback = jest.fn()

      beforeEach(() => {
        handleSwipe(
          mockContainer,
          mockEventTransform,
          mockSwipedElement,
          mockCallback
        )
      })

      it('should invoke the callback with the swiped element and "sibling_up"', () => {
        expect(mockCallback).toHaveBeenCalledWith(
          'mock_swiped_datum',
          'sibling_up'
        )
      })
    })

    describe('when eventTransform.y is less than yThreshold', () => {
      const mockContainer = { clientHeight: 400 }
      const mockEventTransform = { y: -101 }
      const mockCallback = jest.fn()

      beforeEach(() => {
        handleSwipe(
          mockContainer,
          mockEventTransform,
          mockSwipedElement,
          mockCallback
        )
      })

      it('should invoke the callback with the swiped element and "sibling_down"', () => {
        expect(mockCallback).toHaveBeenCalledWith(
          'mock_swiped_datum',
          'sibling_down'
        )
      })
    })
  })

  describe('determineFocusedItemFromGesture', () => {
    it('should return the given item if a direction is not given', () => {
      const mockItem = {}
      expect(determineFocusedItemFromGesture(mockItem)).toBe(mockItem)
    })

    describe('when direction is given as "parent"', () => {
      describe('and the given item has a grandparent', () => {
        it('should return the items grandparent', () => {
          const mockGrandParent = {}
          const mockItem = { parent: { parent: mockGrandParent } }
          expect(determineFocusedItemFromGesture(mockItem, 'parent')).toBe(
            mockGrandParent
          )
        })
      })

      describe('and the given item has a parent only', () => {
        it('should return undefined', () => {
          const mockItem = { parent: {} }
          expect(
            determineFocusedItemFromGesture(mockItem, 'parent')
          ).toBeUndefined()
        })
      })

      describe('and the given item has no parent', () => {
        it('should return undefined', () => {
          const mockItem = {}
          expect(
            determineFocusedItemFromGesture(mockItem, 'parent')
          ).toBeUndefined()
        })
      })
    })

    describe('when direction is given as "child"', () => {
      describe('and the given item has children', () => {
        it('the given item should be returned', () => {
          const mockItem = { children: [] }
          expect(determineFocusedItemFromGesture(mockItem, 'child')).toBe(
            mockItem
          )
        })
      })

      describe('and the given item has no children', () => {
        it("the given item's child should be undefined", () => {
          const mockItem = {}
          expect(
            determineFocusedItemFromGesture(mockItem, 'child')
          ).toBeUndefined()
        })
      })
    })

    describe('when direction is given as "sibling_down"', () => {
      const mockItem = { parent: 'mock_parent' }
      let result

      beforeEach(() => {
        siblingNavigationHelper.getNextAdjacentSibling = jest
          .fn()
          .mockReturnValueOnce('mock_sibling')

        result = determineFocusedItemFromGesture(
          mockItem,
          'sibling_down',
          'mock_partition_data'
        )
      })

      it(`should call getNextAdjacentSibling on sibling navigation helper
          with the current given items parent, direction and partitionData`, () => {
        expect(
          siblingNavigationHelper.getNextAdjacentSibling
        ).toHaveBeenCalledWith(
          'mock_parent',
          'sibling_down',
          'mock_partition_data'
        )
      })

      it('should return the result of the getNextAdjacentSibling call', () => {
        expect(result).toBe('mock_sibling')
      })
    })

    describe('when direction is given as "sibling_up"', () => {
      const mockItem = { parent: 'mock_parent' }
      let result

      beforeEach(() => {
        siblingNavigationHelper.getNextAdjacentSibling = jest
          .fn()
          .mockReturnValueOnce('mock_sibling')

        result = determineFocusedItemFromGesture(
          mockItem,
          'sibling_up',
          'mock_partition_data'
        )
      })

      it(`should call getNextAdjacentSibling on sibling navigation helper
          with the current given item's parent, direction and partitionData`, () => {
        expect(
          siblingNavigationHelper.getNextAdjacentSibling
        ).toHaveBeenCalledWith(
          'mock_parent',
          'sibling_up',
          'mock_partition_data'
        )
      })

      it('should return the result of the getNextAdjacentSibling call', () => {
        expect(result).toBe('mock_sibling')
      })
    })
  })
})
