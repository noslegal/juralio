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
  getMatters(excludeAdministrable, allMatters, startIndex, endIndex) {
    let url = 'matters'
    if (excludeAdministrable) {
      url = `${url}?excludeAdministrable=true`
    } else if (allMatters) {
      url = `${url}?allMatters=true`
    } else if (startIndex !== undefined && endIndex !== undefined) {
      url = `${url}?startIndex=${startIndex}&endIndex=${endIndex}`
    }
    return api(url)
  },

  getOrgMattersPaged({
    startIndex,
    endIndex,
    q,
    statuses,
    sortField,
    sortOrder,
  }) {
    const params = new URLSearchParams()
    params.set('allMatters', 'true')
    params.set('startIndex', String(startIndex))
    params.set('endIndex', String(endIndex))
    if (q) params.set('q', q)
    if (statuses?.length) statuses.forEach(s => params.append('status', s))
    if (sortField) params.set('sortField', sortField)
    if (sortOrder) params.set('sortOrder', sortOrder)
    return api(`matters?${params.toString()}`)
  },

  getMatter(id) {
    return api(`matter/${id}`)
  },

  getMatterTeam(id, includeTaskCount = false, includePlaceholders = false) {
    return api(
      `matter/${id}/team` +
        `?includeTaskCount=${includeTaskCount}` +
        '&' +
        `includePlaceholders=${includePlaceholders}`
    )
  },

  createMatter(
    clientName,
    name,
    userDefinedReferenceNumber,
    position,
    department
  ) {
    return api('matters', 'POST', {
      clientName,
      name,
      userDefinedReferenceNumber,
      position,
      department,
    })
  },

  updateMatter(id, payload) {
    return api(`admin/matter/${id}`, 'PATCH', payload)
  },

  addAdmin(userIds, matterId, costAccess) {
    return api(`admin/matter/${matterId}/matters`, 'POST', {
      matter: matterId,
      users: userIds,
      costAccess: costAccess,
    })
  },

  addEditor(userIds, matterId, costAccess) {
    return api(`admin/matter/${matterId}/teammembers`, 'POST', {
      matter: matterId,
      users: userIds,
      costAccess: costAccess,
    })
  },

  addViewOnly(userIds, matterId, costAccess) {
    return api(`admin/matter/${matterId}/viewers`, 'POST', {
      matter: matterId,
      users: userIds,
      costAccess: costAccess,
    })
  },

  sendAddEmail(matterId, userIds, message) {
    return api(`admin/matter/${matterId}/notify`, 'POST', {
      users: userIds,
      message: message,
    })
  },

  removeAdmin(matterId, adminId) {
    return api(`admin/matter/${matterId}/matters/${adminId}`, 'DELETE', {
      id: adminId,
    })
  },

  addCosts(userId, matterId) {
    return api(`admin/matter/${matterId}/costs`, 'POST', {
      matter: matterId,
      id: userId,
    })
  },

  removeCosts(matterId, costsId) {
    return api(`admin/matter/${matterId}/costs/${costsId}`, 'DELETE', {
      id: costsId,
    })
  },

  removeEditor(matterId, memberId) {
    return api(`admin/matter/${matterId}/teammembers/${memberId}`, 'DELETE')
  },

  removeViewOnly(matterId, viewOnlyId) {
    return api(`admin/matter/${matterId}/viewers/${viewOnlyId}`, 'DELETE', {
      id: viewOnlyId,
      matterId: matterId,
    })
  },

  removeUserFromMatter(userId, matterId) {
    return api(`admin/matter/${matterId}/removeUser`, 'DELETE', {
      userId: userId,
      matterId: matterId,
    })
  },
  search(searchTerm) {
    return api(
      `universal/fuzzysearch?searchTerm=${searchTerm}&mattersOnly=true`
    )
  },
  getMatterResources(id) {
    return api(`matter/${id}/resources`)
  },
  addMatterResource(id, name, url, image) {
    return api(`matter/${id}/resources`, 'POST', {
      name: name,
      url: url,
      image: image,
    })
  },
  visitMatterResource(id, resourceId) {
    return api(`matter/${id}/resources/${resourceId}`, 'POST', {})
  },
  deleteMatterResource(id, resourceId) {
    return api(`matter/${id}/resources/${resourceId}`, 'DELETE')
  },
  getMatterWorkstreamResources(matterId) {
    return api(`matter/${matterId}/workstreams/resources`)
  },
  getMatterOverview(matterId) {
    return api(`matter/${matterId}/overview`)
  },
  getDeletedMatterLogs() {
    return api(`matters/deleted`, 'GET')
  },
  getMatterPlaceholders(matterId) {
    return api(`/matter/${matterId}/placeholders`)
  },
  updateGroupPosition(matterId, payload) {
    return api(`/matter/${matterId}/matterGroupPosition`, 'PATCH', payload)
  },
  deleteGroupFromMatter(matterId, groupId) {
    return api(`/matter/${matterId}/matterGroupPosition/${groupId}`, 'DELETE')
  },
}
