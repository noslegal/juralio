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

import { Button, Link, Typography } from '@mui/material'
import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'

import msLogo from '../../../../assets/images/ms_logo.png'
import oktaLogo from '../../../../assets/images/okta_logo.png'
import colorModifiers from '../../../../theme/color-modifiers'
import rawColours from '../../../../theme/raw-colours'
import LoginValidationMessage from '../../LoginValidationMessage'
import LogoutMessage from '../../sso/LogoutMessage'
const styles = makeStyles()(theme => ({
  usernameLink: {
    marginTop: theme.spacing(2), //'auto',
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
  usernameLinkText: {
    color: colorModifiers.secondaryText(rawColours.text.black),
    cursor: 'pointer',
  },
  ssoButton: {
    color: '#3c4043',
    backgroundColor: rawColours.primary.white.primary,
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
  loginWrapper: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  buttonWrapper: {
    height: 'fill-available',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
  },
}))
const SSOLoginOptions = props => {
  const instanceSettings = props.instanceSettings
  const { t } = useTranslation()
  const { classes } = styles()
  const showMicrosoftLogin = instanceSettings.microsoftSsoEnabled
  const showOktaLogin = instanceSettings.oktaSsoEnabled
  const showSamlLogin = instanceSettings.samlSsoEnabled
  const showGoogleLogin = instanceSettings.googleSsoEnabled

  useEffect(() => {
    if (showGoogleLogin && window.google) {
      props.renderGoogleButton()
    }
  }, [showGoogleLogin]) //eslint-disable-line
  return (
    <div className={classes.loginWrapper}>
      <div className={classes.buttonWrapper}>
        {showMicrosoftLogin && (
          <Button
            variant="outlined"
            className={classes.ssoButton}
            onClick={props.handleMicrosoftLogin}
            data-test="microsoft-login-button"
            startIcon={
              <img
                className={classes.msLogo}
                src={msLogo}
                alt="microsoft_logo"
              />
            }
          >
            {t('sso.signInWithMicrosoft')}
          </Button>
        )}
        {showOktaLogin && (
          <Button
            variant="outlined"
            className={classes.ssoButton}
            onClick={props.handleOktaLogin}
            data-test="okta-login-button"
            startIcon={
              <img
                className={classes.oktaLogo}
                src={oktaLogo}
                alt="okta_logo"
              />
            }
          >
            {t('sso.signInWithOkta')}
          </Button>
        )}
        {showSamlLogin && (
          <Button
            variant="outlined"
            className={classes.ssoButton}
            onClick={props.handleSamlLogin}
            data-test="saml-login-button"
          >
            {t('sso.signInWithSaml')}
          </Button>
        )}
        {showGoogleLogin && window.google && (
          <div
            className={classes.ssoButton}
            data-test="google-login-button"
            id="googleSignInBtn"
          ></div>
        )}
      </div>
      <LoginValidationMessage validationMessage={props.validationMessage} />
      {!props.validationMessage && props.ssoType && (
        <LogoutMessage ssoType={props.ssoType} />
      )}
      <Link
        className={classes.usernameLink}
        color={colorModifiers.secondaryText(rawColours.text.black)}
        onClick={props.setshowUsername}
      >
        <Typography
          className={classes.usernameLinkText}
          data-test="use-password-to-sign-in"
        >
          {t('sso.usePassword')}
        </Typography>
      </Link>
    </div>
  )
}
export default SSOLoginOptions
