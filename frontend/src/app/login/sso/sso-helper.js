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

import { API_ERROR_CODE } from '../../constants'

export const getInvalidSSOText = code => {
  switch (code) {
    case API_ERROR_CODE.FAILED_SSO_AUTHENTICATION:
      return 'sso.failed_authentication'
    case API_ERROR_CODE.NO_MATCHING_JURALIO_USER:
      return 'sso.no_matching_user'
    default:
      return 'sso.unknown'
  }
}
