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
  getPlaceholders(matterId) {
    return api(`admin/matter/${matterId}/placeholders`, 'GET')
  },

  getPlaceholderById(matterId, placeholderId) {
    return api(`admin/matter/${matterId}/placeholders/${placeholderId}`, 'GET')
  },

  getPlaceholderTaskCount(matterId, placeholderId) {
    return api(
      `admin/matter/${matterId}/placeholders/${placeholderId}/tasks`,
      'GET'
    )
  },

  createPlaceholder(matterId, properties) {
    return api(`admin/matter/${matterId}/placeholders`, 'POST', properties)
  },

  updatePlaceholder(matterId, placeholderId, properties) {
    return api(
      `admin/matter/${matterId}/placeholders/${placeholderId}`,
      'PATCH',
      properties
    )
  },
  mergePlaceholders(matterId, placeholder1, placeholder2, masterId) {
    let body = {
      masterPlaceholderId:
        placeholder1 === masterId ? placeholder1 : placeholder2,
      minorPlaceholderId:
        placeholder1 === masterId ? placeholder2 : placeholder1,
    }
    return api(`admin/matter/${matterId}/placeholders/merge`, 'POST', body)
  },

  disablePlaceholder(matterId, placeholderId) {
    return api(
      `admin/matter/${matterId}/placeholders/${placeholderId}`,
      'DELETE'
    )
  },
}
