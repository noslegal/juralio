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

import { InputLabel } from '@mui/material'
import Typography from '@mui/material/Typography'
import classNames from 'classnames'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { withTranslation } from 'react-i18next'
import { withStyles } from 'tss-react/mui'
import { OPERATION_MODE } from '../../../app/constants'
import { removeNewLines } from '../../../services/helpers/text/text-util-helper'
import colourModifiers from '../../../theme/color-modifiers'
import juralioColours from '../../../theme/juralio-colours'
import { EditIcon } from '../../../theme/navigation/CommonIcons'
import rawColours from '../../../theme/raw-colours'
import RawTextLabel from '../../data-display/raw-text-label/RawTextLabel'
import UpdatableField from '../updatable-field/UpdatableField'

const styles = theme => ({
  readField: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  zeroStatePlaceholder: {
    color: theme.palette.text.secondary,
    fontStyle: 'italic',
  },
  autoWidth: {
    width: 'auto',
  },
  fullWidth: {
    width: '100%',
  },
  clickToEditPointer: {
    cursor: 'pointer',
    overflow: 'hidden',
  },
  hover: {
    '&:hover': {
      backgroundColor: colourModifiers.primaryBackground(
        rawColours.primary.white.primary
      ),
    },
  },
  readFieldAndIcon: {
    display: 'flex',
    gap: theme.spacing(),
  },
  readOnlyClass: {
    color: juralioColours.darkText.primary,
    width: '100%',
  },
})

class ReadEditField extends Component {
  state = {}

  componentDidMount() {
    this.setState({
      value: this.props.value,
      localEdit: !!this.props.hasInitialFocus,
    })
    this.clearValidation()
  }

  componentDidUpdate(previousProps) {
    const isClearingValidation =
      previousProps.validationMessage !== this.props.validationMessage &&
      !this.props.validationMessage

    if (
      previousProps.value !== this.props.value ||
      (isClearingValidation && !this.state.localEdit)
    ) {
      this.setState({
        value: this.props.value,
        localEdit: this.props.editMode,
      })
    }

    if (previousProps.editMode !== this.props.editMode) {
      this.setState({
        localEdit: this.props.editMode,
      })
      this.clearValidation()
    }
  }

  enterEditState = () => {
    if (this.props.readOnly) return false
    this.clearValidation()
    this.setState({ localEdit: true })
  }

  exitEditState = () => {
    this.setState({ localEdit: false })
    if (this.props.setInEditState) {
      this.props.setInEditState(false)
    }
  }

  resetToPropValues = () => {
    this.setState({
      value: this.props.value,
      localEdit: false,
    })
    if (this.props.cancelHandler) this.props.cancelHandler()
  }

  onBlur = (e, canDeny) => {
    e.stopPropagation()
    const shouldDenyBlur = canDeny && this.props.validationMessage
    if (this.props.value !== this.state.value) {
      try {
        this.props
          .onBlur(this.state.value)
          .then(() => {
            if (!this.props.disableClickToEdit) {
              this.exitEditState()
            }
          })
          .catch(() => {
            if (!canDeny) {
              this.resetToPropValues()
            }
          })
      } catch (exception) {
        if (!this.props.disableClickToEdit) {
          this.exitEditState()
        }
      }
    } else if (!shouldDenyBlur) {
      if (this.props.onNoChangeBlur) this.props.onNoChangeBlur(e)
      if (!this.props.disableClickToEdit) {
        this.exitEditState()
      }
    }
  }

  onChange = e => {
    const filteredValue = this.props.multiline
      ? e.target.value
      : removeNewLines(e.target.value)

    if (this.state.value !== filteredValue) {
      this.setState({ value: filteredValue })
      this.clearValidation()
    }
  }

  clearValidation = () => {
    if (this.props.clearValidation) this.props.clearValidation()
  }

  onKeyPress = e => {
    if (e.key === 'Enter' && (!this.props.multiline || e.shiftKey)) {
      this.onBlur(e, true)
    } else if (e.key === 'Escape') {
      this.resetToPropValues()
    }
  }

  clickHandler = () => {
    if (!this.props.disableClickToEdit && !this.state.localEdit)
      this.enterEditState()
  }

  render() {
    const inputProps = {
      classes: {
        root: this.props.classes[this.props.variant],
      },
    }

    return (
      <div
        onClick={this.clickHandler}
        className={classNames({
          [this.props.classes.hover]: !this.props.disableClickToEdit,
          [this.props.classes.autoWidth]: this.props.autoWidth,
          [this.props.classes.fullWidth]:
            !this.props.autoWidth ||
            (this.state.localEdit && this.props.fullWidthOnEdit),
          [this.props.classes.clickToEditPointer]:
            !this.props.disableClickToEdit,
        })}
      >
        {this.props.label && <InputLabel shrink>{this.props.label}</InputLabel>}
        {this.state.localEdit && !this.props.viewOnly ? (
          <>
            <UpdatableField
              data-test="edit-field"
              value={this.state.value}
              mode={OPERATION_MODE.EDIT}
              margin="none"
              validationMessage={this.props.validationMessage}
              onChange={this.onChange}
              onKeyDown={this.onKeyPress}
              onBlur={this.onBlur}
              autoFocus={this.state.localEdit}
              multiline={this.props.multiline || this.props.wrapText}
              inputProps={{
                maxLength: this.props.maxLength,
                style: this.props.textStyle,
              }}
              InputProps={inputProps}
            />
          </>
        ) : (
          this.renderReadOnlyState()
        )}
      </div>
    )
  }

  renderReadOnlyState() {
    return this.state.value ? (
      this.props.multiline ? (
        <RawTextLabel
          rawText={this.state.value}
          variant={this.props.variant}
          collapseProps={this.props.collapseProps}
          onClick={this.props.onClick}
        />
      ) : (
        <div className={this.props.classes.readFieldAndIcon}>
          <Typography
            className={
              this.props.readOnlyClass
                ? this.props.classes.readOnlyClass
                : this.props.classes.readField
            }
            style={{ whiteSpace: !this.props.wrapText && 'nowrap' }}
            variant={this.props.variant}
            data-test="read-field"
            onClick={this.props.onClick}
          >
            {this.state.value}
          </Typography>
          {this.props.showEditIcon && <EditIcon />}
        </div>
      )
    ) : (
      <Typography
        data-test="zero-state-placeholder"
        variant="body1"
        onClick={this.props.onClick}
        className={this.props.classes.zeroStatePlaceholder}
      >
        {this.props.zeroState}
      </Typography>
    )
  }
}

ReadEditField.propTypes = {
  value: PropTypes.string,
  validationMessage: PropTypes.string,
  multiline: PropTypes.bool,
  zeroState: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
  onBlur: PropTypes.func.isRequired,
  clearValidation: PropTypes.func,
  maxLength: PropTypes.number.isRequired,
  variant: PropTypes.string.isRequired,
  readOnlyClass: PropTypes.string,
  hasInitialFocus: PropTypes.bool,
  /** Flag for blocking edit mode entirely*/
  readOnly: PropTypes.bool,
  /** Flag for disabling click to edit mode*/
  disableClickToEdit: PropTypes.bool,
  /** Flag for opening edit mode*/
  editMode: PropTypes.bool,
  /** Handler for cancelled edits */
  cancelHandler: PropTypes.func,
  /** Handler for no change blur - used to reset edit states */
  onNoChangeBlur: PropTypes.func,
}

export default withTranslation()(withStyles(ReadEditField, styles))
