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

import SettingsIcon from '@mui/icons-material/Settings'
import {
  DialogContent,
  IconButton,
  Typography,
  useMediaQuery,
} from '@mui/material'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import MFATogglePanelContainer from '../../../app/organisation/users/security/mfa/MFATogglePanelContainer'
import SSOTogglePanel from '../../../app/organisation/users/security/sso/SSOTogglePanel'
import JuralioDialog from '../../../components/dialog/juralio-dialog/JuralioDialog'
import juralioTheme from '../../../theme/juralio-theme'
import { getOrganisation, updateOrganisation } from '../organisation-actions'
import CostsToggle from '../../instance-management/costs/CostsToggle'

const OrganisationSettings = props => {
  const [showDialog, setShowDialog] = useState(false)
  const instanceSettings = useSelector(state => state.instanceSettings)

  const [ssoState, setSsoState] = useState({
    microsoftSsoEnabled: props.organisation.microsoftSsoEnabled,
    oktaSsoEnabled: props.organisation.oktaSsoEnabled,
    samlSsoEnabled: props.organisation.samlSsoEnabled,
    googleSsoEnabled: props.organisation.googleSsoEnabled,
  })
  const [mfaState, setMfaState] = useState(props.organisation.mfaEnabled)
  const [costsState, setCostsState] = useState(props.organisation.costsEnabled)
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const isMobileView = useMediaQuery(juralioTheme.breakpoints.down('md'))

  const submit = () => {
    dispatch(
      updateOrganisation(props.organisation.id, {
        microsoftSsoEnabled: ssoState.microsoftSsoEnabled,
        oktaSsoEnabled: ssoState.oktaSsoEnabled,
        samlSsoEnabled: ssoState.samlSsoEnabled,
        googleSsoEnabled: ssoState.googleSsoEnabled,
        mfaEnabled: mfaState,
        costsEnabled: costsState,
      })
    ).then(() => {
      dispatch(getOrganisation(props.organisation.id))
      setShowDialog(false)
    })
  }

  const changeSSO = (type, checked) => {
    if (type === 'oktaSsoEnabled') {
      setSsoState({
        microsoftSsoEnabled: ssoState.microsoftSsoEnabled,
        oktaSsoEnabled: checked,
      })
    }
    if (type === 'microsoftSsoEnabled') {
      setSsoState({
        ...ssoState,
        microsoftSsoEnabled: !ssoState.microsoftSsoEnabled,
      })
    }
    if (type === 'samlSsoEnabled') {
      setSsoState({
        ...ssoState,
        samlSsoEnabled: !ssoState.samlSsoEnabled,
      })
    }
    if (type === 'googleSsoEnabled') {
      setSsoState({
        ...ssoState,
        googleSsoEnabled: !ssoState.googleSsoEnabled,
      })
    }
  }

  const changeMFA = (type, checked) => {
    setMfaState(checked)
  }
  const changeCosts = (type, checked) => {
    setCostsState(checked)
  }

  return (
    <>
      <IconButton
        onClick={() => setShowDialog(true)}
        data-test="org-settings-button"
        size="large"
      >
        <SettingsIcon />
      </IconButton>
      {showDialog && (
        <JuralioDialog
          open={true}
          titleText={
            <div>
              <Typography variant="h6">{t('organisation.settings')}</Typography>
            </div>
          }
          titleIcon={SettingsIcon}
          handleCancel={() => setShowDialog(false)}
          onClose={() => setShowDialog(false)}
          fullScreen={isMobileView}
          handleAction={submit}
          actionLabel={t('sysAdmin.organisations.confirm')}
          largeSize={true}
        >
          <DialogContent>
            <MFATogglePanelContainer
              requestInlineChangeConfirmation={changeMFA}
              organisation={props.organisation}
              mfaEnabledState={mfaState}
            />
            <SSOTogglePanel
              showMicrosoftSSOToggle={
                instanceSettings.settings.microsoftSsoEnabled
              }
              showOktaSSOToggle={instanceSettings.settings.oktaSsoEnabled}
              showSamlSSOToggle={instanceSettings.settings.samlSsoEnabled}
              showGoogleSSOToggle={instanceSettings.settings.googleSsoEnabled}
              microsoftSSOEnabled={ssoState.microsoftSsoEnabled}
              oktaSSOEnabled={ssoState.oktaSsoEnabled}
              googleSSOEnabled={ssoState.googleSsoEnabled}
              samlSSOEnabled={ssoState.samlSsoEnabled}
              requestInlineChangeConfirmation={changeSSO}
            />
            {instanceSettings.settings.costsEnabled && (
              <CostsToggle
                requestInlineChangeConfirmation={changeCosts}
                costsEnabled={costsState}
              />
            )}
          </DialogContent>
        </JuralioDialog>
      )}
    </>
  )
}

export default OrganisationSettings
