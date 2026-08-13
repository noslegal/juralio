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

import { getAuthAttribute } from '../../../user/user-data-service'
import getAPIUrl from '../../api-helper'
import {
  getHeaders,
  getHeadersExcludingContentType,
  getSerialisedBody,
} from '../request/request-helper'

export default (url, method = 'GET', body, isPublic = false) => {
  if (url.indexOf('nska=true') === -1) {
    // No Session Keep Alive.
    localStorage.setItem('lastAPICall', new Date().toJSON())
  }
  return fetch(`${getAPIUrl(isPublic)}${url}`, {
    method,
    headers: getHeaders(getAuthAttribute(['access_token'])),
    body: getSerialisedBody(body, method),
  })
}

export const imageFetchWrapper = (url, method = 'GET', body) => {
  const accessToken = getAuthAttribute(['access_token'])
  const headers = getHeadersExcludingContentType(accessToken)
  validateUrl(url)
  return fetch(`${getAPIUrl()}${url}`, {
    method,
    headers: headers,
    body: method === 'POST' ? body : getSerialisedBody(body, method),
  })
}

export const fileFetchWrapper = (url, method = 'GET', body) => {
  const accessToken = getAuthAttribute(['access_token'])
  const headers = getHeadersExcludingContentType(accessToken)
  validateUrl(url)
  return fetch(`${getAPIUrl()}${url}`, {
    method,
    headers: headers,
    body: method === 'POST' ? body : getSerialisedBody(body, method),
  })
}

const validateUrl = url => {
  let urlObject = url.split('/')
  let isUndefined = urlObject.indexOf('undefined') !== -1
  if (isUndefined) {
    console.error(url, 'is malformed')
  }
}
