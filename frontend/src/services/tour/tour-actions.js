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

export const SET_CURRENT_TOUR = 'SET_CURRENT_TOUR'
export const CLEAR_TOUR = 'CLEAR_TOUR'
export const SET_AVAILABLE_TOURS = 'SET_AVAILABLE_TOURS'
export const SET_STEP = 'SET_STEP'
export const setTour = (
  tour,
  steps,
  showMask = false,
  disableFocusLock = true,
  step = 0
) => {
  return {
    type: SET_CURRENT_TOUR,
    currentTour: tour,
    steps,
    showMask,
    disableFocusLock,
    step,
  }
}

export const clearTour = () => {
  return {
    type: CLEAR_TOUR,
    steps: [],
    currentTour: undefined,
    showMask: false,
    disableFocusLock: true,
  }
}
export const setStep = step => {
  return { type: SET_STEP, step: step }
}

export const setAvailableTours = tours => {
  return {
    type: SET_AVAILABLE_TOURS,
    tours: tours,
  }
}
