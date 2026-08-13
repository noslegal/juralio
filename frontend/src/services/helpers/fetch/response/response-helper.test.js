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

import { extractBody } from './response-helper'
import { createPromise } from '../../../../../test/helper/promise-helper'
import * as jsonHelper from '../../json-helper'

describe('response-helper.test', () => {
  describe('extractBody', () => {
    let mockResponse, textPromise, result

    beforeEach(() => {
      textPromise = createPromise()

      mockResponse = {
        text: jest.fn().mockReturnValueOnce(textPromise.promise),
      }

      result = extractBody(mockResponse)
    })

    it('should call the text function on the given response', () => {
      expect(mockResponse.text).toHaveBeenCalledTimes(1)
    })

    describe('when the text function resolves', () => {
      const mockTextResponse = 'mock-text-response'

      beforeEach(() => {
        jsonHelper.tryParse = jest.fn().mockReturnValueOnce('mock-parsed-json')
        textPromise.resolve(mockTextResponse)
      })

      it('should call tryParse on jsonHelper with the resolved text', () => {
        expect(jsonHelper.tryParse).toHaveBeenCalledWith(mockTextResponse)
      })

      it('the overall promise should resolve with the tryParse result', () => {
        return result.then(value => expect(value).toBe('mock-parsed-json'))
      })
    })
  })
})
