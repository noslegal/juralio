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

import { Slide } from '@mui/material'
import Button from '@mui/material/Button'
import Snackbar from '@mui/material/Snackbar'
import React, { Component } from 'react'
import { withTranslation } from 'react-i18next'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { closeSnackbar } from './global-snackbar-actions'

export function mapStateToProps(state) {
  return {
    snackbar: state.snackbar,
  }
}

export function mapDispatchToProps(dispatch) {
  return {
    globalSnackbarActions: {
      closeSnackbar: bindActionCreators(closeSnackbar, dispatch),
    },
  }
}

class GlobalSnackbar extends Component {
  componentWillUnmount = () => this.closeSnackbar()

  closeSnackbar = () => this.props.globalSnackbarActions.closeSnackbar()
  render() {
    return (
      <Snackbar
        style={{ minWidth: '800px' }}
        data-test="global-snackbar"
        open={this.props.snackbar.open}
        autoHideDuration={this.props.snackbar.options.autoHideDuration}
        message={
          <span data-test="snackbar-message">
            {typeof this.props.snackbar.snackbarMessage === 'string'
              ? this.props.t(this.props.snackbar.snackbarMessage)
              : this.props.snackbar.snackbarMessage}
          </span>
        }
        onClose={this.closeSnackbar}
        action={this.getActions()}
        anchorOrigin={this.props.snackbar.options.anchorOrigin}
        slots={{
          transition: Slide,
        }}
      />
    )
  }

  getActions() {
    return this.props.snackbar.snackbarMessage ? (
      <div>
        {this.props.snackbar.action}

        {this.props.snackbar.options.showDismiss && (
          <Button
            key="close"
            aria-label="close"
            color="secondary"
            onClick={this.closeSnackbar}
            size="small"
            data-test="snackbar-dismiss"
          >
            {this.props.t('snackbarCommon.dismiss')}
          </Button>
        )}
      </div>
    ) : null
  }
}

export default withTranslation()(
  connect(mapStateToProps, mapDispatchToProps)(GlobalSnackbar)
)
