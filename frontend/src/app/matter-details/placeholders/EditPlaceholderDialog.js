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

import PeopleIcon from '@mui/icons-material/People'
import { Button, TextField, Typography } from '@mui/material'
import { makeStyles } from 'tss-react/mui'
import DialogContent from '@mui/material/DialogContent'
import { StatusCodes } from 'http-status-codes'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import JuralioDialog from '../../../components/dialog/juralio-dialog/JuralioDialog'
import placeholderService from '../../../services/placeholders/placeholder-service'
import { EditIcon } from '../../../theme/navigation/CommonIcons'
import rawColours from '../../../theme/raw-colours'
import {
  checkTextHasNonWhitespaceContent,
  isValidEmail,
} from '../../../services/helpers/text/text-util-helper'
import { useSelector } from 'react-redux'

const useStyles = makeStyles()(theme => ({
  nameFieldContainer: {
    scale: '1.3',
    paddingLeft: '15%',
    paddingTop: '5%',
  },
  emailContianer: {
    scale: '1.2',
    paddingLeft: '15%',
    paddingRight: '15%',
    paddingTop: '5%',
  },
  error: {
    color: rawColours.error.primary,
    marginLeft: 'auto',
    marginRight: 'auto',
    marginTop: theme.spacing(4),
  },
}))

const EditPlaceholderDialog = props => {
  const [currentPlaceholder] = useState(props.placeholder)
  const { classes } = useStyles()
  const { t } = useTranslation()
  const [firstName, setFirstName] = useState(props.placeholder.firstName)
  const [lastName, setLastName] = useState(props.placeholder.lastName)
  const [emailAddress, setEmailAddress] = useState(
    props.placeholder.emailAddress
  )
  const [isValidated, setIsValidated] = useState({
    firstName: true,
    lastName: true,
    emailAddress: true,
  })
  const [showLoadingBar, setShowLoadingBar] = useState(false)
  const [showDialog, setShowDialog] = useState(false)
  const [showError, setShowError] = useState(false)
  const [showEmailInUseError, setShowEmailInUseError] = useState(false)
  const [showNameInUseError, setShowNameInUseError] = useState(false)
  const matterTeam = useSelector(state => state.matterTeam.mainPage.team)

  const handleAction = () => {
    setShowLoadingBar(true)
    if (firstName?.length === 0) {
      setIsValidated(isValidated => ({
        ...isValidated,
        firstName: false,
      }))
    } else if (lastName?.length === 0) {
      setIsValidated(isValidated => ({
        ...isValidated,
        lastName: false,
      }))
    } else {
      let payload = {
        firstName,
        lastName,
        emailAddress,
      }
      placeholderService
        .updatePlaceholder(
          currentPlaceholder.matter.id,
          currentPlaceholder.id,
          payload
        )
        .then(res => {
          if (res.status === StatusCodes.OK) {
            setShowDialog(false)
          } else {
            setShowError(true)
            setShowLoadingBar(false)
          }
          props.callBack()
        })
    }
  }

  const validateNameUse = (matterTeam, firstName, lastName) => {
    matterTeam = matterTeam.filter(
      item =>
        item.user.firstname === firstName && item.user.lastname === lastName
    )
    if (matterTeam.length > 0) {
      return false
    } else {
      return true
    }
  }
  const validateEmailUse = (matterTeam, email) => {
    matterTeam = matterTeam.filter(item => item.user.username === email)
    if (matterTeam.length > 0) {
      return false
    } else {
      return true
    }
  }

  const handleFirstNameInput = e => {
    setFirstName(e.target.value)

    if (e.target.value?.length > 0 && e.target.value?.length < 31) {
      if (validateNameUse(matterTeam, e.target.value, lastName)) {
        setShowNameInUseError(false)
      } else {
        setShowNameInUseError(true)
      }
      setIsValidated(isValidated => ({
        ...isValidated,
        firstName: true,
      }))
    } else {
      setIsValidated(isValidated => ({
        ...isValidated,
        firstName: false,
      }))
    }
  }

  const handleLastNameInput = e => {
    setLastName(e.target.value)
    if (e.target.value?.length > 0 && e.target.value?.length < 31) {
      if (validateNameUse(matterTeam, firstName, e.target.value)) {
        setShowNameInUseError(false)
      } else {
        setShowNameInUseError(true)
      }
      setIsValidated(isValidated => ({
        ...isValidated,
        lastName: true,
      }))
    } else {
      setIsValidated(isValidated => ({
        ...isValidated,
        lastName: false,
      }))
    }
  }

  const handleEmailInput = e => {
    setEmailAddress(e.target.value)
    if (isValidEmail(e.target.value)) {
      if (validateEmailUse(matterTeam, e.target.value)) {
        setShowEmailInUseError(false)
      } else {
        setShowEmailInUseError(true)
      }
      setIsValidated(isValidated => ({
        ...isValidated,
        emailAddress: true,
      }))
    } else {
      if (e.target.value === '') {
        setShowEmailInUseError(false)
        setIsValidated(isValidated => ({
          ...isValidated,
          emailAddress: true,
        }))
      } else {
        setIsValidated(isValidated => ({
          ...isValidated,
          emailAddress: false,
        }))
      }
    }
  }
  return (
    <>
      <Button
        variant="text"
        color="primary"
        data-test="edit-placeholder-button"
        onClick={() => setShowDialog(true)}
      >
        <EditIcon />
      </Button>
      <span>
        {showDialog && (
          <JuralioDialog
            style={{ zIndex: 10001 }}
            open={true}
            titleText={t('matterAdmin.placeholders.dialog.editPlaceholder')}
            titleIcon={PeopleIcon}
            actionLabel={t('common.save')}
            handleAction={() => {
              handleAction()
            }}
            handleCancel={() => {
              setShowDialog(false)
              setShowEmailInUseError(false)
              setShowNameInUseError(false)
            }}
            cancelText={t('common.cancel')}
            disabled={
              !Object.values(isValidated).every(value => value === true) ||
              firstName?.length === 0 ||
              lastName?.length === 0 ||
              (firstName === currentPlaceholder?.firstName &&
                lastName === currentPlaceholder?.lastName &&
                emailAddress === currentPlaceholder?.emailAddress) ||
              showEmailInUseError ||
              showNameInUseError ||
              !checkTextHasNonWhitespaceContent(firstName) ||
              !checkTextHasNonWhitespaceContent(lastName)
            }
            showLoadingBar={showLoadingBar}
            loadingText={t('matterAdmin.placeholders.dialog.editLoading')}
          >
            <DialogContent data-test="dialog-content">
              <>
                <div className={classes.nameFieldContainer}>
                  <span style={{ padding: '8px' }}>
                    <TextField
                      data-test="firstname-input"
                      label={t(
                        'matterAdmin.placeholders.dialog.firstNameLabel'
                      )}
                      onChange={handleFirstNameInput}
                      value={firstName}
                      error={!isValidated.firstName}
                      helperText={
                        !isValidated.firstName && firstName.length > 30
                          ? t(
                              'matterAdmin.placeholders.dialog.helperTextMaxChars'
                            )
                          : !isValidated.firstName
                            ? t(
                                'matterAdmin.placeholders.dialog.helperTextEmpty'
                              )
                            : ''
                      }
                      autoWidth
                    ></TextField>
                  </span>
                  <span style={{ padding: '8px' }}>
                    <TextField
                      data-test="lastname-input"
                      label={t('matterAdmin.placeholders.dialog.lastNameLabel')}
                      onChange={handleLastNameInput}
                      value={lastName}
                      error={!isValidated.lastName}
                      helperText={
                        !isValidated.lastName && lastName.length > 30
                          ? t(
                              'matterAdmin.placeholders.dialog.helperTextMaxChars'
                            )
                          : !isValidated.lastName
                            ? t(
                                'matterAdmin.placeholders.dialog.helperTextEmpty'
                              )
                            : ''
                      }
                      autoWidth
                    ></TextField>
                  </span>
                </div>
                <br></br>
                <div className={classes.emailContianer}>
                  <TextField
                    data-test="email-input"
                    label={t('matterAdmin.placeholders.dialog.emailLabel')}
                    onChange={handleEmailInput}
                    value={emailAddress}
                    error={!isValidated.emailAddress}
                    helperText={
                      !isValidated.emailAddress
                        ? t('Invalid email address')
                        : t('matterAdmin.placeholders.dialog.emailHelper')
                    }
                    fullWidth
                  ></TextField>
                </div>
                {showError && (
                  <Typography
                    className={classes.error}
                    data-test="create-error-text"
                  >
                    {t('matterAdmin.placeholders.dialog.createError')}
                  </Typography>
                )}
                {showNameInUseError && (
                  <Typography
                    className={classes.error}
                    data-test="name-in-use-error-text"
                  >
                    {t('matterAdmin.placeholders.dialog.nameInUseError')}
                  </Typography>
                )}
                {showEmailInUseError && (
                  <Typography
                    className={classes.error}
                    data-test="email-in-use-error-text"
                  >
                    {t('matterAdmin.placeholders.dialog.emailInUseError')}
                  </Typography>
                )}
              </>
            </DialogContent>
          </JuralioDialog>
        )}
      </span>
    </>
  )
}

export default EditPlaceholderDialog
