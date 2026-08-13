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
import matterService from '../../services/matter/matter-service'

export const REQUEST_MATTER_DETAILS = 'REQUEST_MATTER_DETAILS'
export const RECEIVE_MATTER_DETAILS_SUCCESS = 'RECEIVE_MATTER_DETAILS_SUCCESS'
export const RECEIVE_MATTER_DETAILS_FAILURE = 'RECEIVE_MATTER_DETAILS_FAILURE'
export const UPDATE_MATTER = 'UPDATE_MATTER'
export const CLEAR_MATTER = 'CLEAR_MATTER'
export const SET_MATTER_DETAILS = 'SET_MATTER_DETAILS'
export const RECEIVE_MATTER_OVERVIEW = 'RECIEVE_MATTER_OVERVIEW'
export const REQUEST_MATTER_OVERVIEW = 'REQUEST_MATTER_OVERVIEW'
function requestMatterDetails() {
  return {
    type: REQUEST_MATTER_DETAILS,
  }
}

function receiveMatterDetailsSuccess(json) {
  return {
    type: RECEIVE_MATTER_DETAILS_SUCCESS,
    matter: json,
  }
}

function _setMatterDetails(json) {
  return {
    type: SET_MATTER_DETAILS,
    matter: json,
  }
}

function receiveMatterDetailsFailure() {
  return {
    type: RECEIVE_MATTER_DETAILS_FAILURE,
  }
}

function updateMatter(payload) {
  return {
    type: UPDATE_MATTER,
    payload,
  }
}

function clearMatter() {
  return {
    type: CLEAR_MATTER,
  }
}

function receiveMatterOverview(overview) {
  return {
    type: RECEIVE_MATTER_OVERVIEW,
    overview: overview,
  }
}

function requestMatterOverview(id) {
  return {
    type: REQUEST_MATTER_OVERVIEW,
    id: id,
  }
}

export const setMatterDetails =
  (matterDetails = {}) =>
  dispatch => {
    dispatch(_setMatterDetails(matterDetails))
  }

export const fetchMatterDetails =
  (id, includeTaskCount = false) =>
  dispatch => {
    dispatch(requestMatterDetails())
    return matterService.getMatter(id).then(response => {
      if (response.status !== StatusCodes.OK) {
        return dispatch(receiveMatterDetailsFailure())
      } else {
        dispatch(receiveMatterDetailsSuccess(response.body))
      }
    })
  }

export const updateMatterDetails = (id, data) => dispatch => {
  dispatch(updateMatter({ id, data }))
  return matterService.updateMatter(id, data).then(response => {
    if (response.status !== StatusCodes.OK) {
      return dispatch(receiveMatterDetailsFailure())
    } else {
      return dispatch(receiveMatterDetailsSuccess(response.body))
    }
  })
}

export const clearMatterDetails = () => dispatch => {
  dispatch(clearMatter())
}

export const fetchMatterOverview = id => dispatch => {
  dispatch(requestMatterOverview(id))
  return matterService.getMatterOverview(id).then(response => {
    if (response.status === StatusCodes.OK) {
      dispatch(receiveMatterOverview(response.body))
    } else {
      return dispatch(receiveMatterDetailsFailure())
    }
  })
}
