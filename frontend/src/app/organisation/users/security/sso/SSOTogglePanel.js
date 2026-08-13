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
  Card,
  FormControlLabel,
  FormGroup,
  IconButton,
  Switch,
  Tooltip,
  Typography,
} from '@mui/material'
import PropTypes from 'prop-types'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { makeStyles } from 'tss-react/mui'
import configValidatorService from '../../../../../admin/instance-management/SSO/config-validator-service'
import juralioColours from '../../../../../theme/juralio-colours'

const useStyles = makeStyles()(theme => ({
  sso: {
    marginTop: theme.spacing(3),
  },
  explanation: {
    padding: theme.spacing(1, 0, 1, 0),
    color: juralioColours.darkText.secondary,
  },
  ssoCard: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(1.5),
    marginTop: theme.spacing(2),
  },
  ssoTitle: {
    flex: 2,
  },
  flexRow: {
    display: 'flex',
    flexDirection: 'row',
    alignItems: 'center',
  },
  emphasisToggle: {
    marginLeft: 'auto',
  },
}))

const SSOTogglePanel = props => {
  const { t } = useTranslation()
  const { classes } = useStyles()
  const {
    showMicrosoftSSOToggle,
    showOktaSSOToggle,
    showGoogleSSOToggle,
    microsoftSSOEnabled,
    oktaSSOEnabled,
    googleSSOEnabled,
    showSamlSSOToggle,
    samlSSOEnabled,
    requestInlineChangeConfirmation,
    openSettings,
  } = props

  const instanceSettings = useSelector(state => state.instanceSettings)

  // If there's nothing to toggle, don't show the heading
  if (
    !showMicrosoftSSOToggle &&
    !showOktaSSOToggle &&
    !showSamlSSOToggle &&
    !showGoogleSSOToggle
  )
    return null
  return (
    <>
      <div className={classes.sso}>
        <div className={classes.flexRow}>
          <Typography variant="h6">
            {t('organisation.ssoTogglePanel.title')}
          </Typography>
          {props.isInstanceManagment && (
            <FormGroup className={classes.emphasisToggle}>
              <FormControlLabel
                control={
                  <Switch
                    checked={instanceSettings.settings.emphasiseSsoLogin}
                    onChange={e => {
                      requestInlineChangeConfirmation(
                        'emphasiseSsoLogin', // Sso not SSO
                        e.target.checked
                      )
                    }}
                  />
                }
                label={
                  <Tooltip
                    title={t(
                      'organisation.ssoTogglePanel.ssoDefaulLoginExplain'
                    )}
                  >
                    <Typography variant="caption">
                      {t('organisation.ssoTogglePanel.ssoDefaulLogin')}
                    </Typography>
                  </Tooltip>
                }
              />
            </FormGroup>
          )}
        </div>
        <Typography
          variant="caption"
          className={classes.explanation}
          data-test="sso-panel-explanatory-text"
        >
          {t('organisation.ssoTogglePanel.explanatoryText')}
        </Typography>
        {showMicrosoftSSOToggle && (
          <Card className={classes.ssoCard} variant="outlined">
            <Typography variant="subtitle1" className={classes.ssoTitle}>
              {t('organisation.ssoTogglePanel.microsoft')}
            </Typography>
            <Switch
              color="primary"
              checked={microsoftSSOEnabled}
              onChange={e =>
                requestInlineChangeConfirmation(
                  'microsoftSsoEnabled', // Sso not SSO
                  e.target.checked
                )
              }
              data-test="toggle-microsoft-sso"
            />
          </Card>
        )}
        {showOktaSSOToggle && (
          <Card className={classes.ssoCard} variant="outlined">
            <Typography variant="subtitle1" className={classes.ssoTitle}>
              {t('organisation.ssoTogglePanel.okta')}
            </Typography>
            <Switch
              color="primary"
              checked={oktaSSOEnabled}
              onChange={e =>
                requestInlineChangeConfirmation(
                  'oktaSsoEnabled', // Sso not SSO
                  e.target.checked
                )
              }
              data-test="toggle-okta-sso"
            />
          </Card>
        )}
        {showGoogleSSOToggle && (
          <Card className={classes.ssoCard} variant="outlined">
            <Typography variant="subtitle1" className={classes.ssoTitle}>
              {t('organisation.ssoTogglePanel.google')}
            </Typography>
            <Switch
              color="primary"
              checked={googleSSOEnabled}
              onChange={e =>
                requestInlineChangeConfirmation(
                  'googleSsoEnabled', // Sso not SSO
                  e.target.checked
                )
              }
              data-test="toggle-google-sso"
            />
          </Card>
        )}
        {showSamlSSOToggle && (
          <Card className={classes.ssoCard} variant="outlined">
            <Typography variant="subtitle1" className={classes.ssoTitle}>
              {t('organisation.ssoTogglePanel.saml')}
            </Typography>
            {openSettings && (
              <IconButton
                onClick={() => openSettings('saml')}
                data-test="saml-settings"
                size="large"
              >
                <SettingsIcon />
              </IconButton>
            )}
            {configValidatorService.validateSaml(
              instanceSettings.settings.samlSettings
            ) && (
              <Switch
                color="primary"
                checked={samlSSOEnabled}
                onChange={e =>
                  requestInlineChangeConfirmation(
                    'samlSsoEnabled', // Sso not SSO
                    e.target.checked
                  )
                }
                data-test="toggle-saml-sso"
              />
            )}
          </Card>
        )}
      </div>
    </>
  )
}

SSOTogglePanel.propTypes = {
  microsoftSSOEnabled: PropTypes.bool,
  oktaSSOEnabled: PropTypes.bool,
  samlSSOEnabled: PropTypes.bool,
  requestInlineChangeConfirmation: PropTypes.func,
}

export default SSOTogglePanel
