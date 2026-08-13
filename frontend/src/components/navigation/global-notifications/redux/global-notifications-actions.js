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

import { StatusCodes } from 'http-status-codes'
import userNotificationService from '../../../../services/user-notification/user-notification-service'

export const END_REQUEST_NOTIFICATIONS = 'END_REQUEST_NOTIFICATIONS'
export const MARK_NOTIFICATION_READ = 'MARK_NOTIFICATION_READ'
export const RECEIVE_NOTIFICATIONS = 'RECEIVE_NOTIFICATIONS'
export const REQUEST_NOTIFICATIONS = 'REQUEST_NOTIFICATIONS'
export const DISMISS_NOTIFICATIONS = 'DISMISS_NOTIFICATIONS'
export const REQUEST_MORE_NOTIFICATIONS = 'REQUEST_MORE_NOTIFICATIONS'
export const APPEND_NOTIFICATIONS = 'APPEND_NOTIFICATIONS'
export const END_REQUEST_MORE_NOTIFICATIONS = 'END_REQUEST_MORE_NOTIFICATIONS'

export const requestNotifications =
  (currentNotificationCount, currentUserId) => dispatch => {
    dispatch({
      type: REQUEST_NOTIFICATIONS,
    })

    return userNotificationService.getUnreadCount().then(result => {
      const unreadCount = result.body.count
      if (unreadCount !== currentNotificationCount) {
        return userNotificationService.getNotifications().then(listResult => {
          if (listResult.status === StatusCodes.OK) {
            dispatch(
              receiveNotifications(listResult.body, unreadCount, currentUserId)
            )
          }
        })
      } else {
        dispatch({
          type: END_REQUEST_NOTIFICATIONS,
        })
      }
    })
  }

export const receiveNotifications =
  (json, unreadCount, currentUserId) => dispatch => {
    dispatch({
      type: RECEIVE_NOTIFICATIONS,
      notifications: json.items,
      nextCursor: json.nextCursor,
      unreadCount: unreadCount,
      currentUserId: currentUserId,
    })
  }

export const loadMoreNotifications = (cursor, currentUserId) => dispatch => {
  dispatch({
    type: REQUEST_MORE_NOTIFICATIONS,
  })

  return userNotificationService
    .getNotifications(cursor)
    .then(listResult => {
      if (listResult.status === StatusCodes.OK) {
        dispatch({
          type: APPEND_NOTIFICATIONS,
          notifications: listResult.body.items,
          nextCursor: listResult.body.nextCursor,
          currentUserId: currentUserId,
        })
      } else {
        dispatch({
          type: END_REQUEST_MORE_NOTIFICATIONS,
        })
      }
    })
    .catch(() => {
      dispatch({
        type: END_REQUEST_MORE_NOTIFICATIONS,
      })
    })
}

export const markNotificationRead =
  (notification, currentUserId) => dispatch => {
    const request =
      notification.id === -1
        ? userNotificationService.markAllAsRead()
        : userNotificationService.markAsRead(notification.id)

    return request.then(() => {
      dispatch({
        type: MARK_NOTIFICATION_READ,
        notification: notification,
        currentUserId: currentUserId,
      })
    })
  }

export const markNotificationsDismissed =
  (notification, currentUserId) => dispatch => {
    return userNotificationService.dismiss(notification.id).then(() => {
      dispatch({
        type: DISMISS_NOTIFICATIONS,
        notification: notification,
        currentUserId: currentUserId,
      })
    })
  }
