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

import * as x509 from '@peculiar/x509'
import { isValidUrl } from '../../../services/helpers/text/text-util-helper'
export default {
  validateSaml(settings) {
    if (
      !settings ||
      !settings?.identityProviderEntityId ||
      !settings?.identityProviderSsoUrl ||
      !settings?.identityProviderCertificate
    ) {
      return false
    }
    if (!isValidUrl(settings.identityProviderSsoUrl)) {
      return false
    }
    if (!isValidUrl(settings.identityProviderEntityId)) {
      return false
    }
    if (!this.validateX509(settings.identityProviderCertificate)) {
      return false
    }
    return true
  },

  validateX509(base64) {
    try {
      new x509.X509Certificate(base64)
      return true
    } catch (e) {
      return false
    }
  },
}
