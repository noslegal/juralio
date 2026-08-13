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
  NO_USERNAME_AND_PASSWORD,
  NO_USERNAME,
  NO_PASSWORD,
  INCORRECT_CREDENTIALS,
  LOCKED,
  LAPSED,
} from './username-password-form-actions'
import { RESET_VALIDATION } from '../../login-forms-actions'

export default function usernamePasswordForm(
  state = { usernameInvalid: false, passwordInvalid: false },
  action
) {
  switch (action.type) {
    case NO_USERNAME_AND_PASSWORD:
      return {
        ...state,
        usernameInvalid: true,
        passwordInvalid: true,
      }
    case NO_USERNAME:
      return {
        ...state,
        usernameInvalid: true,
        passwordInvalid: false,
      }
    case NO_PASSWORD:
      return {
        ...state,
        usernameInvalid: false,
        passwordInvalid: true,
      }
    case INCORRECT_CREDENTIALS:
      return {
        ...state,
        usernameInvalid: true,
        passwordInvalid: true,
      }
    case LOCKED:
      return {
        ...state,
        usernameInvalid: true,
        passwordInvalid: true,
      }
    case LAPSED:
      return {
        ...state,
        usernameInvalid: true,
        passwordInvalid: true,
      }
    case RESET_VALIDATION:
      return {
        ...state,
        usernameInvalid: false,
        passwordInvalid: false,
      }
    default:
      return state
  }
}
