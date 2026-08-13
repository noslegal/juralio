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

import api from '../helpers/fetch/fetch-helper'

export default {
  getPrivateWorkstreamTeam(matterId, workstreamId) {
    return api(`matter/${matterId}/workstreams/${workstreamId}/teammembers`)
  },

  addMembers(matterId, workstreamId, userIds) {
    return api(
      `matter/${matterId}/workstreams/${workstreamId}/teammembers`,
      'POST',
      {
        users: userIds,
      }
    )
  },

  removeMember(matterId, workstreamId, privateWorkstreamMemberId) {
    return api(
      `matter/${matterId}/workstreams/${workstreamId}/teammembers/${privateWorkstreamMemberId}`,
      'DELETE'
    )
  },

  removeFromAllTeams(matter_id, userId) {
    return api(
      `matter/${matter_id}/remove-private-teammember/${userId}`,
      'DELETE'
    )
  },
}
