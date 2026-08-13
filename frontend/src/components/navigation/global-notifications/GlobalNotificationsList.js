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
import { Button, CircularProgress, Typography } from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import juralioColours from '../../../theme/juralio-colours'
import rawColours from '../../../theme/raw-colours'
import JuralioMiniLinearProgress from '../../feedback/juralio-linear-progress/JuralioMiniLinearProgress'
import Notification from './components/Notification'
import NotificationCountChip from './components/NotificationCountChip'

const useStyles = makeStyles()(theme => ({
  root: {
    boxShadow: theme.shadows[7],
    display: 'flex',
    flexDirection: 'column',
  },
  listContent: {
    maxHeight: 400,
    overflowY: 'auto',
  },
  zeroState: {
    display: 'flex',
    maxHeight: 400,
    minHeight: 400,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: rawColours.notifications.background,
  },
  header: {
    display: 'flex',
    alignItems: 'center',
    padding: theme.spacing(),
    justifyContent: 'space-between',
  },
  olderHeading: {
    fontWeight: theme.typography.fontWeightBold,
    backgroundColor: rawColours.notifications.background,
    padding: theme.spacing(2),
    paddingLeft: theme.spacing(2),
  },
  titleAndCount: {
    display: 'flex',
    marginTop: theme.spacing(0.5),
  },
  chevron: {
    marginTop: theme.spacing(0.5),
    cursor: 'pointer',
  },
  loadMore: {
    borderRadius: 0,
    padding: theme.spacing(1.5),
    backgroundColor: rawColours.notifications.background,
    fontWeight: theme.typography.fontWeightBold,
    '&:hover': {
      backgroundColor: juralioColours.hover.hoverMedium,
    },
  },
}))

const GlobalNotificationsList = props => {
  const {
    currentUser,
    notifications,
    clearNotification,
    hasMore,
    isLoadingMore,
    onLoadMore,
  } = props
  const { classes } = useStyles()
  const { t } = useTranslation()
  if (!notifications) return null
  const hasNewNotifications = notifications.unread.length > 0
  const hasReadNotifications = notifications.read.length > 0

  const hasNoNotifications = hasNewNotifications + hasReadNotifications === 0

  return (
    <div className={classes.root}>
      <div className={classes.header}>
        <div className={classes.titleAndCount}>
          <Typography>{t('notifications.title')}</Typography>
          {hasNewNotifications && (
            <NotificationCountChip label={notifications.unreadCountLabel} />
          )}
        </div>
        <CloseIcon className={classes.chevron} />
      </div>

      <JuralioMiniLinearProgress show={notifications.isLoading} height={4} />

      {hasNoNotifications ? (
        <div
          className={classes.zeroState}
          data-test="notifications-list-zero-state"
        >
          <Typography>{t('notifications.text.zeroState')}</Typography>
        </div>
      ) : (
        <div className={classes.listContent}>
          <div data-test="unread-notifications">
            {notifications.unread.map(n => (
              <Notification
                key={n.id}
                notification={n}
                currentUser={currentUser}
                clearNotification={clearNotification}
              />
            ))}
          </div>

          {hasReadNotifications && notifications.unread.length > 0 && (
            <Typography className={classes.olderHeading}>
              {t('notifications.olderHeader')}
            </Typography>
          )}

          <div data-test="read-notifications">
            {notifications.read.map(n => (
              <Notification
                key={n.id}
                notification={n}
                currentUser={currentUser}
                clearNotification={clearNotification}
              />
            ))}
          </div>

          {hasMore && (
            <Button
              fullWidth
              className={classes.loadMore}
              onClick={e => {
                e.stopPropagation()
                onLoadMore()
              }}
              disabled={isLoadingMore}
              data-test="notifications-load-more"
              startIcon={
                isLoadingMore ? (
                  <CircularProgress size={16} color="inherit" />
                ) : null
              }
            >
              {t('notifications.loadMore')}
            </Button>
          )}
        </div>
      )}
    </div>
  )
}

export default GlobalNotificationsList
