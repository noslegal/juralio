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

import { ClickAwayListener } from '@mui/material'
import React from 'react'
import { makeStyles } from 'tss-react/mui'
import GlobalNotificationsListContainer from '../GlobalNotificationsListContainer'

const useStyles = makeStyles()(theme => ({
  cardContainer: {
    backgroundColor: theme.palette.common.white,
    cursor: 'auto',
    marginRight: theme.spacing(),
    marginTop: theme.spacing(2),
    padding: 0,
    position: 'absolute',
    left: 144,
    bottom: 0,
    transform: 'translate(-80px, -55px)',
    width: theme.spacing(50),
    zIndex: '1',
  },
}))

const GlobalNotificationsDropdown = props => {
  const { classes } = useStyles()
  const { close } = props

  return (
    <ClickAwayListener
      onClickAway={e => setTimeout(() => close(e), 50)} // Timeout is required.
    >
      <div
        className={classes.cardContainer}
        data-test="notifications-header-dropdown-menu"
      >
        <GlobalNotificationsListContainer />
      </div>
    </ClickAwayListener>
  )
}

export default GlobalNotificationsDropdown
