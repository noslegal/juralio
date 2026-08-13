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

import Button from '@mui/material/Button'
import React from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { closeSnackbar } from '../../app/global-snackbar/global-snackbar-actions'
import withRouter from '../navigation/WithRouter'
import { projectRedirectPath } from './ProjectRedirect'

class ProjectRedirectSnackbarAction extends React.Component {
  handleRedirect = () => {
    this.props.actions.closeSnackbar()
    this.props.router.navigate(
      projectRedirectPath(
        this.props.matterId,
        this.props.projectId,
        this.props.taskId
      )
    )
  }

  render() {
    return (
      <Button
        color="secondary"
        size="small"
        onClick={this.handleRedirect}
        data-test="snackbar-redirect-action-button"
      >
        open
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

const ConnectedProjectRedirectSnackbarAction = withRouter(
  connect(null, mapDispatchToProps)(ProjectRedirectSnackbarAction)
)

export const getProjectRedirectSnackbarAction = (
  matterId,
  projectId,
  selectedTaskId
) => (
  <ConnectedProjectRedirectSnackbarAction
    matterId={matterId}
    projectId={projectId}
    taskId={selectedTaskId}
  />
)
