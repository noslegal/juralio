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
import { withStyles } from 'tss-react/mui'
import { checkTextHasNonWhitespaceContent } from '../../../services/helpers/text/text-util-helper'
import JuralioDialog from '../juralio-dialog/JuralioDialog'

const styles = theme => ({
  textEntryField: {
    width: 'calc(100% - 8px)',
  },
  explanatoryText: {
    marginBottom: theme.spacing(2),
  },
  ipadDialog: {
    marginBottom: '30%',
  },
})
/** Dialog to prompt for a single line of text */
class TextPromptDialog extends React.Component {
  state = {
    text: '',
    error: false,
  }

  constructor(props) {
    super(props)
    const appVersion = navigator.appVersion
    this.isIpad = appVersion.includes('iPad')
  }

  onChange = e => {
    this.setState({
      text: e.target.value,
      error: !checkTextHasNonWhitespaceContent(e.target.value),
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

  onActionButtonClicked = () => this.props.actionHandler(this.state.text)

  componentDidUpdate = (prevProps, prevState) => {
    if (prevProps.defaultInput !== this.props.defaultInput) {
      this.setState({
        text: this.props.defaultInput,
        error: !checkTextHasNonWhitespaceContent(this.props.defaultInput),
      })
    }
  }

  render() {
    const { AdditionalFields } = this.props

    return (
      <JuralioDialog
        open={true}
        onClose={this.props.cancelHandler}
        fullScreen={this.props.fullScreen}
        className={this.isIpad && this.props.classes.ipadDialog}
        titleText={this.props.titleText}
        titleIcon={this.props.titleIcon ? this.props.titleIcon : null}
        handleCancel={this.props.cancelHandler}
        handleAction={this.onActionButtonClicked}
        actionLabel={this.props.actionText}
        switchValue={this.props.switchValue}
        switchToggler={this.props.switchToggler}
        switchLabel={this.props.switchLabel}
        disabled={!this.validate(this.state.text)}
        usageContext={`${this.props.usageContext}.TextPromptDialog`}
        showLoadingBar={this.props.showLoadingBar}
        loadingText={this.props.loadingText}
      >
        <DialogContent>
          {
            <Typography
              variant="caption"
              className={this.props.classes.explanatoryText}
              data-test="dialog-header-title-text"
            >
              {this.props.explanatoryText}
            </Typography>
          }
          <TextField
            className={this.props.classes.textEntryField}
            placeholder={this.props.placeholderText}
            data-test="text-prompt-text-field"
            autoFocus={true}
            onChange={this.onChange}
            value={this.state.text}
            error={this.state.error}
            label={this.props.label}
            helperText={this.props.validationMessage}
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
        </DialogContent>
      </JuralioDialog>
    )
  }
}

TextPromptDialog.propTypes = {
  /** Text for dialog title bar */
  titleText: PropTypes.string.isRequired,
  /** Optional explanatory text */
  explanatoryText: PropTypes.string,
  /** Icon for dialog title bar */
  titleIcon: PropTypes.object,
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
  /** Flag for mobile display */
  fullScreen: PropTypes.bool.isRequired,
}

export default withStyles(TextPromptDialog, styles)
