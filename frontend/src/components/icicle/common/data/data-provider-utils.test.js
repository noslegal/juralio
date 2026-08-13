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

import { getChildrenAccessor, getLeafResolver } from './data-provider-utils'

describe('data-provider-utils.test.js', () => {
  describe('getChildrenAccessor', () => {
    let accessorFunction

    describe('when called with a property name', () => {
      const childrenPropertyName = 'mockProperty'

      beforeEach(() => {
        accessorFunction = getChildrenAccessor(childrenPropertyName)
      })

      describe('and an object which has a property of that name', () => {
        it('should return the value referenced by the given property name', () => {
          expect(accessorFunction({ mockProperty: 'wood' })).toBe('wood')
        })
      })

      describe('and an object which does NOT have a property of that name', () => {
        it('should return undefined', () => {
          expect(accessorFunction({ wood: 'wood' })).toBeUndefined()
        })
      })
    })
  })

  describe('getLeafResolver', () => {
    let leafResolver

    describe('when called with a property name', () => {
      const childrenPropertyName = 'mockProperty'

      beforeEach(() => {
        leafResolver = getLeafResolver(childrenPropertyName)
      })

      describe('and an object which does NOT have a property of that name', () => {
        it('should return 1', () => {
          expect(leafResolver({})).toBe(1)
        })
      })

      describe('and an object which has an empty array referenced the property name', () => {
        it('should return 1', () => {
          expect(leafResolver({ mockProperty: [] })).toBe(1)
        })
      })

      describe('and an object which has a populated array referenced the property name', () => {
        it('should return 0', () => {
          expect(leafResolver({ mockProperty: [{}] })).toBe(0)
        })
      })
    })
  })
})
