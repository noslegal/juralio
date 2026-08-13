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

import FilterOptions from '../header-with-filter/person-selector/PersonFilterConstants'
import { inboxActionTypes } from './inbox-actions'
import { updateRecencyList } from './update-recency-list-helper'

const initialState = {
  fetchingFilterUserRecency: false,
  filterSelectionText: '',
  filterSelectionUser: {},
  filterUserRecency: undefined,
  personFilter: FilterOptions.ANYBODY,
}

const inboxReducer = (state = initialState, action) => {
  switch (action.type) {
    case inboxActionTypes.SET_FETCHING_FILTER_USER_RECENCY:
      return {
        ...state,
        filterUserRecency: undefined,
        fetchingFilterUserRecency: true,
      }
    case inboxActionTypes.SET_FILTER_USER_RECENCY:
      return {
        ...state,
        filterUserRecency: action.users,
        fetchingFilterUserRecency: false,
      }
    case inboxActionTypes.SET_INBOX_PERSON_FILTER:
      let updatedFilterUserRecency
      updatedFilterUserRecency = updateRecencyList(
        state,
        updatedFilterUserRecency,
        action
      )
      return {
        ...state,
        personFilter: action.filterPerson,
        filterSelectionText: action.filterSelectionText,
        filterSelectionUser: action.filterSelectionUser,
        filterUserRecency: updatedFilterUserRecency
          ? updatedFilterUserRecency
          : state.filterUserRecency,
      }
    case inboxActionTypes.RESET_INBOX_PERSON_FILTER:
      return { ...state, ...initialState }
    default:
      return state
  }
}

export default inboxReducer
