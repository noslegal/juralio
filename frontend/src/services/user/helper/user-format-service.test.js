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

import { formatUserDisplayName } from './user-format-service'

describe('user-format-service', () => {
  describe('formatUserDisplayName', () => {
    it('should return first name followed by last name if user has both', () => {
      const user = {
        firstname: 'King',
        lastname: 'Kong',
        username: 'BigMonkey',
      }
      expect(formatUserDisplayName(user)).toBe('King Kong')
    })

    it('should return bracketed username if no last name', () => {
      const user = {
        firstname: 'King',
        username: 'BigMonkey',
      }
      expect(formatUserDisplayName(user)).toBe('BigMonkey')
    })

    it('should return bracketed username if no first name', () => {
      const user = {
        lastname: 'Kong',
        username: 'BigMonkey',
      }
      expect(formatUserDisplayName(user)).toBe('BigMonkey')
    })
    it('should return username if no first name or last name', () => {
      const user = {
        username: 'Mothra',
      }
      expect(formatUserDisplayName(user)).toBe('Mothra')
    })
  })
})
