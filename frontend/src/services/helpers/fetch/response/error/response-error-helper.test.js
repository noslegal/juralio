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

import { hasUnknownError } from './response-error-helper'

describe('response-error-helper.test', () => {
  describe('hasUnknownError', () => {
    describe('when the given response body', () => {
      describe('has no error array', () => {
        it('false should be returned', () => {
          expect(hasUnknownError({})).toBe(false)
        })
      })

      describe('has an error array of zero length', () => {
        it('false should be returned', () => {
          expect(hasUnknownError({ errors: [] })).toBe(false)
        })
      })

      describe('has an error code which matches an UNKNOWN error type', () => {
        it('true should be returned', () => {
          expect(hasUnknownError({ errors: [{ message: 6 }] })).toBe(true)
        })
      })

      describe('has an error code which matches a KNOWN error type', () => {
        it('false should be returned', () => {
          expect(hasUnknownError({ errors: [{ message: 101 }] })).toBe(false)
        })
      })
    })
  })
})
