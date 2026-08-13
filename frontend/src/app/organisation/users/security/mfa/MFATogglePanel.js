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
import { makeStyles } from 'tss-react/mui'
import { useIsViewOnly } from '../../../../../hooks/matter/viewer/matter-viewer-hooks'
import juralioColours from '../../../../../theme/juralio-colours'

const useStyles = makeStyles()(theme => ({
  mfa: {
    display: 'flex',
    flexDirection: 'column',
    '&:last-child': {
      paddingBottom: theme.spacing(),
    },
  },
  explanation: {
    padding: theme.spacing(1, 0, 1, 0),
    color: juralioColours.darkText.secondary,
  },
  switchRow: {
    paddingTop: theme.spacing(2),
    display: 'flex',
    alignItems: 'center',
  },
}))

const MFATogglePanel = props => {
  const { t } = useTranslation()
  const { classes } = useStyles()
  const { mfaEnabled, requestInlineChangeConfirmation } = props
  const isViewOnly = useIsViewOnly({ activities: [] })

  return (
    <>
      <div className={classes.mfa}>
        <Typography variant="h6">
          {t('organisation.mfaTogglePanel.title')}
        </Typography>
        <Typography
          variant="caption"
          className={classes.explanation}
          data-test="mfa-panel-explanatory-text"
        >
          {t('organisation.mfaTogglePanel.explanatoryText')}
        </Typography>
        <div className={classes.switchRow}>
          <Switch
            data-test="mfa-panel-switch"
            color="primary"
            disabled={isViewOnly}
            checked={mfaEnabled}
            onChange={e =>
              requestInlineChangeConfirmation('mfaEnabled', e.target.checked)
            }
          />
          <Typography variant="body1" data-test="mfa-panel-switch-status">
            {t('organisation.mfaTogglePanel.mfaStatus', {
              context: mfaEnabled ? 'enabled' : 'disabled',
            })}
          </Typography>
        </div>
      </div>
    </>
  )
}

MFATogglePanel.propTypes = {
  mfaEnabled: PropTypes.bool,
  requestInlineChangeConfirmation: PropTypes.func,
}

export default MFATogglePanel
