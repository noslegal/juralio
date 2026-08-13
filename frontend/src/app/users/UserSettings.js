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
import { Button, Typography } from '@mui/material'
import DialogTitle from '@mui/material/DialogTitle'
import TextField from '@mui/material/TextField'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { makeStyles } from 'tss-react/mui'
import UserAvatar from '../../components/data-display/user/user-avatar/UserAvatar'
import {
  checkNameIsValidLength,
  checkTextHasNonWhitespaceContent,
  isValidEmail,
} from '../../services/helpers/text/text-util-helper'
import organisationService from '../../services/organisation/organisation-service'
import { setAvailableTours } from '../../services/tour/tour-actions'
import tourService from '../../services/tour/tour-service'
import { showSnackbar } from '../global-snackbar/global-snackbar-actions'
import AccountOptions from '../organisation/users/AccountOptions'
import UserAvatarEditDialogContainer from './avatar/UserAvatarEditDialogContainer'
import ConfirmPasswordDialog from './password/ConfirmPasswordDialog'
import { resetFtue, updateSelf } from './users-actions'

const useStyles = makeStyles()(theme => ({
  nameField: {
    marginRight: theme.spacing(2),
    width: '40%',
  },
  emailField: {
    display: 'block',
    marginTop: theme.spacing(2),
    width: `calc(80% + ${theme.spacing(2)})`,
  },
  title: {
    padding: 0,
    paddingBottom: theme.spacing(4.5),
    wordWrap: 'break-word',
    display: 'flex',
  },
  titleText: {
    alignSelf: 'center',
    marginLeft: theme.spacing(),
  },
  leftPanel: {
    display: 'flex',
    flexDirection: 'column',
  },
  mainContent: {
    padding: theme.spacing(4.5, 8, 26),
  },
  userDetailsRow: {
    display: 'flex',
  },
  saveButton: {
    marginTop: theme.spacing(2),
  },
  personIcon: {},
  accountWrapper: {
    marginTop: theme.spacing(2),
  },
  editTextDiv: {
    display: 'grid',
    textAlign: 'center',
  },
}))

const UserSettings = props => {
  const { t } = useTranslation()
  const { classes } = useStyles()
  const dispatch = useDispatch()
  const isValidName = name => checkTextHasNonWhitespaceContent(name)
  const [validation, setValidation] = useState({})
  const [values, setValues] = useState({ organisation: {} })
  const [org, setOrg] = useState('')
  const [showAvatarEdit, setShowAvatarEdit] = useState(false)
  const [showPasswordDialog, setShowPasswordDialog] = useState(false)

  const { firstname, lastname, username } = props.user

  useEffect(() => {
    setValues({
      firstname,
      lastname,
      username,
    })
    organisationService.getCurrentOrganisation().then(res => {
      if (res.status === 200 && res.body) {
        setOrg(res.body.name)
      }
    })
  }, [firstname, lastname, username, props.user])

  const validUpdate = () => {
    return (
      firstname !== values.firstname ||
      lastname !== values.lastname ||
      username !== values.username
    )
  }

  const updateValue = (fieldName, value, validator, validationMessage) => {
    setValues({ ...values, [fieldName]: value })
    setValidation({
      ...validation,
      [fieldName]: !validator || validator(value) ? null : validationMessage,
    })
  }

  const shouldEnableSave =
    (isValidName(values.firstname) || !firstname) &&
    (isValidName(values.lastname) || !lastname) &&
    !props.user.isThirdPartyUser &&
    isValidEmail(values.username) &&
    validUpdate()

  const _resetFtue = () => {
    sessionStorage.removeItem('hideTips')
    dispatch(resetFtue(props.user.id))
  }

  const _resetTours = () => {
    tourService.resetTours(props.user.id).then(res => {
      if (res.status === 200) {
        dispatch(setAvailableTours(res.body))
        dispatch(showSnackbar(t('tours.common.resetSuccess')))
      }
    })
  }
  const saveChanges = async properties => {
    dispatch(updateSelf(properties))
  }

  const handlePasswordDialog = password => {
    saveChanges({ ...values, password })
    setShowPasswordDialog(false)
  }
  return (
    <>
      <div className={classes.leftPanel}>
        <div className={classes.mainContent}>
          <DialogTitle className={classes.title} id="form-title">
            <PersonIcon fontSize="large" className={classes.personIcon} />
            <Typography
              className={classes.titleText}
              variant="h5"
              data-test="title"
            >
              {t('userSettings.header')}
            </Typography>
          </DialogTitle>
          <div className={classes.userDetailsRow}>
            <TextField
              data-test="first-name-field"
              className={classes.nameField}
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
                firstname
              }
            />
            <TextField
              data-test="last-name-field"
              className={classes.nameField}
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
                lastname
              }
            />
            <div className={classes.editTextDiv}>
              <UserAvatar
                user={props.user}
                large
                editable={true}
                onClick={() => {
                  setShowAvatarEdit(true)
                }}
              />
              <Typography style={{ fontSize: 'small' }}>
                {t('common.edit')}
              </Typography>
            </div>
          </div>
          <TextField
            data-test="email-field"
            className={classes.emailField}
            label={t('common.email')}
            type="text"
            value={values.username}
            disabled={props.user.isThirdPartyUser}
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
          <TextField
            data-test="org-field"
            className={classes.emailField}
            label={t('common.organisation')}
            type="text"
            value={org}
            disabled={true}
            fullWidth
          />

          <Button
            className={classes.saveButton}
            variant="outlined"
            data-test={'save-button'}
            disabled={!shouldEnableSave}
            onClick={() => {
              return username !== values.username
                ? setShowPasswordDialog(true)
                : saveChanges(values)
            }}
          >
            {t('common.save')}
          </Button>
          <div className={classes.accountWrapper}>
            <AccountOptions
              isThirdPartyUser={props.user.isThirdPartyUser}
              resetFtue={_resetFtue}
              resetTours={_resetTours}
              user={values}
              hideResetPassword={true}
              hideResetInvite={true}
              noPadding={true}
            />
          </div>
        </div>
      </div>
      {showAvatarEdit && (
        <UserAvatarEditDialogContainer
          user={props.user}
          closeDialog={() => setShowAvatarEdit(false)}
        />
      )}
      {showPasswordDialog && (
        <ConfirmPasswordDialog
          handleCancel={setShowPasswordDialog}
          handleAction={handlePasswordDialog}
          text={{
            header: t('userSettings.confirmPasswordHeader'),
            subHeader: t('userSettings.confirmPasswordSubHeader'),
            actionLabel: t('common.confirm'),
            placeholder: t('passwords.enterPassword'),
          }}
        />
      )}
    </>
  )
}

export default UserSettings
