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
  checkIfPrivateWorkstreamMember,
  isAdmin,
  isEditor,
  isViewer,
} from './user-roles-helper'

export const getRolesText = (t, user) => {
  let rolesText = ''
  if (isAdmin(user) && isViewer(user)) {
    rolesText += `(${t('roles.matterAdmin')}, ${t('roles.matterViewer')})`
  } else if (isAdmin(user) && isEditor(user)) {
    rolesText += `(${t('roles.matterAdmin')}, ${t('roles.matterEditor')})`
  } else if (isAdmin(user)) {
    rolesText += `(${t('roles.matterAdmin')})`
  } else if (isEditor(user)) {
    rolesText += `(${t('roles.matterEditor')})`
  } else if (isViewer(user)) {
    rolesText += `(${t('roles.matterViewer')})`
  }

  return rolesText
}

export const sortMatterViewersLast = users => [
  ...users.filter(user =>
    user.user ? !user.user.isViewerOnMatter : !user.isViewerOnMatter
  ),
  ...users.filter(user =>
    user.user ? user.user.isViewerOnMatter : user.isViewerOnMatter
  ),
]

export const sortNoAccessLast = users => [
  ...users.filter(user =>
    user.user ? user.user.isActiveOnWorkstream : user.isActiveOnWorkstream
  ),
  ...users.filter(user =>
    user.user ? !user.user.isActiveOnWorkstream : !user.isActiveOnWorkstream
  ),
]

export const addIsActiveOnWorkstream = (users, workstream) => {
  return users.map(user => {
    if (user.user) {
      user.user.isActiveOnWorkstream = checkIfPrivateWorkstreamMember(
        workstream,
        user.user
      )
    }
    user.isActiveOnWorkstream = checkIfPrivateWorkstreamMember(workstream, user)
    return user
  })
}
export const canInteractWithPrivateWorkstream = (user, workstream) => {
  //n.b. there are multiple options here as this function is also used by the split functionality
  if (!workstream.isPrivate && !workstream.isWorkstreamPrivate) {
    return true
  }

  let team =
    workstream.privateWorkstreamTeam || workstream.privateWorkstreamUsers

  if (team.map(pwt => pwt.user.id).includes(user.id)) {
    return true
  }
  return false
}
