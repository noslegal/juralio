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

import { useSelector } from 'react-redux'
import {
  isSysAdmin,
  isOrgAdmin,
  isMatterCreator,
  isKnowledgeManager,
} from '../services/user/helper/user-role-service'
import { POSITIONS } from '../app/constants'

const useUserAuthData = () => useSelector(state => state.auth.data.auth)
const useUserDetailsData = () => useSelector(state => state.auth.data.details)
const useUserRole = () => {
  const userAuthData = useUserAuthData()
  return {
    isSysAdmin: isSysAdmin(userAuthData),
    isOrgAdmin: isOrgAdmin(userAuthData),
    isMatterCreator: isMatterCreator(userAuthData),
    isKnowledgeManager: isKnowledgeManager(userAuthData),
  }
}
const useUserPosition = matter => {
  const details = useUserDetailsData()
  const orgGroupId = details?.organisationGroup?.id
  const positionsOfGroups = matter?.positionsOfGroups ?? []
  const match = positionsOfGroups.find(item => item.group?.id === orgGroupId)
  return {
    isClient: match?.position?.name === POSITIONS.CLIENT.name,
    isAdvisor: match?.position?.name === POSITIONS.ADVISOR.name,
    positionData: match?.position,
    isInternalGroup: details?.organisationGroup?.isInternal === true,
  }
}
export { useUserAuthData, useUserDetailsData, useUserRole, useUserPosition }
