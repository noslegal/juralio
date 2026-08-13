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

const MAX_USER_RECENCY_LIST_LENGTH = 5

export const updateRecencyList = (state, updatedFilterUserRecency, action) => {
  if (
    !action.filterSelectionUser?.id ||
    action.filterSelectionUser.currentUser === true
  ) {
    return state.filterUserRecency
  }

  if (state.filterUserRecency?.length > 0) {
    updatedFilterUserRecency = [
      action.filterSelectionUser,
      ...state.filterUserRecency.filter(
        user => user.id !== action.filterSelectionUser.id
      ),
    ]
  } else {
    updatedFilterUserRecency = [action.filterSelectionUser]
  }

  if (updatedFilterUserRecency.length > MAX_USER_RECENCY_LIST_LENGTH) {
    updatedFilterUserRecency = updatedFilterUserRecency.slice(
      0,
      MAX_USER_RECENCY_LIST_LENGTH
    )
  }
  return updatedFilterUserRecency
}
