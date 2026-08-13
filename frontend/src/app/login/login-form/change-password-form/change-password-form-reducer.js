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
  OLD_PASSWORD_INCORRECT,
  NEW_PASSWORDS_DO_NOT_MATCH,
  PASSWORD_COMPLEXITY_NOT_MET,
  NEW_PASSWORD_MATCHES_OLD_PASSWORD,
} from './change-password-form-actions'
import { RESET_VALIDATION } from '../../login-forms-actions'

export default function changePasswordForm(
  state = {
    oldPasswordInvalid: false,
    newPasswordInvalid: false,
    verifyNewPasswordInvalid: false,
  },
  action
) {
  switch (action.type) {
    case OLD_PASSWORD_INCORRECT:
      return {
        ...state,
        oldPasswordInvalid: true,
        newPasswordInvalid: false,
        verifyNewPasswordInvalid: false,
      }
    case NEW_PASSWORDS_DO_NOT_MATCH:
      return {
        ...state,
        oldPasswordInvalid: false,
        newPasswordInvalid: true,
        verifyNewPasswordInvalid: true,
      }
    case PASSWORD_COMPLEXITY_NOT_MET:
      return {
        ...state,
        oldPasswordInvalid: false,
        newPasswordInvalid: true,
        verifyNewPasswordInvalid: true,
      }
    case NEW_PASSWORD_MATCHES_OLD_PASSWORD:
      return {
        ...state,
        oldPasswordInvalid: false,
        newPasswordInvalid: true,
        verifyNewPasswordInvalid: true,
      }
    case RESET_VALIDATION:
      return {
        ...state,
        oldPasswordInvalid: false,
        newPasswordInvalid: false,
        verifyNewPasswordInvalid: false,
      }
    default:
      return state
  }
}
