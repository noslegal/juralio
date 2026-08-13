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

import * as routeHelper from './route-helper'
import { isInSpecificTaskContext } from './route-context-helper'

describe('route-context-helper.test', () => {
  describe('isInSpecificTaskContext', () => {
    beforeEach(() => {
      routeHelper.getLocationParams = jest.fn().mockReturnValueOnce(321)
    })

    describe('when the given id DOES match the task in context', () => {
      let result

      beforeEach(() => {
        result = isInSpecificTaskContext(321)
      })

      it('should call getLocationParams with "task', () => {
        expect(routeHelper.getLocationParams).toHaveBeenCalledWith('task')
      })

      it('true should be returned', () => {
        expect(result).toBe(true)
      })
    })

    describe('when the given id does NOT match the task in context', () => {
      it('false should be returned', () => {
        expect(isInSpecificTaskContext(123)).toBe(false)
      })
    })

    describe('when a string is passed in instead of an integer', () => {
      it('false should be returned', () => {
        expect(isInSpecificTaskContext('321')).toBe(false)
      })
    })
  })
})
