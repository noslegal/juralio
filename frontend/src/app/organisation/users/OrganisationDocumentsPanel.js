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

import { Switch, Typography } from '@mui/material'
import PropTypes from 'prop-types'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { makeStyles } from 'tss-react/mui'
import {
  getOrganisation,
  updateOrganisation,
} from '../../../admin/organisations/organisation-actions'
import juralioColours from '../../../theme/juralio-colours'
import { DocumentMultipleIcon } from '../../../theme/navigation/CommonIcons'
import PanelTitle from './panels/PanelTitle.js'

const useStyles = makeStyles()(theme => ({
  content: {
    display: 'flex',
    flexDirection: 'column',
    '&:last-child': {
      paddingBottom: theme.spacing(),
    },
    width: '100%',
  },
  switchRow: {
    paddingTop: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    //gap: theme.spacing(8),
    [theme.breakpoints.down('md')]: {
      justifyContent: 'space-between',
      gap: 'unset',
    },
  },
  helperText: {
    width: '70%',
    color: juralioColours.darkText.secondary,
    [theme.breakpoints.down('lg')]: {
      width: '50%',
    },
  },
  switchAndText: { display: 'flex', alignItems: 'center' },
}))

const OrganisationDocumentsPanel = props => {
  const { t } = useTranslation()
  const { classes } = useStyles()
  const dispatch = useDispatch()
  const isViewOnly = props.organisation?.isFrozen
  const googleDriveEnabled = !!props.organisation?.googleDriveEnabled

  const updateGoogleDrive = checked => {
    dispatch(
      updateOrganisation(props.organisation.id, {
        googleDriveEnabled: checked,
      })
    ).then(res => {
      dispatch(getOrganisation(props.organisation.id))
    })
  }

  return (
    <div className={classes.content}>
      <PanelTitle
        icon={<DocumentMultipleIcon />}
        header={t('organisationAdmin.documents.header')}
        caption={t('organisationAdmin.documents.subtitle')}
      />

      <div className={classes.switchRow}>
        <Typography
          variant="subtitle1"
          data-test="documents-panel-switch-label"
        >
          {t('organisationAdmin.documents.googleDrive')}
        </Typography>

        <div className={classes.switchAndText}>
          <Switch
            data-test="documents-panel-switch"
            color="primary"
            disabled={isViewOnly}
            checked={googleDriveEnabled}
            onChange={e => updateGoogleDrive(e.target.checked)}
          />
          <Typography
            variant="caption"
            data-test="documents-panel-switch-status"
          >
            {googleDriveEnabled ? t('labels.enabled') : t('labels.disabled')}
          </Typography>
        </div>
      </div>
      <Typography
        variant="caption"
        className={classes.helperText}
        data-test="documents-panel-helper-text"
      >
        {t('organisationAdmin.documents.googleDriveHelper')}
      </Typography>
    </div>
  )
}

OrganisationDocumentsPanel.propTypes = {
  organisation: PropTypes.object,
}

export default OrganisationDocumentsPanel
