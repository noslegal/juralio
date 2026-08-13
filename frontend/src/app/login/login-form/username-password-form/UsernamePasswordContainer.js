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

import React, { useEffect, useState } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import BigDataSpinner from '../../../../components/feedback/big-data-spinner/BigDataSpinner'
import { useInstanceSettings } from '../../../../hooks/instance-settings/instance-settings-hooks'
import experimentalServices from '../../../../services/experimental/experimental-services'
import {
  login,
  microsoftLogin,
} from '../../../../services/user/auth/auth-actions'
import { setupExperimentalSettings } from '../../../experimental/experimental-actions'
import { clearValidation } from '../../login-forms-actions'
import SSOEmphasisContainer from '../sso-emphasis-form/SSOEmphasisContainer'
import UsernamePassword from './UsernamePassword'

const UsernamePasswordContainer = props => {
  const instanceSettings = useInstanceSettings()
  const [maxLoadTimePassed, setMaxLoadTimePassed] = useState(false)

  useEffect(() => {
    setTimeout(() => {
      setMaxLoadTimePassed(true)
    }, 3000)
  }, [])

  useEffect(() => {
    experimentalServices.getExperimentalConfig().then(res => {
      props.actions.setupExperimentalSettings(res)
    })
  }, [props.actions])

  const numberOfSSOOptions = [
    instanceSettings.settings.microsoftSsoEnabled,
    instanceSettings.settings.oktaSsoEnabled,
    instanceSettings.settings.samlSsoEnabled,
    instanceSettings.settings.googleSsoEnabled,
  ].filter(t => t === true).length

  if (!instanceSettings.hasLoaded && !maxLoadTimePassed) {
    return (
      <div style={{ marginTop: '20%', display: 'flex' }}>
        <BigDataSpinner size={80} />
      </div>
    )
  }

  if (instanceSettings.settings.emphasiseSsoLogin && numberOfSSOOptions > 0) {
    return (
      <SSOEmphasisContainer
        instanceSettings={instanceSettings.settings}
        {...props}
      />
    )
  }

  return (
    <UsernamePassword
      {...props}
      showMicrosoftLogin={instanceSettings.settings.microsoftSsoEnabled}
      showOktaLogin={instanceSettings.settings.oktaSsoEnabled}
      showSamlLogin={instanceSettings.settings.samlSsoEnabled}
      showGoogleLogin={instanceSettings.settings.googleSsoEnabled}
      showForgotMyPassword={instanceSettings.settings.enableForgotMyPassword}
    />
  )
}

function mapStateToProps(state) {
  return {
    ...state.login.usernamePasswordForm,
    ...state.login.loginForms,
    ssoType: state.auth.data.ssoType,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      login: bindActionCreators(login, dispatch),
      clearValidation: bindActionCreators(clearValidation, dispatch),
      microsoftLogin: bindActionCreators(microsoftLogin, dispatch),
      setupExperimentalSettings: bindActionCreators(
        setupExperimentalSettings,
        dispatch
      ),
    },
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(UsernamePasswordContainer)
