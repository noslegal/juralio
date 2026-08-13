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

import { UPDATE_LOCATION } from './last-location-recorder-actions'

const initialState = {
  currentLocation: null,
  lastLocation: null,
  currentQueryString: null,
  lastQueryString: null,
}

export default function lastLocationRecorderReducer(
  state = initialState,
  action
) {
  switch (action.type) {
    case UPDATE_LOCATION:
      const lastLocation = state.currentLocation
      const lastQueryString = state.currentQueryString

      return {
        currentLocation: action.location,
        lastLocation: lastLocation,
        currentQueryString: action.queryString,
        lastQueryString: lastQueryString,
      }
    default:
      return state
  }
}
