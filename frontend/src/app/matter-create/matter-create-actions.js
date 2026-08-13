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
import { showSnackbar } from '../global-snackbar/global-snackbar-actions'

export const MATTER_CREATE_SUCCESS = 'MATTER_CREATE_SUCCESS'
export const RESET_MATTER_STATE = 'RESET_MATTER_STATE'

const _createMatterSuccess = matter => {
  return {
    type: MATTER_CREATE_SUCCESS,
    matter: matter,
  }
}

const _resetMatterState = () => {
  return {
    type: RESET_MATTER_STATE,
  }
}

const getSnackbarMessage = matter => `${matter.name} - created successfully`

export const createMatter =
  (
    clientName,
    matterName,
    userDefinedReferenceNumber,
    isSnackbarRequired = true,
    position,
    department
  ) =>
  dispatch => {
    return matterService
      .createMatter(
        clientName,
        matterName,
        userDefinedReferenceNumber,
        position,
        department
      )
      .then(response => {
        if (response.status === StatusCodes.OK) {
          if (isSnackbarRequired) {
            dispatch(showSnackbar(getSnackbarMessage(response.body)))
          }
          return dispatch(_createMatterSuccess(response.body))
        }
      })
  }

export const resetMatterState = () => dispatch => {
  return dispatch(_resetMatterState())
}
