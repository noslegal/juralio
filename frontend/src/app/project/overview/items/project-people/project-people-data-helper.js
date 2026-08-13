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
  compareBoolsDescending,
  compareNumbersDescending,
  compareStrings,
} from '../../../../../services/helpers/table/juralio-table-sorting-helper'
import { formatUserDisplayName } from '../../../../../services/user/helper/user-format-service'
import { POSITIONS } from '../../../../constants'

export const shouldUseClientNamePlaceholder = (overview, positionName) =>
  positionName === POSITIONS.CLIENT.name &&
  (overview?.positionsOfGroups || []).some(
    o =>
      o.group.isInternal === true && o.position.name === POSITIONS.ADVISOR.name
  )

const getMatterRoles = (t, user, adminsMap) => {
  let result = []
  if (user.isCosts || user.costsId > 0) {
    result.push(t('entity.costs'))
  }
  if (user.isViewer || user.matterViewerId > 0) {
    result.push(t('entity.viewer'))
  }
  if (user.isEditor || user.teamMemberId > 0) {
    result.push(t('entity.editor'))
  }
  if (user.isAdmin || adminsMap[user.id]) {
    result.push(t('entity.admin'))
  }
  if (user.isPlaceholder) {
    result.push(t('entity.placeholder'))
  }
  return result.reverse()
}

export const populateTable = (
  t,
  matterAdmins,
  teamOnProject,
  privateTeamMembers = [],
  matterId,
  isPrivate = false
) => {
  if (!matterAdmins || !teamOnProject) return []

  const adminsMap = {}
  matterAdmins.forEach(user => {
    if (user.matterAdminId > 0) adminsMap[user.user.id] = true
  })

  const team = isPrivate ? privateTeamMembers : teamOnProject
  const rows = team.map(user => {
    let u = user
    const teamOnProjectUser = teamOnProject.find(u => u.id === user.id)
    if (teamOnProjectUser) {
      u = teamOnProjectUser
    }
    const matterRoles = getMatterRoles(t, u, adminsMap)
    return {
      id: user.id,
      _user: user,
      displayName: user.isPlaceholder
        ? user.firstame + ' ' + user.lastame
        : formatUserDisplayName(user),
      email: user.username,
      groupName: user.organisationGroup ? user.organisationGroup.name : '',
      matterRolesDisplay: user.isPlaceholder
        ? 'Placeholder'
        : matterRoles.join(', '),
      matterRoles,
      taskCount: u.taskCount || 0,
      _search: `${formatUserDisplayName(user)} ${
        user.username ?? ''
      }`.toLowerCase(),
    }
  })

  rows.sort((a, b) =>
    compareStrings(
      a._user.firstname?.toLowerCase(),
      b._user.firstname?.toLowerCase()
    )
  )
  rows.sort((a, b) =>
    compareStrings(
      a._user.lastname?.toLowerCase(),
      b._user.lastname?.toLowerCase()
    )
  )
  rows.sort((a, b) => compareNumbersDescending(a.taskCount, b.taskCount))
  rows.sort((a, b) =>
    compareBoolsDescending(a._user.isPlaceholder, b._user.isPlaceholder)
  )

  return rows
}
