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
  fadeIn,
  addRenderCompleteListener,
  fadeOut,
} from './icicleTransitionHelper'
import { ICICLE_RENDER_COMPLETE_EVENT } from './icicleTransitionConstants'

describe('icicleTransitionHelper', () => {
  describe('addRenderCompleteListener', () => {
    let mockElement, innerHandler, result

    beforeEach(() => {
      mockElement = {
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      }
      result = addRenderCompleteListener(mockElement)
      innerHandler = mockElement.addEventListener.mock.calls[0][1]
    })

    it(`should call addEventListener with ${ICICLE_RENDER_COMPLETE_EVENT} and callback function`, () => {
      expect(mockElement.addEventListener).toHaveBeenCalledWith(
        ICICLE_RENDER_COMPLETE_EVENT,
        expect.any(Function)
      )
    })

    describe('when the event handler is called', () => {
      beforeEach(() => {
        innerHandler()
      })

      it('should call removeEventListener on the given element', () => {
        expect(mockElement.removeEventListener).toHaveBeenCalledWith(
          ICICLE_RENDER_COMPLETE_EVENT,
          innerHandler
        )
      })

      it('should resolve the overall promise', () => {
        return result
      })
    })
  })

  describe('fadeOut', () => {
    let mockElement, innerHandler, result

    beforeEach(() => {
      mockElement = {
        style: {},
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
      }
      result = fadeOut(mockElement)
      innerHandler = mockElement.addEventListener.mock.calls[0][1]
    })

    it('should call addEventListener with "transitionend" and callback function', () => {
      expect(mockElement.addEventListener).toHaveBeenCalledWith(
        'transitionend',
        expect.any(Function)
      )
    })

    describe('when the event handler is called', () => {
      beforeEach(() => {
        innerHandler()
      })

      it('should call removeEventListener on the given element', () => {
        expect(mockElement.removeEventListener).toHaveBeenCalledWith(
          'transitionend',
          innerHandler
        )
      })

      it('should set the opacity style of the given element to 0', () => {
        expect(mockElement.style.opacity).toBe(0)
      })

      it('should set the transition style of the given element to the expected transition behaviour', () => {
        expect(mockElement.style.transition).toBe('opacity 0.25s')
      })

      it('should resolve the overall promise', () => {
        return result
      })
    })
  })

  describe('fadeIn', () => {
    let mockElement

    beforeEach(() => {
      mockElement = { style: { opacity: 0 } }
      fadeIn(mockElement)
    })

    it('should set the opacity of the given element to 1', () => {
      expect(mockElement.style.opacity).toBe(1)
    })
  })
})
