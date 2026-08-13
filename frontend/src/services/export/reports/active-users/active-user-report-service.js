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
import { createSheet } from '../common/excel/sheet-builder'
import { createWorkbook, writeWorkbook } from '../common/excel/workbook'
import { generateDownloadFilename } from '../common/file-name-helpers'
import { processData } from './active-user-report-helper'
import { buildActiveUserContent } from './build-active-user-content'
import { setPrintConfiguration } from './configure-print'
import { applyStyle } from './styler'

const buildReport = (t, reportData) => {
  createWorkbook().then(async newWorkbook => {
    const content = []
    const downloadFilename = generateDownloadFilename(
      t('exports.activeUsers.name'),
      EXPORT_FORMATS.EXCEL
    )

    // Active User Report Content
    const { activeFullMonthUsers, activePartialMonthUsers } =
      processData(reportData)
    buildActiveUserContent(
      t,
      content,
      activeFullMonthUsers,
      activePartialMonthUsers,
      reportData.period
    )

    // Build Excel
    const ws = createSheet(
      newWorkbook,
      t('sysAdmin.activeUsers.header'),
      content
    )

    // Add the Logo
    buildLogo(ws)

    // Set for Printing including Headers and Footers.
    setPrintConfiguration(
      t,
      ws,
      activePartialMonthUsers.length + activeFullMonthUsers.length
    )

    // Format the content
    applyStyle(t, ws, activePartialMonthUsers.length, content[3][0])

    // Download
    const wbout = await writeWorkbook(newWorkbook)
    saveAs(
      new Blob([wbout], { type: 'application/octet-stream' }),
      downloadFilename
    )

    return { activeUsers: content, filename: downloadFilename }
  })
}

export default buildReport
