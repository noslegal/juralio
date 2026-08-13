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

import responseHandler from './response-handler'
import * as errorHandler from './error/reponse-error-handler'
import * as responseHelper from './../response/response-helper'
import { createPromise } from '../../../../../test/helper/promise-helper'

describe('response-handler.test', () => {
  beforeEach(() => {
    errorHandler.handleErrorStatus = jest.fn()
    errorHandler.handleUnknownError = jest.fn()
    responseHelper.extractBody = jest.fn()
  })

  describe('when the given response contains a status error', () => {
    const mockResponse = 'mock_repsonse'

    describe('the resulting promise should be rejected, and', () => {
      beforeEach(done => {
        errorHandler.handleErrorStatus.mockReturnValueOnce(true)
        responseHandler(mockResponse).then(() => {}, done)
      })

      it('handleErrorStatus on the error handler should be called with the response', () => {
        expect(errorHandler.handleErrorStatus).toHaveBeenCalledWith(
          mockResponse
        )
      })

      it('extractBody on the response helper should not be called', () => {
        expect(responseHelper.extractBody).not.toHaveBeenCalled()
      })
    })
  })

  describe('when the given response DOES NOT contain a status error', () => {
    const mockResponse = { status: 'mock_status', body: 'mock_body' }
    const mockExtractedBody = 'mock_extracted_body'

    let resultingPromise, extractBodyPromise

    beforeEach(() => {
      extractBodyPromise = createPromise()

      errorHandler.handleErrorStatus.mockReturnValueOnce(false)

      responseHelper.extractBody = jest
        .fn()
        .mockReturnValueOnce(extractBodyPromise.promise)
      resultingPromise = responseHandler(mockResponse)
    })

    it('extractBody on the response helper should be called with the response', () => {
      expect(responseHelper.extractBody).toHaveBeenCalledWith(mockResponse)
    })

    describe('when extractBody resolves', () => {
      let resolveHandler, rejectionHandler

      beforeEach(() => {
        resolveHandler = jest.fn()
        rejectionHandler = jest.fn()
      })

      describe('with an populated body', () => {
        beforeEach(() => {
          resultingPromise.then(resolveHandler, rejectionHandler)
        })

        describe('which contains no error', () => {
          beforeEach(() => {
            errorHandler.handleUnknownError.mockReturnValueOnce(false)
            extractBodyPromise.resolve(mockExtractedBody)
          })

          it('the given resolve handler should be called with an object containing status and extracted body', () => {
            expect(resolveHandler).toHaveBeenCalledWith({
              status: 'mock_status',
              body: mockExtractedBody,
            })
          })
        })
      })

      describe('with an unpopulated body', () => {
        beforeEach(() => {
          extractBodyPromise.resolve()
          resultingPromise.then(resolveHandler, () => {})
        })

        it('handleUnknownError should NOT be called on the error handler', () => {
          expect(errorHandler.handleUnknownError).not.toHaveBeenCalled()
        })

        it('the given resolve handler should be called with the full response', () => {
          expect(resolveHandler).toHaveBeenCalledWith(mockResponse)
        })
      })
    })
  })
})
