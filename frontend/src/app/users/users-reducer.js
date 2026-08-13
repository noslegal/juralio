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
  BULK_CREATE_USERS_ERROR,
  BULK_CREATE_USERS_REQUEST,
  BULK_CREATE_USERS_SUCCESS,
  CLEAR_USERNAME_VALIDATION,
  CREATE_USER_REQUEST,
  CREATE_USER_SUCCESS,
  DESELECT_USER,
  GET_ACTIVE_USERS_SUCCESS,
  INIT_CREATED_USER,
  RECEIVE_USERS_SUCCESS,
  RESET_TEMPORARY_PASSWORD_STATE,
  RESET_USERS_STATE,
  SELECT_USER,
  TEMPORARY_PASSWORD_REQUEST,
  TEMPORARY_PASSWORD_REQUEST_SUCCESS,
  UPDATE_USER_SUCCESS,
  USERNAME_UNIQUE_FAILURE,
} from './users-actions'

export default function usersReducer(state, action) {
  const initialState = {
    users: [],
    selectedUser: undefined,
    isLoaded: false,
    usernameValidationMessage: undefined,
    temporaryPassword: undefined,
    isCreated: false,
    bulkCreateErrors: [],
    newUsers: [],
  }

  if (!state) {
    return initialState
  }

  switch (action.type) {
    case RESET_USERS_STATE:
      return { ...initialState }
    case SELECT_USER:
      return {
        ...state,
        selectedUser: { ...action.user },
      }
    case DESELECT_USER:
      return {
        ...state,
        selectedUser: undefined,
      }
    case INIT_CREATED_USER:
      return {
        ...state,
        isCreated: false,
      }
    case CREATE_USER_REQUEST:
      return {
        ...state,
        usernameValidationMessage: undefined,
        isCreated: false,
      }
    case CREATE_USER_SUCCESS:
      const { temporaryPassword, isThirdPartyUser, ...user } = action.user
      user.isThirdPartyUser = isThirdPartyUser
      return {
        ...state,
        users: [user, ...state.users],
        usernameValidationMessage: undefined,
        ...(!isThirdPartyUser && {
          temporaryPassword: {
            user,
            password: temporaryPassword.password,
            isNewUser: true,
          },
        }),
        isCreated: true,
      }
    case USERNAME_UNIQUE_FAILURE:
      return {
        ...state,
        usernameValidationMessage: i18n.t('userCreation.userAddFailed'),
      }
    case CLEAR_USERNAME_VALIDATION:
      return {
        ...state,
        usernameValidationMessage: undefined,
      }
    case RECEIVE_USERS_SUCCESS:
      return {
        ...state,
        users: action.users,
        isLoaded: true,
      }
    case UPDATE_USER_SUCCESS:
      const users = state.users
        .filter(u => u != null)
        .map(user => (user.id === action.user.id ? action.user : user))
      return {
        ...state,
        users,
      }
    case TEMPORARY_PASSWORD_REQUEST:
      return {
        ...state,
        temporaryPassword: {
          user: action.user,
        },
      }
    case TEMPORARY_PASSWORD_REQUEST_SUCCESS:
      return {
        ...state,
        temporaryPassword: {
          ...state.temporaryPassword,
          password: action.payload.password,
          isAuthChange: action.context === 'auth_conversion',
        },
      }
    case RESET_TEMPORARY_PASSWORD_STATE:
      return {
        ...state,
        temporaryPassword: undefined,
      }
    case GET_ACTIVE_USERS_SUCCESS:
      return {
        ...state,
        ActiveUsers: action.ActiveUsers,
      }
    case BULK_CREATE_USERS_REQUEST:
      return {
        ...state,
        isCreated: false,
        usernameValidationMessage: undefined,
        newUsers: [],
        bulkCreateErrors: [],
      }
    case BULK_CREATE_USERS_SUCCESS:
      return {
        ...state,
        users: [...action.users, ...state.users],
        isCreated: true,
        newUsers: action.users,
      }
    case BULK_CREATE_USERS_ERROR:
      return {
        ...state,
        bulkCreateErrors: action.errors,
      }
    default:
      return state
  }
}
