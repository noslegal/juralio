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

import VpnKeyIcon from '@mui/icons-material/VpnKey'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import classNames from 'classnames'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import PasswordField from '../../../../components/inputs/password-field/PasswordField'
import LoginValidationMessage from '../../LoginValidationMessage'

const style = makeStyles()(theme => ({
  form: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  changePasswordInfoMessage: {
    textAlign: 'center',
    marginBottom: theme.spacing(2),
    [theme.breakpoints.down('md')]: {
      marginBottom: theme.spacing(1),
      paddingLeft: theme.spacing(2),
      paddingRight: theme.spacing(2),
    },
  },
  changePasswordInput: {
    width: '80%',
    alignSelf: 'center',
    marginBottom: theme.spacing(1.5),
  },
  changePasswordInputSmall: {
    width: '50%',
  },
  signInButton: {
    left: 0,
    right: 0,
    marginLeft: 'auto',
    marginRight: 'auto',
    alignSelf: 'center',
  },
  wrapper: {
    display: 'flex',
  },
  updatePassword: {
    marginRight: theme.spacing(24),
    marginLeft: 'auto',
  },
  titleTextWrapper: {
    display: 'flex',
    flexDirection: 'column',
  },
  icon: {
    width: theme.spacing(4),
    height: theme.spacing(4),
    marginRight: theme.spacing(2),
    marginBottom: 'auto',
    marginTop: 'auto',
  },
  titleWrapper: {
    marginBottom: theme.spacing(4),
    marginTop: theme.spacing(4),
    marginLeft: theme.spacing(9),
    display: 'flex',
  },
}))

const ChangePassword = props => {
  const { classes } = style()
  const { t } = useTranslation()
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [verifyNewPassword, setVerifyNewPassword] = useState('')
  const [magicLink, setMagicLink] = useState({
    username: null,
    password: null,
    context: null,
  })

  useEffect(() => {
    if (props.magicLinkToken !== undefined) {
      try {
        setMagicLink(props.magicLinkToken)
        setOldPassword(props.magicLinkToken.password)
      } catch (error) {
        //something went wrong
      }
    }
  }, []) //eslint-disable-line

  const handleChange = e => {
    if (e.target.value.length > 0) {
      props.actions.clearValidation()
    }
    if (e.target.name === 'oldPassword') {
      setOldPassword(e.target.value)
    }
    if (e.target.name === 'newPassword') {
      setNewPassword(e.target.value)
    }
    if (e.target.name === 'verifyNewPassword') {
      setVerifyNewPassword(e.target.value)
    }
    if (e.target.name === 'magicLink') {
      setMagicLink(e.target.value)
    }
  }

  const getUsername = () => {
    if (magicLink.username) {
      return magicLink.username
    }
    return props.user ? props.user.username : props.username
  }

  const handleSubmit = e => {
    e.preventDefault()
    return props.actions.changePasswordAndLogin({
      username: getUsername(),
      oldPassword: oldPassword,
      newPassword: newPassword,
      newPasswordRepeat: verifyNewPassword,
      context: props.context,
    })
  }

  const disableSignIn = () =>
    oldPassword.length === 0 ||
    newPassword.length === 0 ||
    verifyNewPassword.length === 0

  const getSelfServiceTitle = () => {
    return (
      <div className={classes.titleWrapper}>
        <VpnKeyIcon className={classes.icon} />
        <div className={classes.titleTextWrapper}>
          <Typography variant="h5">{t('passwordSettings.title')}</Typography>
        </div>
      </div>
    )
  }

  const isSelfService = props.context === 'selfService'
  const isMagicLink = magicLink.password !== null

  return (
    <form
      data-test="password-change-form"
      onSubmit={handleSubmit}
      className={classes.form}
    >
      {!isSelfService && (
        <Typography
          className={classes.changePasswordInfoMessage}
          data-test="password-change-info-message"
          variant="body2"
        >
          {isMagicLink && magicLink.context === 'newUser'
            ? t('login.firstTimePasswordSet')
            : t('login.expiredPassword')}
        </Typography>
      )}
      {isSelfService && getSelfServiceTitle()}
      {!isMagicLink && (
        <PasswordField
          className={classNames(
            classes.changePasswordInput,
            isSelfService && classes.changePasswordInputSmall
          )}
          data-test="old-password-input"
          name="oldPassword"
          value={isMagicLink ? magicLink.password : undefined}
          placeholder={
            isSelfService
              ? t('passwordSettings.currentPassword')
              : t('passwords.oldPassword')
          }
          onChange={handleChange}
          error={props.oldPasswordInvalid}
        />
      )}
      <PasswordField
        className={classNames(
          classes.changePasswordInput,
          isSelfService && classes.changePasswordInputSmall
        )}
        data-test="new-password-input"
        name="newPassword"
        placeholder={t('passwords.newPassword')}
        onChange={handleChange}
        error={props.newPasswordInvalid}
        id="password"
      />
      <PasswordField
        className={classNames(
          classes.changePasswordInput,
          isSelfService && classes.changePasswordInputSmall
        )}
        data-test="verify-new-password-input"
        name="verifyNewPassword"
        placeholder={t('passwords.verifyNewPassword')}
        onChange={handleChange}
        error={props.verifyNewPasswordInvalid}
      />
      <LoginValidationMessage
        validationMessage={props.validationMessage}
        isSelfService={isSelfService}
      />
      <div className={classes.wrapper}>
        <Button
          data-test="password-submit-button"
          className={classNames([
            classes.signInButton,
            isSelfService && classes.updatePassword,
          ])}
          disabled={disableSignIn()}
          type="submit"
          color="primary"
          variant={isSelfService ? 'contained' : null}
        >
          {isSelfService ? t('passwordSettings.submit') : t('login.signIn')}
        </Button>
      </div>
    </form>
  )
}

export default ChangePassword
