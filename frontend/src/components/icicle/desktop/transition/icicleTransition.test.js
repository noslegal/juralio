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

import * as icicleTransitionHelper from './icicleTransitionHelper'
import { createPromise } from '../../test/test-utils'
import { applyTransition } from './icicleTransition'

describe('icicleTransition.test', () => {
  describe('applyTransition', () => {
    const mockElement = 'MOCK_ELEMENT'
    let mockRenderCallback, renderCompletePromise, fadeOutPromise

    beforeEach(() => {
      renderCompletePromise = createPromise()
      fadeOutPromise = createPromise()

      icicleTransitionHelper.addRenderCompleteListener = jest
        .fn()
        .mockReturnValueOnce(renderCompletePromise.promise)

      icicleTransitionHelper.fadeOut = jest
        .fn()
        .mockReturnValueOnce(fadeOutPromise.promise)

      icicleTransitionHelper.fadeIn = jest.fn()
      mockRenderCallback = jest.fn()

      applyTransition(mockElement, mockRenderCallback)
    })

    it('should call transitionHelper.addRenderCompleteListener with the given icicle element', () => {
      expect(
        icicleTransitionHelper.addRenderCompleteListener
      ).toHaveBeenCalledWith(mockElement)
    })

    it('should call transitionHelper.fadeOut with the given icicle element', () => {
      expect(icicleTransitionHelper.fadeOut).toHaveBeenCalledWith(mockElement)
    })

    describe('when the call to fadeOut is resolved', () => {
      beforeEach(() => {
        fadeOutPromise.resolve()
      })

      it('should call the given render callback', () => {
        expect(mockRenderCallback).toHaveBeenCalled()
      })

      describe('when the render complete promise has resolved', () => {
        beforeEach(() => {
          renderCompletePromise.resolve()
        })

        it('should call transitionHelper.fadeIn with the given icicle element', () => {
          expect(icicleTransitionHelper.fadeIn).toHaveBeenCalledWith(
            mockElement
          )
        })
      })
    })
  })
})
