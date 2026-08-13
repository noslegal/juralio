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

import { tryParse } from './json-helper'

describe('json-helper.test', () => {
  describe('tryParse', () => {
    it('when passed a valid JSON string should return the parsed object', () => {
      const input = '{ "testProp": "testVal" }'
      expect(tryParse(input)).toEqual({ testProp: 'testVal' })
    })

    it('when passed an invalid JSON string should return undefined', () => {
      const input = 'Not a json string'
      expect(tryParse(input)).toBeUndefined()
    })
  })
})
