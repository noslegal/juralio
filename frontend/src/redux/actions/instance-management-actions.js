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
import instanceSettingsService from '../../services/instance-settings/instance-settings-service'
import ssoSettingsService from '../../services/sso-settings/sso-settings-service'
// Get
export const REQUEST_GET_INSTANCE_SETTINGS = 'REQUEST_GET_INSTANCE_SETTINGS'
export const GET_INSTANCE_SETTINGS_SUCCESS = 'GET_INSTANCE_SETTINGS_SUCCESS'
export const GET_INSTANCE_SETTINGS_FAILURE = 'GET_INSTANCE_SETTINGS_FAILURE'
// Update
export const REQUEST_UPDATE_INSTANCE_SETTINGS =
  'REQUEST_UPDATE_INSTANCE_SETTINGS'
export const UPDATE_INSTANCE_SETTINGS_SUCCESS =
  'UPDATE_INSTANCE_SETTINGS_SUCCESS'
export const UPDATE_INSTANCE_SETTINGS_FAILURE =
  'UPDATE_INSTANCE_SETTINGS_FAILURE'

export const UPDATE_SAML_SETTINGS = 'UPDATE_SAML_SETTINGS'
export const UPDATE_SAML_SETTINGS_SUCCESS = 'UPDATE_SAML_SETTINGS_SUCCESS'
export const UPDATE_SAML_SETTINGS_FAILURE = 'UPDATE_SAML_SETTINGS_FAILURE'
export const GET_SAML_SETTINGS = 'GET_SAML_SETTINGS'

// Get
function requestGetInstanceSettings() {
  return {
    type: REQUEST_GET_INSTANCE_SETTINGS,
  }
}
function getInstanceSettingsSuccess(settings) {
  return {
    type: GET_INSTANCE_SETTINGS_SUCCESS,
    settings: settings,
  }
}
function getInstanceSettingsFailure() {
  return {
    type: GET_INSTANCE_SETTINGS_FAILURE,
  }
}
// Update
function requestUpdateInstanceSettings() {
  return {
    type: REQUEST_UPDATE_INSTANCE_SETTINGS,
  }
}
function updateInstanceSettingsSuccess(setting) {
  return {
    type: UPDATE_INSTANCE_SETTINGS_SUCCESS,
    setting: setting,
  }
}
function updateInstanceSettingsFailure() {
  return {
    type: UPDATE_INSTANCE_SETTINGS_FAILURE,
  }
}

function updateSamlSettingsSuccess(response) {
  return { type: UPDATE_SAML_SETTINGS_SUCCESS, samlSettings: response }
}

function updateSamlSettingsFailure() {
  return { type: UPDATE_SAML_SETTINGS_FAILURE }
}

function _getSamlSettings(response) {
  return { type: GET_SAML_SETTINGS, samlSettings: response }
}

// ---------------------
// Exports
// ---------------------
export const getInstanceSettings = () => dispatch => {
  dispatch(requestGetInstanceSettings())
  return instanceSettingsService.getInstanceSettings().then(response => {
    if (response.status === StatusCodes.OK) {
      return dispatch(getInstanceSettingsSuccess(response.body))
    }
    return dispatch(getInstanceSettingsFailure())
  })
}
export const updateInstanceSettings = payload => dispatch => {
  dispatch(requestUpdateInstanceSettings())
  return instanceSettingsService
    .updateInstanceSettings(payload)
    .then(response => {
      if (response.status === StatusCodes.OK) {
        return dispatch(updateInstanceSettingsSuccess(payload))
      }
      return dispatch(updateInstanceSettingsFailure())
    })
}

export const updateSamlSettings = payload => dispatch => {
  return ssoSettingsService.updateSamlSettings(payload).then(response => {
    if (response.status === StatusCodes.OK) {
      return dispatch(updateSamlSettingsSuccess(payload))
    }
    return dispatch(updateSamlSettingsFailure())
  })
}

export const getSamlSettings = () => dispatch => {
  return ssoSettingsService.getSamlSettings().then(response => {
    if (response.status === StatusCodes.OK) {
      return dispatch(_getSamlSettings(response.body))
    }
  })
}
