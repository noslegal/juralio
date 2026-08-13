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

import { StatusCodes } from 'http-status-codes'
import { getTypeObject } from '../../../../app/template/project-creation/action-helper'
import notificationFilterUserRecency from '../../../../services/inbox-notification/notification-filter-user-recency-service'

export const inboxActionTypes = {
  RESET_INBOX_PERSON_FILTER: 'RESET_INBOX_PERSON_FILTER',
  SET_FETCHING_FILTER_USER_RECENCY: 'SET_FETCHING_FILTER_USER_RECENCY',
  SET_FILTER_USER_RECENCY: 'SET_FILTER_USER_RECENCY',
  SET_INBOX_PERSON_FILTER: 'SET_INBOX_PERSON_FILTER',
}

const _resetInboxPersonFilter = () =>
  getTypeObject(inboxActionTypes.RESET_INBOX_PERSON_FILTER)

const _setFetchingFilterUserRecency = () =>
  getTypeObject(inboxActionTypes.SET_FETCHING_FILTER_USER_RECENCY)

const _setFilterUserRecency = users => {
  return getTypeObject(inboxActionTypes.SET_FILTER_USER_RECENCY, {
    users: users,
  })
}

const _updateInboxPersonFilter = (
  filterValue,
  filterSelectionText,
  filterSelectionUser
) => {
  return getTypeObject(inboxActionTypes.SET_INBOX_PERSON_FILTER, {
    filterPerson: filterValue,
    filterSelectionText: filterSelectionText,
    filterSelectionUser: filterSelectionUser,
  })
}

export const inboxActions = {
  updateInboxPersonFilter:
    (filterValue, filterSelectionText, filterSelectionUser) => dispatch =>
      dispatch(
        _updateInboxPersonFilter(
          filterValue,
          filterSelectionText,
          filterSelectionUser
        )
      ),
  resetInboxPersonFilter: () => dispatch => {
    dispatch(_resetInboxPersonFilter())
  },
  fetchFilterUserRecency: projectId => dispatch => {
    dispatch(_setFetchingFilterUserRecency())
    return notificationFilterUserRecency
      .getNotificationFilterUserRecency(projectId)
      .then(response => {
        if (response.status === StatusCodes.OK) {
          dispatch(_setFilterUserRecency(response.body))
        }
      })
  },
  setFetchingFilterUserRecency: () => dispatch => {
    return dispatch(_setFetchingFilterUserRecency())
  },
}
