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

import DialogContent from '@mui/material/DialogContent'
import DialogContentText from '@mui/material/DialogContentText'
import PropTypes from 'prop-types'
import React, { useState } from 'react'
import { makeStyles } from 'tss-react/mui'
import juralioColours from '../../../theme/juralio-colours'
import JuralioDialog from '../juralio-dialog/JuralioDialog'

const useStyles = makeStyles()(() => ({
  warningText: {
    color: juralioColours.error,
  },
}))

function ConfirmationDialog(props) {
  const [showLoading, setShowLoading] = useState(false)
  const { classes } = useStyles()

  const handleClose = () => {
    if (props.cancelHandler) props.cancelHandler()
  }

  const handleAction = () => {
    if (props.actionHandler) {
      setShowLoading(true)
      props.actionHandler()
    }
  }

  const closeDialog = () => {
    if (props.cancelHandler) props.cancelHandler()
  }

  return (
    <JuralioDialog
      titleIcon={props.headerIcon}
      open={true}
      onClose={closeDialog}
      titleText={props.titleText}
      handleAction={handleAction}
      hideCancel={props.hideCancel}
      handleCancel={handleClose}
      actionLabel={props.actionText}
      disabled={props.disabled ? props.disabled : false}
      usageContext={`${props.usageContext}.ConfirmationDialog`}
      showLoadingBar={showLoading}
      loadingText={props.loadingText ? props.loadingText : ''}
      cancelText={props.cancelText}
      isKnockOnDialog={props.isKnockOnDialog}
    >
      <DialogContent>
        {props.warningText && (
          <DialogContentText
            data-test="dialog-warning-text"
            className={classes.warningText}
          >
            {props.warningText}
          </DialogContentText>
        )}
        {props.promptText && (
          <DialogContentText data-test="dialog-prompt-text">
            {props.promptText}
          </DialogContentText>
        )}
        {props.extraComponent && props.extraComponent}
      </DialogContent>
    </JuralioDialog>
  )
}

ConfirmationDialog.propTypes = {
  titleText: PropTypes.string,
  warningText: PropTypes.string,
  promptText: PropTypes.string,
}

export default ConfirmationDialog
