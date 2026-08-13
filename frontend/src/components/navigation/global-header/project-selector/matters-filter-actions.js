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

import { getTypeObject } from '../../../../app/template/project-creation/action-helper'

export const mattersListActionTypes = {
  CLEAR_DEFAULT_SELECTED_MATTER: 'CLEAR_DEFAULT_SELECTED_MATTER',
  RESET_FILTERED_MATTERS: 'RESET_FILTERED_MATTERS',
  SET_FILTERED_MATTERS: 'SET_FILTERED_MATTERS',
}

const _clearMattersListFilter = () =>
  getTypeObject(mattersListActionTypes.CLEAR_DEFAULT_SELECTED_MATTER)

const _resetMattersListFilter = () =>
  getTypeObject(mattersListActionTypes.RESET_FILTERED_MATTERS)

const _setMattersListFilter = (matters, defaultFilteredMatterId) =>
  getTypeObject(mattersListActionTypes.SET_FILTERED_MATTERS, {
    matters,
    defaultFilteredMatterId,
  })

export const mattersListActions = {
  clearMattersListFilter: () => dispatch => {
    dispatch(_clearMattersListFilter())
  },
  resetMattersListFilter: () => dispatch => {
    dispatch(_resetMattersListFilter())
  },
  setMattersListFilter: (matters, defaultFilteredMatterId) => dispatch => {
    dispatch(_setMattersListFilter(matters, defaultFilteredMatterId))
  },
}
