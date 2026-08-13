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

import { MATTER_EVENT_TYPES } from './typed-payload-renderers/event-types'
import {
  getAffectedMemberId,
  getEventType,
  getMatterId,
  getPayload,
} from './typed-payload-renderers/notification-accessors'

/*
  Returns a notifications list in which AddedToMatter notifications that share a
  matter and admin-status are collapsed into a single notification carrying the
  others under `relatedNotifications`:
  [
    notification: {
      ...data about notification,
      relatedNotifications: [ ...other notification objects ]
    }
  ]
 */
export const groupNotifications = (notifications, currentUserId) => {
  let groupedNotifications = []
  let addedNotifications = []

  notifications.forEach(notification => {
    if (getEventType(notification) === MATTER_EVENT_TYPES.AddedToMatter) {
      if (!addedNotifications.includes(notification.id)) {
        const [mergedNotification, notificationsToAdd] = mergeNotifications(
          notification,
          notifications,
          addedNotifications
        )
        notification = mergedNotification
        addedNotifications = notificationsToAdd
      }
    }
    if (!addedNotifications.includes(notification.id)) {
      // promote the current user's own notification to be the parent
      const foundSelfInRelatedNotifications =
        notification.relatedNotifications?.find(
          n => getAffectedMemberId(n) === currentUserId
        )
      if (foundSelfInRelatedNotifications !== undefined) {
        notification = {
          ...foundSelfInRelatedNotifications,
          relatedNotifications: [
            ...notification.relatedNotifications.filter(
              n => n.id !== foundSelfInRelatedNotifications.id
            ),
            notification,
          ],
        }
      }
      // remove duplicate users, the current user, and the parent's own member
      const seenUserIds = {}
      notification.relatedNotifications =
        notification.relatedNotifications?.reduce((unique, item) => {
          const itemMemberId = getAffectedMemberId(item)
          if (
            !(itemMemberId in seenUserIds) &&
            itemMemberId !== currentUserId &&
            itemMemberId !== getAffectedMemberId(notification)
          ) {
            seenUserIds[itemMemberId] = true
            return [...unique, item]
          }
          return unique
        }, [])

      groupedNotifications.push({
        ...notification,
        relatedNotifications: notification.relatedNotifications
          ? notification.relatedNotifications
          : [],
      })
    }
  })

  return groupedNotifications
}

const mergeNotifications = (
  notification,
  notifications,
  addedNotifications
) => {
  const relatedNotifications = findRelatedNotifications(
    notification,
    notifications
  )
  addedNotifications = [
    ...addedNotifications,
    ...relatedNotifications.map(relatedNotification => relatedNotification.id),
  ]
  return [
    { ...notification, relatedNotifications: relatedNotifications },
    addedNotifications,
  ]
}

const findRelatedNotifications = (notification, notifications) => {
  return notifications.filter(
    n =>
      n.id !== notification.id &&
      getMatterId(n) === getMatterId(notification) &&
      getEventType(n) === getEventType(notification) &&
      getPayload(n).adminStatusChanged ===
        getPayload(notification).adminStatusChanged
  )
}
