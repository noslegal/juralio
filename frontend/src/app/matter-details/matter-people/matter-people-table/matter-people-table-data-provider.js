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
  compareBools,
  compareStrings,
} from '../../../../services/helpers/table/juralio-table-sorting-helper'

const VIEW_AND_EDIT = 0
const VIEW = 1
const NO_ACCESS = 2
const VIEW_AND_EDIT_AND_ADMIN = 3
const VIEW_AND_ADMIN = 4

const processData = (t, data) => {
  const records = []

  data.forEach(matterTeamMember => {
    if (!matterTeamMember.isPlaceholder) {
      records.push({
        id: matterTeamMember.user.id,
        _tm: matterTeamMember,
        user: matterTeamMember.user,
        groupName: matterTeamMember.user.organisationGroupName,
        accessLevel:
          matterTeamMember.teamMemberId > 0 &&
          matterTeamMember.matterAdminId > 0
            ? VIEW_AND_EDIT_AND_ADMIN
            : matterTeamMember.matterViewerId > 0 &&
                matterTeamMember.matterAdminId > 0
              ? VIEW_AND_ADMIN
              : matterTeamMember.teamMemberId > 0
                ? VIEW_AND_EDIT
                : matterTeamMember.matterViewerId > 0
                  ? VIEW
                  : NO_ACCESS,
        costsId: matterTeamMember.costsId,
        status:
          matterTeamMember.user.enabled === true
            ? t('common.active')
            : t('common.inactive'),
        _search: `${matterTeamMember.user.username ?? ''} ${
          matterTeamMember.user.firstname ?? ''
        } ${matterTeamMember.user.lastname ?? ''}`.toLowerCase(),
      })
    }
  })

  records.sort((a, b) =>
    compareStrings(a._tm.user.firstname, b._tm.user.firstname)
  )
  records.sort((a, b) =>
    compareStrings(a._tm.user.lastname, b._tm.user.lastname)
  )
  records.sort((a, b) => compareBools(a._tm.user.enabled, b._tm.user.enabled))

  return records
}

export default processData
