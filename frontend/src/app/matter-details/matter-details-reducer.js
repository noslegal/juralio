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

import { OPERATION_MODE } from '../constants'
import {
  CLEAR_MATTER,
  RECEIVE_MATTER_DETAILS_FAILURE,
  RECEIVE_MATTER_DETAILS_SUCCESS,
  RECEIVE_MATTER_OVERVIEW,
  REQUEST_MATTER_DETAILS,
  REQUEST_MATTER_OVERVIEW,
  SET_MATTER_DETAILS,
  UPDATE_MATTER,
} from './matter-details-actions'

const initialMatterDetailsState = {
  matter: undefined,
  isLoaded: false,
  isForbidden: false,
  overview: undefined,
}

const calculateMatterDetailsMode = matter => {
  if (
    matter &&
    matter.activities !== null &&
    matter.activities?.includes('MATTER_ADMIN')
  ) {
    return OPERATION_MODE.EDIT
  }
  return OPERATION_MODE.VIEW
}

const constructMatter = (state, matter) => ({
  ...state,
  matter,
  isLoaded: true,
  mode: calculateMatterDetailsMode(matter),
})

export default function matterDetailsReducer(
  state = initialMatterDetailsState,
  action
) {
  switch (action.type) {
    case REQUEST_MATTER_DETAILS:
      return { ...state, isLoaded: false, isForbidden: false }
    case RECEIVE_MATTER_DETAILS_SUCCESS:
      return constructMatter(state, action.matter)
    case SET_MATTER_DETAILS:
      return {
        ...state,
        matter: action.matter,
      }
    case RECEIVE_MATTER_DETAILS_FAILURE:
      return { ...state, isLoaded: true, isForbidden: true }
    case UPDATE_MATTER:
      return {
        ...state,
        isLoaded: true,
        isForbidden: false,
        matter: { ...state.matter, ...action.payload.data },
      }
    case CLEAR_MATTER:
      return initialMatterDetailsState
    case RECEIVE_MATTER_OVERVIEW:
      return { ...state, overview: action.overview }
    case REQUEST_MATTER_OVERVIEW:
      if (action.id !== state.overview?.id) {
        return { ...state, overview: undefined }
      } else {
        return { ...state }
      }
    default:
      return state
  }
}
