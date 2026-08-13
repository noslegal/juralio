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

import { combineReducers } from 'redux'
import changePasswordForm from './login-form/change-password-form/change-password-form-reducer'
import mfaForm from './login-form/mfa-form/mfa-form-reducer'
import usernamePasswordForm from './login-form/username-password-form/username-password-form-reducer'
import {
  CLEAR_CREDENTIALS,
  FORGOT_PASSWORD,
  INVALID_SSO,
  MAGIC_LINK_USED,
  PASSWORD_EXPIRED,
  REGISTER_MFA,
  REQUIRE_MFA_TOKEN,
  RESET_FORM,
  RESET_VALIDATION,
  SSO_LOGIN,
  STORE_CREDENTIALS,
} from './login-forms-actions'
import { getInvalidSSOText } from './sso/sso-helper'

export const loginForms = (
  state = {
    validationMessage: '',
    username: '',
    displayForm: 'USERNAME_PASSWORD',
  },
  action
) => {
  switch (action.type) {
    case RESET_VALIDATION:
      return {
        ...state,
        validationMessage: '',
      }

    case STORE_CREDENTIALS:
      return {
        ...state,
        username: action.credentials.username,
        password: action.credentials.password,
      }

    case PASSWORD_EXPIRED:
      return {
        ...state,
        validationMessage: '',
        displayForm: 'CHANGE_PASSWORD',
      }

    case REGISTER_MFA:
      return {
        ...state,
        validationMessage: '',
        displayForm: 'REGISTER_MFA',
        showQR: true,
      }
    case FORGOT_PASSWORD:
      return {
        ...state,
        validationMessage: '',
        displayForm: 'FORGOT_PASSWORD',
        showQR: false,
      }
    case CLEAR_CREDENTIALS:
      return {
        ...state,
        username: '',
        password: '',
      }
    case SSO_LOGIN: {
      return {
        ...state,
        displayForm: 'SSO_LOGIN',
        validationMessage: '',
      }
    }
    case INVALID_SSO: {
      return {
        ...state,
        displayForm: 'INVALID_SSO',
        validationMessage: getInvalidSSOText(action.invalidSSOReason),
      }
    }
    case RESET_FORM: {
      return {
        ...state,
        displayForm: '',
      }
    }
    case REQUIRE_MFA_TOKEN:
      if (state.displayForm === 'REGISTER_MFA') {
        return {
          ...state,
          validationMessage: 'login.incorrectAuthenticationCode',
        }
      }
      return {
        ...state,
        validationMessage: '',
        displayForm: 'REGISTER_MFA',
        showQR: false,
      }
    case MAGIC_LINK_USED:
      return {
        ...state,
        validationMessage: 'login.magicLinkAlreadyUsed',
      }

    default:
      return {
        ...state,
        validationMessage: action.message
          ? action.message
          : state.validationMessage,
      }
  }
}

export default combineReducers({
  loginForms,
  usernamePasswordForm,
  changePasswordForm,
  mfaForm,
})
