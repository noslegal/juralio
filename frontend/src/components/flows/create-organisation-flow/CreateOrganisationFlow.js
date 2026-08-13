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
import { useTranslation } from 'react-i18next'
import { MAX_FIELD_LENGTHS } from '../../../app/constants'
import SSOTogglePanel from '../../../app/organisation/users/security/sso/SSOTogglePanel'
import IsWidthDown from '../../../hooks/width-helper'
import TextPromptDialog from '../../dialog/text-prompt-dialog/TextPromptDialog'

const CreateOrganisationFlow = props => {
  const { t } = useTranslation()
  const fullScreenMode = IsWidthDown('sm', props.width)
  return (
    <div>
      <TextPromptDialog
        titleText={t('organisation.createOrganisation')}
        explanatoryText={t('organisation.explanatoryTexts.creation')}
        placeholderText={t('organisation.nameYourOrganisation')}
        maximumLength={MAX_FIELD_LENGTHS.ORGANISATION_NAME}
        actionText={t('common.continue')}
        cancelHandler={props.handleCancel}
        actionHandler={props.actionHandler}
        fullScreen={fullScreenMode}
        usageContext="CreateOrganisationFlow"
        validationMessage={props.validationMessage}
        AdditionalFields={
          <SSOTogglePanel
            showMicrosoftSSOToggle={
              props.instanceSettings.settings.microsoftSsoEnabled
            }
            showOktaSSOToggle={props.instanceSettings.settings.oktaSsoEnabled}
            showGoogleSSOToggle={
              props.instanceSettings.settings.googleSsoEnabled
            }
            microsoftSSOEnabled={props.ssoState.microsoftSsoEnabled}
            oktaSSOEnabled={props.ssoState.oktaSsoEnabled}
            googleSSOEnabled={props.ssoState.googleSsoEnabled}
            requestInlineChangeConfirmation={props.changeSSO}
          />
        }
      />
    </div>
  )
}

CreateOrganisationFlow.propTypes = {
  /** actionHandler */
  actionHandler: PropTypes.func.isRequired,
  /** handleCancel */
  handleCancel: PropTypes.func.isRequired,
}

export default CreateOrganisationFlow
