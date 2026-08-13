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

import PersonIcon from '@mui/icons-material/Person'
import PropTypes from 'prop-types'
import React, { useEffect, useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import {
  assignOrganisationToUser,
  getCurrentOrganisation,
} from '../../../admin/organisations/organisation-actions'
import { USER_ROLES } from '../../../app/constants'
import { setupExperimentalSettings } from '../../../app/experimental/experimental-actions'
import { displayConfirmationDialog } from '../../../app/global-confirmation-dialog/global-confirmation-dialog-actions'
import { showSnackbar } from '../../../app/global-snackbar/global-snackbar-actions'
import UpdateUserDetailsContainer from '../../../app/organisation/users/UpdateUserDetailsContainer'
import {
  convertUserToGoogle,
  convertUserToJuralio,
  convertUserToMicrosoft,
  convertUserToOkta,
  convertUserToSaml,
  deselectUser,
  fetchOrganisationUsers,
  fetchUsers,
  requestTemporaryPassword,
  resendInvite,
  resetFtue,
  resetState,
  selectUser,
  update,
} from '../../../app/users/users-actions'
import { useUserAuthData } from '../../../hooks/user-hooks'
import experimentalServices from '../../../services/experimental/experimental-services'
import { setAvailableTours } from '../../../services/tour/tour-actions'
import tourService from '../../../services/tour/tour-service'
import {
  isOrgOwner,
  isSysAdmin,
} from '../../../services/user/helper/user-role-service'
import ConfirmationDialog from '../../dialog/confirmation-dialog/ConfirmationDialog'
import SsoEmailInput from '../../inputs/sso-email-input/SsoEmailInput'
import JuralioUsersTableContainer from './juralio-users-table/JuralioUsersTableContainer'
import UserChangeConfirmationDialogContainer from './UserChangeConfirmationDialogContainer'

const ManageUsers = props => {
  const dispatch = useDispatch()
  const users = useSelector(state => state.users?.users)
  const hasLoadedUsers = useSelector(state => state.users?.isLoaded)
  const selectedUser = useSelector(state => state.users?.selectedUser)
  const userAuthData = useUserAuthData()
  const isCurrentUserSysadmin = isSysAdmin(userAuthData)
  const isCurrentUserOrgOwner = isOrgOwner(userAuthData)
  const instanceSettings = useSelector(state => state.instanceSettings)
  const showUserConfirmationFunctionality =
    instanceSettings.settings.enableUserConfirmation
  const [showDialog, setShowDialog] = useState(false)
  const [user, setUser] = useState(selectedUser)
  const [disabled, setDisabled] = useState(false)
  const [username, setUsername] = useState('')
  const [title, setTitle] = useState()
  const [prompt, setPrompt] = useState()
  const [usage, setUsage] = useState()
  const [action, setAction] = useState()
  const usernameRef = useRef('')

  const { t } = useTranslation()
  const orgMfaEnabled = useSelector(
    state => state.organisation?.selectedOrganisation?.mfaEnabled
  )
  const [changesAwaitingConfirmation, setChangesAwaitingConfirmation] =
    useState({})
  const currentUserId = useSelector(state => state.auth.data.details?.id)
  const currentUser = useSelector(state => state.auth.data.details)

  useEffect(() => {
    usernameRef.current = username
  }, [username])

  useEffect(() => {
    if (!isCurrentUserSysadmin) {
      dispatch(getCurrentOrganisation())
    }
  }, [users, dispatch]) //eslint-disable-line

  const refreshUserList =
    (isCurrentUserSysadmin, isOrganisation, organisationId) => dispatch => {
      if (isOrganisation && organisationId) {
        dispatch(fetchOrganisationUsers(organisationId))
      } else if (isCurrentUserSysadmin) {
        dispatch(fetchUsers())
      }
    }

  useEffect(() => {
    dispatch(
      refreshUserList(
        isCurrentUserSysadmin,
        props.isOrganisation,
        props.organisationId
      )
    )
    return () => dispatch(resetState())
    //eslint-disable-next-line
  }, [
    dispatch,
    isCurrentUserSysadmin,
    props.isOrganisation,
    props.organisationId,
  ])

  useEffect(() => {
    experimentalServices.getExperimentalConfig().then(res => {
      dispatch(setupExperimentalSettings(res))
    })
  }, [dispatch])

  const _selectUser = user => {
    dispatch(selectUser(user))
    setUser(user)
    setUsername(user.username)
  }
  const _deselectUser = () => dispatch(deselectUser())

  let getOrgOwners = user => {
    if (!user.organisation) {
      return []
    }
    let orgId = parseInt(user.organisation.id)
    let orgUsers = users.filter(
      u =>
        u.organisation &&
        u.organisation != null &&
        parseInt(u.organisation.id) === orgId
    )
    let owners = orgUsers.filter(u => u.roles.includes('ROLE_ORG_OWNER'))
    return owners
  }

  const tryingToRemoveSelfAsOrgOwner = properties => {
    if (selectedUser.id !== currentUserId) {
      return false
    }
    if (!isCurrentUserOrgOwner) {
      return false
    }
    if (properties.roles.includes(USER_ROLES.ROLE_ORG_OWNER)) {
      return false
    }
    return true
  }

  const saveChanges = async properties => {
    delete properties.enabled
    const { organisation, ...otherProperties } = properties
    const oldOrganisationId = selectedUser.organisation?.id
    const newOrganisationId = organisation?.id

    const execute = async () => {
      if (otherProperties) {
        dispatch(update(selectedUser.id, otherProperties)).then(() => {
          dispatch(
            refreshUserList(
              isCurrentUserSysadmin,
              props.isOrganisation,
              props.organisationId
            )
          )
        })
      }

      if (oldOrganisationId !== newOrganisationId) {
        await assignOrganisationToUser(selectedUser, newOrganisationId)
        dispatch(deselectUser())
        dispatch(
          refreshUserList(
            isCurrentUserSysadmin,
            props.isOrganisation,
            props.organisationId
          )
        )
      }
    }

    if (tryingToRemoveSelfAsOrgOwner(properties)) {
      const options = {
        actionText: t('common.confirm'),
        titleText: t('userCreation.removeSelfAsOwner'),
        promptText: t('userCreation.confirmRemoveOwnOrgOwnership'),
        usageContext: 'removeSelfAsOrgOwner',
        headerIcon: PersonIcon,
      }
      dispatch(displayConfirmationDialog(options, execute))
    } else {
      execute()
    }
  }

  const requestInlineChangeConfirmation = (user, properties) => {
    setChangesAwaitingConfirmation({
      ...changesAwaitingConfirmation,
      [user.id]: {
        ...(changesAwaitingConfirmation[user.id] || {}),
        ...properties,
      },
    })
  }
  const _resetFtue = () => dispatch(resetFtue(selectedUser.id))

  const _resetTours = () => {
    tourService.resetTours(selectedUser.id).then(res => {
      if (res.status === 200) {
        dispatch(setAvailableTours(res.body))
        dispatch(showSnackbar(t('tours.common.resetSuccess')))
      }
    })
  }

  const _resendInv = () => dispatch(resendInvite(selectedUser))
  const _resetPassword = () => dispatch(requestTemporaryPassword(selectedUser))

  const _convertToMS = () => {
    setShowDialog(true)
    setTitle(t('accountSecurity.convertToMicrosoft'))
    setUsage('ConvertToMicrosoftUser')
    setPrompt(t('accountSecurity.convertMicrosoftUser'))
    setAction(() => _convertToMicrosoft)
  }
  const _convertToMicrosoft = () => {
    dispatch(convertUserToMicrosoft(user.id, t, usernameRef.current))
    setShowDialog(false)
  }

  const _convertToG = () => {
    setShowDialog(true)
    setTitle(t('accountSecurity.convertToGoogle'))
    setUsage('ConvertToMicrosoftUser')
    setPrompt(t('accountSecurity.convertGoogleUser'))
    setAction(() => _convertToGoogle)
  }
  const _convertToGoogle = () => {
    dispatch(convertUserToGoogle(user.id, t, usernameRef.current))
    setShowDialog(false)
  }

  const _convertToJur = () => {
    setShowDialog(true)
    setTitle(t('accountSecurity.convertToJuralio'))
    setUsage('ConvertToMicrosoftUser')
    setPrompt(t('accountSecurity.convertJuralioUser'))
    setAction(() => _convertToJuralio)
  }
  const _convertToJuralio = () => {
    dispatch(convertUserToJuralio(user, t, usernameRef.current))
    setShowDialog(false)
  }

  const _convertToOk = () => {
    setShowDialog(true)
    setTitle(t('accountSecurity.convertToOkta'))
    setUsage('ConvertToMicrosoftUser')
    setPrompt(t('accountSecurity.convertOktaUser'))
    setAction(() => _convertToOkta)
  }
  const _convertToOkta = () => {
    dispatch(convertUserToOkta(user.id, t, usernameRef.current))
    setShowDialog(false)
  }

  const _convertToSa = () => {
    setShowDialog(true)
    setTitle(t('accountSecurity.convertToSaml'))
    setUsage('ConvertToMicrosoftUser')
    setPrompt(t('accountSecurity.convertSamlUser'))
    setAction(() => _convertToSaml)
  }
  const _convertToSaml = () => {
    dispatch(convertUserToSaml(user.id, t, usernameRef.current))
    setShowDialog(false)
  }

  const filteredUsers = users.filter(
    u => !u?.roles.includes(USER_ROLES.ROLE_SYS_ADMIN)
  )

  return (
    <React.Fragment>
      <JuralioUsersTableContainer
        data={filteredUsers}
        currentUserId={currentUserId}
        currentUser={currentUser}
        handleRowClick={_selectUser}
        handleChange={requestInlineChangeConfirmation}
        isCurrentUserSysadmin={isCurrentUserSysadmin}
        isCurrentUserOrgOwner={isCurrentUserOrgOwner}
        isLoaded={hasLoadedUsers}
        isOrganisation={props.isOrganisation}
        isOrgMfaEnabled={orgMfaEnabled}
        currentUserTitleSize={props.currentUserTitleSize}
        showUserConfirmationFunctionality={showUserConfirmationFunctionality}
        refreshUserList={refreshUserList}
      />
      <UpdateUserDetailsContainer
        closeHandler={_deselectUser}
        resetFtue={_resetFtue}
        resetTours={_resetTours}
        saveChanges={saveChanges}
        selectedUser={selectedUser}
        resetPassword={_resetPassword}
        resendInv={_resendInv}
        convertToMS={_convertToMS}
        convertToJuralio={_convertToJur}
        convertToOkta={_convertToOk}
        convertToSaml={_convertToSa}
        convertToGoogle={_convertToG}
        getOrgOwners={getOrgOwners}
      />
      <UserChangeConfirmationDialogContainer
        changesAwaitingConfirmation={changesAwaitingConfirmation}
        setChangesAwaitingConfirmation={setChangesAwaitingConfirmation}
      />
      {showDialog && (
        <ConfirmationDialog
          actionHandler={action}
          actionText={t('common.confirm')}
          titleText={title}
          promptText={prompt}
          usageContext={usage}
          headerIcon={PersonIcon}
          cancelHandler={() => setShowDialog(false)}
          disabled={disabled}
          warningText={null}
          extraComponent={
            <SsoEmailInput
              userId={user?.id}
              username={username}
              setUsername={setUsername}
              setDisabled={setDisabled}
              disabled={disabled}
            />
          }
        />
      )}
    </React.Fragment>
  )
}

ManageUsers.propTypes = {
  isOrganisation: PropTypes.bool,
  currentUserTitleSize: PropTypes.string,
}

export default ManageUsers
