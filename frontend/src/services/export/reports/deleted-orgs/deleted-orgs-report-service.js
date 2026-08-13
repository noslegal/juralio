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
import { buildDeletedOrgContent } from './deleted-orgs-report-helper'
import { applyStyle } from './styler'

const buildReport = (t, reportData) => {
  createWorkbook().then(async newWorkbook => {
    const content = []
    const downloadFilename = generateDownloadFilename(
      t('exports.deleted_orgs.name'),
      EXPORT_FORMATS.EXCEL
    )
    buildDeletedOrgContent(t, content, reportData)

    // Build Excel
    const ws = createSheet(
      newWorkbook,
      t('sysAdmin.organisations.header'),
      content
    )

    // Add the Logo
    buildLogo(ws)

    // Format the content
    applyStyle(t, ws)

    // Download
    const wbout = await writeWorkbook(newWorkbook)
    saveAs(
      new Blob([wbout], { type: 'application/octet-stream' }),
      downloadFilename
    )

    return { deletedOrgs: content, filename: downloadFilename }
  })
}

export default buildReport
