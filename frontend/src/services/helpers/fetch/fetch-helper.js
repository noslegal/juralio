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

import { responseErrorHandler } from './response/error/reponse-error-handler'
import responseHandler, {
  imageResponseHandler,
  svgResponseHandler,
} from './response/response-handler'
import fetchWrapper, {
  fileFetchWrapper,
  imageFetchWrapper,
} from './wrapper/fetch-wrapper'

export default async (path, method, body, isPublic = false) => {
  let response = await fetchWrapper(path, method, body, isPublic)
    .then(responseHandler)
    .catch(responseErrorHandler)

  return response
}

export const imageApi = (path, method, body) =>
  imageFetchWrapper(path, method, body)
    .then(imageResponseHandler)
    .catch(responseErrorHandler)

export const svgApi = (path, method, body) =>
  imageFetchWrapper(path, method, body)
    .then(svgResponseHandler)
    .catch(responseErrorHandler)

export const downloadXlsx = (
  path,
  method,
  body,
  fileName = 'juralio-matter-export.xlsx'
) =>
  fileFetchWrapper(path, method, body)
    .then(imageResponseHandler)
    .then(blob => {
      blob = blob.body
      let url = window.URL.createObjectURL(blob)
      let a = document.createElement('a')
      a.href = url
      a.download = fileName
      a.click()
    })
    .catch(responseErrorHandler)

export const downloadCsv = (path, fileName = 'juralio-export.csv') =>
  fileFetchWrapper(path, 'GET')
    .then(imageResponseHandler)
    .then(blob => {
      blob = blob.body
      let url = window.URL.createObjectURL(blob)
      let a = document.createElement('a')
      a.href = url
      a.download = fileName
      a.click()
      window.URL.revokeObjectURL(url)
    })
    .catch(responseErrorHandler)
