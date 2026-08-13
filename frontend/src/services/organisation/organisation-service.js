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

import api, { imageApi } from '../helpers/fetch/fetch-helper'

export default {
  getOrganisations() {
    return api('organisations')
  },

  getOrganisation(organisationId) {
    return api(`organisations/${organisationId}`)
  },

  getCurrentOrganisation() {
    return api('organisation')
  },

  getOrganisationUsers(id) {
    return api(`organisations/${id}/users`)
  },

  createOrganisation(name, ssoState) {
    const payload = {
      name,
      mfaEnabled: true,
      sso: ssoState,
    }
    return api('organisations', 'POST', payload)
  },

  updateOrganisation(organisationId, properties) {
    return api(`organisations/${organisationId}`, 'PATCH', properties)
  },

  addUserToOrganisation(username, organisationId) {
    return api(`organisations/${organisationId}/users`, 'POST', {
      username,
    })
  },

  removeUserFromOrganisation(username, organisationId) {
    return api(`organisations/${organisationId}/users`, 'DELETE', { username })
  },

  setOrganisationLogo(organisationId, logoFile) {
    const formData = new FormData()
    formData.append('logo', logoFile)
    return imageApi(`organisations/${organisationId}/logo`, 'POST', formData)
  },

  getOrganisationLogo(organisationId) {
    return imageApi(`organisations/${organisationId}/logo`)
  },

  deleteOrganisationLogo(organisationId) {
    return imageApi(`organisations/${organisationId}/logo`, 'DELETE', {})
  },
  getOrganisationReports(organisationId) {
    return api(`organisations/${organisationId}/reports`)
  },
  getLapsedLoginMessage(orgId) {
    return api(`organisations/${orgId}/lapsedloginmessage`)
  },
  saveLapsedLoginMessage(orgId, message) {
    return api(`organisations/${orgId}/lapsedloginmessage`, 'POST', message)
  },
  updateLapsedLoginMessage(orgId, message) {
    return api(`organisations/${orgId}/lapsedloginmessage`, 'PATCH', message)
  },
  getTrialCardMessage(orgId) {
    return api(`organisations/${orgId}/trialmessage`)
  },
  saveTrialCardMessage(orgId, message) {
    return api(`organisations/${orgId}/trialmessage`, 'POST', message)
  },
  updateTrialCardMessage(orgId, message) {
    return api(`organisations/${orgId}/trialmessage`, 'PATCH', message)
  },
  getGroups() {
    return api('groups', 'GET')
  },
  saveGroup(orgId, payload) {
    return api(`organisations/${orgId}/group`, 'POST', payload)
  },
  getGroupsForOrg(orgId) {
    return api(`organisations/${orgId}/group`, 'GET')
  },
  updateGroup(orgId, groupId, payload) {
    return api(`organisations/${orgId}/group/${groupId}`, 'PATCH', payload)
  },
  deleteGroup(orgId, groupId) {
    return api(`organisations/${orgId}/group/${groupId}`, 'DELETE')
  },

  setGroupLogo(orgId, groupId, logoFile) {
    const formData = new FormData()
    formData.append('logo', logoFile)
    return imageApi(
      `organisations/${orgId}/group/${groupId}/logo`,
      'POST',
      formData
    )
  },

  getGroupLogo(orgId, groupId) {
    return imageApi(`organisations/${orgId}/group/${groupId}/logo`)
  },

  deleteGroupLogo(orgId, groupId) {
    return imageApi(
      `organisations/${orgId}/group/${groupId}/logo`,
      'DELETE',
      {}
    )
  },
}
