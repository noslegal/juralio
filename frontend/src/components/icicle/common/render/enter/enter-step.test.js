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

import { enter } from './enter-step'

describe('enter-step.js', () => {
  describe('enter', () => {
    let mockDataBoundCells,
      mockAppend,
      mockAttr,
      mockMerge,
      mockInnerAttr,
      result

    beforeEach(() => {
      mockInnerAttr = jest.fn()
      mockMerge = {
        merge: jest
          .fn()
          .mockReturnValueOnce([
            { data: { filteredOut: false, name: 'mock-result' } },
          ]),
        append: jest.fn().mockReturnValueOnce({ attr: mockInnerAttr }),
      }
      mockAttr = { attr: jest.fn().mockReturnValueOnce(mockMerge) }
      mockAppend = { append: jest.fn().mockReturnValueOnce(mockAttr) }
      mockDataBoundCells = {
        enter: jest.fn().mockReturnValueOnce(mockAppend),
      }

      result = enter(mockDataBoundCells)
    })

    it('should call enter on the dataBoundCells', () => {
      expect(mockDataBoundCells.enter).toHaveBeenCalled()
    })

    it('should call append on the dataBoundCells with "div"', () => {
      expect(mockAppend.append).toHaveBeenCalledWith('div')
    })

    it('should call attr on the dataBoundCells with "class" and the cell css styles', () => {
      expect(mockAttr.attr).toHaveBeenCalledWith('class', 'cell icicle')
    })

    it('should append an inner div', () => {
      expect(mockMerge.append).toHaveBeenCalledWith('div')
    })

    it('should add class styles.content to the inner div', () => {
      expect(mockInnerAttr).toHaveBeenCalledWith('class', 'content')
    })

    it('should call merge on the dataBoundCells with the dataBoundCells', () => {
      expect(mockMerge.merge).toHaveBeenCalledWith(mockDataBoundCells)
    })

    it('should return the merged result', () => {
      expect(result).toEqual([
        { data: { filteredOut: false, name: 'mock-result' } },
      ])
    })
  })
})
