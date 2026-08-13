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

import { groupNotifications } from './notification-grouping'

const addedToMatter = (id, affectedMemberId) => ({
  id,
  matterEvent: {
    eventType: 'AddedToMatter',
    matterId: 'matter 1',
    payload: { adminStatusChanged: true, affectedMemberId },
  },
})

describe('notification-grouping.test', () => {
  describe('groupNotifications', () => {
    test('given 2 related notifications, they should be grouped together', () => {
      const expected = [
        {
          ...addedToMatter('first notification id', 'Bobby'),
          relatedNotifications: [
            addedToMatter('second notification id', 'Sara'),
          ],
        },
      ]
      const actual = groupNotifications(
        [
          addedToMatter('first notification id', 'Bobby'),
          addedToMatter('second notification id', 'Sara'),
        ],
        'Charlie'
      )
      expect(actual).toEqual(expected)
    })
    test('given empty list, return empty list', () => {
      const expected = []
      const actual = groupNotifications([], 'Charlie')
      expect(actual).toEqual(expected)
    })
  })
})
