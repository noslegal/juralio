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

import {
  getActioneerId,
  getEventType,
  getOccurredAt,
} from '../../../components/navigation/global-notifications/helpers/typed-payload-renderers/notification-accessors'
import { categoryForEventType } from './history-categories'

// Events occurring within this many ms of each other by the same actor collapse
// into a single group (mirrors the design's "Task ×12, Workstream ×5" cards).
export const GROUP_WINDOW_MS = 5 * 60 * 1000

const occurredAtMs = event => {
  const value = getOccurredAt(event)
  return value ? new Date(value).getTime() : 0
}

// Builds the per-category counts used by the group's summary badge, e.g.
// { Tasks: 12, Team: 5 }. Returns counts keyed by category in event order.
const summariseCategories = events => {
  return events.reduce((counts, event) => {
    const category = categoryForEventType(getEventType(event))
    if (category) {
      counts[category] = (counts[category] || 0) + 1
    }
    return counts
  }, {})
}

/*
  Collapses a date-descending list of matter events into groups. A new group starts
  when the actor changes or the gap to the previous event in the current group
  exceeds GROUP_WINDOW_MS. Each group is:
  {
    id,                 // first event's id — stable React key
    actorId,
    occurredAt,         // the group's most-recent event time
    events: [...],      // the events, newest first
    categoryCounts: {}, // { Tasks: 12, Team: 5 }
    count,              // events.length
  }
*/
export const groupHistoryEvents = (events = []) => {
  const groups = []
  let current = null

  events.forEach(event => {
    const actorId = getActioneerId(event)
    const eventMs = occurredAtMs(event)
    const withinWindow =
      current &&
      current.actorId === actorId &&
      current.lastMs - eventMs <= GROUP_WINDOW_MS

    if (withinWindow) {
      current.events.push(event)
      current.lastMs = eventMs
    } else {
      current = {
        id: event.id,
        actorId,
        occurredAt: getOccurredAt(event),
        events: [event],
        lastMs: eventMs,
      }
      groups.push(current)
    }
  })

  return groups.map(group => ({
    id: group.id,
    actorId: group.actorId,
    occurredAt: group.occurredAt,
    events: group.events,
    categoryCounts: summariseCategories(group.events),
    count: group.events.length,
  }))
}
