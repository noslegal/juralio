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

import * as mobileScalesHelper from './mobile-scales-helper'
import { createScales } from './mobile-scales'

jest.mock('d3-scale')

describe('mobile-scales.test', () => {
  describe('createScales', () => {
    let result

    beforeEach(() => {
      mobileScalesHelper.calculateFocusedAreaCoordinates = jest
        .fn()
        .mockReturnValueOnce('mockChildrenArea')

      mobileScalesHelper.calculateFocusedAreaPadding = jest
        .fn()
        .mockReturnValueOnce('mockPadding')

      mobileScalesHelper.createWidthScale = jest
        .fn()
        .mockReturnValueOnce('mockWidthScale')

      mobileScalesHelper.createHeightScale = jest
        .fn()
        .mockReturnValueOnce('mockHeightScale')

      result = createScales('mockContainerElement', 'mockPartitionData')
    })

    it('should call calculateFocusedAreaCoordinates on scale helper with the given partitionData node', () => {
      expect(
        mobileScalesHelper.calculateFocusedAreaCoordinates
      ).toHaveBeenCalledWith('mockPartitionData')
    })

    it('should call calculateFocusedAreaPadding on scale helper with the given partitionData node', () => {
      expect(
        mobileScalesHelper.calculateFocusedAreaPadding
      ).toHaveBeenCalledWith('mockPartitionData')
    })

    it(`should call createWidthScale on scale helper the given containerElement, 
        result of calculateFocusedAreaCoordinates call and result of 
        calculateFocusedAreaPadding call`, () => {
      expect(mobileScalesHelper.createWidthScale).toHaveBeenCalledWith(
        'mockContainerElement',
        'mockChildrenArea',
        'mockPadding'
      )
    })

    it('should call createHeightScale on scale helper with the given container element and partitionData', () => {
      expect(mobileScalesHelper.createHeightScale).toHaveBeenCalledWith(
        'mockContainerElement',
        'mockPartitionData'
      )
    })

    it('should return an object containing the create width and height scales', () => {
      expect(result).toEqual({
        widthScale: 'mockWidthScale',
        heightScale: 'mockHeightScale',
      })
    })
  })
})
