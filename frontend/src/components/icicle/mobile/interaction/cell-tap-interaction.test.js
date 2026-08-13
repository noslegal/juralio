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

import * as selector from '../../common/selection/selector'
import { addCellTapInteraction } from './cell-tap-interaction'

describe('cell-tap-interaction.test', () => {
  describe('addCellTapInteraction', () => {
    const mockContainerElement = 'mockContainerElement',
      mockOnTapCallback = () => {}
    let mockCells

    beforeEach(() => {
      mockCells = {
        on: jest.fn(),
      }
      selector.selectAllCells = jest.fn().mockReturnValueOnce(mockCells)

      addCellTapInteraction(mockContainerElement, mockOnTapCallback)
    })

    it('should call selectAllCells with the given containerElement param', () => {
      expect(selector.selectAllCells).toHaveBeenCalledWith(mockContainerElement)
    })

    it('should attach a click event handler to the returned cells with the given onTap function param', () => {
      expect(mockCells.on).toHaveBeenCalledWith('click', mockOnTapCallback)
    })
  })
})
