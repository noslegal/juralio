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

import SecurityIcon from '@mui/icons-material/Security'
import { Typography } from '@mui/material'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import MFATogglePanelContainer from './mfa/MFATogglePanelContainer'
import OrganisationSecurityConfirmationDialog from './OrganisationSecurityConfirmationDialog'
import SSOTogglePanelContainer from './sso/SSOTogglePanelContainer'

const useStyles = makeStyles()(theme => ({
  root: {
    width: '100%',
  },
  heading: {
    display: 'flex',
    paddingBottom: theme.spacing(4),
  },
  icon: {
    flex: '0 0 auto',
  },
  textColumn: {
    flex: '1 1 auto',
    display: 'flex',
    flexDirection: 'column',
    paddingLeft: theme.spacing(1),
  },
  goldStandard: {
    color: 'gold',
  },
}))

const OrganisationSecurity = props => {
  const { t } = useTranslation()
  const { classes } = useStyles()
  const {
    applyChange,
    organisation,
    requestInlineChangeConfirmation,
    changesAwaitingConfirmation,
    setChangesAwaitingConfirmation,
    thirdPartyUsers,
  } = props

  return (
    <>
      <div className={classes.root}>
        <div className={classes.heading}>
          <SecurityIcon
            className={classNames(
              classes.icon,
              organisation &&
                organisation.mfaEnabled &&
                organisation.microsoftSsoEnabled &&
                organisation.oktaSsoEnabled &&
                classes.goldStandard
            )}
          />
          <div className={classes.textColumn}>
            <Typography variant="h6" data-test="mfa-panel-title">
              {t('organisation.security.title')}
            </Typography>
          </div>
        </div>
        <MFATogglePanelContainer
          requestInlineChangeConfirmation={requestInlineChangeConfirmation}
          organisation={organisation}
        />
        <SSOTogglePanelContainer
          requestInlineChangeConfirmation={requestInlineChangeConfirmation}
        />
      </div>
      <OrganisationSecurityConfirmationDialog
        changesAwaitingConfirmation={changesAwaitingConfirmation}
        setChangesAwaitingConfirmation={setChangesAwaitingConfirmation}
        applyChange={applyChange}
        thirdPartyUsers={thirdPartyUsers}
      />
    </>
  )
}

OrganisationSecurity.propTypes = {
  setSelectedOrganisation: PropTypes.func.isRequired,
  applyChange: PropTypes.bool,
  organisation: PropTypes.object,
  requestInlineChangeConfirmation: PropTypes.bool,
  changesAwaitingConfirmation: PropTypes.object,
  setChangesAwaitingConfirmation: PropTypes.func,
  thirdPartyUsers: PropTypes.array,
}

export default OrganisationSecurity
