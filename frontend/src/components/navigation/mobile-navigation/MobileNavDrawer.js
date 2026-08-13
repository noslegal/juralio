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
import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { withStyles } from 'tss-react/mui'
import { setNavDrawerOpen } from '../../../app/global-header/global-header-actions'
import { JuralioNamedColours } from '../../../theme/juralio-named-colours'
import navigationBackgroundStyles from '../common/navigation-background-styles'
import { buttonHeight } from '../fab-button/NavFab'
import NavColumn from '../user-menu/NavColumn'
import MobileNavHeader from './MobileNavHeader'

const openDrawerWidth = 286
const closedDrawerWidth = 72

const styles = () => ({
  drawerContainer: {
    boxSizing: 'border-box',
    position: 'relative',
    display: 'flex',
  },
  background: {
    opacity: navigationBackgroundStyles.opacity,
    position: 'absolute',
    width: '100%',
    height: '100%',
    background: `url(${navigationBackgroundStyles.image})`,
    backgroundPositionX:
      navigationBackgroundStyles.positionXOffset + closedDrawerWidth,
    backgroundSize: navigationBackgroundStyles.size,
    zIndex: -1,
  },
  drawerContent: {
    position: 'relative',
    width: openDrawerWidth,
    height: '100%',
    backgroundColor: JuralioNamedColours.beige[100],
    zIndex: -2,
  },
  navMenuContainer: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
    flex: '1 1 0px',
    overflow: 'hidden',
  },
  navColumn: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    display: 'flex',
    flexDirection: 'column',
  },
  navSpacer: {
    flex: `0 0 ${buttonHeight}px`,
  },
})

const MobileNavDrawer = props => {
  const dispatch = useDispatch()
  const { classes } = props
  const open = useSelector(state => state.header.isNavDrawerOpen)

  const handleDrawerClose = () => dispatch(setNavDrawerOpen(false))

  return (
    <div className={classes.drawerContainer}>
      <Drawer
        data-test="mobile-navigation-drawer"
        variant="temporary"
        open={open}
        onClose={handleDrawerClose}
      >
        <div className={classes.drawerContent}>
          <div className={classes.background} />
          <div className={classes.navColumn}>
            <MobileNavHeader />
            <NavColumn
              open={open}
              inlineFab={false}
              handleDrawerOpen={() => {}}
              handleDrawerClose={handleDrawerClose}
              closeOnNavigate
            />
          </div>
        </div>
      </Drawer>
    </div>
  )
}

export default withStyles(MobileNavDrawer, styles)
