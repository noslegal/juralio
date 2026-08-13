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

import InfoIcon from '@mui/icons-material/Info'
import { FormGroup, Tooltip, Typography } from '@mui/material'
import PropTypes from 'prop-types'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import JuralioLink from '../../../components/navigation/juralio-link/JuralioLink'

const useStyles = makeStyles()(theme => ({
  title: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  content: {
    paddingLeft: theme.spacing(2),
    display: 'grid',
    gridRowGap: theme.spacing(),
    gridAutoFlow: 'row',
  },
  row: {
    display: 'flex',
  },
  infoIcon: {
    marginLeft: theme.spacing(),
    height: theme.spacing(2.5),
  },
}))

const AccountOptions = props => {
  const { classes } = useStyles()
  const { t } = useTranslation()

  return (
    <>
      <FormGroup>
        <Typography
          className={classes.title}
          variant="overline"
          data-test="account-option-title"
          noWrap
        >
          {t('userCreation.accountOptionsTitle')}
        </Typography>
        <div
          className={classes.content}
          style={{ paddingLeft: props.noPadding ? '0px' : '' }}
        >
          {!props.isThirdPartyUser &&
            !props.hideResetPassword &&
            props.hasLoggedIn && (
              <JuralioLink
                data-test="reset-password-link"
                onClick={props.resetPassword}
                value={t('accountSecurity.resetPassword')}
              />
            )}
          {!props.hasLoggedIn && !props.hideResetInvite && (
            <JuralioLink
              data-test="resend-invite-link"
              onClick={() => {
                props.resendInv()
              }}
              value={t('accountSecurity.resendInv')}
            />
          )}
          <div className={classes.row}>
            <JuralioLink
              value={`${t('userCreation.resetFtueTutorialProgress')}`}
              onClick={props.resetFtue}
              data-test="reset-ftue-tutorial-link"
            />
            <Tooltip title={t('userCreation.resetFtueHelperText')}>
              <InfoIcon className={classes.infoIcon} />
            </Tooltip>
          </div>
          <div className={classes.row}>
            <JuralioLink
              value={`${t('userCreation.resetTipsAndTricks')}`}
              onClick={props.resetTours}
              data-test="reset-tours"
            />
            <Tooltip title={t('userCreation.resetTipsAndTricksHelperText')}>
              <InfoIcon className={classes.infoIcon} />
            </Tooltip>
          </div>
        </div>
      </FormGroup>
    </>
  )
}

AccountOptions.propTypes = {
  resetFtue: PropTypes.func.isRequired,
}

export default AccountOptions
