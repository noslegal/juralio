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

import { getLocationParams } from './route-helper'

describe('route-helper.test', () => {
  describe('getLocationParams', () => {
    describe('when the current path', () => {
      describe('does NOT contain the desired sub-path', () => {
        beforeEach(() => {
          global.window.location.hash = 'andy'
        })

        it('should return undefined', () => {
          expect(getLocationParams('task')).toBeUndefined()
        })
      })

      describe('does contain the desired sub-path', () => {
        describe('and the associated id is parsable to an integer', () => {
          beforeEach(() => {
            global.window.location.hash = 'http://example.com/task/123'
          })

          it('should return the associated id as an integer', () => {
            expect(getLocationParams('task')).toBe(123)
          })
        })

        describe('and the associated id is NOT parsable to an integer', () => {
          beforeEach(() => {
            global.window.location.hash = 'http://example.com/task/not_an_int'
          })

          it('should return undefined', () => {
            expect(getLocationParams('task')).toBeUndefined()
          })
        })
      })
    })
  })
})
