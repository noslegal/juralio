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

export const NO_USERNAME_AND_PASSWORD = 'NO_USERNAME_AND_PASSWORD'
export const NO_USERNAME = 'NO_USERNAME'
export const NO_PASSWORD = 'NO_PASSWORD'
export const INCORRECT_CREDENTIALS = 'INCORRECT_CREDENTIALS'
export const LOCKED = 'LOCKED'
export const LAPSED = 'LAPSED'

export const noUsernameAndPassword = () => {
  return {
    type: NO_USERNAME_AND_PASSWORD,
    message: 'login.noUsernameAndPassword',
  }
}

export const noUsername = () => {
  return {
    type: NO_USERNAME,
    message: 'login.noUsername',
  }
}

export const noPassword = () => {
  return {
    type: NO_PASSWORD,
    message: 'login.noPassword',
  }
}

export const incorrectCredentials = () => {
  return {
    type: INCORRECT_CREDENTIALS,
    message: 'login.incorrectCredentials',
  }
}

export const noOrganisation = () => {
  return { type: INCORRECT_CREDENTIALS, message: 'login.noOrganisation' }
}

export const locked = () => {
  return {
    type: LOCKED,
    message: 'login.locked',
  }
}

export const lapsed = trialMessage => {
  if (trialMessage?.customMsg === null) {
    return {
      type: LAPSED,
      message:
        "This account's trial has lapsed. Please contact your system administrator",
    }
  } else {
    return {
      type: LAPSED,
      message: trialMessage.customMsg,
    }
  }
}
