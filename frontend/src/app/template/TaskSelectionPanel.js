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
import { Button, Typography } from '@mui/material'
import PropTypes from 'prop-types'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import juralioColours from '../../theme/juralio-colours'
import HeaderPanel from './HeaderPanel'

const useStyles = makeStyles()(theme => ({
  root: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    maxWidth: theme.spacing(68),
    color: juralioColours.named.black[200],
  },
  promptText: {
    paddingLeft: theme.spacing(3),
    paddingRight: theme.spacing(2),
  },
  cancelButton: {
    width: theme.spacing(14),
    height: theme.spacing(4),
  },
  continueButton: {
    height: theme.spacing(4),
    width: theme.spacing(16.25),
    marginLeft: theme.spacing(2),
  },
}))

const TaskSelectionPanel = props => {
  const { t } = useTranslation()
  const { classes } = useStyles()

  return (
    <HeaderPanel>
      <div className={classes.root}>
        <InfoIcon
          style={props.postError ? { color: juralioColours.error } : {}}
        />
        <Typography
          style={props.postError ? { color: juralioColours.error } : {}}
          className={classes.promptText}
          data-test="task-selection-panel-text"
        >
          {props.panelText}
        </Typography>
        <Button
          className={classes.cancelButton}
          color="primary"
          data-test="cancel-selection-button"
          onClick={props.cancelTaskSelection}
          size="large"
          variant="outlined"
        >
          {t('common.cancel')}
        </Button>
        {!props.hideConfirm && (
          <Button
            className={classes.continueButton}
            color="primary"
            data-test="confirm-selection-button"
            disabled={props.confirmEnabled}
            onClick={props.confirmTaskSelection}
            variant="contained"
          >
            {t('common.continue')}
          </Button>
        )}
      </div>
    </HeaderPanel>
  )
}

TaskSelectionPanel.propTypes = {
  /** cancelTaskSelection */
  cancelTaskSelection: PropTypes.func.isRequired,
  /** confirmTaskSelection */
  confirmTaskSelection: PropTypes.func.isRequired,
  /** confirmEnabled */
  confirmEnabled: PropTypes.bool.isRequired,
}

export default TaskSelectionPanel
