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

import { MATTER_EVENT_TYPES } from '../../../components/navigation/global-notifications/helpers/typed-payload-renderers/event-types'

// High-level categories surfaced in the Matter History event filter and the group
// summary badge. Mirrors MatterEventRegistryService.CATEGORY_TO_EVENT_TYPES on the
// backend — keep the two in sync.
export const HISTORY_CATEGORIES = {
  Tasks: 'Tasks',
  Notes: 'Notes',
  Team: 'Team',
  Matter: 'Matter',
}

export const CATEGORY_TO_EVENT_TYPES = {
  [HISTORY_CATEGORIES.Tasks]: [
    MATTER_EVENT_TYPES.TaskCreated,
    MATTER_EVENT_TYPES.TaskStatusChanged,
    MATTER_EVENT_TYPES.TaskDateUpdated,
    MATTER_EVENT_TYPES.TaskMovedNewParent,
    MATTER_EVENT_TYPES.TaskMovedNewProject,
    MATTER_EVENT_TYPES.TaskMovedLevelA,
    MATTER_EVENT_TYPES.MarkedAsNotRequired,
  ],
  [HISTORY_CATEGORIES.Notes]: [
    MATTER_EVENT_TYPES.PostCreated,
    MATTER_EVENT_TYPES.PostMarkedFinal,
  ],
  [HISTORY_CATEGORIES.Team]: [
    MATTER_EVENT_TYPES.AddedToTaskTeam,
    MATTER_EVENT_TYPES.RemovedFromTaskTeam,
    MATTER_EVENT_TYPES.AddedToMatter,
    MATTER_EVENT_TYPES.RemovedFromMatter,
  ],
  [HISTORY_CATEGORIES.Matter]: [
    MATTER_EVENT_TYPES.DeletedMatter,
    MATTER_EVENT_TYPES.RestoredMatter,
  ],
}

const EVENT_TYPE_TO_CATEGORY = Object.entries(CATEGORY_TO_EVENT_TYPES).reduce(
  (acc, [category, types]) => {
    types.forEach(type => {
      acc[type] = category
    })
    return acc
  },
  {}
)

export const categoryForEventType = eventType =>
  EVENT_TYPE_TO_CATEGORY[eventType] || null
