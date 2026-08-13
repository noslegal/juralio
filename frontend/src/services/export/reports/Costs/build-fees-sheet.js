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
import { getMatterReferenceNumber } from '../workstream-task-list/header-details-helper'
import { getRevenueTableData } from '../../../../app/matter-costs/outcomes/revenueHelper'

export const buildRevenueTable = (t, reportData, content) => {
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
    [t('common.table'), t('exports.costs.fees')],
    [t('common.currency'), reportData.rtd.rateTableDetails.currency],
    [
      t('common.status'),
      reportData.snapshot ? t('common.live') : t('common.finalised'),
    ],
    [''],
    [''],
    ['']
  )

  let months = dayjs(durationEnd).diff(durationStart, 'months') + 1
  let monthsNames = ['', '']
  let monthsObj = [
    {
      title: '',
    },
  ]
  for (let i = 0; i < months; i++) {
    let month = dayjs(durationStart).add(i, 'month')
    let name = month.format('MMM YY')
    monthsNames.push(name)
    monthsObj.push({
      title: name,
      id: i,
      fullMonth: month.format('MMMM YYYY'),
    })
  }

  let tableHeader = ['', 'Fees total', 'Period start']
  monthsNames.forEach((month, index) => {
    if (index !== monthsNames.length - 4) {
      tableHeader.push('')
    } else {
      tableHeader.push('Period end')
    }
  })
  content.push(tableHeader)
  content.push(monthsNames)
  let tableData = getRevenueTableData(
    reportData,
    reportData.matterRatesList,
    reportData.rtd,
    true,
    false
  )
  const formattedTableData = Array.from(tableData, x => x[1])

  if (reportData.costTimeEstimateList.length > 0) {
    reportData.costTimeEstimateList.forEach((cte, index) => {
      buildCteRow(content, cte, formattedTableData[index])
    })
  }
}

const buildCteRow = (content, cte, data) => {
  data.splice(0, 1)
  data.forEach((x, i) => {
    if (x !== '') {
      data[i] = parseFloat(x.toFixed(1))
    }
  })
  content.push([cte.task.name, ...data])
}
