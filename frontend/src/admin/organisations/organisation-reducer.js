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

import i18n from 'i18next'

import {
  ADD_ORGANISATION_ADMIN_FAILURE,
  ADD_ORGANISATION_ADMIN_SUCCESS,
  CLEAR_ORGANISATION_ERROR_MESSAGE,
  CLEAR_ORGANISATION_UNIQUE_NAME_ERROR_MESSAGE,
  CREATE_ORGANISATION_SUCCESS,
  CREATE_ORGANISATION_UNIQUE_FAILURE,
  GET_ORGANISATIONS_SUCCESS,
  GET_ORGANISATION_SUCCESS,
  HIDE_ORGANISATION_EDIT_MODAL,
  INIT_SELECTED_ORGANISATION,
  RECIEVE_ORG_LOGO_UPDATE,
  REMOVE_ORGANISATION_ADMIN_SUCCESS,
  RESET_ORG_LIST_STATE,
  RESET_ORG_LIST_VALIDATION_STATE,
  SHOW_ORGANISATION_EDIT_MODAL,
  UPDATE_ORGANISATION_BLANK_FAILURE,
  UPDATE_ORGANISATION_SUCCESS,
  UPDATE_ORGANISATION_UNIQUE_FAILURE,
  UPDATE_ORG_LOGIN_MSG,
  RECEIVE_GROUPS_SUCCESS,
} from './organisation-actions'

import { API_ERROR_CODE } from '../../app/constants'

const hasAlreadyAddedToOrgError = errors =>
  errors &&
  errors[0] &&
  errors[0].message === API_ERROR_CODE.USER_ALREADY_HAS_ORGANISATION

const initialOrganisationsState = {
  organisationsList: [],
  groupList: [],
  validationMessages: {
    addAdminErrorMessage: null,
    uniqueOrgErrorMessage: null,
    rejectedOrgName: null,
    blankOrgErrorMessage: null,
  },
  showOrganisationEditDialog: false,
  editOrganisation: null,
  lastUpdatedOrgLogoTimeStamp: 0,
  isLoaded: false,
}

export default function organisationReducer(
  state = initialOrganisationsState,
  action
) {
  switch (action.type) {
    case CREATE_ORGANISATION_SUCCESS: {
      return {
        ...state,
        organisationsList: state.organisationsList
          ? [action.organisation, ...state.organisationsList]
          : null,
        validationMessages: {
          uniqueOrgErrorMessage: null,
        },
      }
    }
    case UPDATE_ORGANISATION_SUCCESS: {
      const organisations = getFreshOrganisationArray(state)
      const index = getItemIndex(organisations, action.organisation.id)
      if (index > -1) {
        organisations[index].enabled = action.organisation.enabled
        organisations[index].name = action.organisation.name
      } else {
        organisations[index] = action.organisation
      }
      return {
        ...state,
        organisationsList: organisations,
        selectedOrganisation: action.organisation,
        validationMessages: {
          uniqueOrgErrorMessage: null,
        },
      }
    }
    case GET_ORGANISATION_SUCCESS:
      return {
        ...state,
        selectedOrganisation: action.organisation,
        validationMessages: {},
        isLoaded: true,
      }
    case GET_ORGANISATIONS_SUCCESS:
      return { ...state, organisationsList: action.organisations }
    case ADD_ORGANISATION_ADMIN_SUCCESS: {
      const organisations = getFreshOrganisationArray(state)
      const organisation = getOrganisationById(
        organisations,
        state.selectedOrganisationId
      )

      const adminAlreadyInList =
        organisation.orgAdmins.filter(admin => admin.id === action.admin.id)
          .length > 0

      if (!adminAlreadyInList) organisation.orgAdmins.push(action.admin)

      const userAlreadyInList =
        organisation.users?.filter(user => user.id === action.admin.id).length >
        0

      if (!userAlreadyInList) {
        if (!organisation.users) organisation.users = []
        organisation.users.push(action.admin)
      }

      return {
        ...state,
        organisationsList: organisations,
      }
    }
    case ADD_ORGANISATION_ADMIN_FAILURE: {
      let errorMessage
      if (hasAlreadyAddedToOrgError(action.admin.errors))
        errorMessage = i18n.t('organisation.userAlreadyExists')

      return {
        ...state,
        validationMessages: {
          addAdminErrorMessage: errorMessage,
        },
      }
    }

    case CREATE_ORGANISATION_UNIQUE_FAILURE: {
      return {
        ...state,
        validationMessages: {
          uniqueOrgErrorMessage: action.errorMessage,
        },
      }
    }
    case UPDATE_ORGANISATION_UNIQUE_FAILURE: {
      return {
        ...state,
        validationMessages: {
          uniqueOrgErrorMessage: action.errorMessage,
          rejectedOrgName: action.rejectedName,
        },
      }
    }
    case UPDATE_ORGANISATION_BLANK_FAILURE: {
      return {
        ...state,
        validationMessages: {
          blankOrgErrorMessage: action.errorMessage,
        },
      }
    }

    case REMOVE_ORGANISATION_ADMIN_SUCCESS: {
      const organisations = getFreshOrganisationArray(state)
      const organisation = getOrganisationById(
        organisations,
        state.selectedOrganisationId
      )

      organisation.orgAdmins = organisation.orgAdmins.filter(
        admin => admin.id !== action.admin.id
      )
      return {
        ...state,
        organisationsList: organisations,
      }
    }
    case CLEAR_ORGANISATION_ERROR_MESSAGE:
      return {
        ...state,
        validationMessages: {
          addAdminErrorMessage: null,
        },
      }
    case RESET_ORG_LIST_STATE:
      return initialOrganisationsState
    case INIT_SELECTED_ORGANISATION:
      return {
        ...state,
        selectedOrganisation: undefined,
      }
    case RESET_ORG_LIST_VALIDATION_STATE:
      return {
        ...state,
        validationMessages: {
          addAdminErrorMessage: null,
          uniqueOrgErrorMessage: null,
          blankOrgErrorMessage: null,
        },
      }
    case CLEAR_ORGANISATION_UNIQUE_NAME_ERROR_MESSAGE:
      return {
        ...state,
        validationMessages: {
          uniqueOrgErrorMessage: null,
          rejectedOrgName: null,
        },
      }
    case SHOW_ORGANISATION_EDIT_MODAL:
      return {
        ...state,
        showOrganisationEditDialog: true,
        editOrganisation: action.organisation,
      }
    case HIDE_ORGANISATION_EDIT_MODAL:
      return {
        ...state,
        showOrganisationEditDialog: false,
        editOrganisation: null,
      }
    case UPDATE_ORG_LOGIN_MSG:
      return {
        ...state,
        selectedOrganisation: {
          ...state.selectedOrganisation,
          lapsedLoginMessage: action.lapsedLoginMessage,
          trialMessage: action.trialMessage,
        },
      }
    case RECIEVE_ORG_LOGO_UPDATE:
      const organisation = getOrganisationById(
        state.organisationsList,
        action.organisation.id
      )
      organisation.customLogo = action.organisation.customLogo
      return {
        ...state,
        organisations: [...state.organisationsList],
        lastUpdatedOrgLogoTimeStamp: new Date().getTime(),
      }
    case RECEIVE_GROUPS_SUCCESS:
      return { ...state, groupList: action.groups }
    default:
      return state
  }
}

const getItemIndex = (items, id) =>
  items.findIndex(element => element.id === id)

const getFreshOrganisationArray = state => [...state.organisationsList]

const getOrganisationById = (organisations, id) => {
  const organisationIndex = getItemIndex(organisations, id)
  return organisations[organisationIndex]
}
