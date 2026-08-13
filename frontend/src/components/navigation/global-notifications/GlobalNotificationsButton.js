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

import NotificationsIcon from '@mui/icons-material/Notifications'
import React, { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { makeStyles } from 'tss-react/mui'
import rawColours from '../../../theme/raw-colours'
import GlobalNotificationsDropdown from './components/GlobalNotificationsDropdown'
import NotificationCountChip from './components/NotificationCountChip'
import { markNotificationRead } from './redux/global-notifications-actions'
import colorModifiers from '../../../theme/color-modifiers'

const useStyles = makeStyles()(theme => ({
  root: {
    padding: theme.spacing(),
    paddingTop: theme.spacing(),
    cursor: 'pointer',
  },
  icon: {
    paddingTop: 4,
    height: theme.spacing(3),
    width: theme.spacing(3),
  },
  notificationCount: {
    position: 'absolute',
    marginTop: `-${theme.spacing(4)}`,
    marginLeft: theme.spacing(0.75),
  },
}))

const GlobalNotificationsButton = props => {
  const { classes } = useStyles()
  const dispatch = useDispatch()
  const [showDropdown, setShowDropdown] = useState(false)
  const unreadCountLabel = useSelector(
    state => state.globalNotifications.unreadCountLabel
  )
  const currentUser = useSelector(state => state.auth.data.details)

  const toggleDropdown = () => {
    if (showDropdown && unreadCountLabel.length > 0) {
      dispatch(markNotificationRead({ id: -1 }, currentUser.id))
    }
    setShowDropdown(!showDropdown)
  }

  return (
    <div
      className={classes.root}
      onClick={toggleDropdown}
      data-test="notifications-header-navigation-button"
    >
      <NotificationsIcon
        style={
          props.showHover === 6
            ? { fill: rawColours.status.notRequired.dark }
            : {
                fill: colorModifiers.primaryBackground(
                  rawColours.status.notRequired.dark
                ),
              }
        }
        className={classes.icon}
      />
      {!showDropdown && (
        <div className={classes.notificationCount}>
          <NotificationCountChip label={unreadCountLabel} alert={true} />
        </div>
      )}
      {showDropdown && <GlobalNotificationsDropdown close={toggleDropdown} />}
    </div>
  )
}

export default GlobalNotificationsButton
