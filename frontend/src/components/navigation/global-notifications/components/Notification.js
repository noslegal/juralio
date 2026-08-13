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

import { Typography, useMediaQuery } from '@mui/material'
import { default as React, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { makeStyles } from 'tss-react/mui'
import navigationService from '../../../../services/navigation/navigation-service'
import juralioColours from '../../../../theme/juralio-colours'
import juralioTheme from '../../../../theme/juralio-theme'
import rawColours from '../../../../theme/raw-colours'
import {
  getNotificationContent,
  getNotificationNavigationDetails,
} from '../helpers/typed-payload-renderers'
import { markNotificationRead } from '../redux/global-notifications-actions'
import ClosableItem from './ClosableItem'

const useStyles = makeStyles()(theme => ({
  root: {
    backgroundColor: rawColours.notifications.background,
    cursor: 'pointer',
    display: 'flex',
    justifyContent: 'space-between',
    maxHeight: theme.spacing(10),
    padding: theme.spacing(),
    paddingLeft: theme.spacing(2),
    '&:hover': {
      backgroundColor: juralioColours.hover.hoverMedium,
    },
  },
  content: {
    maxWidth: theme.spacing(35.75),
    minWidth: theme.spacing(35.75),
  },
  title: {
    fontWeight: theme.typography.fontWeightBold,
    paddingBottom: theme.spacing(0.5),
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  titleUnread: {
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
  },
  rightHandColumn: {
    alignItems: 'center',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    paddingLeft: theme.spacing(0.5),
    width: theme.spacing(8),
    minWidth: theme.spacing(8),
    position: 'relative',
    paddingTop: theme.spacing(1.5),
    paddingBottom: theme.spacing(1.5),
  },
  time: {
    fontWeight: theme.typography.fontWeightLight,
  },
  notificationBody: {
    wordWrap: 'break-word',
  },
  icon: {},
}))

const Notification = props => {
  const { t } = useTranslation()

  const { classes } = useStyles()
  const history = useNavigate()
  const dispatch = useDispatch()

  const { notification, currentUser, clearNotification } = props
  const titleClass = notification.read ? classes.titleUnread : classes.title
  const content = getNotificationContent(t, notification, currentUser)

  const [isHovering, setIsHovering] = useState(false)
  const [mobileSwipeStart, setMobileSwipeStart] = useState(0)
  const [mobileSwipeEnd, setMobileSwipeEnd] = useState(0)
  const isMobileView = useMediaQuery(juralioTheme.breakpoints.down('md'))

  const handleClick = notification => {
    const group = [notification, ...(notification.relatedNotifications || [])]
    group
      .filter(n => !n.read)
      .forEach(n => dispatch(markNotificationRead(n, currentUser.id)))
    navigationService.goToTarget(
      history,
      getNotificationNavigationDetails(notification)
    )
  }
  const clickHandler = () => handleClick(notification)

  const handleTouchStart = e => {
    setMobileSwipeStart(e.targetTouches[0].clientX)
  }
  const handleTouchMove = e => {
    setMobileSwipeEnd(e.targetTouches[0].clientX)
  }
  const handleTouchEnd = () => {
    if (Math.abs(mobileSwipeStart - mobileSwipeEnd) > 150) {
      setIsHovering(true)
    }
  }

  const handleCloseDivClick = () => {
    if (isMobileView) {
      setIsHovering(!isHovering)
    }
  }

  return (
    <div
      className={classes.root}
      key={notification.id}
      onClick={clickHandler}
      data-test="global-notification"
    >
      <div className={classes.content}>
        <Typography
          className={titleClass}
          data-test="global-notification-title"
        >
          {content.title}
        </Typography>
        <Typography
          variant="caption"
          data-test="global-notification-body"
          className={classes.notificationBody}
        >
          {content.body}
        </Typography>
      </div>
      <div
        className={classes.rightHandColumn}
        onMouseEnter={() => {
          if (!isMobileView) {
            setIsHovering(true)
          }
        }}
        onMouseLeave={() => {
          if (!isMobileView) {
            setIsHovering(false)
          }
        }}
        onMouseOver={() => {
          if (!isMobileView) {
            setIsHovering(true)
          }
        }}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onClick={handleCloseDivClick}
      >
        <div className={classes.icon}>{content.icon}</div>
        <div className={classes.time}>
          <Typography variant="caption">{content.time}</Typography>
        </div>
        <ClosableItem
          isHovering={isHovering}
          closeNotification={e => {
            e.stopPropagation()
            clearNotification([
              notification,
              ...notification.relatedNotifications,
            ])
          }}
        />
      </div>
    </div>
  )
}

export default Notification
