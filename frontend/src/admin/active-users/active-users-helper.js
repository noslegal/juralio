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

import InfoIcon from '@mui/icons-material/Info'
import SettingsIcon from '@mui/icons-material/Settings'
import { Tooltip, Typography } from '@mui/material'
import CircularProgress from '@mui/material/CircularProgress'
import React from 'react'
import JuralioLink from '../../components/navigation/juralio-link/JuralioLink'
import usageSummaryService from '../../services/Admin/usage-summary-service'
import { generateDownload } from '../../services/export/export-service'
import {
  EXPORT_FORMATS,
  EXPORT_NAMES,
} from '../../services/export/reports/common/constants-reports'
import { getMonthYearDisplayString } from '../../services/helpers/date-helper'

export const processActiveUsersRecords = activeUsers => {
  if (!activeUsers) return []
  return activeUsers
    .map(record => ({
      id: record.period,
      period: record.period,
      activeUserCount: record.activeUserCount,
    }))
    .reverse()
}

export const getTableHeader = (classes, t) => {
  return (
    <div className={classes.header}>
      <SettingsIcon className={classes.settingsIcon} />
      <Typography
        data-test="active-users-table-title"
        variant={'h6'}
        className={classes.title}
      >
        {t('sysAdmin.activeUsers.header')}
      </Typography>
      <Tooltip
        title={
          <React.Fragment>
            {t('sysAdmin.activeUsers.information_heading')}
            <br />
            {t('sysAdmin.activeUsers.information_content1')}
            <br />
            {t('sysAdmin.activeUsers.information_content2')}
          </React.Fragment>
        }
        placement="right"
      >
        <InfoIcon className={classes.infoIcon} fontSize="small" />
      </Tooltip>
    </div>
  )
}

export const getMonthColumn = t => {
  const currentMonth = getMonthYearDisplayString(new Date())
  return {
    field: 'period',
    headerName: t('sysAdmin.activeUsers.headerMonth'),
    flex: 1,
    filterable: false,
    sortable: true,
    renderCell: params => {
      let displayText = getMonthYearDisplayString(params.row.period)
      if (displayText === currentMonth) {
        displayText = `${displayText} (${t(
          'common.dates.currentMonth'
        ).toLowerCase()})`
      }
      return <div>{displayText}</div>
    },
    getApplyQuickFilterFn: () => () => false,
  }
}

export const getDownloadColumn = (t, classes) => {
  return {
    field: 'download',
    headerName: t('sysAdmin.activeUsers.action'),
    flex: 1,
    filterable: false,
    sortable: false,
    renderCell: params => (
      <JuralioLink
        className={classes.downloadLink}
        value={t('common.download')}
        onClick={downloadClickHandler(t, params.row.period)}
      />
    ),
    getApplyQuickFilterFn: () => () => false,
  }
}

export const loadingComponent = (
  <div
    style={{
      display: 'flex',
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    }}
  >
    <CircularProgress size={200} />
  </div>
)

const downloadClickHandler = (t, value) => {
  return () => {
    usageSummaryService.getMonthDetail(value).then(response => {
      generateDownload(t, EXPORT_NAMES.ACTIVE_USERS, EXPORT_FORMATS.EXCEL, {
        period: value,
        records: response.body,
      })
    })
  }
}
