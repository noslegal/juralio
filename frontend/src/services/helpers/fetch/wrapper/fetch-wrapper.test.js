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

import * as userDataService from '../../../../services/user/user-data-service'
import * as requestHelper from '../request/request-helper'
import fetchWrapper from './fetch-wrapper'

describe('fetch-wrapper', () => {
  beforeEach(() => {
    requestHelper.getHeaders = jest.fn().mockReturnValueOnce('mock_headers')
    requestHelper.getSerialisedBody = jest
      .fn()
      .mockReturnValueOnce('mock_serialised_body')
    userDataService.getAuthAttribute = jest
      .fn()
      .mockReturnValueOnce('mock_access_token')
    global.window.fetch = jest.fn()
  })

  describe('when called with all parameters', () => {
    beforeEach(() => {
      fetchWrapper('mock_path', 'mock_method', 'mock_body')
    })

    it('should call getAuthAttribute on user data service with access token property path', () => {
      expect(userDataService.getAuthAttribute).toHaveBeenCalledWith([
        'access_token',
      ])
    })

    it('getHeaders should have been called with the users access token', () => {
      expect(requestHelper.getHeaders).toHaveBeenCalledWith('mock_access_token')
    })

    it('getSerialisedBody should have been called with the body and method', () => {
      expect(requestHelper.getSerialisedBody).toHaveBeenCalledWith(
        'mock_body',
        'mock_method'
      )
    })

    describe('the global fetch function', () => {
      it('should have been called once', () => {
        expect(global.window.fetch.mock.calls.length).toBe(1)
      })

      describe('parameters', () => {
        let parameters
        beforeEach(() => (parameters = global.window.fetch.mock.calls[0]))

        it('should contain the api url and given path concatenated as the first parameter', () => {
          expect(parameters[0]).toEqual('http://localhost/api/mock_path')
        })

        describe('should include a request parameters object which', () => {
          let requestObject
          beforeEach(() => (requestObject = parameters[1]))

          it('should contain the given method', () => {
            expect(requestObject.method).toEqual('mock_method')
          })

          it('should contain the result of the getHeaders call', () => {
            expect(requestObject.headers).toEqual('mock_headers')
          })

          it('should contain the result of the getSerialisedBody call', () => {
            expect(requestObject.body).toEqual('mock_serialised_body')
          })
        })
      })
    })
  })

  describe('when called with the path ONLY', () => {
    let requestObject

    beforeEach(() => {
      fetchWrapper('mock_path')
      requestObject = global.window.fetch.mock.calls[0][1]
    })

    it('the request method should default to GET', () => {
      expect(requestObject.method).toEqual('GET')
    })
  })
})
