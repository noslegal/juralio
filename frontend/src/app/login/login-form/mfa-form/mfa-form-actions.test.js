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

import {
  storeQrUrl,
  STORE_QR_URL,
  invalidMfaToken,
  INVALID_MFA_TOKEN,
} from './mfa-form-actions'

describe('mfa-form-actions', () => {
  let result

  describe('storeQrUrl', () => {
    beforeEach(() => {
      result = storeQrUrl('test-qr')
    })

    it('should return an action typed as STORE_QR_URL', () => {
      expect(result).toEqual({ type: STORE_QR_URL, qrUrl: 'test-qr' })
    })
  })

  describe('invalidMfaToken', () => {
    beforeEach(() => {
      result = invalidMfaToken()
    })

    it('should return an action typed as INVALID_MFA_TOKEN with the correct error message', () => {
      expect(result).toEqual({
        type: INVALID_MFA_TOKEN,
        message: 'login.incorrectAuthenticationCode',
      })
    })
  })
})
