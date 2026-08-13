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

import IconButton from '@mui/material/IconButton'
import Typography from '@mui/material/Typography'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { withStyles } from 'tss-react/mui'
import { OPERATION_MODE } from '../../../app/constants'
import { JuralioCoreColors } from '../../../theme/juralio-core-colors'
import { EditIcon } from '../../../theme/navigation/CommonIcons'
import UpdatableField from '../updatable-field/UpdatableField'

const styles = theme => ({
  urlFieldRoot: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    lineHeight: theme.spacing(2),
    paddingTop: 4,
    display: 'flex',
    flexDirection: 'row',
    maxWidth: 400,
    [theme.breakpoints.down('md')]: {
      width: 320,
    },
  },
  readField: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    color: JuralioCoreColors.primary.main,
    textDecoration: 'none',
  },
  link: {
    textDecoration: 'none',
    overflowX: 'hidden',
    whiteSpace: 'nowrap',
  },
  editField: {
    [theme.breakpoints.down('md')]: {
      width: `calc(100% - ${theme.spacing(2)})`,
    },
  },
  editButton: {
    position: 'relative',
    marginLeft: theme.spacing(1),
    height: theme.spacing(3),
    width: theme.spacing(3),
  },
  editIcon: {
    color: theme.palette.grey.A700,
    width: '100%',
    height: '100%',
  },
  editLabel: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    right: 0,
    width: 'auto',
    margin: theme.spacing(0.5),
  },
  editFieldContainer: {
    width: `calc(100% - ${theme.spacing(2)})`,
  },
})

class ReadEditUrlField extends Component {
  state = { editing: false }

  refreshInternalState = () => {
    this.setState({
      url: this.props.url,
    })
  }

  componentDidMount() {
    this.refreshInternalState()
  }

  componentDidUpdate(previousProps) {
    if (
      (!this.state.editing && this.state.url !== this.props.url) ||
      previousProps.url !== this.props.url
    ) {
      this.refreshInternalState()
    }
  }

  render() {
    return this.state.editing ? this.renderUrlField() : this.renderUrlLink()
  }

  onChange = e => {
    this.clearValidation()
    this.setState({ url: e.target.value })
  }

  clearValidation = () => {
    if (this.props.clearValidation) this.props.clearValidation()
  }

  onBlur = () => {
    if (this.props.validationMessage) {
      this.exitEditAndDiscardChanges()
    } else if (this.props.url !== this.state.url) {
      try {
        this.props.onBlur(this.state.url).then(
          () => {
            this.exitEditState()
          },
          () => {}
        )
      } catch (exception) {
        this.exitEditState()
      }
    } else this.exitEditState()
  }

  onKeyPress = e => {
    if (e.key === 'Enter') this.onBlur()
    else if (e.key === 'Escape') this.exitEditAndDiscardChanges()
  }

  exitEditAndDiscardChanges = () => {
    this.clearValidation()
    this.setState({
      url: this.props.url,
      editing: false,
    })
  }

  exitEditState = () => this.setState({ editing: false })

  renderUrlField() {
    const { props } = this
    return (
      <div className={props.classes.editFieldContainer}>
        <UpdatableField
          className={props.classes.editField}
          data-test="edit-field"
          value={this.state.url}
          mode={OPERATION_MODE.EDIT}
          margin="none"
          viewOnly={props.viewOnly}
          validationMessage={props.validationMessage}
          onChange={this.onChange}
          onKeyDown={this.onKeyPress}
          onBlur={this.onBlur}
          autoFocus={true}
          multiline={false}
          inputProps={{
            maxLength: 1024,
          }}
        />
      </div>
    )
  }

  renderUrlLink() {
    const { props } = this

    return props.url ? (
      <div className={props.classes.urlFieldRoot}>
        <a
          data-test="read-edit-url-link"
          href={props.url}
          target="_blank"
          rel="noopener noreferrer"
          className={props.classes.link}
        >
          <Typography variant="body1" className={props.classes.readField}>
            {props.url}
          </Typography>
        </a>
        {!props.readOnly && !props.viewOnly ? (
          <div>
            <IconButton
              className={props.classes.editButton}
              onClick={this.clickEnterEditMode}
              data-test="task-link-url-edit-button"
              size="small"
              classes={{ label: props.classes.editLabel }}
            >
              <EditIcon className={props.classes.editIcon} fontSize="small" />
            </IconButton>
          </div>
        ) : null}
      </div>
    ) : null
  }

  clickEnterEditMode = () => this.setState({ editing: true })
}

ReadEditUrlField.propTypes = {
  /** url for editor */
  url: PropTypes.string.isRequired,
  /** Flag for readOnly state */
  readOnly: PropTypes.bool.isRequired,
  /** Handler for field losing focus */
  onBlur: PropTypes.func.isRequired,
}

export default withStyles(ReadEditUrlField, styles)
