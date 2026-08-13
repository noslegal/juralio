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

import CloseIcon from '@mui/icons-material/Close'
import ExpandIcon from '@mui/icons-material/ExpandLess'
import { Typography } from '@mui/material'
import React from 'react'
import { withStyles } from 'tss-react/mui'
import juralioColours from '../../../../../../theme/juralio-colours'
import { JuralioNamedColours } from '../../../../../../theme/juralio-named-colours'

const styles = theme => ({
  header: {
    display: 'flex',
    flex: `0 0 ${theme.spacing(8)}`,
    alignItems: 'center',
    width: '100%',
    background: JuralioNamedColours.black[200],
    borderRadius: `${theme.spacing(0.5)} ${theme.spacing(1.0 / 2)} 0px 0px`,
  },
  openCloseIcon: {
    width: theme.spacing(3),
    height: theme.spacing(3),
    margin: theme.spacing(2),
    position: 'relative',
  },
  icon: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    color: juralioColours.whiteText.primary,
    transition: theme.transitions.create('opacity', {
      easing: theme.transitions.easing.sharp,
      duration: theme.transitions.duration.enteringScreen,
    }),
  },
  headerTitle: {
    color: juralioColours.whiteText.primary,
  },
})

const OpenCloseIcon = withStyles(props => {
  return (
    <div className={props.classes.openCloseIcon}>
      <ExpandIcon
        className={props.classes.icon}
        style={{ opacity: props.open ? 0.0 : 1.0 }}
      />
      <CloseIcon
        className={props.classes.icon}
        style={{ opacity: props.open ? 1.0 : 0.0 }}
      />
    </div>
  )
}, styles)

const MobilePostDrawerHeader = withStyles(props => {
  return (
    <div
      className={props.classes.header}
      onClick={props.openPostDrawer}
      data-test="mobile-post-drawer-header"
    >
      <OpenCloseIcon open={props.open} />
      <Typography variant="h6" className={props.classes.headerTitle}>
        Posts
      </Typography>
    </div>
  )
}, styles)

export default MobilePostDrawerHeader
