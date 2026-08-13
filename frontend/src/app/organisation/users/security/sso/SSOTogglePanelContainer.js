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

import PropTypes from 'prop-types'
import React from 'react'
import { useSelector } from 'react-redux'
import SSOTogglePanel from './SSOTogglePanel'

const SSOTogglePanelContainer = props => {
  const instanceSettings = useSelector(state => state.instanceSettings)
  const { requestInlineChangeConfirmation } = props

  const organisation = useSelector(
    state => state.organisation.selectedOrganisation
  )

  if (!organisation) return null

  return (
    <SSOTogglePanel
      showMicrosoftSSOToggle={instanceSettings.settings.microsoftSsoEnabled}
      showOktaSSOToggle={instanceSettings.settings.oktaSsoEnabled}
      showSamlSSOToggle={instanceSettings.settings.samlSsoEnabled}
      showGoogleSSOToggle={instanceSettings.settings.googleSsoEnabled}
      microsoftSSOEnabled={organisation.microsoftSsoEnabled} // Sso not SSO
      oktaSSOEnabled={organisation.oktaSsoEnabled} // Sso not SSO
      samlSSOEnabled={organisation.samlSsoEnabled} // Sso not SSO
      googleSSOEnabled={organisation.googleSsoEnabled}
      requestInlineChangeConfirmation={requestInlineChangeConfirmation}
    />
  )
}

SSOTogglePanelContainer.propTypes = {
  requestInlineChangeConfirmation: PropTypes.func,
}

export default SSOTogglePanelContainer
