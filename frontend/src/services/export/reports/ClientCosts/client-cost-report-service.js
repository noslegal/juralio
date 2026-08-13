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
import { createWorkbook, writeWorkbook } from '../common/excel/workbook'
import { generateDownloadFilename } from '../common/file-name-helpers'
import { buildClientCostsModel } from './client-costs-data'
import { buildProjectionSummarySheet } from './build-projection-summary-sheet'
import { buildScopeSheet } from './build-scope-sheet'
import { buildAssumptionsSheet } from './build-assumptions-sheet'
import { buildOutOfScopeSheet } from './build-out-of-scope-sheet'

const buildReport = (t, reportData, options = {}) => {
  return createWorkbook().then(async workbook => {
    const model = buildClientCostsModel(t, reportData)

    if (options.summary) {
      buildProjectionSummarySheet(
        t,
        model,
        workbook,
        t('exports.clientCosts.sheetSummary', 'Projection Summary')
      )
    }
    if (options.scope) {
      buildScopeSheet(
        t,
        model,
        workbook,
        t('exports.clientCosts.sheetScope', 'Scope')
      )
    }
    if (options.assumptions) {
      buildAssumptionsSheet(
        t,
        model,
        workbook,
        t('exports.clientCosts.sheetAssumptions', 'Assumptions')
      )
    }
    if (options.outOfScope) {
      buildOutOfScopeSheet(
        t,
        model,
        workbook,
        t('exports.clientCosts.sheetOutOfScope', 'Out-of-Scope Terms')
      )
    }

    const downloadFilename = generateDownloadFilename(
      t('exports.clientCosts.name', 'Client Projection'),
      EXPORT_FORMATS.EXCEL
    )
    const wbout = await writeWorkbook(workbook)
    saveAs(
      new Blob([wbout], { type: 'application/octet-stream' }),
      downloadFilename
    )
  })
}

export default buildReport
