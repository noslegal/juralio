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

import { Button } from '@mui/material'
import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { closeSnackbar } from '../../app/global-snackbar/global-snackbar-actions'
import withRouter from '../navigation/WithRouter'

class AdditionalButtonAction extends React.Component {
  handleRedirect = () => {
    this.props.actions.closeSnackbar()
    if (this.props.redirect) {
      this.props.router.navigate(this.props.redirect)
    }
  }

  render() {
    return (
      <Button color="secondary" size="small" onClick={this.handleRedirect}>
        {this.props.text}
      </Button>
    )
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      closeSnackbar: bindActionCreators(closeSnackbar, dispatch),
    },
  }
}

const ConnectedAdditionalButton = withRouter(
  connect(null, mapDispatchToProps)(AdditionalButtonAction)
)

export const additionalButton = (text, redirect) => (
  <ConnectedAdditionalButton text={text} redirect={redirect} />
)
