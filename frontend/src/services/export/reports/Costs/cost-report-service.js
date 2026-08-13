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

import { saveAs } from 'file-saver'
import { EXPORT_FORMATS } from '../common/constants-reports'
import { createSheet } from '../common/excel/sheet-builder'
import { createWorkbook, writeWorkbook } from '../common/excel/workbook'
import { generateDownloadFilename } from '../common/file-name-helpers'
import { buildCostsTable } from './build-costs-sheet'
import { buildGrossProfitTable } from './build-gross-profit-sheet'
import { buildHourTable } from './build-hour-sheet'
import { buildMarginTable } from './build-margin-sheet'
import { buildRatesTable } from './build-rates-sheet'
import { buildRevenueTable } from './build-fees-sheet'
import { applyStyle } from './costs-styler'

const buildReport = (t, reportData, options) => {
  createWorkbook().then(async newWorkbook => {
    const hourContent = []
    const revenueContent = []
    const costsContent = []
    const grossProfitContent = []
    const marginContent = []
    const ratesContent = []
    const downloadFilename = generateDownloadFilename(
      t('exports.costs.name'),
      EXPORT_FORMATS.EXCEL
    )

    if (options.hours) {
      buildHourTable(t, reportData, hourContent)
      const ws = createSheet(newWorkbook, t('Hours'), hourContent)
      applyStyle(ws, reportData.costTimeEstimateList.length + 3)
    }
    if (options.fees) {
      buildRevenueTable(t, reportData, revenueContent)
      const wsRevenue = createSheet(newWorkbook, t('Fees'), revenueContent)
      applyStyle(wsRevenue, reportData.costTimeEstimateList.length + 3)
    }
    if (options.costs) {
      buildCostsTable(t, reportData, costsContent)
      const wsCosts = createSheet(newWorkbook, t('Cost'), costsContent)
      applyStyle(wsCosts, reportData.costTimeEstimateList.length + 3)
    }
    if (options.grossProfit) {
      buildGrossProfitTable(t, reportData, grossProfitContent)
      const wsGrossProfit = createSheet(
        newWorkbook,
        t('Gross profit'),
        grossProfitContent
      )
      applyStyle(wsGrossProfit, reportData.costTimeEstimateList.length + 3)
    }
    if (options.margin) {
      buildMarginTable(t, reportData, marginContent)
      const wsMargin = createSheet(newWorkbook, t('Margin'), marginContent)
      applyStyle(wsMargin, reportData.costTimeEstimateList.length + 3)
    }
    if (options.rates) {
      buildRatesTable(t, reportData, ratesContent)
      const wsRates = createSheet(newWorkbook, t('Rates'), ratesContent)
      applyStyle(
        wsRates,
        reportData.costRatioList.filter(x => x.projectId === 0 && x.cteId === 0)
          .length + 3
      )
    }

    // Download
    const wbout = await writeWorkbook(newWorkbook)
    saveAs(
      new Blob([wbout], { type: 'application/octet-stream' }),
      downloadFilename
    )
  })
}

export default buildReport
