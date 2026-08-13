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

import { getDateDisplayString } from '../../../../../services/helpers/date-helper'
import { formatUserDisplayName } from '../../../../../services/user/helper/user-format-service'
import { MATTER_EVENT_TYPES } from './event-types'
import {
  getActioneer,
  getActioneerId,
  getAffectedMember,
  getAffectedMemberId,
  getOccurredAt,
  getPayload,
} from './notification-accessors'

const add30Days = date => {
  const result = new Date(date)
  result.setDate(result.getDate() + 30)
  return result
}

const otherUserDisplayName = relatedNotification =>
  formatUserDisplayName(getAffectedMember(relatedNotification))

const firstRelatedOtherThanCurrentUser = (
  relatedNotifications,
  currentUserId
) => {
  const found = relatedNotifications.find(
    n => getAffectedMemberId(n) !== currentUserId
  )
  return found ? otherUserDisplayName(found) : null
}

export const addedToMatterBody = (t, notification, currentUser) => {
  const payload = getPayload(notification)
  const related = notification.relatedNotifications || []

  const i18nObj = {
    user: formatUserDisplayName(getAffectedMember(notification)),
    count: related.length,
    otherUser: related.length > 0 ? otherUserDisplayName(related[0]) : null,
    context: `${related.length}`,
  }
  if (!i18nObj.otherUser) {
    i18nObj.count = 0
    i18nObj.context = '0'
  }

  const currentUserIsAffected =
    getAffectedMemberId(notification) === currentUser.id

  if (!currentUserIsAffected) {
    return payload.adminStatusChanged
      ? t('notifications.text.matters.matterMemberAddedAdmin', i18nObj)
      : t('notifications.text.matters.matterMemberAdded', i18nObj)
  }

  i18nObj.user = formatUserDisplayName(currentUser)
  i18nObj.otherUser =
    related.length > 0
      ? firstRelatedOtherThanCurrentUser(related, currentUser.id)
      : null
  if (!i18nObj.otherUser) {
    i18nObj.count = 0
    i18nObj.context = '0'
  }

  return payload.adminStatusChanged
    ? t('notifications.text.matters.addedMatterAdmin', i18nObj)
    : t('notifications.text.matters.addedMatterEditor', i18nObj)
}

export const removedFromMatterBody = (t, notification, currentUser) => {
  const payload = getPayload(notification)

  if (getAffectedMemberId(notification) !== currentUser.id) {
    const user = {
      user: formatUserDisplayName(getAffectedMember(notification)),
    }
    return payload.adminStatusChanged
      ? t('notifications.text.matters.matterMemberRemovedAdmin', user)
      : t('notifications.text.matters.matterMemberRemovedEditor', user)
  }

  const user = { user: formatUserDisplayName(getActioneer(notification)) }
  return payload.adminStatusChanged
    ? t('notifications.text.matters.matterMemberRemovedYouAdmin', user)
    : t('notifications.text.matters.matterMemberRemovedYouEditor', user)
}

const matterLifecycleBody = (t, notification, currentUser, eventType) => {
  const thirtyDaysOut = add30Days(new Date(getOccurredAt(notification)))
  const dateString = getDateDisplayString(thirtyDaysOut)
  const key =
    eventType === MATTER_EVENT_TYPES.DeletedMatter
      ? 'notifications.detailText.matterDeleted'
      : 'notifications.detailText.matterRestored'

  if (getActioneerId(notification) === currentUser.id) {
    return t(key, { detail: t('entity.currentUser'), date: dateString })
  }

  const names = getActioneer(notification)
  return t(key, {
    detail: `${names.firstname} ${names.lastname}`,
    date: dateString,
  })
}

export const deletedMatterBody = (t, notification, currentUser) =>
  matterLifecycleBody(
    t,
    notification,
    currentUser,
    MATTER_EVENT_TYPES.DeletedMatter
  )

export const restoredMatterBody = (t, notification, currentUser) =>
  matterLifecycleBody(
    t,
    notification,
    currentUser,
    MATTER_EVENT_TYPES.RestoredMatter
  )
