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

import PropTypes from 'prop-types'
import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { getOrganisations } from '../../../admin/organisations/organisation-actions'
import { useUserAuthData } from '../../../hooks/user-hooks'
import {
  isOrgAdmin,
  isOrgOwner,
  isSysAdmin,
} from '../../../services/user/helper/user-role-service'
import { USER_ROLES } from '../../constants'
import UpdateUserDetails from './UpdateUserDetails'

const UpdateUserDetailsContainer = props => {
  const userAuthData = useUserAuthData()
  const dispatch = useDispatch()
  const isSystemAdministrator = isSysAdmin(userAuthData)
  const isSelfOrgOwner = isOrgOwner(userAuthData)
  const availableOrganisations = useSelector(state =>
    isSystemAdministrator
      ? state.organisation.organisationsList
      : [state.organisation.selectedOrganisation]
  )

  const isTargetUserSelf =
    userAuthData.username === props.selectedUser?.username
  const isSysAdminSelfEditing = isSystemAdministrator && isTargetUserSelf
  const isKnowledgeManagerDisabled = isSysAdminSelfEditing

  useEffect(() => {
    if (isSystemAdministrator) {
      dispatch(getOrganisations())
    }
  }, [dispatch, isSystemAdministrator])

  return props.selectedUser ? (
    <UpdateUserDetails
      availableOrganisations={availableOrganisations}
      closeHandler={props.closeHandler}
      isEditingSelf={isTargetUserSelf}
      isMatterCreatorDisabled={isSysAdminSelfEditing}
      isKnowledgeManagerDisabled={isKnowledgeManagerDisabled}
      isOrgAdminDisabled={props.isEditingSelf}
      open={!!props.selectedUser}
      resetFtue={props.resetFtue}
      resetTours={props.resetTours}
      resetPassword={props.resetPassword}
      resendInv={props.resendInv}
      saveChanges={props.saveChanges}
      user={props.selectedUser}
      isOrgAdmin={isOrgAdmin(userAuthData)}
      convertToMS={props.convertToMS}
      convertToJuralio={props.convertToJuralio}
      convertToOkta={props.convertToOkta}
      convertToSaml={props.convertToSaml}
      convertToGoogle={props.convertToGoogle}
      isSystemAdministrator={isSystemAdministrator}
      isUserSysAdmin={
        props.selectedUser &&
        props.selectedUser?.roles?.includes(USER_ROLES.ROLE_SYS_ADMIN)
      }
      isOrgOwner={isSelfOrgOwner}
      getOrgOwners={props.getOrgOwners}
    />
  ) : null
}

UpdateUserDetailsContainer.propTypes = {
  /** closeHandler */
  closeHandler: PropTypes.func.isRequired,
  /** Reset FTUE action function*/
  resetFtue: PropTypes.func.isRequired,
  /** Reset password action function*/
  resetPassword: PropTypes.func.isRequired,
  /** selectedUser */
  selectedUser: PropTypes.object,
  /** saveChanges */
  saveChanges: PropTypes.func.isRequired,
}

export default UpdateUserDetailsContainer
