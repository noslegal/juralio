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
import { TextField, Typography } from '@mui/material'
import DialogContent from '@mui/material/DialogContent'
import { StatusCodes } from 'http-status-codes'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { useLocation } from 'react-router'
import { makeStyles } from 'tss-react/mui'
import JuralioDialog from '../../../components/dialog/juralio-dialog/JuralioDialog'
import {
  getPostIdFromLocation,
  getProjectIdFromLocation,
} from '../../../components/navigation/common/location-context-helper'
import placeholderService from '../../../services/placeholders/placeholder-service'
import rawColours from '../../../theme/raw-colours'
import { isValidEmail } from '../../../services/helpers/text/text-util-helper'
import { addTeamMemberToRedux } from '../../task-map/selected-task/selected-task-team-actions'
import { isInImprovedTaskmapContext } from '../../../services/helpers/route/route-context-helper'
import taskService from '../../../services/task/task-service'
import { replaceTask } from '../../../redux/ducks/improved-taskmap'
import { useSelector } from 'react-redux'
import { fetchTeam } from '../../../redux/ducks/matter-team'
import { fetchPostDetails } from '../../task-details/task-card-content/task-notes/task-posts-actions'
import { MAX_FIELD_LENGTHS } from '../../constants'

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

const CreatePlaceholderDialog = props => {
  const { classes } = useStyles()
  const { t } = useTranslation()
  const [emailAddress, setEmailAddress] = useState('')
  const [firstName, setFirstName] = useState('')
  const [lastName, setLastName] = useState('')
  let prefillName

  useEffect(() => {
    if (isValidEmail(props.prefillValue)) {
      setEmailAddress(props.prefillValue)
    } else {
      // eslint-disable-next-line
      prefillName = props.prefillValue
        ? props.prefillValue.split(' ')
        : undefined

      setFirstName(prefillName ? prefillName[0] : '')
      setLastName(prefillName ? prefillName.slice(1).join(' ') : '')
    }
  }, [])

  const [isValidated, setIsValidated] = useState({
    firstName: true,
    lastName: true,
    emailAddress: true,
  })
  const [showLoadingBar, setShowLoadingBar] = useState(false)
  const dispatch = useDispatch()
  const location = useLocation()
  const projectId = getProjectIdFromLocation(location)
  const postId = getPostIdFromLocation(location)
  const [showError, setShowError] = useState(false)
  const taskId = props.taskId
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
        taskId,
        postId,
      }
      placeholderService
        .createPlaceholder(props.matterId, payload)
        .then(res => {
          if (res.status === StatusCodes.OK) {
            if (postId !== undefined) {
              dispatch(
                fetchPostDetails(props.matterId, projectId, taskId, postId)
              )
            } else if (taskId !== undefined) {
              if (isInImprovedTaskmapContext()) {
                taskService
                  .getTaskById(props.matterId, projectId, taskId)
                  .then(response => {
                    if (response.status === 200) {
                      dispatch(replaceTask(response.body))
                    }
                  })
              }
              dispatch(addTeamMemberToRedux(res.body))
            }
            setShowLoadingBar(false)
            setShowError(false)
            props.handleClose()
            props.callBack()
            dispatch(fetchTeam(props.matterId, false, true))
          } else {
            setShowLoadingBar(false)
            setShowError(true)
          }
        })
    }
  }

  const handleCancel = () => {
    props.handleClose()
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
    <JuralioDialog
      style={{ zIndex: 10001 }}
      open={true}
      titleText={t('matterAdmin.placeholders.dialog.createPlaceholder')}
      titleIcon={PeopleIcon}
      actionLabel={t('common.create')}
      handleAction={() => {
        handleAction()
      }}
      handleCancel={() => {
        handleCancel()
      }}
      cancelText={t('common.cancel')}
      disabled={
        !Object.values(isValidated).every(value => value === true) ||
        firstName?.length === 0 ||
        lastName?.length === 0 ||
        showEmailInUseError ||
        showNameInUseError
      }
      showLoadingBar={showLoadingBar}
      loadingText={t('matterAdmin.placeholders.dialog.createLoading')}
      data-test="create-placeholder-dialog"
    >
      <DialogContent style={{ overflow: 'hidden' }} data-test="dialog-content">
        <>
          <div className={classes.nameFieldContainer}>
            <span style={{ padding: '8px' }}>
              <TextField
                data-test="firstname-input"
                label={t('matterAdmin.placeholders.dialog.firstNameLabel')}
                onChange={handleFirstNameInput}
                value={firstName}
                required={true}
                error={!isValidated.firstName || showNameInUseError}
                helperText={
                  !isValidated.firstName &&
                  firstName.length > MAX_FIELD_LENGTHS.PLACEHOLDER_NAME
                    ? t('matterAdmin.placeholders.dialog.helperTextMaxChars')
                    : !isValidated.firstName
                      ? t('matterAdmin.placeholders.dialog.helperTextEmpty')
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
                required={true}
                error={!isValidated.lastName}
                helperText={
                  !isValidated.lastName &&
                  lastName.length > MAX_FIELD_LENGTHS.PLACEHOLDER_NAME
                    ? t('matterAdmin.placeholders.dialog.helperTextMaxChars')
                    : !isValidated.lastName
                      ? t('matterAdmin.placeholders.dialog.helperTextEmpty')
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
            <Typography className={classes.error} data-test="create-error-text">
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
  )
}

export default CreatePlaceholderDialog
