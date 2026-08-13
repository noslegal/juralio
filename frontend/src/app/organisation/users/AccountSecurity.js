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

import {
  FormControl,
  FormControlLabel,
  Radio,
  RadioGroup,
  Typography,
} from '@mui/material'
import PropTypes from 'prop-types'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { makeStyles } from 'tss-react/mui'
import { useUserAuthData } from '../../../hooks/user-hooks'
import { isOrgAdmin } from '../../../services/user/helper/user-role-service'
import { SSO } from '../../constants'

const useStyles = makeStyles()(theme => ({
  title: {
    marginBottom: theme.spacing(2),
  },
  content: {
    paddingLeft: theme.spacing(2),
  },
}))

const AccountSecurity = props => {
  const userAuthData = useUserAuthData()
  const isOAdmin = isOrgAdmin(userAuthData)
  const { classes } = useStyles()
  const { t } = useTranslation()
  const instanceSettings = useSelector(state => state.instanceSettings)
  const [value, setValue] = useState(
    props.isThirdPartyUser ? props.thirdPartyProvider : SSO.JURALIO
  )

  const handleAuthChange = e => {
    setValue(e.target.value)
    switch (e.target.value) {
      case SSO.JURALIO: {
        props.convertToJuralio()
        props.closeHandler()
        return
      }
      case SSO.MICROSOFT: {
        props.convertToMS()
        props.closeHandler()
        return
      }
      case SSO.OKTA: {
        props.convertToOkta()
        props.closeHandler()
        return
      }
      case SSO.SAML: {
        props.convertToSaml()
        props.closeHandler()
        return
      }
      case SSO.GOOGLE: {
        props.convertToGoogle()
        props.closeHandler()
        return
      }
      default:
        return
    }
  }
  return (
    <>
      <Typography className={classes.title} variant="overline">
        {t('accountSecurity.title')}
      </Typography>
      <div className={classes.content}>
        <FormControl component="fieldset">
          <RadioGroup
            value={value}
            onChange={props.isSelf && !isOAdmin ? () => {} : handleAuthChange}
            row
            aria-label="auth-method"
          >
            <FormControlLabel
              data-test="convert-to-juralio"
              value={SSO.JURALIO}
              control={<Radio />}
              label={t('organisation.ssoTogglePanel.juralio')}
              disabled={props.isSelf && !isOAdmin}
            />
            {((props.organisation && props.organisation.microsoftSsoEnabled) ||
              (props.isUserSysAdmin &&
                instanceSettings?.settings?.microsoftSsoEnabled)) && (
              <FormControlLabel
                value={SSO.MICROSOFT}
                data-test="convert-to-ms"
                control={<Radio />}
                label={t('organisation.ssoTogglePanel.microsoft')}
                disabled={props.isSelf && !isOAdmin}
              />
            )}
            {((props.organisation && props.organisation.oktaSsoEnabled) ||
              (props.isUserSysAdmin &&
                instanceSettings?.settings?.oktaSsoEnabled)) && (
              <FormControlLabel
                value={SSO.OKTA}
                control={<Radio />}
                label={t('organisation.ssoTogglePanel.okta')}
                disabled={props.isSelf && !isOAdmin}
              />
            )}
            {((props.organisation && props.organisation.samlSsoEnabled) ||
              (props.isUserSysAdmin &&
                instanceSettings?.settings?.samlSsoEnabled)) && (
              <FormControlLabel
                value={SSO.SAML}
                control={<Radio />}
                label={t('organisation.ssoTogglePanel.saml')}
                disabled={props.isSelf && !isOAdmin}
              />
            )}
            {((props.organisation && props.organisation.googleSsoEnabled) ||
              (props.isUserSysAdmin &&
                instanceSettings?.settings?.googleSsoEnabled)) && (
              <FormControlLabel
                value={SSO.GOOGLE}
                control={<Radio />}
                label={t('organisation.ssoTogglePanel.google')}
                disabled={props.isSelf && !isOAdmin}
              />
            )}
          </RadioGroup>
        </FormControl>
      </div>
    </>
  )
}

AccountSecurity.propTypes = {
  resetPassword: PropTypes.func.isRequired,
}

export default AccountSecurity
