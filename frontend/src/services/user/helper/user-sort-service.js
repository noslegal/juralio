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

import { formatFirstAndLastName } from './user-format-service'

export const sortByName = users =>
  users.sort((a, b) => {
    const aName = formatFirstAndLastName(a).toLocaleLowerCase()
    const bName = formatFirstAndLastName(b).toLocaleLowerCase()
    return aName.localeCompare(bName)
  })

export const sortUserList = (userId, users) => {
  let sortedUsers = sortUserAsFirstItem(userId, users)
  sortedUsers = sortInactiveToBottom(sortedUsers)
  return sortedUsers
}

const sortInactiveToBottom = users => {
  const sortedByEnabled = users.sort(
    (a, b) => b.isActiveOnMatter - a.isActiveOnMatter
  )
  return sortedByEnabled.sort((a, b) => b.enabled - a.enabled)
}

const sortUserAsFirstItem = (userId, users) => {
  let sortedUsers = [...users]
  const userIndex = sortedUsers.findIndex(user => user.id === userId)

  if (userIndex > -1) {
    const userInList = sortedUsers.splice(userIndex, 1)[0]
    sortedUsers.unshift(userInList)
  }

  return sortedUsers
}
