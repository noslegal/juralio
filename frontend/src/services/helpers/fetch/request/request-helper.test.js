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

import { getHeaders, getSerialisedBody } from './request-helper'

describe('request-helper.test', () => {
  describe('getHeaders', () => {
    describe('when passed a populated token', () => {
      let result

      beforeEach(() => (result = getHeaders('mock_token')))

      describe('the returned object', () => {
        it('should include an "Authorization" property with full token string', () => {
          expect(result.Authorization).toEqual('Bearer mock_token')
        })

        it('should include an "Accept" property as "application/json"', () => {
          expect(result.Accept).toEqual('application/json')
        })

        it('should include an "Content-Type" property as "application/json"', () => {
          expect(result['Content-Type']).toEqual('application/json')
        })

        it('should include a "Cache-Control" property as "no-store"', () => {
          expect(result['Cache-Control']).toEqual(
            'no-cache, no-store, must-revalidate'
          )
        })

        it('should include a "Pragma" property as "no-cache"', () => {
          expect(result['Pragma']).toEqual('no-cache')
        })

        it('should have 6 properties in total', () => {
          expect(Object.keys(result).length).toEqual(6)
        })
      })
    })

    describe('when passed undefined', () => {
      let result

      beforeEach(() => (result = getHeaders()))

      describe('the returned object', () => {
        it('should include an "Authorization" property with BLANK token string', () => {
          expect(result.Authorization).toEqual('')
        })

        it('should include an "Accept" property as "application/json"', () => {
          expect(result.Accept).toEqual('application/json')
        })

        it('should include an "Content-Type" property as "application/json"', () => {
          expect(result['Content-Type']).toEqual('application/json')
        })

        it('should include a "Cache-Control" property as "no-store"', () => {
          expect(result['Cache-Control']).toEqual(
            'no-cache, no-store, must-revalidate'
          )
        })

        it('should include a "Pragma" property as "no-cache"', () => {
          expect(result['Pragma']).toEqual('no-cache')
        })

        it('should have 6 properties in total', () => {
          expect(Object.keys(result).length).toEqual(6)
        })
      })
    })
  })

  describe('getSerialisedBody', () => {
    describe('when body is undefined', () => {
      describe('and method is NOT given', () => {
        it('should return undefined', () => {
          expect(getSerialisedBody(undefined)).toBeUndefined()
        })
      })

      describe('and method IS given as POST', () => {
        it('should return undefined', () => {
          expect(getSerialisedBody(undefined, 'POST')).toBeUndefined()
        })
      })

      describe('and method IS given as GET', () => {
        it('should return undefined', () => {
          expect(getSerialisedBody(undefined, 'GET')).toBeUndefined()
        })
      })
    })

    describe('when body is given and method IS given as GET', () => {
      it('should return undefined', () => {
        expect(getSerialisedBody({ test: 'test' }, 'GET')).toBeUndefined()
      })
    })

    describe('when body is given and method IS given as POST', () => {
      it('the stringified body should be returned', () => {
        const mockBody = { test: 'test' }

        expect(getSerialisedBody(Object.assign({}, mockBody), 'POST')).toEqual(
          JSON.stringify(mockBody)
        )
      })
    })

    describe('when body is given and method IS given as PATCH', () => {
      it('the stringified body should be returned', () => {
        const mockBody = { test: 'test' }

        expect(getSerialisedBody(Object.assign({}, mockBody), 'PATCH')).toEqual(
          JSON.stringify(mockBody)
        )
      })
    })
  })
})
