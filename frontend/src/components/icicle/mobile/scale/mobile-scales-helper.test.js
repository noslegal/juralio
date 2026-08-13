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

import * as d3Scales from 'd3-scale'
import {
  createWidthScale,
  createHeightScale,
  calculateFocusedAreaCoordinates,
  calculateFocusedAreaPadding,
} from './mobile-scales-helper'

jest.mock('d3-scale')

describe('mobile-scales-helper.test', () => {
  let mockLinearScale, result

  describe('createWidthScale', () => {
    beforeEach(() => {
      mockLinearScale = {}
      mockLinearScale.domain = jest.fn().mockReturnValueOnce(mockLinearScale)
      mockLinearScale.range = jest.fn().mockReturnValueOnce(mockLinearScale)

      d3Scales.scaleLinear = jest.fn().mockReturnValueOnce(mockLinearScale)
      result = createWidthScale(
        { clientWidth: 'mockClientWidth' },
        { startCoordinate: 20, endCoordinate: 50 },
        10
      )
    })

    it('should call scaleLinear on d3 scales', () => {
      expect(d3Scales.scaleLinear).toHaveBeenCalled()
    })

    describe('should call domain on the linear scale', () => {
      let domainCallArgs

      beforeEach(() => {
        domainCallArgs = mockLinearScale.domain.mock.calls[0][0]
      })

      it("with the given area's start coordinate minus the given padding", () => {
        expect(domainCallArgs[0]).toBe(10)
      })

      it("with the given area's end coordinate plus the given padding", () => {
        expect(domainCallArgs[1]).toBe(60)
      })
    })

    it("should call range on the linear scale with 0 and the given containerElement's width", () => {
      expect(mockLinearScale.range).toHaveBeenCalledWith([0, 'mockClientWidth'])
    })

    it('should return the created linear scale', () => {
      expect(result).toBe(mockLinearScale)
    })
  })

  describe('createHeightScale', () => {
    const mockClientHeight = 200
    const paddingAmount = 8
    beforeEach(() => {
      mockLinearScale = {}
      mockLinearScale.domain = jest.fn().mockReturnValueOnce(mockLinearScale)
      mockLinearScale.range = jest.fn().mockReturnValueOnce(mockLinearScale)

      d3Scales.scaleLinear = jest.fn().mockReturnValueOnce(mockLinearScale)
      result = createHeightScale(
        { clientHeight: mockClientHeight },
        { x0: 'mockX0', x1: 'mockX1' }
      )
    })

    it('should call scaleLinear on d3 scales', () => {
      expect(d3Scales.scaleLinear).toHaveBeenCalled()
    })

    it("should call domain on the linear scale with the given item's x0 and x1 coords", () => {
      expect(mockLinearScale.domain).toHaveBeenCalledWith(['mockX0', 'mockX1'])
    })

    it('should call range on the linear scale with the expected padding', () => {
      expect(mockLinearScale.range).toHaveBeenCalledWith([
        paddingAmount * 6,
        mockClientHeight - paddingAmount,
      ])
    })

    it('should return the created linear scale', () => {
      expect(result).toBe(mockLinearScale)
    })
  })

  describe('calculateFocusedAreaCoordinates', () => {
    let result
    beforeEach(() => {
      result = calculateFocusedAreaCoordinates({
        y0: 23,
        y1: 50,
      })
    })

    describe('result should contain', () => {
      it("startCoordinate equal to the given item's y1 coordinate", () => {
        expect(result.startCoordinate).toBe(50)
      })

      it(`endCoordinate equal to the the given item's y1 coordinate PLUS the 
          "height" of the item (i.e. the difference between y1 and y0)`, () => {
        expect(result.endCoordinate).toBe(77)
      })
    })
  })

  describe('calculateFocusedAreaPadding', () => {
    let result
    beforeEach(() => {
      result = calculateFocusedAreaPadding({
        y0: 23,
        y1: 50,
      })
    })

    it(`should return the "height" (i.e. the difference between y1 and y0) 
        of the given item divided by the padding percentage`, () => {
      expect(result).toBe(2.7)
    })
  })
})
