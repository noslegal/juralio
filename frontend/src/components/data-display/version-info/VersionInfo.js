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

import Typography from '@mui/material/Typography'
import React, { Component } from 'react'
import versionService from '../../../services/version/version-service'

const panelStyle = { color: 'white', paddingLeft: 4, paddingRight: 4 }
export class VersionInfo extends Component {
  state = { versionNumber: '(Unknown version)' }

  componentDidMount() {
    versionService.getVersion().then(response => {
      this.setState({ versionNumber: response.versionNumber })
    })
  }

  render() {
    return (
      <Typography
        variant="body1"
        style={panelStyle}
        className={this.props.background}
      >
        <span data-test="copyright-info">
          Copyright © {new Date().getFullYear()} Juralio Ltd -{' '}
        </span>
        <span data-test="version-info">Build {this.state.versionNumber}</span>
      </Typography>
    )
  }
}

export default VersionInfo
