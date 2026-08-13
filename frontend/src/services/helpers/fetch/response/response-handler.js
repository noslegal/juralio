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

import { handleErrorStatus } from './error/reponse-error-handler'
import { extractBody, extractBlob, extractSvg } from './response-helper'

export default response => {
  return new Promise((resolve, reject) => {
    if (handleErrorStatus(response)) {
      reject()
    } else {
      extractBody(response).then(body => {
        if (body) {
          resolve({ status: response.status, body })
        } else {
          resolve(response)
        }
      })
    }
  })
}

export const imageResponseHandler = response => {
  return new Promise((resolve, reject) => {
    if (handleErrorStatus(response)) {
      reject()
    } else {
      extractBlob(response).then(body => {
        if (body) {
          resolve({ status: response.status, body })
        } else {
          resolve(response)
        }
      })
    }
  })
}

export const svgResponseHandler = response => {
  return new Promise((resolve, reject) => {
    if (handleErrorStatus(response)) {
      reject()
    } else {
      extractSvg(response).then(body => {
        if (body) {
          resolve({ status: response.status, body })
        } else {
          resolve(response)
        }
      })
    }
  })
}
