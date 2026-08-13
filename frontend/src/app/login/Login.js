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

import Card from '@mui/material/Card'
import CardContent from '@mui/material/CardContent'
import CardHeader from '@mui/material/CardHeader'
import classNames from 'classnames'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { makeStyles } from 'tss-react/mui'
import loginBackgroundImage from '../../assets/images/background-pattern.svg'
import logo from '../../assets/images/juralio-lockup-horz-black@2x.png'
import VersionInfo from '../../components/data-display/version-info/VersionInfo'
import { randomTrueOrFalse } from '../../services/helpers/random-helper'
import juralioColours from '../../theme/juralio-colours'
import ChangePasswordContainer from './login-form/change-password-form/ChangePasswordContainer'
import ForgotPasswordContainer from './login-form/forgot-password-form/ForgotPasswordContainer'
import MfaContainer from './login-form/mfa-form/MfaContainer'
import UsernamePasswordContainer from './login-form/username-password-form/UsernamePasswordContainer'
import { forgotPassword, magicLinkUsed, resetForm } from './login-forms-actions'
import MagicLinkBadRequest from './magic-link/MagicLinkBadRequest'
import MagicLinkExpired from './magic-link/MagicLinkExpired'
import MagicLinkLoading from './magic-link/MagicLinkLoading'
import SSOContainer from './sso/SSOContainer'

const useStyles = makeStyles()(theme => ({
  root: {
    display: 'flex',
    flex: 1,
    alignItems: 'center',
    flexDirection: 'column',
    paddingTop: 0,
    PaddingBottom: 0,
    backgroundImage: `url(${loginBackgroundImage})`,
    backgroundPosition: '-5px 1px',
    height: '100%',
  },
  blue: {
    backgroundColor: '#7FB4B7',
  },
  red: {
    backgroundColor: '#DA988E',
  },
  card: {
    display: 'flex',
    flexDirection: 'column',
    margin: 'auto',
    width: '100%',
    maxWidth: 424,
    minHeight: 250,
    background: juralioColours.card.background,
  },
  loginHeader: {
    height: 84,
    backgroundImage: `url(${logo})`,
    backgroundSize: '220px 64px',
    backgroundRepeat: 'no-repeat',
    backgroundPosition: 'center',

    paddingBottom: 0,
    opacity: 1,
  },
  content: {
    flex: 1,
  },
}))

const Login = props => {
  const { classes } = useStyles()
  const { t } = useTranslation()
  let backgroundColor
  backgroundColor = sessionStorage.getItem('background')
  if (backgroundColor === null) {
    backgroundColor = randomTrueOrFalse()
    sessionStorage.setItem('background', backgroundColor)
  }

  const dispatch = useDispatch()
  const login = useSelector(state => state.login)

  const handleForgotPassword = () => {
    dispatch(forgotPassword())
  }

  const renderLoginForm = () => {
    if (
      props.loginForms.displayForm === 'SSO_LOGIN' &&
      login.loginForms.validationMessage !== ''
    ) {
      dispatch(resetForm())
    }

    if (props.magicLinkState === 'USED') {
      props.clearMagicLink()
      dispatch(magicLinkUsed())
    }
    if (
      props.magicLinkState === 'OK' &&
      props.magicLinkToken &&
      props.loginForms.displayForm !== 'REGISTER_MFA'
    ) {
      return <ChangePasswordContainer magicLinkToken={props.magicLinkToken} />
    }
    if (props.magicLinkState === 'DECODING') {
      return <MagicLinkLoading />
    }
    if (props.magicLinkState === 'EXPIRED') {
      return (
        <MagicLinkExpired
          context={props.magicLinkToken}
          clearMagicLink={props.clearMagicLink}
        />
      )
    }
    if (props.magicLinkState === 'BAD_REQUEST') {
      return <MagicLinkBadRequest clearMagicLink={props.clearMagicLink} />
    }

    switch (props.loginForms.displayForm) {
      case 'CHANGE_PASSWORD':
        return <ChangePasswordContainer />
      case 'REGISTER_MFA':
        return <MfaContainer />
      case 'SSO_LOGIN':
        return (
          <SSOContainer
            oktaAccessToken={props.oktaAccessToken}
            samlAccessToken={props.samlAccessToken}
            microsoftAccessToken={props.microsoftAccessToken}
            googleAccessToken={props.googleAccessToken}
          />
        )
      case 'FORGOT_PASSWORD':
        return <ForgotPasswordContainer backgroundColor={backgroundColor} />
      default:
        return (
          <UsernamePasswordContainer
            backgroundColor={backgroundColor}
            oktaAccessToken={props.oktaAccessToken}
            samlAccessToken={props.samlAccessToken}
            googleAccessToken={props.googleAccessToken}
            setGoogleToken={props.setGoogleToken}
            microsoftAccessToken={props.microsoftAccessToken}
            forgotPassword={handleForgotPassword}
          />
        )
    }
  }

  return (
    <div
      className={classNames(
        classes.root,
        backgroundColor === 'true' ? classes.red : classes.blue
      )}
    >
      <Card className={classes.card}>
        <CardHeader className={classes.loginHeader} />
        <CardContent className={classes.content}>
          {renderLoginForm()}
        </CardContent>
      </Card>
      <VersionInfo
        background={backgroundColor === 'true' ? classes.red : classes.blue}
      />
    </div>
  )
}
export default Login
