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

import React from 'react'
import { withStyles } from 'tss-react/mui'
import NoPermission from '../../components/data-display/no-permission/NoPermission'
import RoleToggle from '../../components/inputs/role-toggle/RoleToggle'

const styles = {
  root: {
    display: 'flex',
    flex: 1,
  },
  message: {
    margin: 'auto',
  },
}

export default requiredRole => (WrappedComponent, restrictedMessage) =>
  withStyles(
    class extends React.Component {
      render() {
        return (
          <div className={this.props.classes.root}>
            <RoleToggle excludes activity={requiredRole}>
              <NoPermission
                data-test="restricted-message"
                text={restrictedMessage}
              />
            </RoleToggle>
            <RoleToggle activity={requiredRole}>
              <WrappedComponent />
            </RoleToggle>
          </div>
        )
      }
    },
    styles
  )
