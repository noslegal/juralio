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
import { getMatterReferenceNumber } from '../workstream-task-list/header-details-helper'

export const buildRecoveryTable = (t, reportData, content) => {
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
    [t('common.table'), t('exports.costs.recoveryRates')],
    [
      t('common.status'),
      reportData.snapshot ? t('common.live') : t('common.finalised'),
    ],
    [''],
    [''],
    ['']
  )

  const tableHeader = ['From', dayjs(durationStart).format('MMM YY')]
  const tableHeader2 = ['To', dayjs(durationEnd).format('MMM YY')]
  const tableheader3 = ['Grade', 'Recovery']

  content.push(tableHeader, tableHeader2, tableheader3)
  reportData.costRatioList.forEach(ratio => {
    const row = [ratio.gradeName, ratio.recoveryRate + '%']
    content.push(row)
  })
}
