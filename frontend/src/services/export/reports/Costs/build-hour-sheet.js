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

//import getDownloadedByText from '../common/report-text-helpers'

import dayjs from 'dayjs'
import { calculateMonthHoursForPhase } from '../../../../app/matter-costs/resource/MatterCostsTableHelper'
import { getMatterReferenceNumber } from '../workstream-task-list/header-details-helper'
import {
  getTaskEnd,
  getTaskStart,
} from '../../../../app/matter-costs/outcomes/revenueHelper'

export const buildHourTable = (t, reportData, content) => {
  const durationStart = reportData.period?.startDate
    ? reportData.period?.startDate
    : dayjs().startOf('month').toDate()

  const durationEnd = reportData.period?.endDate
    ? reportData.period?.endDate
    : dayjs().endOf('month').toDate()
  const isSnapshot = reportData.snapshot ? false : true
  //const downloadedByText = getDownloadedByText(t)
  const matterReferenceNumber = getMatterReferenceNumber(t, reportData.matter)

  content.push(
    [t('entity.client'), reportData.matter.clientName],
    [t('entity.matter') + ':', reportData.matter_name],
    [t('exports.costs.matterNumber'), matterReferenceNumber],
    [t('exports.costs.jurId'), reportData.matter.id],
    [t('exports.costs.numPeriod'), '1'], //this is only relevant after multi period in same report
    [t('common.table'), t('common.hours')],
    [
      t('common.status'),
      reportData.snapshot ? t('common.live') : t('common.finalised'),
    ],
    [''],
    [''],
    ['']
  )

  let months = dayjs(durationEnd).diff(durationStart, 'months') + 1
  let monthsObj = ['', '']
  for (let i = 0; i < months; i++) {
    let month = dayjs(durationStart).add(i, 'month')
    let name = month.format('MMM YY')
    monthsObj.push(name)
  }
  let tableHeader = ['', 'Hour total', 'Period start']
  monthsObj.forEach((month, index) => {
    if (index !== monthsObj.length - 4) {
      tableHeader.push('')
    } else {
      tableHeader.push('Period end')
    }
  })
  content.push(tableHeader)
  content.push(monthsObj)

  if (reportData.costTimeEstimateList.length > 0) {
    reportData.costTimeEstimateList.forEach(cte => {
      buildCteRow(
        t,
        content,
        cte,
        monthsObj,
        dayjs(durationStart),
        dayjs(durationEnd),
        isSnapshot
      )
    })
  }
}

const buildCteRow = (
  t,
  content,
  cte,
  monthsObj,
  durationStart,
  durationEnd,
  isSnapshot
) => {
  const taskStart = dayjs(
    getTaskStart(cte.task, durationStart, isSnapshot)
  ).startOf('month')
  const taskEnd = dayjs(getTaskEnd(cte.task, durationEnd, isSnapshot)).endOf(
    'month'
  )
  let inactive = false
  let months = taskEnd.diff(taskStart, 'months') + 1
  if (
    (taskEnd.isBefore(durationStart) && taskStart.isBefore(durationStart)) ||
    (taskStart.isAfter(durationEnd) && taskEnd.isAfter(durationEnd))
  ) {
    inactive = true
  }
  let startMonthPos =
    monthsObj.indexOf(
      monthsObj.find(col => col === taskStart.format('MMM YY'))
    ) + 1

  let endMonthPos =
    monthsObj.indexOf(monthsObj.find(col => col === taskEnd.format('MMM YY'))) +
    1

  if (startMonthPos === 0) {
    startMonthPos = 2
    if (endMonthPos === 0) {
      months = durationEnd.diff(durationStart, 'months') + 1
    } else {
      months = endMonthPos - startMonthPos
    }
  }
  if (endMonthPos === 0) {
    endMonthPos = monthsObj.length
    if (startMonthPos === 0) {
      months = durationEnd.diff(durationStart, 'months') + 1
    } else {
      months = endMonthPos - startMonthPos + 1
    }
  }
  let rowData = calculateMonthHoursForPhase(
    cte,
    months,
    monthsObj,
    startMonthPos,
    endMonthPos,
    [{ inactive: inactive }],
    true
  )

  rowData.splice(0, 1)
  content.push([cte.task.name, cte.hourValue, ...rowData])
}
