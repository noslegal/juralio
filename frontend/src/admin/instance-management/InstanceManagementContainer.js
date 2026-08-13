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

import CloudIcon from '@mui/icons-material/Cloud'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { displayConfirmationDialog } from '../../app/global-confirmation-dialog/global-confirmation-dialog-actions'
import { useInstanceSettings } from '../../hooks/instance-settings/instance-settings-hooks'
import { updateInstanceSettings } from '../../redux/actions/instance-management-actions'
import { capitalise } from '../../services/helpers/text/text-util-helper'
import InstanceManagement from './InstanceManagement'
import SSOConfig from './SSO/SSOConfig'

const InstanceManagementContainer = () => {
  const dispatch = useDispatch()
  const instanceSettings = useInstanceSettings(true)
  const [showConfig, setShowConfig] = useState(false)
  const [provider, setProvider] = useState(null)
  const { t } = useTranslation()

  const addNewlines = text => {
    return text.split('.').map(sentence => (
      <p>
        {sentence}
        {sentence.length > 0 && '.'}
      </p>
    ))
  }

  const requestInlineChangeConfirmation = (changeKey, changeValue) => {
    let confirmOptions = {}
    if (changeKey === 'emphasiseSsoLogin') {
      confirmOptions = {
        actionText: t('common.confirm'),
        titleText: changeValue
          ? t('sysAdmin.instanceManagement.emphasiseSSOTitle')
          : t('sysAdmin.instanceManagement.dontEmphasiseSSOTitle'),
        promptText: changeValue
          ? t('organisation.ssoTogglePanel.ssoDefaulLoginExplain')
          : t('sysAdmin.instanceManagement.returnToDefaultLogin'),
        usageContext: 'emphasiseSSO',
        headerIcon: CloudIcon,
        dontTranslatePromptText: true,
      }
    } else {
      const provider = { provider: capitalise(changeKey.split('Sso')[0]) }
      confirmOptions = {
        actionText: t('common.confirm'),
        titleText: changeValue
          ? t('sysAdmin.instanceManagement.confirmationTitle_enable', provider)
          : t(
              'sysAdmin.instanceManagement.confirmationTitle_disable',
              provider
            ),
        promptText: changeValue
          ? addNewlines(
              t(
                'sysAdmin.instanceManagement.confirmationPrompt_enable',
                provider
              )
            )
          : addNewlines(
              t(
                'sysAdmin.instanceManagement.confirmationPrompt_disable',
                provider
              )
            ),
        usageContext: 'ConvertToJuralioUser',
        headerIcon: CloudIcon,
        dontTranslatePromptText: true,
      }
    }
    dispatch(
      displayConfirmationDialog(confirmOptions, () => {
        dispatch(
          updateInstanceSettings({
            [changeKey]: changeValue,
          })
        )
      })
    )
  }

  const openSettings = p => {
    setProvider(p)
    setShowConfig(true)
  }

  return (
    <>
      {!showConfig && (
        <InstanceManagement
          microsoftSSOEnabled={instanceSettings.settings.microsoftSsoEnabled}
          oktaSSOEnabled={instanceSettings.settings.oktaSsoEnabled}
          samlSSOEnabled={instanceSettings.settings.samlSsoEnabled}
          googleSSOEnabled={instanceSettings.settings.googleSsoEnabled}
          openSettings={openSettings}
          requestInlineChangeConfirmation={requestInlineChangeConfirmation}
          close={() => setShowConfig(false)}
        />
      )}
      {showConfig && (
        <SSOConfig provider={provider} close={() => setShowConfig(false)} />
      )}
    </>
  )
}

export default InstanceManagementContainer
