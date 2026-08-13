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

import HttpStatus from 'http-status-codes'
import { API_ERROR_CODE } from '../../app/constants'
import getAPIUrl from '../helpers/api-helper'

export default {
  decryptMagicLink(magicLink) {
    return fetch(getAPIUrl(true) + '/magicLink/decode', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify({
        magicLink: magicLink,
      }),
    }).then(async response => {
      const jsonResponse = await response.text()
      if (response.status === HttpStatus.OK) {
        return JSON.parse(jsonResponse)
      }
      if (response.status === API_ERROR_CODE.MAGIC_LINK_EXPIRED) {
        return {
          status: API_ERROR_CODE.MAGIC_LINK_EXPIRED,
          context: jsonResponse,
        }
      }
      if (response.status === API_ERROR_CODE.MAGIC_LINK_ALREADY_USED) {
        return {
          status: API_ERROR_CODE.MAGIC_LINK_ALREADY_USED,
        }
      }

      return { status: 400 }
    })
  },

  decryptMagicLinkBase64(magicLink) {
    return fetch(getAPIUrl(true) + '/magicLink/decode', {
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
      },
      method: 'POST',
      body: JSON.stringify(magicLink),
    }).then(async response => {
      const jsonResponse = await response.text()
      if (response.status === HttpStatus.OK) {
        return JSON.parse(jsonResponse)
      }
      if (response.status === API_ERROR_CODE.MAGIC_LINK_EXPIRED) {
        return {
          status: API_ERROR_CODE.MAGIC_LINK_EXPIRED,
          context: jsonResponse,
        }
      }
      if (response.status === API_ERROR_CODE.MAGIC_LINK_ALREADY_USED) {
        return {
          status: API_ERROR_CODE.MAGIC_LINK_ALREADY_USED,
        }
      }

      return { status: 400 }
    })
  },
}
