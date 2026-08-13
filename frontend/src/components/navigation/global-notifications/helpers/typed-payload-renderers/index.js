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

import ReplayIcon from '@mui/icons-material/Replay'
import React from 'react'
import { getStatusColour } from '../../../../../services/helpers/task/task-status-colour-helper'
import {
  DateIcon,
  DeleteIcon,
  MattersIcon,
  NoteIcon,
  TaskIcon,
} from '../../../../../theme/navigation/CommonIcons'
import { getFriendlyTimeText } from '../notification-time-helper'
import { MATTER_EVENT_TYPES } from './event-types'
import {
  addedToMatterBody,
  deletedMatterBody,
  removedFromMatterBody,
  restoredMatterBody,
} from './matter-body-renderers'
import {
  getEventType,
  getMatterId,
  getMatterName,
  getMatterReference,
  getOccurredAt,
  getPayload,
} from './notification-accessors'
import {
  addedToTaskTeamBody,
  markedAsNotRequiredBody,
  postCreatedBody,
  postMarkedFinalBody,
  removedFromTaskTeamBody,
  taskCreatedBody,
  taskDateUpdatedBody,
  taskMovedBody,
  taskStatusChangedBody,
} from './task-body-renderers'

// Per-event-type body renderers. Each takes (t, notification, currentUser) and
// returns the notification's body string.
const BODY_RENDERERS = {
  [MATTER_EVENT_TYPES.TaskCreated]: taskCreatedBody,
  [MATTER_EVENT_TYPES.TaskStatusChanged]: taskStatusChangedBody,
  [MATTER_EVENT_TYPES.PostCreated]: postCreatedBody,
  [MATTER_EVENT_TYPES.PostMarkedFinal]: postMarkedFinalBody,
  [MATTER_EVENT_TYPES.TaskDateUpdated]: taskDateUpdatedBody,
  [MATTER_EVENT_TYPES.TaskMovedNewParent]: taskMovedBody,
  [MATTER_EVENT_TYPES.TaskMovedNewProject]: taskMovedBody,
  [MATTER_EVENT_TYPES.TaskMovedLevelA]: taskMovedBody,
  [MATTER_EVENT_TYPES.MarkedAsNotRequired]: markedAsNotRequiredBody,
  [MATTER_EVENT_TYPES.AddedToTaskTeam]: addedToTaskTeamBody,
  [MATTER_EVENT_TYPES.RemovedFromTaskTeam]: removedFromTaskTeamBody,
  [MATTER_EVENT_TYPES.AddedToMatter]: addedToMatterBody,
  [MATTER_EVENT_TYPES.RemovedFromMatter]: removedFromMatterBody,
  [MATTER_EVENT_TYPES.DeletedMatter]: deletedMatterBody,
  [MATTER_EVENT_TYPES.RestoredMatter]: restoredMatterBody,
}

const TASK_ICON_TYPES = [
  MATTER_EVENT_TYPES.TaskCreated,
  MATTER_EVENT_TYPES.TaskStatusChanged,
  MATTER_EVENT_TYPES.MarkedAsNotRequired,
  MATTER_EVENT_TYPES.AddedToTaskTeam,
  MATTER_EVENT_TYPES.RemovedFromTaskTeam,
  MATTER_EVENT_TYPES.TaskMovedNewParent,
  MATTER_EVENT_TYPES.TaskMovedNewProject,
  MATTER_EVENT_TYPES.TaskMovedLevelA,
]

export const getTitleText = (t, notification) => {
  const type = getEventType(notification)
  const matter = `${getMatterReference(notification)} ${getMatterName(
    notification
  )}`

  if (type === MATTER_EVENT_TYPES.DeletedMatter) {
    return t('notifications.titleText.matterDeleted', { matter })
  }
  if (type === MATTER_EVENT_TYPES.RestoredMatter) {
    return t('notifications.titleText.matterRestored', { matter })
  }
  return matter
}

export const getBodyText = (t, notification, currentUser) => {
  const renderer = BODY_RENDERERS[getEventType(notification)]
  if (!renderer) {
    console.error('Unrecognised notification:', notification)
    return ''
  }
  return renderer(t, notification, currentUser)
}

export const getIcon = notification => {
  const type = getEventType(notification)
  const payload = getPayload(notification)

  if (
    type === MATTER_EVENT_TYPES.AddedToMatter ||
    type === MATTER_EVENT_TYPES.RemovedFromMatter
  ) {
    return <MattersIcon />
  }
  if (
    type === MATTER_EVENT_TYPES.PostCreated ||
    type === MATTER_EVENT_TYPES.PostMarkedFinal
  ) {
    return <NoteIcon />
  }
  if (TASK_ICON_TYPES.includes(type)) {
    return <TaskIcon style={{ color: getStatusColour(payload.taskStatus) }} />
  }
  if (type === MATTER_EVENT_TYPES.TaskDateUpdated) {
    return <DateIcon style={{ color: getStatusColour(payload.taskStatus) }} />
  }
  if (type === MATTER_EVENT_TYPES.DeletedMatter) {
    return <DeleteIcon />
  }
  if (type === MATTER_EVENT_TYPES.RestoredMatter) {
    return <ReplayIcon />
  }
  return null
}

export const getNotificationContent = (t, notification, currentUser) => {
  return {
    title: getTitleText(t, notification),
    body: getBodyText(t, notification, currentUser),
    time: getFriendlyTimeText(t, getOccurredAt(notification)),
    icon: getIcon(notification),
  }
}

export const getNotificationNavigationDetails = notification => {
  const type = getEventType(notification)
  const payload = getPayload(notification)
  const details = {}

  if (type === MATTER_EVENT_TYPES.AddedToMatter) {
    details.matterAdminId = getMatterId(notification)
  } else if (type === MATTER_EVENT_TYPES.RestoredMatter) {
    details.matterId = getMatterId(notification)
    details.matterID = true
  } else if (type === MATTER_EVENT_TYPES.DeletedMatter) {
    details.deletedMatter = true
  } else {
    details.matterId = getMatterId(notification)
    details.projectId = payload.projectId
    details.taskId = payload.taskId
    details.postId = payload.postId
  }

  return details
}
