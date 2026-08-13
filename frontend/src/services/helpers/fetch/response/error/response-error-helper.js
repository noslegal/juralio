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

import { API_ERROR_CODE } from '../../../../../app/constants'

const isCustomError = payload =>
  Object.keys(API_ERROR_CODE)
    .map(key => API_ERROR_CODE[key])
    .includes(payload.errors[0].message.toString())

const hasError = payload =>
  payload.errors && payload.errors.length > 0 ? true : false

export const hasUnknownError = responseBody =>
  hasError(responseBody) && !isCustomError(responseBody)
