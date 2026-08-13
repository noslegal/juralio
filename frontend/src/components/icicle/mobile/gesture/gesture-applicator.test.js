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

import * as d3Selection from 'd3-selection'
import { applyGesture } from './gesture-applicator'
import * as panBehaviour from './pan-behaviour'

jest.mock('d3-selection')

describe('gesture-applicator.test', () => {
  describe('applyGesture', () => {
    const mockSelectionObject = { call: jest.fn() }
    const mockPanInstance = { on: jest.fn() }

    beforeEach(() => {
      d3Selection.select = jest.fn().mockReturnValue(mockSelectionObject)
      panBehaviour.zoomed = jest.fn().mockReturnValue('mockZoomHandler')
      panBehaviour.onEnd = jest.fn().mockReturnValue('mockOnEndHandler')
      panBehaviour.getPanInstance = jest.fn().mockReturnValue(mockPanInstance)

      applyGesture('mockNode', 'mockContainer', 'mockSwipeCalllback')
    })

    it('should call select on d3Selection with the passed in container', () => {
      expect(d3Selection.select).toHaveBeenCalledWith('mockContainer')
    })

    it('should then invoke "call" method', () => {
      expect(mockSelectionObject.call)
    })

    describe('panInstance', () => {
      describe('on "zoom" should be registered', () => {
        it('with the first parameter as "zoom"', () => {
          expect(mockPanInstance.on.mock.calls[0][0]).toEqual('zoom')
        })
      })

      describe('on "end" should be registered', () => {
        it('with the first parameter as "end"', () => {
          expect(mockPanInstance.on.mock.calls[1][0]).toEqual('end')
        })
      })
    })
  })
})
