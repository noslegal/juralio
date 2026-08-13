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

import { getMatterReferenceNumber } from '../workstream-task-list/header-details-helper'
import dayjs from 'dayjs'
export const buildRatesTable = (t, reportData, content) => {
  const matterReferenceNumber = getMatterReferenceNumber(t, reportData.matter)
  const isSnapshot = reportData.snapshot ? false : true
  content.push(
    [t('entity.client'), reportData.matter.clientName],
    [t('entity.matter') + ':', reportData.matter_name],
    [t('exports.costs.matterNumber'), matterReferenceNumber],
    [t('exports.costs.jurId'), reportData.matter.id],
    [t('exports.costs.numPeriod'), '1'], //this is only relevant after multi period in same report
    [t('common.table'), t('exports.costs.rates')],
    [t('common.currency'), reportData.rtd.rateTableDetails.currency],
    [
      t('common.status'),
      reportData.snapshot ? t('common.live') : t('common.finalised'),
    ],
    [''],
    [''],
    ['']
  )

  let tableHeader = ['Grade']
  let tableHeader2 = ['']
  reportData.rtd.periods.forEach(period => {
    tableHeader.push(
      period.endDate
        ? dayjs(period.endDate).format('MMM YY')
        : 'Until superseded'
    )
    tableHeader2.push(
      period.startDate
        ? dayjs(period.startDate).format('MMM YY')
        : 'Any earlier time'
    )
  })

  content.push(tableHeader2)
  content.push(tableHeader)

  var formattedData = []
  reportData.matterRatesList.forEach(rate => {
    let newCol = formattedData.find(row => {
      if (row[0].id === rate.gradeId) {
        return row
      }
    })
    if (newCol) {
      newCol.push({
        name: rate.rate
          ? rate.rate.toString()
          : rate.rateValue
            ? rate.rateValue.toString()
            : '-',
        id: rate.rateId,
      })
    } else {
      var row = [
        {
          name: rate.gradeName,
          id: rate.gradeId,
          colour_idx: rate.colour_idx,
        },
        {
          name: rate.rate
            ? rate.rate.toString()
            : rate.rateValue
              ? rate.rateValue.toString()
              : '-',
          id: rate.rateId,
        },
      ]
      formattedData.push(row)
    }
  })

  formattedData.forEach(row => {
    content.push(row.map(x => x.name))
  })
}
