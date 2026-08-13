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

import {
  MARK_NOTIFICATION_READ,
  REQUEST_NOTIFICATIONS,
  RECEIVE_NOTIFICATIONS,
  END_REQUEST_NOTIFICATIONS,
  DISMISS_NOTIFICATIONS,
  REQUEST_MORE_NOTIFICATIONS,
  APPEND_NOTIFICATIONS,
  END_REQUEST_MORE_NOTIFICATIONS,
} from './global-notifications-actions'
import { groupNotifications } from '../helpers/notification-grouping'

const notificationsState = {
  totalNotificationCount: -1,
  readNotifications: [],
  unreadNotifications: [],
  unreadNotificationCount: -1,
  unreadCountLabel: '',
  nextCursor: null,
  isLoaded: false,
  isLoading: false,
  isLoadingMore: false,
}

const getCountLabelText = updatedUnreadNotifications => {
  if (updatedUnreadNotifications.length === 0) return ''
  return updatedUnreadNotifications.length > 99
    ? '99+'
    : '' + updatedUnreadNotifications.length
}

const sortNotificationsNewestFirst = (a, b) => (a.id < b.id ? 1 : -1)

const globalNotificationsReducer = (state = notificationsState, action) => {
  switch (action.type) {
    case MARK_NOTIFICATION_READ:
      if (action.notification.id === -1) {
        const updatedReadNotifications = [
          ...state.readNotifications,
          ...state.unreadNotifications.map(n => ({ ...n, read: true })),
        ]
        updatedReadNotifications.sort(sortNotificationsNewestFirst)

        return {
          ...state,
          readNotifications: updatedReadNotifications,
          unreadNotifications: [],
          unreadNotificationCount: 0,
          unreadCountLabel: getCountLabelText([]),
          totalNotificationCount: 0,
        }
      } else {
        const updatedUnreadNotifications = state.unreadNotifications.filter(
          n => n.id !== action.notification.id
        )
        const updatedReadNotifications = [
          ...state.readNotifications,
          { ...action.notification, read: true },
        ]
        updatedReadNotifications.sort(sortNotificationsNewestFirst)

        const groupedNotifications = groupNotifications(
          updatedUnreadNotifications,
          action.currentUserId
        )

        return {
          ...state,
          readNotifications: updatedReadNotifications,
          unreadNotifications: updatedUnreadNotifications,
          unreadNotificationCount: updatedUnreadNotifications.length,
          unreadCountLabel: getCountLabelText(groupedNotifications),
          totalNotificationCount: updatedUnreadNotifications.length,
        }
      }
    case REQUEST_NOTIFICATIONS:
      return { ...state, isLoaded: false, isLoading: true }
    case END_REQUEST_NOTIFICATIONS:
      return { ...state, isLoaded: true, isLoading: false }
    case DISMISS_NOTIFICATIONS:
      const updatedReadNotifications = state.readNotifications.filter(
        n => n.id !== action.notification.id
      )
      const updatedUnreadNotifications = state.unreadNotifications.filter(
        n => n.id !== action.notification.id
      )

      const groupedNotifics = groupNotifications(
        updatedUnreadNotifications,
        action.currentUserId
      )

      return {
        ...state,
        readNotifications: updatedReadNotifications,
        unreadNotifications: updatedUnreadNotifications,
        unreadNotificationCount: updatedUnreadNotifications.length,
        unreadCountLabel: getCountLabelText(groupedNotifics),
        totalNotificationCount: updatedUnreadNotifications.length,
      }
    case RECEIVE_NOTIFICATIONS:
      const notifications = action.notifications
      const unreadNotifications = notifications.filter(n => !n.read)
      const readNotifications = notifications.filter(n => n.read)

      const groupedNotifs = groupNotifications(
        unreadNotifications,
        action.currentUserId
      )

      return {
        ...state,
        totalNotificationCount: action.unreadCount,
        readNotifications: readNotifications,
        unreadNotifications: unreadNotifications,
        unreadNotificationCount: unreadNotifications.length,
        unreadCountLabel: getCountLabelText(groupedNotifs),
        nextCursor: action.nextCursor,
        isLoaded: true,
        isLoading: false,
      }
    case REQUEST_MORE_NOTIFICATIONS:
      return { ...state, isLoadingMore: true }
    case END_REQUEST_MORE_NOTIFICATIONS:
      return { ...state, isLoadingMore: false }
    case APPEND_NOTIFICATIONS: {
      const existingIds = new Set([
        ...state.unreadNotifications.map(n => n.id),
        ...state.readNotifications.map(n => n.id),
      ])
      const newNotifications = action.notifications.filter(
        n => !existingIds.has(n.id)
      )

      const appendedUnread = [
        ...state.unreadNotifications,
        ...newNotifications.filter(n => !n.read),
      ]
      const appendedRead = [
        ...state.readNotifications,
        ...newNotifications.filter(n => n.read),
      ]
      appendedRead.sort(sortNotificationsNewestFirst)

      const appendedGroupedUnread = groupNotifications(
        appendedUnread,
        action.currentUserId
      )

      return {
        ...state,
        readNotifications: appendedRead,
        unreadNotifications: appendedUnread,
        unreadNotificationCount: appendedUnread.length,
        unreadCountLabel: getCountLabelText(appendedGroupedUnread),
        nextCursor: action.nextCursor,
        isLoadingMore: false,
      }
    }
    default:
      return state
  }
}

export default globalNotificationsReducer
