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
  CLEAR_TOUR,
  SET_AVAILABLE_TOURS,
  SET_CURRENT_TOUR,
  SET_STEP,
} from './tour-actions'

export default function tour(
  state = {
    currentTour: undefined,
    steps: [],
    tours: [],
    step: 0,
    showMask: false,
    disableFocusLock: true,
  },
  action
) {
  switch (action.type) {
    case SET_CURRENT_TOUR:
      return {
        ...state,
        currentTour: action.currentTour,
        steps: action.steps,
        step: action.step,
        showMask: action.showMask,
        disableFocusLock: action.disableFocusLock,
      }
    case CLEAR_TOUR:
      return {
        ...state,
        currentTour: undefined,
        steps: [],
        step: 0,
        showMask: false,
        disableFocusLock: true,
      }
    case SET_STEP:
      return {
        ...state,
        step: action.step,
      }
    case SET_AVAILABLE_TOURS:
      return {
        ...state,
        tours: action.tours,
      }
    default:
      return state
  }
}
