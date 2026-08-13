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

import dayjs from 'dayjs'

export const getFriendlyTimeText = (t, time) => {
  const currentDate = new Date(Date.now())
  const recordedDate = dayjs(time)
  const deltaMinutes = Math.abs(recordedDate.diff(currentDate, 'minutes'))
  const deltaHours = Math.abs(recordedDate.diff(currentDate, 'hours'))
  const deltaDays = Math.abs(recordedDate.diff(currentDate, 'days'))
  const deltaWeeks = Math.abs(recordedDate.diff(currentDate, 'weeks'))

  if (deltaMinutes < 1) {
    return `${t('time.now')}`
  }
  if (deltaMinutes < 60) {
    return `${deltaMinutes} ${t('time.minuteShort')}`
  }
  if (deltaHours > 0 && deltaHours < 2) {
    return `${deltaHours} ${t('time.hourSingularShort')}`
  }
  if (deltaHours > 1 && deltaHours < 24) {
    return `${deltaHours} ${t('time.hourPluralShort')}`
  }
  if (deltaDays === 1) {
    return `${deltaDays} ${t('time.daySingularShort')}`
  }
  if (deltaDays > 1 && deltaDays < 7) {
    return `${deltaDays} ${t('time.daysPluralShort')}`
  }
  if (deltaDays > 6) {
    return `${deltaWeeks} ${t('time.weeksShort')}`
  }
  return 'ERROR'
}
