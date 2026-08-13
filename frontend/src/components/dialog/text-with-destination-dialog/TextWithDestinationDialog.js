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

import { Typography } from '@mui/material'
import DialogContent from '@mui/material/DialogContent'
import TextField from '@mui/material/TextField'
import PropTypes from 'prop-types'
import React from 'react'
import { withTranslation } from 'react-i18next'
import { withStyles } from 'tss-react/mui'
import { DESKTOP_DIALOG_WIDTH } from '../../../app/constants'
import { checkTextHasNonWhitespaceContent } from '../../../services/helpers/text/text-util-helper'
import { formatReferenceNumber } from '../../../services/task/task-text-format-service'
import { JuralioCoreColors } from '../../../theme/juralio-core-colors'
import ErrorBox from '../../data-display/error-box/ErrorBox'
import JuralioLink from '../../navigation/juralio-link/JuralioLink'
import JuralioDialog from '../juralio-dialog/JuralioDialog'

const styles = theme => ({
  textEntryField: {
    width: 'calc(100% - 8px)',
  },
  taskDestinationField: {
    maxWidth: 39 * theme.spacing(1),
    textOverflow: 'ellipsis',
    overflow: 'hidden',
    whiteSpace: 'nowrap',
  },
  editLink: {
    color: JuralioCoreColors.primary.main,
    visibility: 'visible',
    '&:hover': {
      cursor: 'pointer',
    },
  },
  editLinkHidden: {
    visibility: 'hidden',
  },
  taskDestinationContainer: {
    paddingTop: theme.spacing(4),
    display: 'flex',
    flexDirection: 'column',
    maxHeight: theme.spacing(6),
  },
  ipadDialog: {
    marginBottom: '30%',
  },
})

/**
 * Dialog to prompt for a single line of text with optional task destination.
 */
class TextWithDestinationDialog extends React.Component {
  state = { text: '', showError: false }
  constructor(props) {
    super(props)
    const appVersion = navigator.appVersion
    this.isIpad = appVersion.includes('iPad')
  }

  onChange = e => {
    this.setState({
      text: e.target.value,
      showError: false,
    })
  }

  validate = () => {
    if (this.props.additionalValidator) {
      return (
        this.props.additionalValidator() &&
        checkTextHasNonWhitespaceContent(this.state.text)
      )
    }
    return checkTextHasNonWhitespaceContent(this.state.text)
  }

  onActionButtonClicked = () => {
    this.setState({ showError: true })
    this.props.actionHandler(this.state.text)
  }

  componentDidUpdate = (prevProps, prevState) => {
    if (prevProps.text !== this.props.text) {
      this.setState({
        text: this.props.text,
        error: !checkTextHasNonWhitespaceContent(this.props.text),
      })
    }
  }

  render() {
    const { t, AdditionalFields } = this.props
    const linkStyle = { paddingTop: 12 }
    return (
      <JuralioDialog
        open={true}
        onClose={this.props.cancelHandler}
        fullScreen={this.props.fullScreen}
        className={this.isIpad && this.props.classes.ipadDialog}
        titleText={this.props.titleText}
        titleIcon={this.props.titleIcon}
        handleCancel={this.props.cancelHandler}
        handleAction={this.onActionButtonClicked}
        actionLabel={this.props.actionText}
        switchValue={this.props.switchValue}
        switchToggler={this.props.switchToggler}
        switchLabel={this.props.switchLabel}
        disabled={!this.validate()}
        usageContext={`${this.props.usageContext}.TextWithDestinationDialog`}
        showLoadingBar={this.props.showLoadingBar}
        loadingText={this.props.loadingText}
      >
        <DialogContent
          style={this.props.fullScreen ? {} : { width: DESKTOP_DIALOG_WIDTH }}
        >
          <TextField
            className={this.props.classes.textEntryField}
            placeholder={this.props.placeholderText}
            data-test="text-prompt-text-field"
            autoFocus={true}
            onChange={this.onChange}
            value={this.state.text}
            label={this.props.label}
            slotProps={{
              htmlInput: {
                maxLength: this.props.maximumLength,
              },
            }}
          />
          {AdditionalFields ? (
            <div className={this.props.classes.textEntryField}>
              {AdditionalFields}
            </div>
          ) : null}
          <div className={this.props.classes.taskDestinationContainer}>
            <Typography
              variant="body1"
              data-test="task-creation-destination-field"
              className={this.props.classes.taskDestinationField}
            >
              {this.props.destinationLabelText}
              {this.getDestinationLabel(this.props.destinationParentTask)}
            </Typography>
            <JuralioLink
              value={`${t('taskCreation.editDestination')}`}
              onClick={this.onClickChangeDestination}
              variant="caption"
              style={linkStyle}
              data-test="task-creation-destination-field-edit"
              className={this.getEditLinkClass()}
            />
          </div>
          {this.props.error && this.state.showError === true && (
            <ErrorBox error={this.props.error} padding={true} />
          )}
        </DialogContent>
      </JuralioDialog>
    )
  }

  getEditLinkClass = () =>
    this.validate()
      ? this.props.classes.editLink
      : this.props.classes.editLinkHidden

  getDestinationLabel = task => ` ${task.name} ${formatReferenceNumber(task)}`

  onClickChangeDestination = () => {
    this.setState({ showError: false })
    if (this.validate()) this.props.editDestination(this.state.text)
  }
}

TextWithDestinationDialog.propTypes = {
  /** Text for dialog title bar */
  titleText: PropTypes.string.isRequired,
  /** Icon for dialog title bar */
  titleIcon: PropTypes.oneOfType([PropTypes.func, PropTypes.object]).isRequired,
  /** Text for placeholder */
  placeholderText: PropTypes.string.isRequired,
  /** Max length of string */
  maximumLength: PropTypes.number.isRequired,
  /** Text for the Action button */
  actionText: PropTypes.string.isRequired,
  /** Cancel function handler */
  cancelHandler: PropTypes.func.isRequired,
  /** Action function handler */
  actionHandler: PropTypes.func.isRequired,
  /** EditDestination function handler */
  editDestination: PropTypes.func.isRequired,
  /** Flag for mobile display */
  fullScreen: PropTypes.bool.isRequired,
  /** Destination Parent task */
  destinationParentTask: PropTypes.object.isRequired,
  /** Destination label text */
  destinationLabelText: PropTypes.string.isRequired,
  /** Label for Privacy switch */
  switchLabel: PropTypes.string,
  /** The usage context */
  usageContext: PropTypes.string,
  /** Switch control Value */
  switchValue: PropTypes.bool,
  /** Switch Toggle handler */
  switchToggler: PropTypes.func,
}

export default withTranslation()(withStyles(TextWithDestinationDialog, styles))
