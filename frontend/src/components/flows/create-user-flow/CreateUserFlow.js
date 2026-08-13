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

import PersonAddIcon from '@mui/icons-material/PersonAdd'
import { DialogContent } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { SSO, USER_ROLES, USER_TYPES } from '../../../app/constants'
import { handleCreateUserFailure } from '../../../app/users/users-actions'
import { useUserAuthData } from '../../../hooks/user-hooks'
import {
  checkTextHasNonWhitespaceContent,
  isValidEmail,
} from '../../../services/helpers/text/text-util-helper'
import { isSysAdmin } from '../../../services/user/helper/user-role-service'
import userService from '../../../services/user/user-service'
import JuralioDialog from '../../dialog/juralio-dialog/JuralioDialog'
import CreateUserFlowCreatedContent from './CreateUserFlowCreatedContent'
import CreateUserFlowRolesContent from './CreateUserFlowRolesContent'
import CreateUserFlowUserDetailsContent from './CreateUserFlowUserDetailsContent'
import CreateUserFlowUserNameContent from './CreateUserFlowUserNameContent'
import CreateUserFlowUserTypeContent from './CreateUserFlowUserTypeContent'
import CreateUserFlowGroupSelector from './CreateUserFlowGroupSelector'
import organisationService from '../../../services/organisation/organisation-service'
const JURALIO_USER = SSO.JURALIO

const NONE_ORG = {
  name: 'No organisation',
  id: -1,
}
const SCREEN = {
  USER_DETAILS_FORM: 0,
  CHOOSE_ROLES_METHOD: 1,
  CHOOSE_AUTH_METHOD: 2,
  USER_CREATED_DIALOG: 3,
  USER_NAME_DIALOG: 4,
  CHOOSE_GROUP: 5,
}
let initialLoad = true

const CreateUserFlow = props => {
  const { t } = useTranslation()
  const instanceSettings = useSelector(state => state.instanceSettings.settings)
  const organisations = useSelector(
    state => state.organisation.organisationsList
  )
  const organisationGroups = useSelector(state => state.organisation.groupList)
  const [selectedOrgGroups, setSelectedOrgGroups] = useState([])
  const selectedOrganisation = useSelector(
    state => state.organisation.selectedOrganisation
  )
  const userAuthData = useUserAuthData()
  const isCurrentUserSysadmin = isSysAdmin(userAuthData)

  const getDefaultOrg = () => {
    if (!isCurrentUserSysadmin && organisations.length === 1) {
      return organisations[0]
    }
    return props.organisation
  }

  const initialValueState = {
    emails: [],
    emailErrors: false,
    roles: [USER_ROLES.ROLE_MATTER_CREATOR],
    firstname: '',
    lastname: '',
    organisation: props.organisation ? props.organisation : getDefaultOrg(),
    group: null,
  }

  const [seatCountError, setSeatCountError] = useState('')
  const [values, setValues] = useState(initialValueState)
  const [screen, setScreen] = useState(SCREEN.USER_DETAILS_FORM)
  const [authType, setAuthType] = useState(SSO.JURALIO)
  const [userType, setUserType] = useState(USER_TYPES.STANDARD)
  const [isExternalUser, setIsExternalUser] = useState(
    instanceSettings.fullSeats === 0
  )
  const [loading, setLoading] = useState(false)
  const dispatch = useDispatch()

  useEffect(() => {
    if (!isCurrentUserSysadmin && selectedOrganisation?.id) {
      organisationService.getGroupsForOrg(selectedOrganisation.id).then(res => {
        setSelectedOrgGroups(res.body)
      })
    }
  }, []) //eslint-disable-line

  useEffect(() => {
    if (!initialLoad) {
      // Don't force a sysadmin's out-of-context creation into the selected org;
      // they pick an org explicitly via the dropdown (or leave it unset).
      if (!isCurrentUserSysadmin) {
        values.organisation = selectedOrganisation
        setValues(values)
      }
    } else {
      initialLoad = false
    }
  }, [selectedOrganisation]) //eslint-disable-line

  const seatsAvailable = () => {
    if (
      !isExternalUser &&
      instanceSettings.fullSeats > 0 &&
      values.emails.length > instanceSettings.fullSeats &&
      seatCountError === ''
    ) {
      if (seatCountError === '') {
        setSeatCountError('There are not enough full seats available')
      }
      return true
    } else if (
      isExternalUser &&
      instanceSettings.limitedSeats > 0 &&
      values.emails.length > instanceSettings.limitedSeats
    ) {
      if (seatCountError === '') {
        setSeatCountError('There are not enough limited seats available')
      }
      return true
    } else {
      setSeatCountError('')
    }
  }

  useEffect(() => {
    seatsAvailable()
  }, [values, isExternalUser]) //eslint-disable-line

  const submit = () => {
    setLoading(true)
    props
      .bulkCreateUsers(values.emails, {
        firstname: values.emails.length === 1 ? values.firstname : '',
        lastname: values.emails.length === 1 ? values.lastname : '',
        roles: values.roles,
        isThirdPartyUser: authType !== JURALIO_USER,
        thirdPartyProvider: authType !== JURALIO_USER ? authType : null,
        isExternal: isExternalUser,
        organisation: values.organisation?.id,
        group: values.group,
      })
      .then(() => {
        setLoading(false)
        setScreen(SCREEN.USER_CREATED_DIALOG)
      })
  }

  const handleCreate = () => {
    switch (screen) {
      case SCREEN.CHOOSE_ROLES_METHOD:
        const org = isCurrentUserSysadmin
          ? values.organisation
          : selectedOrganisation
        if (
          org?.oktaSsoEnabled ||
          org?.microsoftSsoEnabled ||
          org?.samlSsoEnabled ||
          org?.googleSsoEnabled
        ) {
          setScreen(SCREEN.CHOOSE_AUTH_METHOD)
        } else {
          submit()
        }
        break
      case SCREEN.USER_DETAILS_FORM:
        //validate user first
        userService.getUsersByEmail(values.email).then(res => {
          if (res.length === 0) {
            if (
              values.organisation !== undefined &&
              values?.organisation?.id !== -1
            ) {
              setScreen(SCREEN.CHOOSE_GROUP)
            } else if (values.emails.length === 1 && isCurrentUserSysadmin) {
              setScreen(SCREEN.USER_NAME_DIALOG)
            } else if (isExternalUser) {
              setScreen(SCREEN.CHOOSE_AUTH_METHOD)
            } else {
              setScreen(SCREEN.CHOOSE_ROLES_METHOD)
            }
          } else {
            //email already in use
            handleCreateUserFailure(
              {
                body: {
                  errors: [
                    {
                      field: 'username',
                      codes: ['unique'],
                    },
                  ],
                },
              },
              dispatch
            )
          }
        })

        break
      case SCREEN.USER_NAME_DIALOG:
        if (isExternalUser) {
          setScreen(SCREEN.CHOOSE_AUTH_METHOD)
        } else if (!props.isCreateSysadminFlow) {
          setScreen(SCREEN.CHOOSE_ROLES_METHOD)
        } else {
          submit()
        }
        break
      case SCREEN.CHOOSE_AUTH_METHOD:
        submit()
        break
      case SCREEN.CHOOSE_GROUP:
        if (values.emails.length === 1 && isCurrentUserSysadmin) {
          setScreen(SCREEN.USER_NAME_DIALOG)
        } else if (isExternalUser) {
          setScreen(SCREEN.CHOOSE_AUTH_METHOD)
        } else {
          setScreen(SCREEN.CHOOSE_ROLES_METHOD)
        }
        break
      case SCREEN.USER_CREATED_DIALOG:
        props.cancelHandler()
        break
      default:
        return null
    }
  }

  const isValidName = name => checkTextHasNonWhitespaceContent(name)

  const handleCancel = e => {
    if (e === 'Escape') {
      props.cancelHandler()
    } else {
      switch (screen) {
        case SCREEN.USER_DETAILS_FORM:
          props.cancelHandler()
          break
        case SCREEN.CHOOSE_AUTH_METHOD:
          if (isExternalUser) {
            setScreen(SCREEN.USER_DETAILS_FORM) //skip over roles
          } else {
            setScreen(SCREEN.CHOOSE_ROLES_METHOD)
          }
          break
        case SCREEN.CHOOSE_ROLES_METHOD:
          setValues(initialValueState)
          setScreen(screen - 1)
          break
        case SCREEN.USER_NAME_DIALOG:
          if (
            values.organisation !== undefined &&
            values?.organisation?.id !== -1
          ) {
            setScreen(SCREEN.CHOOSE_GROUP)
          } else {
            setValues(initialValueState)
            setScreen(SCREEN.USER_DETAILS_FORM)
          }

          break
        case SCREEN.CHOOSE_GROUP:
          setValues(initialValueState)
          setScreen(SCREEN.USER_DETAILS_FORM)
          break
        default:
          setScreen(screen - 1)
          break
      }
    }
  }

  const isValidUserValues = () => {
    return (
      !values.emails.map(v => isValidEmail(v)).includes(false) &&
      values.emails.length > 0 &&
      !values.emailErrors
    )
  }

  const canContinue = () => {
    switch (screen) {
      case SCREEN.USER_DETAILS_FORM:
        return isValidUserValues()
      default:
        return true
    }
  }

  const getScreen = () => {
    switch (screen) {
      case SCREEN.CHOOSE_AUTH_METHOD:
        return (
          <CreateUserFlowUserTypeContent
            value={authType}
            onChange={value => setAuthType(value)}
            organisation={
              isCurrentUserSysadmin ? values.organisation : selectedOrganisation
            }
          />
        )
      case SCREEN.USER_DETAILS_FORM:
        return (
          <CreateUserFlowUserDetailsContent
            values={values}
            setValues={setValues}
            authType={authType}
            usernameValidationMessage={props.usernameValidationMessage}
            clearUsernameValidation={props.clearUsernameValidation}
            isValidName={isValidName}
            isExternalUser={isExternalUser}
            setIsExternalUser={setIsExternalUser}
            organisations={[NONE_ORG, ...organisations]}
            setUserType={setUserType}
            userType={userType}
            isCreateSysadminFlow={props.isCreateSysadminFlow}
            seatCountError={seatCountError}
          />
        )
      case SCREEN.USER_CREATED_DIALOG:
        return (
          <CreateUserFlowCreatedContent
            authType={authType}
            email={values.email}
          />
        )
      case SCREEN.CHOOSE_ROLES_METHOD:
        return (
          <CreateUserFlowRolesContent values={values} setValues={setValues} />
        )
      case SCREEN.USER_NAME_DIALOG:
        return (
          <CreateUserFlowUserNameContent
            values={values}
            setValues={setValues}
          />
        )
      case SCREEN.CHOOSE_GROUP:
        let orgGroups
        if (organisationGroups.length > 0) {
          orgGroups = organisationGroups.filter(
            g => g.organisation.id === values.organisation.id
          )
        } else {
          orgGroups = selectedOrgGroups
        }
        return (
          <CreateUserFlowGroupSelector
            values={values}
            setValues={setValues}
            groups={orgGroups}
            canEdit={isExternalUser}
            isSysAdmin={isCurrentUserSysadmin}
            setSelectedOrgGroups={setSelectedOrgGroups}
          />
        )
      default:
        return null
    }
  }

  const getActionLabel = () => {
    const org = isCurrentUserSysadmin
      ? values.organisation
      : selectedOrganisation
    const noOrgs =
      !org?.microsoftSsoEnabled &&
      !org?.samlSsoEnabled &&
      !org?.oktaSsoEnabled &&
      !org?.googleSsoEnabled
    if (screen === SCREEN.USER_NAME_DIALOG && props.isCreateSysadminFlow) {
      return t('userList.confirmationDialog.createAccount')
    }

    switch (screen) {
      case SCREEN.USER_CREATED_DIALOG:
        return t('common.close')
      case SCREEN.CHOOSE_ROLES_METHOD:
        if (noOrgs) {
          return t('userList.confirmationDialog.createAccount')
        } else {
          return t('userList.confirmationDialog.actionText')
        }
      case SCREEN.CHOOSE_AUTH_METHOD:
        return t('userList.confirmationDialog.createAccount')
      default:
        return t('userList.confirmationDialog.actionText')
    }
  }
  const getCancelText = () => {
    switch (screen) {
      case SCREEN.USER_DETAILS_FORM:
        return t('common.cancel')
      case SCREEN.USER_CREATED_DIALOG:
        return t('common.close')
      default:
        return t('common.back')
    }
  }

  const getSubtitleText = () => {
    switch (screen) {
      case SCREEN.USER_DETAILS_FORM:
        return authType === SSO.JURALIO
          ? null
          : authType === SSO.MICROSOFT
            ? t('userCreation.enterMicrosoftEmail')
            : t('userCreation.enterOktaEmail')
      default:
        return null
    }
  }

  const getTitle = () => {
    switch (screen) {
      case SCREEN.USER_DETAILS_FORM:
        return props.isCreateSysadminFlow
          ? t('userList.createSysadminAccount')
          : t('userList.createUserAccount')
      case SCREEN.CHOOSE_ROLES_METHOD:
        return t('userList.assignUserRoles')
      case SCREEN.CHOOSE_AUTH_METHOD:
        return t('userList.howWillTheyLogin')
      case SCREEN.CHOOSE_GROUP:
        return t('What group does this person belong to?')
      default:
        return null
    }
  }

  const getIcon = () => {
    switch (screen) {
      case SCREEN.USER_DETAILS_FORM:
        return PersonAddIcon
      case SCREEN.CHOOSE_ROLES_METHOD:
        return PersonAddIcon
      case SCREEN.CHOOSE_AUTH_METHOD:
        return PersonAddIcon
      default:
        return null
    }
  }

  return (
    <JuralioDialog
      open={true}
      titleText={getTitle()}
      subtitleText={getSubtitleText()}
      titleIcon={getIcon()}
      handleCancel={handleCancel}
      handleAction={handleCreate}
      actionLabel={getActionLabel()}
      hideCancel={screen === SCREEN.USER_CREATED_DIALOG}
      disabled={!canContinue() || loading || seatCountError !== ''}
      onClose={() => {}}
      cancelText={getCancelText()}
      context={screen}
      disableSingleClickAction={true}
      showLoadingBar={loading}
      loadingText={t('userCreation.creatingUsers')}
    >
      <DialogContent>{getScreen(values)}</DialogContent>
    </JuralioDialog>
  )
}

export default CreateUserFlow
