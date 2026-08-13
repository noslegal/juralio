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
  GET_INSTANCE_SETTINGS_FAILURE,
  GET_INSTANCE_SETTINGS_SUCCESS,
  GET_SAML_SETTINGS,
  REQUEST_GET_INSTANCE_SETTINGS,
  REQUEST_UPDATE_INSTANCE_SETTINGS,
  UPDATE_INSTANCE_SETTINGS_FAILURE,
  UPDATE_INSTANCE_SETTINGS_SUCCESS,
  UPDATE_SAML_SETTINGS_FAILURE,
  UPDATE_SAML_SETTINGS_SUCCESS,
} from '../actions/instance-management-actions'

const initialState = {
  settings: {
    costsEnabled: false,
    enablePaymentPlatformIntegration: false,
    microsoftSsoEnabled: true,
    oktaSsoEnabled: false,
    samlSsoEnabled: false,
    samlSettings: {
      identityProviderEntityId: null,
      identityProviderSsoUrl: null,
      identityProviderCertificate: null,
      serviceProviderMetaData: null,
    },
  },
  isLoading: false,
  hasLoaded: false,
  error: false,
}

export default function templateTaskPostReducer(state = initialState, action) {
  switch (action.type) {
    case REQUEST_GET_INSTANCE_SETTINGS:
      return {
        ...state,
        isLoading: true,
        hasLoaded: false,
        error: false,
      }
    case GET_INSTANCE_SETTINGS_SUCCESS:
      return {
        ...state,
        isLoading: false,
        hasLoaded: true,
        error: false,
        settings: action.settings,
      }
    case GET_INSTANCE_SETTINGS_FAILURE:
      return {
        ...state,
        isLoading: false,
        hasLoaded: true,
        error: true,
      }
    case REQUEST_UPDATE_INSTANCE_SETTINGS:
      return {
        ...state,
        isLoading: true,
        hasLoaded: false,
        error: false,
      }
    case UPDATE_INSTANCE_SETTINGS_SUCCESS:
      return {
        ...state,
        isLoading: false,
        hasLoaded: true,
        error: false,
        settings: {
          ...state.settings,
          ...action.setting,
        },
      }
    case UPDATE_INSTANCE_SETTINGS_FAILURE:
      return {
        ...state,
        isLoading: false,
        hasLoaded: true,
        error: true,
      }
    case UPDATE_SAML_SETTINGS_SUCCESS:
      return {
        ...state,
        settings: { ...state.settings, samlSettings: action.samlSettings },
      }
    case UPDATE_SAML_SETTINGS_FAILURE:
      return {
        ...state,
        settings: {
          ...state.settings,
          samlSettings: initialState.samlSettings,
        },
      }
    case GET_SAML_SETTINGS:
      return {
        ...state,
        settings: {
          ...state.settings,
          samlSettings: action.samlSettings,
        },
      }
    default:
      return state
  }
}
