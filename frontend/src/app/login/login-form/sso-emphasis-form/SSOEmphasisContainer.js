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

import React, { useState } from 'react'
import { useSelector } from 'react-redux'
import { _getAPIUrl } from '../../../../services/helpers/api-helper'

import UsernamePassword from '../username-password-form/UsernamePassword'
import SSOLoginOptions from './SSOLoginOptions'

const SSOEmphasisContainer = props => {
  const [showUsername, setshowUsername] = useState(false)
  const loginForms = useSelector(state => state.login)

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
    this.props.setGoogleToken(response.credential)
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
    <>
      {(showUsername ||
        (loginForms.loginForms.displayForm !== 'USERNAME_PASSWORD' &&
          loginForms.loginForms.displayForm !== 'INVALID_SSO')) && (
        <UsernamePassword
          {...props}
          showMicrosoftLogin={false}
          showOktaLogin={false}
          showSamlLogin={false}
          showGoogleLogin={false}
          showForgotMyPassword={props.instanceSettings.enableForgotMyPassword}
          ssoFocus={true}
          backToSSOFocus={() => setshowUsername(false)}
        />
      )}
      {!showUsername &&
        (loginForms.loginForms.displayForm === 'USERNAME_PASSWORD' ||
          loginForms.loginForms.displayForm === 'INVALID_SSO') && (
          <SSOLoginOptions
            instanceSettings={props.instanceSettings}
            handleMicrosoftLogin={handleMicrosoftLogin}
            handleOktaLogin={handleOktaLogin}
            handleSamlLogin={handleSamlLogin}
            setshowUsername={setshowUsername}
            renderGoogleButton={renderGoogleButton}
            validationMessage={props.validationMessage}
            ssoType={props.ssoType}
          />
        )}
    </>
  )
}
export default SSOEmphasisContainer
