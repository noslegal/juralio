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
import { Typography } from '@mui/material'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import SSOTogglePanel from '../../app/organisation/users/security/sso/SSOTogglePanel'
import AuditLogToggle from './AuditLogToggle'
import DefaultTemplateSetup from './default-template/DefaultTemplateSetup'
import ShowSplashScreen from './first-login/ShowSplashScreen'
import PasswordResetSelfService from './password-reset/PasswordResetSelfService'
import UrlValidationToggle from './url-validation/UrlValidationToggle'
import TrialPeriodSetup from './userConfirmation/TrialPeriodSetup'
import UserConfirmationToggle from './userConfirmation/UserConfirmationToggle'
import UserWhitelist from './userConfirmation/UserWhitelist'
import CostsToggle from './costs/CostsToggle'

const useStyles = makeStyles()(theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
  },
  wrapper: {
    width: '50%',
    margin: 'auto',
    maxWidth: theme.spacing(66),
    minWidth: theme.spacing(30),
  },
  heading: {
    display: 'flex',
    paddingBottom: theme.spacing(4),
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  icon: {
    marginRight: theme.spacing(2),
  },
}))

const InstanceManagement = props => {
  const { t } = useTranslation()
  const { classes } = useStyles()
  const {
    microsoftSSOEnabled,
    oktaSSOEnabled,
    googleSSOEnabled,
    samlSSOEnabled,
    requestInlineChangeConfirmation,
    openSettings,
  } = props

  return (
    <div className={classes.root}>
      <div className={classes.heading}>
        <CloudIcon className={classNames(classes.icon)} />
        <div className={classes.textColumn}>
          <Typography variant="h5" data-test="mfa-panel-title">
            {t('sysAdmin.instanceManagement.header')}
          </Typography>
        </div>
      </div>
      <div className={classes.wrapper}>
        <SSOTogglePanel
          showMicrosoftSSOToggle={true}
          showOktaSSOToggle={true}
          showSamlSSOToggle={true}
          showGoogleSSOToggle={true}
          microsoftSSOEnabled={microsoftSSOEnabled}
          oktaSSOEnabled={oktaSSOEnabled}
          samlSSOEnabled={samlSSOEnabled}
          googleSSOEnabled={googleSSOEnabled}
          requestInlineChangeConfirmation={requestInlineChangeConfirmation}
          openSettings={openSettings}
          isInstanceManagment={true}
        />
        <PasswordResetSelfService />
        <DefaultTemplateSetup />
        <ShowSplashScreen />
        <UrlValidationToggle />
        <UserConfirmationToggle
          requestInlineChangeConfirmation={requestInlineChangeConfirmation}
        />
        <TrialPeriodSetup />
        <CostsToggle />
        <UserWhitelist t={t} />
        <AuditLogToggle />
      </div>
    </div>
  )
}

InstanceManagement.propTypes = {
  microsoftSSOEnabled: PropTypes.bool,
  oktaSSOEnabled: PropTypes.bool,
  samlSSOEnabled: PropTypes.bool,
  requestInlineChangeConfirmation: PropTypes.func,
}

export default InstanceManagement
