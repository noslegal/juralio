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

import Drawer from '@mui/material/Drawer'
import classNames from 'classnames'
import React from 'react'
import MobilePostDrawerHeader from './MobilePostDrawerHeader'

const styles = theme => ({
  drawerClose: {
    flex: `0 0 ${theme.spacing(8)}`,
  },
  paperDrawer: {
    width: '100%',
    top: 'auto',
    bottom: 0,
    position: 'fixed',
    background: 'transparent',
    zIndex: theme.zIndex.appBar + 1,
    height: theme.spacing(8),
  },
  paperDrawerClose: {
    transition: theme.transitions.create('height', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.leavingScreen,
    }),
  },
  paperDrawerOpen: {
    height: '100%',

    transition: theme.transitions.create('height', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  drawerInterior: {
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  mobilePostContainer: {
    position: 'relative',
    height: '100%',
    overflow: 'hidden',
    background: 'white',
  },
})

class MobilePostContainer extends React.Component {
  state = { open: false }

  render() {
    return (
      <Drawer
        variant="permanent"
        open={this.state.open}
        onClose={() => this.setState({ open: false })}
        className={this.props.classes.drawerClose}
        classes={{
          paper: classNames(this.props.classes.paperDrawer, {
            [this.props.classes.paperDrawerOpen]: this.state.open,
            [this.props.classes.paperDrawerClose]: !this.state.open,
          }),
        }}
      >
        <div className={this.props.classes.drawerInterior}>
          <MobilePostDrawerHeader
            openPostDrawer={() => this.setState({ open: !this.state.open })}
            open={this.state.open}
          />
          <div className={this.props.classes.mobilePostContainer}>
            {this.props.children}
          </div>
        </div>
      </Drawer>
    )
  }
}

export default MobilePostContainer
