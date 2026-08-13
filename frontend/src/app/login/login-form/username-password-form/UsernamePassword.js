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

import { Link, Typography } from '@mui/material'
import Button from '@mui/material/Button'
import Input from '@mui/material/Input'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import msLogo from '../../../../assets/images/ms_logo.png'
import oktaLogo from '../../../../assets/images/okta_logo.png'
import PasswordField from '../../../../components/inputs/password-field/PasswordField'
import { _getAPIUrl } from '../../../../services/helpers/api-helper'
import { getParameterByName } from '../../../../services/helpers/url/url-helpers'
import colorModifiers from '../../../../theme/color-modifiers'
import {
  default as rawColors,
  default as rawColours,
} from '../../../../theme/raw-colours'

import LoginValidationMessage from '../../LoginValidationMessage'
import LogoutMessage from '../../sso/LogoutMessage'
import { useDispatch } from 'react-redux'
import { resetValidation, ssoLogin } from '../../login-forms-actions'
import { login } from '../../../../services/user/auth/auth-actions'

const useStyles = makeStyles()(theme => ({
  form: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  username: {
    width: '70%',
    alignSelf: 'center',
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(3),
  },
  password: {
    width: '70%',
    alignSelf: 'center',
  },
  signInButton: {
    marginTop: theme.spacing(3),
    marginBottom: theme.spacing(1),
    marginLeft: 'auto',
    marginRight: 'auto',
    alignSelf: 'center',
    width: '70%',
    color: 'white',
    boxShadow: '0px 4px 8px #888888',
  },
  ssoButton: {
    color: '#3c4043',
    backgroundColor: rawColors.primary.white.primary,
    borderColor: '#dadce0',
    marginLeft: 'auto',
    marginRight: 'auto',
    alignSelf: 'center',
    display: 'flex',
    width: '70%',
    height: theme.spacing(4),
    '&:hover': {
      backgroundColor: '#f8fafe',
      borderColor: '#e5eefd',
    },
    marginTop: theme.spacing(2),
    textTransform: 'unset',
  },
  msLogo: {
    width: '16px',
  },
  oktaLogo: {
    width: '18px',
  },
  forgotYourPassword: {
    marginLeft: 'auto',
    marginRight: 'auto',
    cursor: 'pointer',
    marginTop: theme.spacing(2),
    width: 'fit-content',
  },
  backToSSOFocus: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(),
    width: 'fit-content',
    padding: theme.spacing(0.5),

    borderRadius: theme.spacing(0.5),
    marginLeft: 'auto',
    marginRight: 'auto',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',

    '&:hover': {
      backgroundColor: colorModifiers.secondaryBackground(
        rawColours.primary.grey.main
      ),
    },
  },
  backToSSOFocusLinkText: {
    color: colorModifiers.secondaryText(rawColours.text.black),
    cursor: 'pointer',
  },
  loginWrapper: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
}))

const UsernamePassword = props => {
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const { classes } = useStyles()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')

  useEffect(() => {
    //if been redirected from microsoft
    let code = getParameterByName('code')

    if (code !== null) {
      dispatch(ssoLogin())
    }
    // eslint-disable-next-line
  }, [])

  useEffect(() => {
    if (!props.showGoogleLogin) {
      return
    } else if (props.showGoogleLogin && window.google) {
      renderGoogleButton()
    }
    //eslint-disable-next-line
  }, [props.showGoogleLogin])

  const handleChange = e => {
    if (e.target.value.length > 0) {
      dispatch(resetValidation())
      //clearValidation()
    }
    if (e.target.name === 'username') {
      setUsername(e.target.value)
    } else if (e.target.name === 'password') {
      setPassword(e.target.value)
    }
  }

  const handleSubmit = e => {
    e.preventDefault()

    dispatch(
      login({
        username: username,
        password: password,
      })
    )
  }

  const handleMicrosoftLogin = () => {
    let url = _getAPIUrl(window, true) + '/mslogin'
    window.location.href = url
  }

  const handleOktaLogin = () => {
    window.location.href =
      window.location.origin === 'http://localhost:3000'
        ? 'http://localhost:8080/oktalogin'
        : '/oktalogin'
  }

  const handleSamlLogin = () => {
    window.location.href =
      window.location.origin === 'http://localhost:3000'
        ? 'http://localhost:8080/saml/redirect'
        : '/saml/redirect'
  }

  const handleGoogleLogin = response => {
    if (!response.credential) return
    props.setGoogleToken(response.credential)
  }

  const renderGoogleButton = () => {
    window.google.accounts.id.initialize({
      client_id: import.meta.env.VITE_GOOGLE_API_CLIENT_ID,
      callback: handleGoogleLogin,
    })
    window.google.accounts.id.renderButton(
      document.getElementById('googleSignInBtn'),
      {
        theme: 'outline',
        size: 'medium',
        width: 274,
        logo_alignment: 'center',
      }
    )
  }

  return (
    <div className={classes.loginWrapper}>
      <form onSubmit={handleSubmit} className={classes.form}>
        <Input
          data-test="username-input"
          className={classes.username}
          placeholder="Username"
          name="username"
          error={props.usernameInvalid}
          value={username}
          onChange={handleChange}
          inputProps={{
            type: 'email',
            autoComplete: 'username',
            autoCapitalize: 'off',
          }}
        />
        <PasswordField
          data-test="password-input"
          className={classes.password}
          name="password"
          placeholder="Password"
          onChange={handleChange}
          error={props.passwordInvalid}
        />
        <LoginValidationMessage validationMessage={props.validationMessage} />

        <Button
          data-test="password-submit-button"
          className={classes.signInButton}
          type="submit"
          style={
            props.backgroundColor === 'true'
              ? { backgroundColor: rawColours.tips.orange }
              : { backgroundColor: rawColors.status.done.dark }
          }
        >
          {t('login.signIn')}
        </Button>
      </form>
      {props.showMicrosoftLogin && (
        <Button
          variant="outlined"
          className={classes.ssoButton}
          onClick={handleMicrosoftLogin}
          data-test="microsoft-login-button"
          startIcon={
            <img className={classes.msLogo} src={msLogo} alt="microsoft_logo" />
          }
        >
          {t('sso.signInWithMicrosoft')}
        </Button>
      )}
      {props.showOktaLogin && (
        <Button
          variant="outlined"
          className={classes.ssoButton}
          onClick={handleOktaLogin}
          data-test="okta-login-button"
          startIcon={
            <img className={classes.oktaLogo} src={oktaLogo} alt="okta_logo" />
          }
        >
          {t('sso.signInWithOkta')}
        </Button>
      )}
      {props.showSamlLogin && (
        <Button
          variant="outlined"
          className={classes.ssoButton}
          onClick={handleSamlLogin}
          data-test="saml-login-button"
        >
          {t('sso.signInWithSaml')}
        </Button>
      )}
      {props.showGoogleLogin && window.google && (
        <div
          className={classes.ssoButton}
          data-test="google-login-button"
          id="googleSignInBtn"
        ></div>
      )}
      {props.showForgotMyPassword && (
        <Link
          data-test="forgot-your-password-link"
          className={classes.forgotYourPassword}
          onClick={props.forgotPassword}
        >
          {t('login.forgotYourPassword')}
        </Link>
      )}

      {!props.validationMessage && props.ssoType && (
        <LogoutMessage ssoType={props.ssoType} />
      )}
      {props.ssoFocus && (
        <Link
          data-test="back-to-sso-link"
          className={classes.backToSSOFocus}
          color={colorModifiers.secondaryText(rawColours.text.black)}
          onClick={props.backToSSOFocus}
        >
          <Typography className={classes.backToSSOFocusLinkText}>
            {t('login.backToSSO')}
          </Typography>
        </Link>
      )}
    </div>
  )
}
export default UsernamePassword
