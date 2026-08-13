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
import { Button, TextField, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { makeStyles } from 'tss-react/mui'
import { updateSamlSettings } from '../../../redux/actions/instance-management-actions'
import { isValidUrl } from '../../../services/helpers/text/text-util-helper'
import configValidatorService from './config-validator-service'

const style = makeStyles()(theme => ({
  cert: {
    width: '100%',
    overflow: 'auto',
    paddingBottom: theme.spacing(0),
  },
  wrapper: {
    display: 'flex',
    flexDirection: 'column',
    maxWidth: '80%',
    margin: 'auto',
    marginTop: theme.spacing(),
    marginBottom: theme.spacing(),
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
  buttonWrapper: {
    display: 'flex',
    marginLeft: 'auto',
    marginTop: theme.spacing(),
  },
  button: {
    marginLeft: theme.spacing(),
  },
  ssoUrl: {
    marginTop: theme.spacing(),
    marginBottom: theme.spacing(),
  },
  issuer: {
    marginTop: theme.spacing(),
    marginBottom: theme.spacing(),
  },
}))

const SSOConfig = props => {
  const { t } = useTranslation()
  const samlSettings = useSelector(
    state => state.instanceSettings.settings.samlSettings
  )
  const [ssoUrl, setSSOUrl] = useState(
    samlSettings?.identityProviderSsoUrl || ''
  )
  const [issuer, setIssuer] = useState(
    samlSettings?.identityProviderEntityId || ''
  )
  const [cert, setCert] = useState(
    samlSettings?.identityProviderCertificate || ''
  )
  const [valid, setValid] = useState(
    configValidatorService.validateSaml(samlSettings)
  )

  useEffect(() => {
    setValid(
      (isValidUrl(ssoUrl) || ssoUrl.length === 0) &&
        (isValidUrl(issuer) || issuer.length === 0) &&
        (configValidatorService.validateX509(cert) || cert.length === 0)
    )
  }, [ssoUrl, issuer, cert])
  const { classes } = style()
  const dispatch = useDispatch()

  const save = () => {
    dispatch(
      updateSamlSettings({
        identityProviderEntityId: issuer,
        identityProviderSsoUrl: ssoUrl,
        identityProviderCertificate: cert,
      })
    ).then(props.close)
  }

  return (
    <div className={classes.wrapper}>
      <div className={classes.heading}>
        <CloudIcon className={classes.icon} />
        <div className={classes.textColumn}>
          <Typography variant="h5" data-test="mfa-panel-title">
            {t('sysAdmin.instanceManagement.samlSettings')}
          </Typography>
        </div>
      </div>
      <TextField
        className={classes.ssoUrl}
        value={ssoUrl}
        data-test="sso-url-field"
        onChange={e => {
          setSSOUrl(e.target.value)
        }}
        label={t('sysAdmin.instanceManagement.samlSettingsTitles.ssoUrl')}
        error={!isValidUrl(ssoUrl) && ssoUrl.length > 0}
        helperText={
          !isValidUrl(ssoUrl) && ssoUrl.length > 0
            ? t('sysAdmin.instanceManagement.samlHelpers.invalidUrl')
            : ''
        }
      />
      <TextField
        className={classes.issuer}
        data-test="idp-issuer-field"
        label={t('sysAdmin.instanceManagement.samlSettingsTitles.issuer')}
        value={issuer}
        onChange={e => {
          setIssuer(e.target.value)
        }}
        error={!isValidUrl(issuer) && issuer.length > 0}
        helperText={
          !isValidUrl(issuer) && issuer.length > 0
            ? t('sysAdmin.instanceManagement.samlHelpers.invalidIssuer')
            : ''
        }
      />
      <TextField
        multiline={true}
        maxRows={100}
        value={cert}
        rows={18}
        className={classes.cert}
        data-test="cert-field"
        onChange={e => {
          setCert(e.target.value)
        }}
        label={t('sysAdmin.instanceManagement.samlSettingsTitles.cert')}
        error={!configValidatorService.validateX509(cert) && cert.length > 0}
        helperText={
          !configValidatorService.validateX509(cert) && cert.length > 0
            ? t('sysAdmin.instanceManagement.samlHelpers.invalidCert')
            : ''
        }
        slotProps={{
          htmlInput: {
            style: {
              fontSize: '12px',
            },
          },
        }}
      />
      <div className={classes.buttonWrapper}>
        <Button
          variant="outlined"
          color="primary"
          className={classes.button}
          onClick={props.close}
        >
          {t('common.close')}
        </Button>
        <Button
          variant="outlined"
          className={classes.button}
          color="primary"
          disabled={!valid}
          onClick={save}
          data-test="saml-save-button"
        >
          {t('common.save')}
        </Button>
      </div>
    </div>
  )
}
export default SSOConfig
