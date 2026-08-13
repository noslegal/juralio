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

import { groupHistoryEvents, GROUP_WINDOW_MS } from './history-grouping'

const event = (id, actorId, occurredAt, eventType) => ({
  id,
  occurredAt,
  matterEvent: {
    eventType,
    occurredAt,
    performedBy: { id: actorId, firstName: 'A', lastName: 'B' },
    payload: {},
  },
})

const base = new Date('2026-06-16T15:31:00Z').getTime()
const at = offsetMs => new Date(base - offsetMs).toISOString()

describe('history-grouping', () => {
  describe('groupHistoryEvents', () => {
    test('empty list returns empty list', () => {
      expect(groupHistoryEvents([])).toEqual([])
    })

    test('consecutive events by the same actor within the window form one group', () => {
      const events = [
        event(3, 1, at(0), 'TaskCreated'),
        event(2, 1, at(1000), 'TaskStatusChanged'),
        event(1, 1, at(2000), 'AddedToMatter'),
      ]
      const groups = groupHistoryEvents(events)
      expect(groups).toHaveLength(1)
      expect(groups[0].count).toBe(3)
      expect(groups[0].actorId).toBe(1)
      expect(groups[0].categoryCounts).toEqual({ Tasks: 2, Team: 1 })
    })

    test('a change of actor starts a new group', () => {
      const events = [
        event(2, 1, at(0), 'TaskCreated'),
        event(1, 2, at(1000), 'TaskCreated'),
      ]
      const groups = groupHistoryEvents(events)
      expect(groups).toHaveLength(2)
      expect(groups.map(g => g.actorId)).toEqual([1, 2])
    })

    test('a gap larger than the window starts a new group for the same actor', () => {
      const events = [
        event(2, 1, at(0), 'TaskCreated'),
        event(1, 1, at(GROUP_WINDOW_MS + 1000), 'TaskCreated'),
      ]
      const groups = groupHistoryEvents(events)
      expect(groups).toHaveLength(2)
    })

    test('the group id and occurredAt come from its first (newest) event', () => {
      const events = [
        event(9, 1, at(0), 'TaskCreated'),
        event(8, 1, at(1000), 'TaskCreated'),
      ]
      const [group] = groupHistoryEvents(events)
      expect(group.id).toBe(9)
      expect(group.occurredAt).toBe(at(0))
    })
  })
})
