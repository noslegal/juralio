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

export const SELECT_INBOX_ITEM = 'SELECT_INBOX_ITEM'
export const CLEAR_SELECTED_INBOX_ITEM = 'CLEAR_SELECTED_INBOX_ITEM'
export const REQUEST_INBOX_ITEM_OVERVIEW = 'REQUEST_INBOX_ITEM_OVERVIEW'
export const RECEIVE_INBOX_ITEM_OVERVIEW_SUCCESS =
  'RECEIVE_INBOX_ITEM_OVERVIEW_SUCCESS'

export function requestInboxItemOverview() {
  return {
    type: REQUEST_INBOX_ITEM_OVERVIEW,
  }
}
export function receiveInboxItemOverviewSuccess() {
  return {
    type: RECEIVE_INBOX_ITEM_OVERVIEW_SUCCESS,
  }
}

export function selectInboxItem(inboxItem) {
  return {
    type: SELECT_INBOX_ITEM,
    inboxItem,
  }
}

export function clearSelectedInboxItem() {
  return {
    type: CLEAR_SELECTED_INBOX_ITEM,
  }
}
