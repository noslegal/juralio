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
  getArchivedPosts(matterId) {
    return api(`matter/${matterId}/posts?archived=true`)
  },
  getPostsByTaskId(
    matterId,
    projectId,
    taskId,
    previewSummary = false,
    previewLimit = 0
  ) {
    let options = ''
    if (previewSummary) {
      options = '?previewSummary=true'
      if (previewLimit > 0) {
        options += '&limit=' + previewLimit
      }
    }

    return api(
      `matter/${matterId}/workstreams/${projectId}/task/${taskId}/posts${options}`
    )
  },
  getPost(matterId, projectId, taskId, postId) {
    return api(
      `matter/${matterId}/workstreams/${projectId}/task/${taskId}/post/${postId}`
    )
  },
  archivePost(matterId, projectId, taskId, postId) {
    const payload = {
      archive: true,
    }
    return api(
      `matter/${matterId}/workstreams/${projectId}/task/${taskId}/post/${postId}`,
      'PATCH',
      payload
    )
  },
  restorePost(postId, targetDetails) {
    const payload = targetDetails
    return api(
      `matter/${targetDetails.matterId}/post/${postId}`,
      'PATCH',
      payload
    )
  },
  updatePost(matterId, projectId, taskId, postId, properties) {
    const payload = {
      ...properties,
    }
    return api(
      `matter/${matterId}/workstreams/${projectId}/task/${taskId}/post/${postId}`,
      'PATCH',
      payload
    )
  },
  createPost(
    matterId,
    projectId,
    taskId,
    name,
    privatePost,
    type,
    url,
    startTime,
    endTime
  ) {
    const payload = {
      name,
      privatePost,
      type,
      url,
      startTime,
      endTime,
    }
    return api(
      `matter/${matterId}/workstreams/${projectId}/task/${taskId}/posts`,
      'POST',
      payload
    )
  },
  movePost(matterId, projectId, taskId, postId, newTaskId) {
    const payload = {
      newTaskId: newTaskId,
    }
    return api(
      `matter/${matterId}/workstreams/${projectId}/task/${taskId}/post/${postId}/move`,
      'POST',
      payload
    )
  },
}
