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

import { USER_ROLES } from '../../../app/constants'

export const hasRole = (role, userData) => {
  return !!userData && !!userData.roles && userData.roles.indexOf(role) > -1
}

export const isSysAdmin = userData => {
  return hasRole(USER_ROLES.ROLE_SYS_ADMIN, userData)
}

export const isOrgAdmin = userData => {
  return hasRole(USER_ROLES.ROLE_ORG_ADMIN, userData)
}

export const isOrgOwner = userData => {
  return hasRole(USER_ROLES.ROLE_ORG_OWNER, userData)
}

export const isMatterCreator = userData => {
  return hasRole(USER_ROLES.ROLE_MATTER_CREATOR, userData)
}

export const isMatterViewer = userData => {
  return hasRole(USER_ROLES.ROLE_MATTER_VIEWER, userData)
}

export const isKnowledgeManager = userData => {
  return hasRole(USER_ROLES.ROLE_KNOWLEDGE_MANAGER, userData)
}
