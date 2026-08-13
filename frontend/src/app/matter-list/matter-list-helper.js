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

import { Typography } from '@mui/material'
import CircularProgress from '@mui/material/CircularProgress'
import React from 'react'
import { MattersIcon } from '../../theme/navigation/CommonIcons'

export const processActiveUsersRecords = activeUsers => {
  const tableRecords = []
  if (activeUsers) {
    activeUsers.forEach(record =>
      tableRecords.push([record.period, record.activeUserCount])
    )
  }
  return tableRecords.reverse()
}

export const getTableHeader = (classes, t) => {
  return (
    <div className={classes.header}>
      <MattersIcon className={classes.settingsIcon} />
      <Typography
        data-test="matters-table-title"
        variant={'h6'}
        className={classes.title}
        style={{ paddingRight: 8 }}
      >
        {t('organisationAdmin.matters.header')}
      </Typography>
    </div>
  )
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
