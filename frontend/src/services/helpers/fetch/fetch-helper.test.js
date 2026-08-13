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

import * as fetchWrapper from './wrapper/fetch-wrapper'
import * as responseHandler from './response/response-handler'
import fetchHelper from './fetch-helper'
import { createPromise } from '../../../../test/helper/promise-helper'

describe('fetch-helper.test', () => {
  let fetchWrapperPromise, resolveHandler, rejectHandler

  beforeEach(() => {
    fetchWrapperPromise = createPromise()
    fetchWrapper.default = jest
      .fn()
      .mockReturnValueOnce(fetchWrapperPromise.promise)
    responseHandler.default = jest
      .fn()
      .mockReturnValueOnce('response_handler_result')
    resolveHandler = jest.fn()
    rejectHandler = jest.fn()

    fetchHelper('mock_path', 'mock_method', 'mock_body').then(
      resolveHandler,
      rejectHandler
    )
  })

  it('should call the fetchWrapper with the given parameters', () => {
    expect(fetchWrapper.default).toHaveBeenCalledWith(
      'mock_path',
      'mock_method',
      'mock_body',
      false
    )
  })

  describe('when the fetchWrapper call resolves', () => {
    beforeEach(() => {
      fetchWrapperPromise.resolve('fetch_wrapper_response')
    })

    it('the repsonse handler should be called with the result of the fetchWrapper', () => {
      expect(responseHandler.default).toHaveBeenCalledWith(
        'fetch_wrapper_response'
      )
    })
  })

  describe('when the fetchWrapper call rejects', () => {
    beforeEach(() => {
      fetchWrapperPromise.reject()
    })

    it('the repsonse handler should NOT be called', () => {
      expect(responseHandler.default).not.toHaveBeenCalled()
    })
  })
})
