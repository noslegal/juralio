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

export const RESET_VALIDATION = 'RESET_VALIDATION'
export const PASSWORD_EXPIRED = 'PASSWORD_EXPIRED'
export const REGISTER_MFA = 'REGISTER_MFA'
export const REQUIRE_MFA_TOKEN = 'REQUIRE_MFA_TOKEN'
export const STORE_CREDENTIALS = 'STORE_CREDENTIALS'
export const CLEAR_CREDENTIALS = 'CLEAR_CREDENTIALS'
export const SSO_LOGIN = 'SSO_LOGIN'
export const INVALID_SSO = 'INVALID_SSO'
export const RESET_FORM = 'RESET_FORM'
export const FORGOT_PASSWORD = 'FORGOT_PASSWORD'
export const MAGIC_LINK_USED = 'MAGIC_LINK_USED'

export const resetValidation = () => {
  return {
    type: RESET_VALIDATION,
  }
}

export const storeCredentials = credentials => {
  return { type: STORE_CREDENTIALS, credentials }
}

export const passwordExpired = () => {
  return { type: PASSWORD_EXPIRED }
}

export const forgotPassword = () => {
  return { type: FORGOT_PASSWORD }
}

export const registerMfa = () => {
  return { type: REGISTER_MFA }
}

export const requireMfaToken = () => {
  return { type: REQUIRE_MFA_TOKEN }
}

export const clearCredentials = () => {
  return { type: CLEAR_CREDENTIALS }
}

export const ssoLogin = () => {
  return { type: SSO_LOGIN }
}
export const invalidSSO = reasonCode => {
  return { type: INVALID_SSO, invalidSSOReason: reasonCode }
}
export const resetForm = () => {
  return { type: RESET_FORM }
}

export const clearValidation = () => dispatch => {
  dispatch(resetValidation())
}

export const magicLinkUsed = () => dispatch => {
  dispatch({ type: MAGIC_LINK_USED })
}
