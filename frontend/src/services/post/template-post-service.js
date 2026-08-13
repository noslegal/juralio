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

import { NOTE_TYPES } from '../../app/constants'
import { getPostType } from '../../helpers/post-helpers'
import api from '../helpers/fetch/fetch-helper'

export default {
  getPostsByTemplateTaskId(templateId, templateTaskId) {
    return api(`projecttemplates/${templateId}/tasks/${templateTaskId}/posts`)
  },

  createTemplatePost(
    templateId,
    templateTaskId,
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
      `projecttemplates/${templateId}/tasks/${templateTaskId}/posts`,
      'POST',
      payload
    )
  },

  getTemplatePost(templateId, templateTaskId, templatePostId) {
    return api(
      `projecttemplates/${templateId}/tasks/${templateTaskId}/posts/${templatePostId}`
    )
  },

  deletePost(templateId, templateTaskId, templatePostId) {
    return api(
      `projecttemplates/${templateId}/tasks/${templateTaskId}/posts/${templatePostId}`,
      'DELETE'
    )
  },

  updateTemplatePost(templateId, templateTaskId, templatePostId, properties) {
    if (properties.url) {
      properties.type = getPostType(properties.url, NOTE_TYPES.WEB)
    }
    return api(
      `projecttemplates/${templateId}/tasks/${templateTaskId}/posts/${templatePostId}`,
      'PATCH',
      properties
    )
  },
}
