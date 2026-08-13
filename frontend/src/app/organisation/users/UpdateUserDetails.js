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

import InfoIcon from '@mui/icons-material/Info'
import { Typography, useMediaQuery, useTheme } from '@mui/material'
import Dialog from '@mui/material/Dialog'
import DialogContent from '@mui/material/DialogContent'
import DialogTitle from '@mui/material/DialogTitle'
import TextField from '@mui/material/TextField'
import PropTypes from 'prop-types'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { withStyles } from 'tss-react/mui'
import { ORGANISATION_SELECTOR_OPTIONS } from '../../../admin/organisations/organisation-actions'
import logo from '../../../assets/images/juralio-logo-70-opacity.svg'
import ErrorBox from '../../../components/data-display/error-box/ErrorBox'
import InfoHelperText from '../../../components/data-display/info-helper-text/InfoHelperText'
import UserAvatar from '../../../components/data-display/user/user-avatar/UserAvatar'
import DialogActions from '../../../components/dialog/common/DialogActions'
import { useUserAuthData } from '../../../hooks/user-hooks'
import {
  checkNameIsValidLength,
  checkTextHasNonWhitespaceContent,
  isValidEmail,
} from '../../../services/helpers/text/text-util-helper'
import { isSysAdmin } from '../../../services/user/helper/user-role-service'
import { JuralioCoreColors } from '../../../theme/juralio-core-colors'
import { JuralioNamedColours } from '../../../theme/juralio-named-colours'
import rawColours from '../../../theme/raw-colours'
import {
  DESKTOP_DIALOG_HEIGHT,
  MAX_ORG_OWNER_COUNT,
  USER_ROLES,
} from '../../constants'
import AccountOptions from './AccountOptions'
import AccountSecurity from './AccountSecurity'
import Association from './Association'
import OrganisationSelector from './OrganisationSelector'
import RoleSelection from './RoleSelection'
import GroupSelector from './GroupSelector'

const styles = theme => ({
  optionsContainer: {
    paddingBottom: theme.spacing(1.5),
    paddingLeft: theme.spacing(3),
    backgroundColor: JuralioCoreColors.primary[100],
  },
  firstNameField: {
    marginRight: theme.spacing(2),
  },
  lastNameField: {
    marginRight: theme.spacing(2),
  },
  emailField: {
    display: 'block',
    marginTop: theme.spacing(2),
  },
  paperRoot: {
    flexDirection: 'row',
    maxWidth: 'none',
    maxHeight: DESKTOP_DIALOG_HEIGHT,
    minHeight: DESKTOP_DIALOG_HEIGHT,
    overflow: 'hidden',
  },
  mobilePaperRoot: {
    flexDirection: 'column',
  },
  dialogContent: {
    padding: 0,
    overflow: 'hidden',
  },
  title: {
    padding: 0,
    paddingBottom: theme.spacing(4.5),
    wordWrap: 'break-word',
  },
  leftPanel: {
    display: 'flex',
    flexDirection: 'column',
  },
  mainContent: {
    padding: theme.spacing(4.5, 8, 17.5),
  },
  rightPanel: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(4.5),
    paddingLeft: theme.spacing(4),
    paddingRight: theme.spacing(7),
    backgroundColor: JuralioNamedColours.beige[200],
  },
  logoImage: {
    position: 'absolute',
    bottom: -65,
    left: -110,
    width: theme.spacing(25),
    height: theme.spacing(25),
  },
  userDetailsRow: {
    display: 'flex',
  },
  warningError: {
    paddingTop: theme.spacing(1),
    paddingBottom: theme.spacing(2),
  },
  helperText: {
    width: theme.spacing(60),
    paddingTop: theme.spacing(1),
  },
  errorTextWrapper: {
    position: 'absolute',
    bottom: theme.spacing(10),
    left: theme.spacing(25),
    height: theme.spacing(2),
  },
  errorText: { color: rawColours.primary.red.primary },
})

const UpdateUserDetails = props => {
  const { t } = useTranslation()
  const theme = useTheme()
  const fullScreen = useMediaQuery(theme.breakpoints.down('md'))
  const isValidName = name => checkTextHasNonWhitespaceContent(name)
  const [validation, setValidation] = useState({})
  const [values, setValues] = useState({ organisation: {} })
  const userAuthData = useUserAuthData()
  const isCurrentUserSysadmin = isSysAdmin(userAuthData)
  const instanceSettings = useSelector(state => state.instanceSettings.settings)
  const allGroups = useSelector(state => state.organisation.groupList)

  const auth = useSelector(state => state.auth.data.details)

  useEffect(() => {
    const {
      firstname,
      lastname,
      username,
      roles,
      organisation,
      isExternal,
      id,
    } = props.user

    setValues({
      firstname,
      lastname,
      username,
      id,
      avatarColorIndex: props.user.avatarColorIndex,
      avatarImageIndex: props.user.avatarImageIndex,
      roles: roles ? roles : [],
      organisation: {
        id: organisation ? `${organisation.id}` : undefined,
      },
      originalOrganisation: {
        id: organisation ? `${organisation.id}` : undefined,
      },
      isExternal,
      enabled: props.user.enabled,
      group: props.user.organisationGroup,
      originalGroup: props.user.organisationGroup,
    })
  }, [props.user])

  const updateValue = (fieldName, value, validator, validationMessage) => {
    setValues({ ...values, [fieldName]: value })
    setValidation({
      ...validation,
      [fieldName]: !validator || validator(value) ? null : validationMessage,
    })
  }

  const handleAssociationChange = association => {
    updateValue('isExternal', association)
  }

  const handleRoleChange = function (event) {
    let roles = [...values.roles]
    const { checked, value } = event.target

    if (checked) {
      roles.push(value)
      if (
        value === USER_ROLES.ROLE_ORG_OWNER &&
        !roles.includes(USER_ROLES.ROLE_ORG_ADMIN)
      ) {
        roles.push(USER_ROLES.ROLE_ORG_ADMIN)
      }
    } else {
      roles = roles.filter(role => role !== value)
      if (value === USER_ROLES.ROLE_MATTER_CREATOR) {
        roles = roles.filter(
          role => role !== USER_ROLES.ROLE_NEUTRAL_MATTER_CREATOR
        )
      }
    }
    setValues({ ...values, roles })
  }

  const isOnlyOrgOwner = user => {
    if (!props.user.roles || !user.roles) {
      return true
    }
    if (props.user.roles.includes(USER_ROLES.ROLE_SYS_ADMIN)) {
      return false //sysadmin bypass this requirment as they're not in an org
    }
    const isOrgOwner = props.user.roles.includes(USER_ROLES.ROLE_ORG_OWNER)
    if (!isOrgOwner) {
      return false
    }
    if (
      isOrgOwner &&
      props.getOrgOwners(props.user).length === 1 &&
      !user.roles.includes(USER_ROLES.ROLE_ORG_OWNER)
    ) {
      return true
    }
  }

  const selectOrganisation =
    !props.isEditingSelf &&
    !(
      props.getOrgOwners(props.user).length === 1 &&
      props.getOrgOwners(props.user)[0].id === props.user.id
    )
      ? organisationId => {
          updateValue('organisation', {
            id: organisationId,
            name:
              organisationId === ORGANISATION_SELECTOR_OPTIONS.NONE
                ? ''
                : getOrganisationNameById(organisationId).name,
          })
        }
      : undefined
  const saveChanges = () => props.saveChanges(values)

  const hasOrgOwnerLimitBeenReached = () => {
    let owners = props.getOrgOwners(props.user)
    return (
      owners.filter(u => u.id !== props.user.id).length >= MAX_ORG_OWNER_COUNT
    )
  }

  const shouldEnableSave =
    props.user.isThirdPartyUser ||
    ((isValidName(values.firstname) || !props.user.firstname) &&
      (isValidName(values.lastname) || !props.user.lastname) &&
      isValidEmail(values.username) &&
      !isOnlyOrgOwner(values))

  const getOrganisationNameById = id =>
    props.availableOrganisations.filter(org => org.id.toString() === id)[0]

  const isOwner = () => {
    if (values.roles) {
      return values.roles.includes(USER_ROLES.ROLE_ORG_OWNER)
    }
    return false
  }

  return (
    <Dialog
      open={props.open}
      onClose={props.closeHandler}
      aria-labelledby="form-dialog-title"
      data-test="update-user-dialog"
      fullScreen={fullScreen}
      slotProps={{
        paper: {
          className: fullScreen
            ? props.classes.mobilePaperRoot
            : props.classes.paperRoot,
        },
      }}
    >
      <div className={props.classes.leftPanel}>
        <div className={props.classes.mainContent}>
          <DialogTitle className={props.classes.title} id="form-dialog-title">
            <Typography variant="h6" data-test="dialog-title">
              {props.isUserSysAdmin
                ? t('userDetails.sysAdminTitle')
                : t('userDetails.title')}
            </Typography>
          </DialogTitle>
          <DialogContent className={props.classes.dialogContent}>
            <div className={props.classes.userDetailsRow}>
              <TextField
                data-test="first-name-field"
                className={props.classes.firstNameField}
                label={t('userDetails.firstNameLabel')}
                disabled={props.user.isThirdPartyUser}
                type="text"
                value={values.firstname}
                onChange={e => {
                  if (checkNameIsValidLength(e.target.value))
                    updateValue(
                      'firstname',
                      e.target.value,
                      isValidName,
                      t('commonValidationMessages.requiredField')
                    )
                }}
                helperText={validation.firstname}
                error={
                  validation.firstname &&
                  validation.firstname.length > 0 &&
                  props.user.firstname
                }
              />
              <TextField
                data-test="last-name-field"
                className={props.classes.lastNameField}
                label={t('userDetails.lastNameLabel')}
                type="text"
                value={values.lastname}
                disabled={props.user.isThirdPartyUser}
                onChange={e => {
                  if (checkNameIsValidLength(e.target.value))
                    updateValue(
                      'lastname',
                      e.target.value,
                      isValidName,
                      t('commonValidationMessages.requiredField')
                    )
                }}
                helperText={validation.lastname}
                error={
                  validation.lastname &&
                  validation.lastname.length > 0 &&
                  props.user.lastname
                }
              />
              <UserAvatar user={values} large />
            </div>
            <TextField
              data-test="email-field"
              className={props.classes.emailField}
              label={t('common.email')}
              type="text"
              value={values.username}
              disabled={props.user.isThirdPartyUser || props.isEditingSelf}
              onChange={e => {
                updateValue(
                  'username',
                  e.target.value,
                  isValidEmail,
                  t('commonValidationMessages.requiredEmailField')
                )
              }}
              helperText={validation.username}
              error={validation.username}
              fullWidth
            />
            {!props.isUserSysAdmin && (
              <>
                <OrganisationSelector
                  currentOrganisationId={values.organisation.id}
                  organisations={props.availableOrganisations}
                  selectOrganisation={selectOrganisation}
                  currentOrganisation={values.organisation}
                  originalOrganisation={values.originalOrganisation}
                  isSysAdmin={props.isSystemAdministrator}
                />
                <GroupSelector
                  currentGroupId={values?.group?.id}
                  canEdit={
                    !props.isEditingSelf &&
                    props.user.isExternal &&
                    isCurrentUserSysadmin
                  }
                  updateValue={updateValue}
                  currentGroup={values?.group}
                  originalGroup={values?.originalGroup}
                  currentOrgId={values?.organisation?.id}
                  isSysAdmin={isCurrentUserSysadmin}
                  allGroups={allGroups}
                />
              </>
            )}
            {props.user.isThirdPartyUser &&
              props.user.firstname === '' &&
              props.user.lastname === '' && (
                <div className={props.classes.helperText}>
                  <InfoHelperText
                    text={t('userDetails.microsoftUserNotLoggedIn')}
                    icon={InfoIcon}
                    dataTest="microsoft-user-not-logged-in"
                  />
                </div>
              )}
            <img
              src={logo}
              alt={t('notificationIcon.notificationIconAlt')}
              className={props.classes.logoImage}
            />
            <div className={props.classes.errorTextWrapper}>
              {isOnlyOrgOwner(values) && (
                <Typography
                  className={props.classes.errorText}
                  data-test="update-user-error-message"
                >
                  {t('commonValidationMessages.cannotRemoveOnlyOrgOwner')}
                </Typography>
              )}
            </div>
          </DialogContent>
        </div>
        <DialogActions
          disabled={!shouldEnableSave}
          handleAction={saveChanges}
          disableSingleClickAction
          handleCancel={props.closeHandler}
          actionLabel={t('common.save')}
        />
      </div>
      <div className={props.classes.rightPanel}>
        <DialogContent className={props.classes.dialogContent}>
          {props.isUserSysAdmin ||
          (isCurrentUserSysadmin && props.isEditingSelf) ? null : (
            <Association
              setIsExternalUser={handleAssociationChange}
              isExternalUser={values.isExternal}
              disabled={
                props.isEditingSelf ||
                (values.isExternal && instanceSettings.fullSeats === 0) ||
                (!values.isExternal && instanceSettings.limitedSeats === 0)
              }
              tooltip={
                (values.isExternal && instanceSettings.fullSeats === 0) ||
                (!values.isExternal && instanceSettings.limitedSeats === 0)
              }
            />
          )}
          {!values.isExternal && !props.isUserSysAdmin && (
            <RoleSelection
              transparentBackground
              handleRoleChange={handleRoleChange}
              user={values}
              isOrgAdminDisabled={props.isEditingSelf}
              userIsOwner={isOwner()}
              isMatterCreatorDisabled={props.isMatterCreatorDisabled}
              isKnowledgeManagerDisabled={props.isKnowledgeManagerDisabled}
              isSystemAdministrator={props.isSystemAdministrator}
              isOrgOwner={props.isOrgOwner}
              hasOrgOwnerLimitBeenReached={hasOrgOwnerLimitBeenReached}
            />
          )}
          {values.isExternal && values.roles.length > 1 && (
            <div className={props.classes.warningError}>
              <ErrorBox
                error={t('userCreation.externalUsersLoseTheirRolesError')}
                padding={false}
              />
            </div>
          )}
          {(props.isUserSysAdmin || values.organisation?.id > 0) && (
            <AccountSecurity
              organisation={
                props.availableOrganisations.filter(
                  org => org.id.toString() === values.organisation.id
                )[0]
              }
              convertToOkta={props.convertToOkta}
              convertToMS={props.convertToMS}
              convertToSaml={props.convertToSaml}
              convertToJuralio={props.convertToJuralio}
              convertToGoogle={props.convertToGoogle}
              isThirdPartyUser={props.user.isThirdPartyUser}
              thirdPartyProvider={props.user.thirdPartyProvider}
              isSelf={props.user.id === auth.id}
              closeHandler={props.closeHandler}
              isUserSysAdmin={props.isUserSysAdmin}
            />
          )}
          <AccountOptions
            hasLoggedIn={
              props.user.mostRecentActivityTime !== null &&
              !props.user.isThirdPartyUser
            }
            isThirdPartyUser={props.user.isThirdPartyUser}
            resetPassword={props.resetPassword}
            resendInv={props.resendInv}
            handleRoleChange={handleRoleChange}
            resetFtue={props.resetFtue}
            resetTours={props.resetTours}
            user={values}
            hideResetPassword={values.id === auth.id && !isCurrentUserSysadmin}
          />
        </DialogContent>
      </div>
    </Dialog>
  )
}

UpdateUserDetails.propTypes = {
  /** user */
  user: PropTypes.object.isRequired,
  /** saveChanges */
  saveChanges: PropTypes.func.isRequired,
  /** open */
  open: PropTypes.bool.isRequired,
  /** closeHandler */
  closeHandler: PropTypes.func.isRequired,
  /** isOrgAdminDisabled */
  isEditingSelf: PropTypes.bool.isRequired,
  /** isMatterCreatorDisabled */
  isMatterCreatorDisabled: PropTypes.bool.isRequired,
  /** List of available Organisations */
  availableOrganisations: PropTypes.array.isRequired,
  /** Reset password action function*/
  resetPassword: PropTypes.func.isRequired,
  convertToMS: PropTypes.func.isRequired,
}

export default withStyles(UpdateUserDetails, styles)
