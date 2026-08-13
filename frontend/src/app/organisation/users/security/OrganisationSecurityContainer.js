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

import React, { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import { useDispatch, useSelector } from 'react-redux'

import { updateOrganisation } from '../../../../admin/organisations/organisation-actions'
import OrganisationSecurity from './OrganisationSecurity'
import { fetchOrganisationUsers } from '../../../users/users-actions'
import { useThirdPartyUsers } from '../../../../hooks/organisation/users/organisation-users-hooks'

const OrganisationSecurityContainer = () => {
  const dispatch = useDispatch()
  const organisation = useSelector(
    state => state.organisation.selectedOrganisation
  )
  const organisationUsers = useSelector(state => state.users?.users)
  const thirdPartyUsers = useThirdPartyUsers(organisationUsers)

  useEffect(() => {
    dispatch(fetchOrganisationUsers(organisation?.id))
  }, [dispatch, organisation])

  const [changesAwaitingConfirmation, setChangesAwaitingConfirmation] =
    useState({})

  const requestInlineChangeConfirmation = (propertyName, value) => {
    setChangesAwaitingConfirmation({
      ...changesAwaitingConfirmation,
      [propertyName]: value,
    })
  }

  const applyChange = (propertyName, propertyValue) =>
    dispatch(
      updateOrganisation(organisation.id, {
        [propertyName]: propertyValue,
      })
    )

  return (
    <OrganisationSecurity
      organisation={organisation}
      applyChange={applyChange}
      requestInlineChangeConfirmation={requestInlineChangeConfirmation}
      changesAwaitingConfirmation={changesAwaitingConfirmation}
      setChangesAwaitingConfirmation={setChangesAwaitingConfirmation}
      thirdPartyUsers={thirdPartyUsers}
    />
  )
}

OrganisationSecurityContainer.propTypes = {
  organisation: PropTypes.object,
}

export default OrganisationSecurityContainer
