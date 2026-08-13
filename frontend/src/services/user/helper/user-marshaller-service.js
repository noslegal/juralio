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

export const marshallAddTeamMemberResultToTeamListItem = addedTeamMembers => {
  if (addedTeamMembers.length === 1) {
    let teamMember = addedTeamMembers[0]
    return [{ teamMemberId: teamMember.id, user: teamMember.user }]
  } else if (addedTeamMembers.length > 1) {
    return addedTeamMembers.map(teamMember => {
      return { teamMemberId: teamMember.id, user: teamMember.user }
    })
  } else {
    return { teamMemberId: addedTeamMembers.id, user: addedTeamMembers.user }
  }
}

export const marshallAddAdminResultToTeamListItem = addedAdmins => {
  if (addedAdmins.length === 1) {
    let admin = addedAdmins[0]
    return [{ matterAdminId: admin.id, user: admin.user }]
  } else if (addedAdmins.length > 1) {
    return addedAdmins.map(admin => {
      return { matterAdminId: admin.id, user: admin.user }
    })
  } else {
    return { matterAdminId: addedAdmins.id, user: addedAdmins.user }
  }
}

export const marshallAddViewOnlyToTeamList = addedViewOnlyUsers => {
  if (addedViewOnlyUsers.length === 1) {
    let viewOnly = addedViewOnlyUsers[0]
    return [{ viewOnlyId: viewOnly.id, user: viewOnly.user }]
  } else if (addedViewOnlyUsers.length > 1) {
    return addedViewOnlyUsers.map(viewonly => {
      return { viewOnlyId: viewonly.id, user: viewonly.user }
    })
  } else {
    return {
      viewOnlyId: addedViewOnlyUsers.id,
      user: addedViewOnlyUsers.user,
    }
  }
}
