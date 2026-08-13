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

export const MATTER_COSTS_ACTIONS = {
  UPDATE_RATIO_PAYLOAD: 'matter-costs/UPDATE_RATIO_PAYLOAD',
  SET_MATTER_PROJECTIONS: 'SET_MATTER_PROJECTIONS',
}

export default function reducer(
  state = {
    payload: {},
    projections: [],
  },
  action = {}
) {
  switch (action.type) {
    case MATTER_COSTS_ACTIONS.UPDATE_RATIO_PAYLOAD:
      return {
        ...state,
        payload: action.payload,
      }
    case MATTER_COSTS_ACTIONS.SET_MATTER_PROJECTIONS:
      return {
        ...state,
        projections: action.projections,
      }
    default:
      return state
  }
}

const creators = {
  updateRatioPayload(payload) {
    return {
      type: MATTER_COSTS_ACTIONS.UPDATE_RATIO_PAYLOAD,
      payload: payload,
    }
  },
  setMatterProjections(projections) {
    return {
      type: MATTER_COSTS_ACTIONS.SET_MATTER_PROJECTIONS,
      projections: projections,
    }
  },
}

export const updateRatioPayload = payload => dispatch => {
  dispatch(creators.updateRatioPayload(payload))
}

export const setMatterProjections = projections => dispatch => {
  dispatch(creators.setMatterProjections(projections))
}
