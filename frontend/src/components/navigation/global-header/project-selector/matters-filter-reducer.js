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

import { mattersListActionTypes } from './matters-filter-actions'

const initialState = {
  filteredMatters: undefined,
  defaultFilteredMatterId: undefined,
}

export default function mattersFilterReducer(state = initialState, action) {
  switch (action.type) {
    case mattersListActionTypes.CLEAR_DEFAULT_SELECTED_MATTER:
      return { ...state, defaultFilteredMatterId: undefined }
    case mattersListActionTypes.RESET_FILTERED_MATTERS:
      return initialState
    case mattersListActionTypes.SET_FILTERED_MATTERS:
      return {
        ...state,
        filteredMatters: action.matters,
        defaultFilteredMatterId: action.defaultFilteredMatterId,
      }
    default:
      return state
  }
}
