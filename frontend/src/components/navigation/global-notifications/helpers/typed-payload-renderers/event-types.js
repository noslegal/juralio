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

// Event-type strings as emitted by the backend MatterEvent registry
// (server/grails-app/services/com/juralio/matterevent/MatterEventRegistryService.groovy).
export const MATTER_EVENT_TYPES = {
  TaskCreated: 'TaskCreated',
  TaskStatusChanged: 'TaskStatusChanged',
  PostCreated: 'PostCreated',
  PostMarkedFinal: 'PostMarkedFinal',
  TaskDateUpdated: 'TaskDateUpdated',
  TaskMovedNewParent: 'TaskMovedNewParent',
  TaskMovedNewProject: 'TaskMovedNewProject',
  TaskMovedLevelA: 'TaskMovedLevelA',
  MarkedAsNotRequired: 'MarkedAsNotRequired',
  AddedToTaskTeam: 'AddedToTaskTeam',
  RemovedFromTaskTeam: 'RemovedFromTaskTeam',
  AddedToMatter: 'AddedToMatter',
  RemovedFromMatter: 'RemovedFromMatter',
  DeletedMatter: 'DeletedMatter',
  RestoredMatter: 'RestoredMatter',
}
