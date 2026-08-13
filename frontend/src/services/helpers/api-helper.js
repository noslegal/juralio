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

const DEV_APP_PORTS = ['9090', '3000', '3007']
const DEV_SERVER_PORT = '8080'

export const _getAPIUrl = (window, isPublic) => {
  const API_URI = isPublic ? '' : '/api/'

  const {
    top: { location },
  } = window
  if (DEV_APP_PORTS.includes(location.port)) {
    let hostname = location.hostname
    let protocol = location.protocol
    if (hostname === 'localdeveloper.example.com') {
      hostname = 'localhost'
      protocol = 'http:'
    }

    return `${protocol}//${hostname}:${DEV_SERVER_PORT}${API_URI}`
  } else {
    return `${location.protocol}//${location.hostname}${
      location.port ? ':' + location.port : ''
    }${API_URI}`
  }
}

export default isPublic => _getAPIUrl(global.window, isPublic)
