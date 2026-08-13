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

import React, { useEffect, useState } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import GlobalNotificationsList from './GlobalNotificationsList'
import { groupNotifications } from './helpers/notification-grouping'
import {
  loadMoreNotifications,
  markNotificationsDismissed,
} from './redux/global-notifications-actions'

const GlobalNotificationsContainer = () => {
  const currentUser = useSelector(state => state.auth.data.details)
  const dispatch = useDispatch()

  const unreadNotifications = useSelector(
    state => state.globalNotifications.unreadNotifications
  )
  const readNotifications = useSelector(
    state => state.globalNotifications.readNotifications
  )
  const unreadNotificationCount = useSelector(
    state => state.globalNotifications.unreadNotificationCount
  )
  const unreadCountLabel = useSelector(
    state => state.globalNotifications.unreadCountLabel
  )
  const isLoading = useSelector(state => state.globalNotifications.isLoading)
  const isLoadingMore = useSelector(
    state => state.globalNotifications.isLoadingMore
  )
  const nextCursor = useSelector(state => state.globalNotifications.nextCursor)

  const initialNotificationsState = {
    isLoading: isLoading,
    read: readNotifications,
    unread: unreadNotifications,
    unreadCount: unreadNotificationCount,
    unreadCountLabel: unreadCountLabel,
  }

  const [notifications, setNotifications] = useState(null)

  const getCountLabelText = updatedUnreadNotifications => {
    if (updatedUnreadNotifications.length === 0) return ''
    return updatedUnreadNotifications.length > 99
      ? '99+'
      : '' + updatedUnreadNotifications.length
  }

  useEffect(() => {
    const unreadNotifications = groupNotifications(
      initialNotificationsState.unread,
      currentUser.id
    )
    setNotifications({
      ...initialNotificationsState,
      read: groupNotifications(initialNotificationsState.read, currentUser.id),
      unread: unreadNotifications,
      unreadCount: unreadNotifications.length,
      unreadCountLabel: getCountLabelText(unreadNotifications),
    })
  }, [unreadNotifications, readNotifications]) // eslint-disable-line

  const clearNotification = notifications => {
    notifications.forEach(notification =>
      dispatch(markNotificationsDismissed(notification, currentUser.id))
    )
  }

  const loadMore = () => {
    dispatch(loadMoreNotifications(nextCursor, currentUser.id))
  }

  return (
    <GlobalNotificationsList
      notifications={notifications}
      currentUser={currentUser}
      clearNotification={clearNotification}
      hasMore={!!nextCursor}
      isLoadingMore={isLoadingMore}
      onLoadMore={loadMore}
    />
  )
}

export default GlobalNotificationsContainer
