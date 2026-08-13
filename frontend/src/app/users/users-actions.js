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

import PersonIcon from '@mui/icons-material/Person'
import { StatusCodes } from 'http-status-codes'
import i18n from 'i18next'
import { showSnackbar } from '../../app/global-snackbar/global-snackbar-actions'
import usageSummaryService from '../../services/Admin/usage-summary-service'
import organisationService from '../../services/organisation/organisation-service'
import {
  getSessionUserData,
  setSessionUserData,
} from '../../services/user/user-data-service'
import userService from '../../services/user/user-service'
import { UserIcon } from '../../theme/navigation/CommonIcons'
import { API_ERROR_CODE, SSO } from '../constants'
import { displayConfirmationDialog } from '../global-confirmation-dialog/global-confirmation-dialog-actions'

export const RESET_USERS_STATE = 'RESET_USERS_STATE'
export const SELECT_USER = 'SELECT_USER'
export const DESELECT_USER = 'DESELECT_USER'
export const RECEIVE_USERS_SUCCESS = 'RECEIVE_USERS_SUCCESS'
export const CREATE_USER_SUCCESS = 'CREATE_USER_SUCCESS'
export const CREATE_USER_REQUEST = 'CREATE_USER_REQUEST'
export const USERNAME_UNIQUE_FAILURE = 'USERNAME_UNIQUE_FAILURE'
export const UPDATE_USER_SUCCESS = 'UPDATE_USER_SUCCESS'
export const CLEAR_USERNAME_VALIDATION = 'CLEAR_USERNAME_VALIDATION'
export const TEMPORARY_PASSWORD_REQUEST = 'TEMPORARY_PASSWORD_REQUEST'
export const TEMPORARY_PASSWORD_REQUEST_SUCCESS =
  'TEMPORARY_PASSWORD_REQUEST_SUCCESS'
export const RESET_TEMPORARY_PASSWORD_STATE = 'RESET_TEMPORARY_PASSWORD_STATE'
export const INIT_CREATED_USER = 'INIT_CREATED_USER'
export const GET_ACTIVE_USERS_SUCCESS = 'GET_ACTIVE_USERS_SUCCESS'
export const RESEND_INVITE = 'RESEND_INVITE'
const integerToWordLimitTen = int => {
  switch (int) {
    case 1:
      return 'one'
    case 2:
      return 'two'
    case 3:
      return 'three'
    case 4:
      return 'four'
    case 5:
      return 'five'
    case 6:
      return 'six'
    case 7:
      return 'seven'
    case 8:
      return 'eight'
    case 9:
      return 'nine'
    case 10:
      return 'ten'
    default:
      return int
  }
}

export const BULK_CREATE_USERS_REQUEST = 'BULK_CREATE_USERS_REQUEST'
export const BULK_CREATE_USERS_SUCCESS = 'BULK_CREATE_USERS_SUCCESS'
export const BULK_CREATE_USERS_ERROR = 'BULK_CREATE_USERS_ERROR'
const creators = {
  resetState() {
    return {
      type: RESET_USERS_STATE,
    }
  },

  selectUser(user) {
    return {
      type: SELECT_USER,
      user,
    }
  },

  deselectUser() {
    return {
      type: DESELECT_USER,
    }
  },

  receiveUsersSuccess(users) {
    return {
      type: RECEIVE_USERS_SUCCESS,
      users,
    }
  },

  createUserSuccess(user) {
    return {
      type: CREATE_USER_SUCCESS,
      user,
    }
  },
  bulkCreateUsersSuccess(users) {
    return {
      type: BULK_CREATE_USERS_SUCCESS,
      users: users,
    }
  },

  bulkCreateUsersError(errors) {
    return {
      type: BULK_CREATE_USERS_ERROR,
      errors: errors,
    }
  },

  initCreatedUser() {
    return {
      type: INIT_CREATED_USER,
    }
  },

  createUserRequest() {
    return {
      type: CREATE_USER_REQUEST,
    }
  },

  bulkCreateUsersRequest() {
    return {
      type: BULK_CREATE_USERS_REQUEST,
    }
  },

  usernameUniqueFailure() {
    return {
      type: USERNAME_UNIQUE_FAILURE,
    }
  },

  updateUserSuccess(user) {
    return {
      type: UPDATE_USER_SUCCESS,
      user,
    }
  },

  clearUsernameValidation() {
    return {
      type: CLEAR_USERNAME_VALIDATION,
    }
  },

  requestTemporaryPassword(user) {
    return {
      type: TEMPORARY_PASSWORD_REQUEST,
      user,
    }
  },

  requestTemporaryPasswordSuccess(payload, context) {
    return {
      type: TEMPORARY_PASSWORD_REQUEST_SUCCESS,
      payload,
      context: context,
    }
  },

  resetTemporaryPasswordState() {
    return {
      type: RESET_TEMPORARY_PASSWORD_STATE,
    }
  },

  completeGetActiveUsersSuccess(ActiveUsers) {
    return {
      type: GET_ACTIVE_USERS_SUCCESS,
      ActiveUsers: ActiveUsers,
    }
  },
  resendInvite(user) {
    return {
      type: RESEND_INVITE,
      user,
    }
  },
}

export const resetState = () => dispatch => dispatch(creators.resetState())
export const selectUser = user => creators.selectUser(user)
export const deselectUser = () => creators.deselectUser()
export const clearUsernameValidation = () => dispatch =>
  dispatch(creators.clearUsernameValidation())

export const fetchUsers = () => dispatch => {
  return userService
    .getUsers()
    .then(response => dispatch(creators.receiveUsersSuccess(response.body)))
}

export const fetchOrganisationUsers = organisationId => dispatch => {
  if (organisationId) {
    return organisationService
      .getOrganisationUsers(organisationId)
      .then(response => {
        if (response.body) dispatch(creators.receiveUsersSuccess(response.body))
      })
  }
}

export const createUser = (properties, organisationId) => async dispatch => {
  dispatch(creators.createUserRequest())

  const response = await userService.create({
    ...properties,
    ...(organisationId && { organisation: { id: organisationId } }),
  })

  if (response.status === StatusCodes.CREATED) {
    return handleCreateUserSuccess(response, dispatch)
  } else if (response.status === StatusCodes.BAD_REQUEST) {
    handleCreateUserFailure(response, dispatch)
  }

  return false
}

export const bulkCreateUsers =
  (usernames, properties, organisationId) => async dispatch => {
    dispatch(creators.bulkCreateUsersRequest())
    const response = await userService.bulkCreate({
      usernames: usernames,
      ...properties,
      ...(organisationId && { organisation: { id: organisationId } }),
    })

    if (response.status === StatusCodes.OK) {
      return handleBulkCreateUserResponse(response, dispatch)
    }

    return false
  }

export const initCreatedUser = () => dispatch =>
  dispatch(creators.initCreatedUser())

export const update = (id, properties) => async dispatch => {
  const response = await userService.update(id, properties)

  if (response.status === StatusCodes.OK) {
    dispatch(creators.updateUserSuccess(response.body))
    dispatch(deselectUser())
  } else if (response.status === API_ERROR_CODE.USERNAME_ALREADY_IN_USE) {
    dispatch(showSnackbar(i18n.t('userCreation.userAddFailed')))
    dispatch(deselectUser())
  } else if (
    response.status === API_ERROR_CODE.EXTERNAL_USER_NO_FORCE_ROLE_CHANGE
  ) {
    const generatesRolesString = roles => {
      let convertedRoles = roles.map(role => {
        let r = role.replace('ROLE_', '')
        r = r.replaceAll('_', ' ')
        return r[0].toUpperCase() + r.slice(1).toLowerCase()
      })
      if (convertedRoles.length < 2) {
        return convertedRoles.join('')
      }
      let returnStr = convertedRoles.join(', ')
      let pos = returnStr.lastIndexOf(',')
      return (
        returnStr.substring(0, pos) + ' and ' + returnStr.substring(pos + 1)
      )
    }

    let textString = 'userConversion.body'
    if (response.body.mattersCount === 0) {
      textString = 'userConversion.body_no_matters'
    }
    if (response.body.roles.length === 0) {
      textString = 'userConversion.body_no_roles'
    }
    const confirmationOptions = {
      headerIcon: UserIcon,
      actionText: 'common.confirm',
      cancelText: 'common.cancel',
      titleText: 'userConversion.internalToExternal',
      promptText: i18n.t(textString, {
        orgRoles: generatesRolesString(response.body.roles),
        matterNumber: integerToWordLimitTen(response.body.mattersCount),
        multipleMatters: response.body.mattersCount !== 1 ? 's' : '',
      }),
      dontTranslatePromptText: true,
      usageContext: 'interlaToExternalConversion',
      cancel: () => {},
    }
    dispatch(
      displayConfirmationDialog(confirmationOptions, () => {
        properties.forceUpdate = true
        dispatch(update(id, properties))
      })
    )
  }
}

export const setConfirmedStatus = (orgId, userId) => async dispatch => {
  const response = await userService.setConfirmedStatus(orgId, userId)

  if (response.status === StatusCodes.OK) {
    dispatch(creators.updateUserSuccess(response.body))
    dispatch(deselectUser())
  } else {
    dispatch(showSnackbar(i18n.t('sso.unknown')))
    dispatch(deselectUser())
  }
}

export const updateSelf = properties => async dispatch => {
  const response = await userService.updateSelf(properties)
  switch (response.status) {
    case 200:
      const userSessionData = getSessionUserData()
      if (userSessionData) {
        userSessionData.details = response.body
        setSessionUserData(userSessionData)
      }
      dispatch(showSnackbar(i18n.t('userCreation.userEditSuccessful')))
      dispatch(creators.updateUserSuccess(response.body))
      break
    case API_ERROR_CODE.USERNAME_ALREADY_IN_USE:
      dispatch(showSnackbar(i18n.t('userCreation.userAddFailed')))
      break
    case API_ERROR_CODE.PASSWORD_DOES_NOT_MATCH:
      dispatch(showSnackbar(i18n.t('login.incorrectPassword')))
      break
    default:
      dispatch(showSnackbar(i18n.t('commonValidationMessages.unknownError')))
  }
  dispatch(deselectUser())
}

export const resetFtue = userId => async dispatch => {
  const response = await userService.resetFtue(userId)
  if (response.status === StatusCodes.OK) {
    dispatch(showSnackbar(i18n.t('userCreation.firstTimeUserExperienceReset')))
  }
}

export const convertUserToMicrosoft = (userId, t, email) => async dispatch => {
  const properties = {
    isThirdPartyUser: true,
    thirdPartyProvider: SSO.MICROSOFT,
    username: email,
  }

  dispatch(update(userId, properties)).then(() => {
    const options = {
      actionText: t('common.close'),
      titleText: t('accountSecurity.userConverted'),
      promptText: t('userCreation.microsoftCompleted'),
      usageContext: 'ConvertToMicrosoftUser',
      hideCancel: true,
      headerIcon: PersonIcon,
    }
    dispatch(displayConfirmationDialog(options, () => {}))
  })
}

export const convertUserToGoogle = (userId, t, email) => async dispatch => {
  const properties = {
    isThirdPartyUser: true,
    thirdPartyProvider: SSO.GOOGLE,
    username: email,
  }

  dispatch(update(userId, properties)).then(() => {
    const options = {
      actionText: t('common.close'),
      titleText: t('accountSecurity.userConverted'),
      promptText: t('userCreation.googleCompleted'),
      usageContext: 'ConvertToGoogleUser',
      hideCancel: true,
      headerIcon: PersonIcon,
    }
    dispatch(displayConfirmationDialog(options, () => {}))
  })
}

export const convertUserToOkta = (userId, t, email) => async dispatch => {
  const properties = {
    isThirdPartyUser: true,
    thirdPartyProvider: SSO.OKTA,
    username: email,
  }

  dispatch(update(userId, properties)).then(() => {
    const options = {
      actionText: t('common.close'),
      titleText: t('accountSecurity.userConverted'),
      promptText: t('userCreation.oktaCompleted'),
      usageContext: 'ConvertToOktaUser',
      hideCancel: true,
      headerIcon: PersonIcon,
    }
    dispatch(displayConfirmationDialog(options, () => {}))
  })
}

export const convertUserToSaml = (userId, t, email) => async dispatch => {
  const properties = {
    isThirdPartyUser: true,
    thirdPartyProvider: SSO.SAML,
    username: email,
  }

  dispatch(update(userId, properties)).then(() => {
    const options = {
      actionText: t('common.close'),
      titleText: t('accountSecurity.userConverted'),
      promptText: t('userCreation.samlCompleted'),
      usageContext: 'ConvertToSamlUser',
      hideCancel: true,
      headerIcon: PersonIcon,
    }
    dispatch(displayConfirmationDialog(options, () => {}))
  })
}

export const convertUserToJuralio = (user, t, email) => async dispatch => {
  const properties = {
    isThirdPartyUser: false,
    thirdPartyProvider: null,
    thirdPartyUserId: null,
    username: email,
  }
  dispatch(update(user.id, properties)).then(async () => {
    dispatch(requestTemporaryPassword(user, 'auth_conversion'))
  })
}

export const requestTemporaryPassword = (user, context) => async dispatch => {
  dispatch(creators.deselectUser())
  dispatch(creators.requestTemporaryPassword(user))

  const response = await userService.requestTemporaryPassword(user.id, context)

  if (response.status === StatusCodes.OK) {
    dispatch(creators.requestTemporaryPasswordSuccess(response.body, context))
  } else if (response.status === StatusCodes.FORBIDDEN) {
    dispatch(
      showSnackbar(
        'You can only reset a users password once per minute. Please way and try again. If the problem persists, contact support@example.com'
      )
    )
  }
}

export const resetTemporaryPasswordState = () =>
  creators.resetTemporaryPasswordState()

const handleCreateUserSuccess = async (response, dispatch) => {
  const user = response.body

  dispatch(creators.createUserSuccess(user))
  return true
}

const handleBulkCreateUserResponse = async (response, dispatch) => {
  const errors = response.body.errors
  const createdUsers = response.body.createdUsers
  if (errors.length > 0) {
    dispatch(creators.bulkCreateUsersError(errors))
  }
  if (createdUsers.length > 0) {
    dispatch(creators.bulkCreateUsersSuccess(createdUsers))
  }
}

export const handleCreateUserFailure = (response, dispatch) => {
  const { errors } = response.body

  if (
    errors?.length > 0 &&
    errors[0].field === 'username' &&
    errors[0].codes.indexOf('unique') > -1
  ) {
    dispatch(creators.usernameUniqueFailure())
  }
}

export const getActiveUsers = () => dispatch => {
  return usageSummaryService.showSummary().then(response => {
    if (response.status === StatusCodes.OK) {
      return dispatch(creators.completeGetActiveUsersSuccess(response.body))
    }
  })
}

export const resendInvite = email => async dispatch => {
  const response = await userService.requestResendInvite(email.username)
  dispatch(showSnackbar('Invite link has been resent'))
  return response
}
