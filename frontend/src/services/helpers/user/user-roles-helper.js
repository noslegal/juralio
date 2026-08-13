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

export const getUserRoles = (userRoles, t) => {
  if (!userRoles) {
    return ''
  }

  const roleDescriptions = []
  const authorityToLabelMapping = {
    ROLE_SYSADMIN: 'userList.sysadmin',
    ROLE_ORG_ADMIN: 'userList.orgadmin',
    ROLE_ORG_OWNER: 'userList.orgOwner',
    ROLE_MATTER_CREATOR: 'userList.matterCreator',
    ROLE_KNOWLEDGE_MANAGER: 'userList.knowledgeManager',
  }

  for (let i = 0; i < userRoles.length; i++) {
    const label = authorityToLabelMapping[userRoles[i]]
    if (label) {
      roleDescriptions.push(t(label))
    }
  }

  roleDescriptions.sort()

  return roleDescriptions
}

export const isEditor = user => {
  return user.user && user.user.teamMemberId && !user.isPlaceholder
    ? user.user.teamMemberId > 0
    : (user.teamMemberId > 0 || user.isEditor) && !user.isPlaceholder
}

export const isAdmin = user => {
  return user.user && user.user.matterAdminId && !user.isPlaceholder
    ? user.user.matterAdminId > 0
    : (user.matterAdminId > 0 || user.isAdmin) && !user.isPlaceholder
}

export const isViewer = user => {
  return user.user && user.user.matterViewerId && !user.isPlaceholder
    ? user.user.matterViewerId > 0
    : (user.matterViewerId > 0 || user.isViewer) && !user.isPlaceholder
}

export const checkIfPrivateWorkstreamMember = (workstream, user) => {
  if (!workstream?.isPrivate) {
    return true
  }
  if (user.isPlaceholder) {
    return true
  }

  return workstream.privateWorkstreamTeam
    .map(member => member?.id)
    .includes(user.id)
}
