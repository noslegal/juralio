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

import { StatusCodes } from 'http-status-codes'
import { getHeaders } from '../../services/helpers/fetch/request/request-helper'
import getAPIUrl from '../helpers/api-helper'
import api from '../helpers/fetch/fetch-helper'
import fetchWrapper from '../helpers/fetch/wrapper/fetch-wrapper'

export default {
  getUserDetails(authResponse) {
    return fetch(getAPIUrl() + 'user', {
      headers: getHeaders(authResponse.access_token),
    }).then(async response => {
      const jsonResponse = await response.json()
      return {
        auth: authResponse,
        details: jsonResponse,
      }
    })
  },
  login(credentials) {
    const doLogin = () => {
      return fetch(getAPIUrl() + 'login', {
        method: 'POST',
        body: JSON.stringify(credentials),
      }).then(response =>
        response.ok ? response.json() : Promise.reject(response)
      )
    }

    return doLogin().then(this.getUserDetails)
  },

  visit(userId, urlPartial) {
    return api(`settings/user/${userId}/visit`, 'POST', {
      urlPartial: urlPartial,
    }).then(response => response)
  },
  getVisit(userId) {
    return api(`settings/user/${userId}/visit`, 'GET').then(
      response => response
    )
  },

  changePassword(credentials) {
    if (credentials.context === 'selfService') {
      return fetchWrapper('user/password', 'POST', credentials, false).then(
        response => {
          return response.ok
            ? Promise.resolve({
                username: credentials.username,
                password: credentials.newPassword,
              })
            : Promise.reject(response)
        }
      )
    } else {
      return fetch(getAPIUrl() + 'settings/user/password', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(credentials),
      }).then(response =>
        response.ok
          ? Promise.resolve({
              username: credentials.username,
              password: credentials.newPassword,
            })
          : Promise.reject(response)
      )
    }
  },

  logout() {
    return api('logout', 'POST', null)
  },

  updateftue(properties) {
    const payload = {
      ...properties,
    }
    return api('settings/user/updateftue', 'PATCH', payload).then(response => {
      if (response.status === StatusCodes.OK) {
        return response.body
      }
    })
  },

  resetFtue(userId) {
    return api(`settings/user/${userId}/resetftue`, 'POST').then(
      response => response
    )
  },

  getUsers() {
    return api('users')
  },

  getActivityLog(userId) {
    return api(`/users/${userId}/activitylog`)
  },

  getMatterUsers(matters) {
    return api('users/search', 'POST', { matters })
  },

  create(properties) {
    return api('users', 'POST', properties)
  },
  bulkCreate(properties) {
    return api('users/bulk', 'POST', properties)
  },

  update(id, properties) {
    return api(`users/${id}`, 'PATCH', properties)
  },

  updateSelf(properties) {
    return api('user', 'PATCH', properties)
  },

  setConfirmedStatus(orgId, userId) {
    return api(`organisations/${orgId}/user/${userId}/confirm`, 'POST', {})
  },

  requestTemporaryPassword(id, context) {
    if (context) {
      return api(`settings/users/${id}/password?context=${context}`, 'GET')
    }
    return api(`settings/users/${id}/password`, 'GET')
  },
  getUsersByEmail(email) {
    return api('users/search', 'POST', { username: email }).then(
      response => response.body
    )
  },
  requestResendInvite(username) {
    return api('settings/user/resendInvite', 'POST', { email: username })
  },
  forgotPassword(email) {
    return fetch(getAPIUrl(true) + '/forgotpassword', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({ username: email }),
    })
  },
}
