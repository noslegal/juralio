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

export const OLD_PASSWORD_INCORRECT = 'OLD_PASSWORD_INCORRECT'
export const NEW_PASSWORDS_DO_NOT_MATCH = 'NEW_PASSWORDS_DO_NOT_MATCH'
export const PASSWORD_COMPLEXITY_NOT_MET = 'PASSWORD_COMPLEXITY_NOT_MET'
export const NEW_PASSWORD_MATCHES_OLD_PASSWORD =
  'NEW_PASSWORD_MATCHES_OLD_PASSWORD'
export const USER_LOCKED = 'USER_LOCKED'

export const oldPasswordIncorrect = () => {
  return {
    type: OLD_PASSWORD_INCORRECT,
    message: 'login.oldPasswordIncorrect',
  }
}

export const newPasswordsDoNotMatch = () => {
  return {
    type: NEW_PASSWORDS_DO_NOT_MATCH,
    message: 'login.newPasswordsDoNotMatch',
  }
}

export const passwordComplexityNotMet = () => {
  return {
    type: PASSWORD_COMPLEXITY_NOT_MET,
    message: 'login.passwordComplexityNotMet',
  }
}

export const newPasswordMatchesOldPassword = () => {
  return {
    type: NEW_PASSWORD_MATCHES_OLD_PASSWORD,
    message: 'login.newPasswordMatchesOldPassword',
  }
}

export const userLocked = () => {
  return {
    type: USER_LOCKED,
    message: 'login.userLocked',
  }
}
