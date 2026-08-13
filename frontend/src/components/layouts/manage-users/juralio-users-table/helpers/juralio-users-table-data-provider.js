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
  compareConfirmationStatus,
  compareStrings,
} from '../../../../../services/helpers/table/juralio-table-sorting-helper'
import { getUserRoles } from '../../../../../services/helpers/user/user-roles-helper'
import { formatAuthMethod } from './auth-method-helper'
import { getUserLastLoggedInDate } from './last-logged-in-helper'

const processData = (
  t,
  data,
  isOrganisation,
  organisation,
  sortByConfirmation = false
) => {
  const records = []

  data.forEach(user => {
    if (user === null) return ''
    if (user.firstname === 'Unknown' && user.lastname === 'Microsoft User') {
      user.firstname = ''
      user.lastname = ''
    }

    if (
      isOrganisation &&
      parseInt(user.organisation?.id) !== parseInt(organisation)
    ) {
      return
    }

    const orgName =
      !isOrganisation && user.organisation !== null && user.organisation?.name
        ? user.organisation.name
        : t('common.none')

    records.push({
      id: user.id,
      _user: user,
      organisation: orgName,
      groupName: user?.organisationGroup?.name ?? '',
      roles: getUserRoles(user.roles, t),
      userType: user.isExternal ? t('auth.external') : t('auth.internal'),
      mfaEnabled: user.mfaEnabled,
      enabled: user.enabled,
      confirmationStatus: user.confirmationStatus,
      authMethod: formatAuthMethod(user.thirdPartyProvider),
      lastLoggedIn: getUserLastLoggedInDate(user),
      _search: `${user.username} ${user.firstname ?? ''} ${
        user.lastname ?? ''
      } ${user?.organisationGroup?.name ?? ''}`.toLowerCase(),
    })
  })

  records.sort((a, b) => compareStrings(a._user.firstname, b._user.firstname))
  records.sort((a, b) => compareStrings(a._user.lastname, b._user.lastname))
  records.sort((a, b) => compareBools(a._user.enabled, b._user.enabled))
  if (sortByConfirmation) {
    records.sort((a, b) => compareConfirmationStatus(a._user, b._user))
  }

  return records
}

export default processData
