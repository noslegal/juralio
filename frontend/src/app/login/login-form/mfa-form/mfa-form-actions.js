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

export const STORE_QR_URL = 'STORE_QR_URL'
export const INVALID_MFA_TOKEN = 'INVALID_MFA_TOKEN'

export const storeQrUrl = qrUrl => {
  return {
    type: STORE_QR_URL,
    qrUrl,
  }
}

export const invalidMfaToken = () => {
  return {
    type: INVALID_MFA_TOKEN,
    message: 'login.incorrectAuthenticationCode',
  }
}
