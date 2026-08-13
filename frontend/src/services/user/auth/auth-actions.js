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

import { StatusCodes } from 'http-status-codes'
import i18n from 'i18next'
import { API_ERROR_CODE, LOGIN_FAILURE_REASONS } from '../../../app/constants'
import { showSnackbar } from '../../../app/global-snackbar/global-snackbar-actions'
import {
  newPasswordMatchesOldPassword,
  newPasswordsDoNotMatch,
  oldPasswordIncorrect,
  passwordComplexityNotMet,
  userLocked,
} from '../../../app/login/login-form/change-password-form/change-password-form-actions'
import {
  invalidMfaToken,
  storeQrUrl,
} from '../../../app/login/login-form/mfa-form/mfa-form-actions'
import {
  incorrectCredentials,
  lapsed,
  locked,
  noOrganisation,
  noPassword,
  noUsername,
  noUsernameAndPassword,
} from '../../../app/login/login-form/username-password-form/username-password-form-actions'
import {
  clearCredentials,
  invalidSSO,
  passwordExpired,
  registerMfa,
  requireMfaToken,
  storeCredentials,
} from '../../../app/login/login-forms-actions'
import { clearGoogleDriveAuth } from '../../../components/dialog/google-drive/google_drive_dialog'
import { getSessionUserData, setSessionUserData } from '../user-data-service'
import userService from '../user-service'
export const LOGOUT = 'LOGOUT'
export const REQUEST_LOGIN = 'REQUEST_LOGIN'
export const RECEIVE_LOGIN = 'RECEIVE_LOGIN'
export const UNKNOWN_ERROR = 'UNKNOWN_ERROR'
export const RECEIVE_MICROSOFT_LOGIN = 'RECEIVE_MICROSOFT_LOGIN'
export const RECEIVE_USER_DATA_UPDATE = 'RECEIVE_USER_DATA_UPDATE'

export const BULK_UPDATE_FTUE = 'BULK_UPDATE_FTUE'

export const logout = ssoType => {
  return {
    type: LOGOUT,
    data: {
      ssoType: ssoType,
    },
  }
}

export const receiveLogin = userData => {
  return {
    type: RECEIVE_LOGIN,
    userData,
  }
}

export const receiveMicrosoftLogin = microsoftUserData => {
  return {
    type: RECEIVE_MICROSOFT_LOGIN,
    microsoftUserData,
  }
}

export const unknownError = () => {
  return {
    type: UNKNOWN_ERROR,
  }
}

export const receiveUserDataUpdate = data => ({
  type: RECEIVE_USER_DATA_UPDATE,
  data: data,
})

export const doLogout = ssoType => dispatch => {
  window.localStorage.logoutInProgress = true
  if (window.notificationFetcher) {
    clearInterval(window.notificationFetcher)
  }
  window.notificationFetcher = undefined
  clearGoogleDriveAuth()
  return userService
    .logout()
    .catch(() => {})
    .finally(() => {
      window.location.href = '#/login'
      localStorage.clear()
      return dispatch(logout(ssoType))
    })
}

export const microsoftLogin = microsoftUserData => dispatch => {
  dispatch(receiveMicrosoftLogin(microsoftUserData))
  dispatch(
    login({
      username: microsoftUserData.details.username,
      password: microsoftUserData.auth.access_token,
    })
  )
}

export const login = credentials => dispatch => {
  const validate = () => {
    if (!credentials.username && !credentials.password) {
      dispatch(noUsernameAndPassword())
      return false
    }
    if (!credentials.username) {
      dispatch(noUsername())
      return false
    }
    if (!credentials.password) {
      dispatch(noPassword())
      return false
    }
    return true
  }

  const handleLoginSuccess = payload => {
    setSessionUserData(payload)
    dispatch(receiveLogin(payload))
    dispatch(clearCredentials())
  }

  const handleLoginFailure = errorResponse => {
    if (errorResponse.status === StatusCodes.UNAUTHORIZED) {
      errorResponse.text().then(responseText => {
        const responseBody = responseText.length ? JSON.parse(responseText) : {}
        switch (responseBody.reason) {
          case LOGIN_FAILURE_REASONS.PASSWORD_EXPIRED:
            return dispatch(passwordExpired())
          case LOGIN_FAILURE_REASONS.LOCKED:
            return dispatch(locked())
          case LOGIN_FAILURE_REASONS.MFA_REGISTRATION_REQUIRED:
            dispatch(registerMfa())
            return dispatch(storeQrUrl(responseBody.qrUrl))
          case LOGIN_FAILURE_REASONS.MFA_TOKEN_INVALID:
            return dispatch(invalidMfaToken())
          case LOGIN_FAILURE_REASONS.MFA_TOKEN_REQUIRED:
            return dispatch(requireMfaToken())
          case LOGIN_FAILURE_REASONS.NO_ORGANISATION:
            return dispatch(noOrganisation())
          case LOGIN_FAILURE_REASONS.USER_DOES_NOT_EXIST:
            return dispatch(invalidSSO(API_ERROR_CODE.NO_MATCHING_JURALIO_USER))
          case LOGIN_FAILURE_REASONS.BAD_CREDENTIALS:
            return dispatch(
              invalidSSO(API_ERROR_CODE.FAILED_SSO_AUTHENTICATION)
            )
          case LOGIN_FAILURE_REASONS.USER_LAPSED:
            return dispatch(lapsed(responseBody))
          default:
            return dispatch(incorrectCredentials())
        }
      })
    } else {
      return dispatch(unknownError())
    }
  }

  dispatch(storeCredentials(credentials))

  if (validate()) {
    return userService
      .login(credentials)
      .then(handleLoginSuccess, handleLoginFailure)
  }
}

export const changePasswordAndLogin = credentials => dispatch => {
  const handlechangePasswordSuccess = updatedCredentials => {
    if (credentials.context === 'selfService') {
      dispatch(showSnackbar(i18n.t('passwordSettings.snackbar')))
      setTimeout(() => {
        dispatch(doLogout())
      }, 5000)
    } else {
      login(updatedCredentials)(dispatch)
    }
  }

  const handleChangePasswordFailure = errorResponse => {
    if (errorResponse.status === StatusCodes.UNAUTHORIZED) {
      return dispatch(oldPasswordIncorrect())
    }
    errorResponse.text().then(responseText => {
      const responseBody = responseText.length ? JSON.parse(responseText) : {}
      switch (responseBody.errors[0].message) {
        case API_ERROR_CODE.NEW_PASSWORDS_DO_NOT_MATCH:
          return dispatch(newPasswordsDoNotMatch())
        case API_ERROR_CODE.PASSWORD_COMPLEXITY_NOT_MET:
          return dispatch(passwordComplexityNotMet())
        case API_ERROR_CODE.NEW_PASSWORD_MATCHES_OLD_PASSWORD:
          return dispatch(newPasswordMatchesOldPassword())
        case API_ERROR_CODE.USER_LOCKED:
          if (credentials.context === 'selfService') {
            dispatch(doLogout(API_ERROR_CODE.USER_LOCKED))
            return
          } else {
            return dispatch(userLocked())
          }
        default:
          return
      }
    })
  }

  return userService
    .changePassword(credentials)
    .then(handlechangePasswordSuccess, handleChangePasswordFailure)
}

const updateFTUE = payload => {
  return {
    type: BULK_UPDATE_FTUE,
    payload: payload,
  }
}

export const updateFtueStatus = (ftueFlagName, value) => dispatch => {
  return userService.updateftue({ [ftueFlagName]: value }).then(payload => {
    dispatch(updateFTUE(payload))
    let userSessionData = getSessionUserData()
    if (userSessionData) {
      userSessionData.details.firstTimeUserExperience = payload
      setSessionUserData(userSessionData)
    }
  })
}
