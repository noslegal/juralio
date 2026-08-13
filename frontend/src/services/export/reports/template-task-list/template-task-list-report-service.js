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
import { buildLogo } from '../common/excel/build-logo'
import { setPrintConfiguration } from '../common/excel/configure-print'
import { createSheet } from '../common/excel/sheet-builder'
import { createWorkbook, writeWorkbook } from '../common/excel/workbook'
import { generateDownloadFilename } from '../common/file-name-helpers'
import { getDownloadedByText } from '../common/report-text-helpers'
import { buildReportContent } from './build-template-task-tree-list'
import { applyStyle } from './template-task-list-styler'

const buildReport = (t, reportData, callback, options) => {
  createWorkbook().then(async newWorkbook => {
    const { template } = reportData
    const downloadFilename = generateDownloadFilename(
      template.name,
      EXPORT_FORMATS.EXCEL
    )
    const downloadedByText = getDownloadedByText(t)
    const taskList = []

    // Build Excel
    buildReportContent(t, taskList, template, downloadedByText, options)

    // Create worksheet
    const ws = createSheet(newWorkbook, t('exports.common.taskList'), taskList)

    // Add the Logo
    buildLogo(ws)

    // Set for Printing including Headers and Footers.
    setPrintConfiguration(t, ws, taskList.length, options.printType, 6)

    // Format the content
    applyStyle(ws, taskList.length - 6)

    // Download
    const wbout = await writeWorkbook(newWorkbook)
    saveAs(
      new Blob([wbout], { type: 'application/octet-stream' }),
      downloadFilename
    )
    callback()

    return {
      taskList,
      filename: downloadFilename,
    }
  })
}

export default buildReport
