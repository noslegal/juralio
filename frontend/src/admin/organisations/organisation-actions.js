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
import { USER_ROLES } from '../../app/constants'
import { getTypeObject } from '../../app/template/project-creation/action-helper'
import organisationService from '../../services/organisation/organisation-service'
import userService from '../../services/user/user-service'
import { showSnackbar } from '../../app/global-snackbar/global-snackbar-actions'

export const ORGANISATION_SELECTOR_OPTIONS = {
  NONE: 'NONE',
}

export const CREATE_ORGANISATION_SUCCESS = 'CREATE_ORGANISATION_SUCCESS'
export const GET_ORGANISATION_SUCCESS = 'GET_ORGANISATION_SUCCESS'
export const GET_ORGANISATIONS_SUCCESS = 'GET_ORGANISATIONS_SUCCESS'
export const UPDATE_ORGANISATION_SUCCESS = 'UPDATE_ORGANISATION_SUCCESS'
export const UPDATE_ORGANISATION_UNIQUE_FAILURE =
  'UPDATE_ORGANISATION_UNIQUE_FAILURE'
export const REMOVE_ORGANISATION_ADMIN_SUCCESS =
  'REMOVE_ORGANISATION_ADMIN_SUCCESS'
export const ADD_ORGANISATION_ADMIN_SUCCESS = 'ADD_ORGANISATION_ADMIN_SUCCESS'
export const ADD_ORGANISATION_ADMIN_FAILURE = 'ADD_ORGANISATION_ADMIN_FAILURE'
export const CLEAR_ORGANISATION_ERROR_MESSAGE =
  'CLEAR_ORGANISATION_ERROR_MESSAGE'
export const CLEAR_ORGANISATION_UNIQUE_NAME_ERROR_MESSAGE =
  'CLEAR_ORGANISATION_UNIQUE_NAME_ERROR_MESSAGE'
export const RESET_ORG_LIST_STATE = 'RESET_ORG_LIST_STATE'
export const RESET_ORG_LIST_VALIDATION_STATE = 'RESET_ORG_LIST_VALIDATION_STATE'
export const CREATE_ORGANISATION_UNIQUE_FAILURE =
  'CREATE_ORGANISATION_UNIQUE_FAILURE'
export const UPDATE_ORGANISATION_BLANK_FAILURE =
  'UPDATE_ORGANISATION_BLANK_FAILURE'
export const INIT_SELECTED_ORGANISATION = 'INIT_SELECTED_ORGANISATION'
export const SHOW_ORGANISATION_EDIT_MODAL = 'SHOW_ORGANISATION_EDIT_MODAL'
export const HIDE_ORGANISATION_EDIT_MODAL = 'HIDE_ORGANISATION_EDIT_MODAL'
export const RECIEVE_ORG_LOGO_UPDATE = 'RECIEVE_ORG_LOGO_UPDATE'
export const UPDATE_ORG_LOGIN_MSG = 'UPDATE_ORG_LOGIN_MSG'
export const RECEIVE_GROUPS_SUCCESS = 'RECEIVE_GROUPS_SUCCESS'

function resetState() {
  return {
    type: RESET_ORG_LIST_STATE,
  }
}

function initSelectedOrganisation() {
  return {
    type: INIT_SELECTED_ORGANISATION,
  }
}

function resetValidationMessage() {
  return {
    type: RESET_ORG_LIST_VALIDATION_STATE,
  }
}

function completeAddOrganisationAdminErrorMessage() {
  return {
    type: CLEAR_ORGANISATION_ERROR_MESSAGE,
  }
}

function completeAddOrganisationAdminSuccess(admin) {
  return {
    type: ADD_ORGANISATION_ADMIN_SUCCESS,
    admin: admin,
  }
}

function completeAddOrganisationAdminFailure(admin) {
  return {
    type: ADD_ORGANISATION_ADMIN_FAILURE,
    admin: admin,
  }
}

function completeRemoveOrganisationAdminSuccess(admin) {
  return {
    type: REMOVE_ORGANISATION_ADMIN_SUCCESS,
    admin: admin,
  }
}

function completeCreateOrganisationSuccess(organisation) {
  return {
    type: CREATE_ORGANISATION_SUCCESS,
    organisation: organisation,
  }
}

function completeCreateOrganisationUniqueFailure(organisation) {
  return {
    type: CREATE_ORGANISATION_UNIQUE_FAILURE,
    organisation: organisation,
    errorMessage: i18n.t('organisation.orgExistsError'),
  }
}

function completeUpdateOrganisationSuccess(organisation) {
  return {
    type: UPDATE_ORGANISATION_SUCCESS,
    organisation: organisation,
  }
}

function completeUpdateOrganisationUniqueFailure(organisation, name) {
  return {
    type: UPDATE_ORGANISATION_UNIQUE_FAILURE,
    organisation: organisation,
    errorMessage: i18n.t('organisation.orgExistsError'),
    rejectedName: name,
  }
}
function completeUpdateOrganisationBlankFailure() {
  return {
    type: UPDATE_ORGANISATION_BLANK_FAILURE,

    errorMessage: i18n.t('commonValidationMessages.requiredField'),
  }
}

function completeGetOrganisationSuccess(organisation) {
  return {
    type: GET_ORGANISATION_SUCCESS,
    organisation: organisation,
  }
}

function completeGetOrganisationsSuccess(organisationList) {
  return {
    type: GET_ORGANISATIONS_SUCCESS,
    organisations: organisationList,
  }
}

function updateOrgLoginMsg(lapsedLogin, trialCard) {
  return {
    type: UPDATE_ORG_LOGIN_MSG,
    lapsedLoginMessage: lapsedLogin,
    trialMessage: trialCard,
  }
}

function recieveGroupsSuccess(groups) {
  return {
    type: RECEIVE_GROUPS_SUCCESS,
    groups: groups,
  }
}

const _clearOrganisationUniqueNameErrorMessage = () =>
  getTypeObject(CLEAR_ORGANISATION_UNIQUE_NAME_ERROR_MESSAGE)

const hasUniqueError = body =>
  body.errors &&
  body.errors[0].field === 'name' &&
  body.errors[0].codes.indexOf('unique') > -1

export const addOrganisationAdmin = (organisationId, user) => dispatch => {
  return userService
    .update(user.id, { roles: [...user.roles, USER_ROLES.ROLE_ORG_ADMIN] })
    .then(() =>
      organisationService.addUserToOrganisation(user.username, organisationId)
    )
    .then(response => {
      if (response.status === StatusCodes.CREATED)
        return dispatch(completeAddOrganisationAdminSuccess(response.body))
      else return dispatch(completeAddOrganisationAdminFailure(response.body))
    })
}

export const removeOrganisationAdmin = admin => dispatch => {
  return userService
    .update(admin.id, {
      roles: admin.roles.filter(r => r !== USER_ROLES.ROLE_ORG_ADMIN),
    })
    .then(response => {
      if (response.status === StatusCodes.OK) {
        return dispatch(completeRemoveOrganisationAdminSuccess(response.body))
      }
    })
}

export const createOrganisation = (name, ssoState) => dispatch => {
  return organisationService
    .createOrganisation(name, ssoState)
    .then(response => {
      if (response.status === StatusCodes.CREATED) {
        dispatch(
          completeCreateOrganisationSuccess({
            ...response.body,
            activeUserCount: 0,
          })
        )
      } else {
        dispatch(showSnackbar('An error has occurred'))
      }
      return response.body
    })
}

export const updateOrganisation = (id, properties) => dispatch => {
  const { name, ...otherProperties } = properties

  if (!name && !otherProperties) {
    dispatch(completeUpdateOrganisationBlankFailure())
    return null
  }
  return organisationService
    .updateOrganisation(id, properties)
    .then(response => {
      if (response.status === StatusCodes.OK) {
        dispatch(completeUpdateOrganisationSuccess(response.body))
      } else {
        const handleUniqueOrganisationError = body => {
          if (hasUniqueError) {
            dispatch(completeUpdateOrganisationUniqueFailure(body, name))
          }
        }

        handleUniqueOrganisationError(response.body)
      }
      return response.body
    })
}

export const getOrganisations = () => dispatch => {
  return organisationService.getOrganisations().then(response => {
    if (response.status === StatusCodes.OK) {
      return dispatch(completeGetOrganisationsSuccess(response.body.reverse()))
    }
  })
}

export const assignOrganisationToUser = (user, organisationId) => {
  const requiresRemovalFromOldOrg =
    user.organisation && user.organisation.id !== organisationId
  const requiresAdditionToNewOrg =
    organisationId !== ORGANISATION_SELECTOR_OPTIONS.NONE
  const removalStep = requiresRemovalFromOldOrg
    ? organisationService.removeUserFromOrganisation(
        user.username,
        user.organisation.id
      )
    : Promise.resolve()

  return removalStep.then(() => {
    if (requiresAdditionToNewOrg) {
      return organisationService.addUserToOrganisation(
        user.username,
        organisationId
      )
    }
  })
}

export const getOrganisation = organisationId => dispatch => {
  return organisationService.getOrganisation(organisationId).then(response => {
    if (response.status === StatusCodes.OK) {
      return dispatch(completeGetOrganisationSuccess(response.body))
    }
  })
}

export const getCurrentOrganisation = () => dispatch => {
  return organisationService.getCurrentOrganisation().then(response => {
    if (response.status === StatusCodes.OK) {
      return dispatch(completeGetOrganisationSuccess(response.body))
    }
  })
}

export const clearSelectedOrganisation = () => dispatch => {
  return dispatch(initSelectedOrganisation())
}

export const clearAddOrganisationAdminErrorMessage = () => dispatch => {
  return dispatch(completeAddOrganisationAdminErrorMessage())
}

export const cleanState = () => dispatch => {
  return dispatch(resetState())
}

export const cleanValidation = () => dispatch => {
  return dispatch(resetValidationMessage())
}

export const clearOrganisationUniqueNameErrorMessage = () => dispatch => {
  return dispatch(_clearOrganisationUniqueNameErrorMessage())
}

export const showOrganisationEditModal = organisation => {
  return {
    type: SHOW_ORGANISATION_EDIT_MODAL,
    organisation: organisation,
  }
}

export const hideOrganisationEditModal = () => {
  return {
    type: HIDE_ORGANISATION_EDIT_MODAL,
  }
}

export const updateDisplayedOrgLogos = organisation => {
  return {
    type: RECIEVE_ORG_LOGO_UPDATE,
    organisation: organisation,
  }
}

export const _updateOrgLoginMsg = (lapsedLogin, trialCard) => dispatch => {
  return dispatch(updateOrgLoginMsg(lapsedLogin, trialCard))
}

export const fetchGroups = () => dispatch => {
  return organisationService
    .getGroups()
    .then(response => dispatch(recieveGroupsSuccess(response.body)))
}
