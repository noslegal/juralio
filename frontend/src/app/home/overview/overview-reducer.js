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
  SELECT_INBOX_ITEM,
  CLEAR_SELECTED_INBOX_ITEM,
  REQUEST_INBOX_ITEM_OVERVIEW,
  RECEIVE_INBOX_ITEM_OVERVIEW_SUCCESS,
} from './overview-actions'

const initialOverviewState = {
  selectedInboxItem: undefined,
  isLoading: false,
}

export default function overviewReducer(state = initialOverviewState, action) {
  switch (action.type) {
    case SELECT_INBOX_ITEM:
      return { ...state, selectedInboxItem: action.inboxItem }
    case CLEAR_SELECTED_INBOX_ITEM:
      return initialOverviewState
    case REQUEST_INBOX_ITEM_OVERVIEW:
      return { ...state, isLoading: true }
    case RECEIVE_INBOX_ITEM_OVERVIEW_SUCCESS:
      return { ...state, isLoading: false }
    default:
      return state
  }
}
