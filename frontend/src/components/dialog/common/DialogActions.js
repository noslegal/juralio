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

import { Button, DialogActions } from '@mui/material'
import PropTypes from 'prop-types'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
const useStyles = makeStyles()(theme => ({
  actionContainer: {
    display: 'flex',
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 2,
  },
  buttons: {
    display: 'flex',
    marginRight: theme.spacing(6),
    marginBottom: theme.spacing(2),
    marginLeft: 'auto',
  },
  buttonLeft: {
    marginRight: theme.spacing(2),
  },
  buttonRight: {
    marginLeft: theme.spacing(2),
  },
}))
const CustomDialogActions = props => {
  const { t } = useTranslation()
  const { classes } = useStyles()
  const [actionInitiated, setActionInitiated] = useState(null)
  const [contextActionInitiated, setContextActionInitiated] = useState(null)
  if (contextActionInitiated !== props.context) {
    setActionInitiated(false)
    setContextActionInitiated(props.context)
  }
  const cancelButtonClick = () => {
    if (props.handleCancel) {
      props.handleCancel()
    }
  }
  const actionButtonClick = () => {
    if (props.disableSingleClickAction || !actionInitiated) {
      setActionInitiated(true)
      props.handleAction()
    }
  }
  const extraActionButtonClick = () => {
    if (!actionInitiated) {
      setActionInitiated(true)
      props.handleExtraAction()
    }
  }

  return (
    <DialogActions>
      <div className={classes.actionContainer}>
        <div className={classes.buttons}>
          {!props.hideCancel && (
            <Button
              className={classes.buttonLeft}
              size="large"
              color="primary"
              data-test="cancel-dialog-button"
              onClick={cancelButtonClick}
            >
              {props.cancelText ? props.cancelText : t('common.cancel')}
            </Button>
          )}
          {!props.hideAction && (
            <Button
              size="large"
              color="primary"
              variant="outlined"
              data-test="action-dialog-button"
              onClick={actionButtonClick}
              disabled={props.disabled}
              type={props.actionType}
            >
              {props.actionLabel}
            </Button>
          )}
          {props.showExtraAction && (
            <Button
              className={classes.buttonRight}
              size="large"
              color="primary"
              variant="outlined"
              data-test="extra-action-dialog-button"
              onClick={extraActionButtonClick}
              disabled={props.disabledExtra}
              type={props.actionType}
            >
              {props.extraActionLabel}
            </Button>
          )}
        </div>
      </div>
    </DialogActions>
  )
}
CustomDialogActions.propTypes = {
  actionLabel: PropTypes.string.isRequired,
  extraActionLabel: PropTypes.string,
  disabled: PropTypes.bool,
  disabledExtra: PropTypes.bool,
  handleAction: PropTypes.func.isRequired,
  showExtraAction: PropTypes.bool,
  handleExtraAction: PropTypes.func,
  handleCancel: PropTypes.func,
  hideCancel: PropTypes.bool,
  switchLabel: PropTypes.string,
  switchToggler: PropTypes.func,
  switchValue: PropTypes.any,
  usageContext: PropTypes.string,
  disableSingleClickAction: PropTypes.bool,
}
export default CustomDialogActions
