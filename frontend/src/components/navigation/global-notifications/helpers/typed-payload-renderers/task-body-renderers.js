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

import { DATE_FORMAT_NO_YEAR, TASK_STATUS } from '../../../../../app/constants'
import { getDateDisplayString } from '../../../../../services/helpers/date-helper'
import { capitalise } from '../../../../../services/helpers/text/text-util-helper'
import { MATTER_EVENT_TYPES } from './event-types'
import { getEventType, getPayload } from './notification-accessors'

const taskDateChangeText = (t, payload) => {
  const detail = {
    dateType: t(`taskDateTypes.${payload.dateChangeType}`),
    oldDateString: getDateDisplayString(payload.oldDate, DATE_FORMAT_NO_YEAR),
    newDateString: getDateDisplayString(payload.newDate, DATE_FORMAT_NO_YEAR),
    count: payload.knockOnUpdateCount,
  }

  if (payload.newDate === null) {
    return t('notifications.text.datesShort.removalOfADate', detail)
  }

  return payload.oldDate === null
    ? t('notifications.text.datesShort.additionOfADate', detail)
    : t('notifications.text.datesShort.changeOfADate', detail)
}

export const taskCreatedBody = (t, notification) =>
  t('notifications.text.tasks.taskWasCreated', {
    taskName: getPayload(notification).taskName,
  })

export const taskStatusChangedBody = (t, notification) => {
  const payload = getPayload(notification)

  if (
    payload.previousTaskStatus === TASK_STATUS.NOT_STARTED &&
    payload.taskStatus === TASK_STATUS.IN_PROGRESS
  ) {
    return t('notifications.text.tasks.taskWasStarted', {
      taskName: payload.taskName,
    })
  }

  if (
    (payload.previousTaskStatus === TASK_STATUS.NOT_STARTED ||
      payload.previousTaskStatus === TASK_STATUS.IN_PROGRESS) &&
    payload.taskStatus === TASK_STATUS.DONE
  ) {
    return t('notifications.text.tasks.taskWasCompleted', {
      taskName: payload.taskName,
    })
  }

  if (
    payload.previousTaskStatus === TASK_STATUS.DONE &&
    (payload.taskStatus === TASK_STATUS.NOT_STARTED ||
      payload.taskStatus === TASK_STATUS.IN_PROGRESS)
  ) {
    return t('notifications.text.tasks.taskWasReopened', {
      taskName: payload.taskName,
    })
  }

  if (
    payload.previousTaskStatus === TASK_STATUS.IN_PROGRESS &&
    payload.taskStatus === TASK_STATUS.NOT_STARTED
  ) {
    return t('notifications.text.tasks.taskWasMovedBackToNotStarted', {
      taskName: payload.taskName,
    })
  }

  return `${t('entity.task')} ${t(
    'notifications.text.tasks.taskStatusUpdated'
  )} ${payload.taskStatus}`
}

export const markedAsNotRequiredBody = (t, notification) =>
  t('notifications.text.tasks.taskWasMarkedAsNotRequired', {
    taskName: getPayload(notification).taskName,
  })

export const taskDateUpdatedBody = (t, notification) =>
  capitalise(taskDateChangeText(t, getPayload(notification)))

export const taskMovedBody = (t, notification) => {
  const payload = getPayload(notification)
  switch (getEventType(notification)) {
    case MATTER_EVENT_TYPES.TaskMovedNewParent:
      return t('notifications.text.taskMove.interParent', {
        taskName: payload.taskName,
        newParentTaskName: payload.newParentTaskName,
      })
    case MATTER_EVENT_TYPES.TaskMovedLevelA:
      return t('notifications.text.taskMove.toLevelA', {
        taskName: payload.taskName,
      })
    default:
      return t('notifications.text.taskMove.interProject', {
        taskName: payload.taskName,
        oldProjectName: payload.oldProjectName,
        projectName: payload.projectName,
      })
  }
}

export const addedToTaskTeamBody = (t, notification) =>
  t('notifications.text.tasks.addedTaskTeam', {
    taskName: getPayload(notification).taskName,
  })

export const removedFromTaskTeamBody = (t, notification) =>
  t('notifications.text.tasks.removedTaskTeam', {
    taskName: getPayload(notification).taskName,
  })

export const postCreatedBody = (t, notification) =>
  t('notifications.text.posts.wasCreated', {
    postName: getPayload(notification).postName,
  })

export const postMarkedFinalBody = (t, notification) =>
  t('notifications.text.posts.wasFinalised', {
    postName: getPayload(notification).postName,
  })
