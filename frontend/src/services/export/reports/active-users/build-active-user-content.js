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
import {
  getDayMonthDisplayString,
  getMonthYearDisplayString,
  getTimeDisplayStringUTC,
} from '../../../helpers/date-helper'

const normaliseDate = dateString => {
  let d = dayjs(dateString)
  d.set({ year: d.year() - 1900 })
  d.set({ hour: d.hour() + 1 })
  return d
}

export const buildActiveUserContent = (
  t,
  content,
  activeFullMonthUsers,
  activePartialMonthUsers,
  period
) => {
  const totalUserCount =
    activeFullMonthUsers.length + activePartialMonthUsers.length

  content.push(
    [],
    [],
    [],
    [
      getDateForDownload(t, period),
      `${totalUserCount} ${t('exports.activeUsers.name')}`,
    ],
    [],
    []
  )
  content.push([
    t('exports.activeUsers.activePartOfMonth'),
    activePartialMonthUsers.length,
  ])

  if (activePartialMonthUsers.length > 0) {
    content.push([
      t('entity.user'),
      t('exports.activeUsers.activated'),
      t('exports.activeUsers.deactivated'),
      t('common.by'),
    ])
    activePartialMonthUsers.forEach(record => {
      content.push(processRecord(t, record))
    })
  } else {
    content.push(['', '', '', ''])
  }

  content.push([])
  content.push([])

  content.push([
    t('exports.activeUsers.activeWholeOfMonth'),
    activeFullMonthUsers.length,
  ])
  content.push([t('entity.user')])
  activeFullMonthUsers.forEach(record => {
    content.push([record.username])
  })
  content.push([])
  content.push([])

  return content
}

const processRecord = (t, record) => {
  return [
    record.username,
    getDateEntry(record.firstActivation),
    getDateEntry(record.lastDeactivation),
    record.lastActivatingUser
      ? record.lastActivatingUser.username
      : t('sysAdmin.activeUsers.notRecorded'),
  ]
}

const getDateEntry = date =>
  date ? getDayMonthDisplayString(normaliseDate(date)) : ''

const getDateForDownload = (t, period) => {
  const now = new Date()
  const currentMonth = now.getMonth() + 1
  let dateOutput = getMonthYearDisplayString(period)

  if (
    period.includes(now.getFullYear()) &&
    period.includes(
      currentMonth < 10 ? `-0${currentMonth}-` : `-${currentMonth}-`
    )
  ) {
    dateOutput += ` ${t(
      'sysAdmin.activeUsers.dateUpTo'
    )} ${getDayMonthDisplayString(now)} ${t(
      'sysAdmin.activeUsers.timeAt'
    )} ${getTimeDisplayStringUTC(now)} UTC`
  }

  return dateOutput
}
