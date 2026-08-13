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
  addPostMember(matterId, projectId, taskId, postId, user) {
    let payload = {
      user: user,
      includeTree: true,
    }
    return api(
      `matter/${matterId}/workstreams/${projectId}/task/${taskId}/post/${postId}/postmembers`,
      'POST',
      payload
    )
  },

  deletePostMember(matterId, projectId, taskId, postId, user) {
    let payload = {
      user: user,
    }
    return api(
      `matter/${matterId}/workstreams/${projectId}/task/${taskId}/post/${postId}/postmembers/${user.id}`,
      'DELETE',
      payload
    )
  },

  getMembers(matterId, projectId, taskId, postId) {
    return api(
      `matter/${matterId}/workstreams/${projectId}/task/${taskId}/post/${postId}/postmembers`,
      'GET'
    )
  },
}
