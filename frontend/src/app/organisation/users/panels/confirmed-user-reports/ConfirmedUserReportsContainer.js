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

import { Paper, Typography } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { getMonthYearDisplayString } from '../../../../../services/helpers/date-helper'
import { downloadXlsx } from '../../../../../services/helpers/fetch/fetch-helper'
import organisationService from '../../../../../services/organisation/organisation-service'
import ConfirmedUserReports from './ConfirmedUserReports'
import dayjs from 'dayjs'

const ConfirmedUserReportsContainer = props => {
  const [data, setData] = useState([])
  const [loaded, setLoaded] = useState(false)
  const [error, setError] = useState(false)
  const { t } = useTranslation()
  useEffect(() => {
    if (props.organisationId) {
      organisationService
        .getOrganisationReports(props.organisationId)
        .then(response => {
          if (response.status === 200) {
            setData(response.body)
            setLoaded(true)
          } else {
            setError(true)
          }
        })
    }
  }, [props.organisationId])

  const downloadReport = (orgId, date) => {
    let dateObj = new Date(date)
    const dateString = dayjs(dateObj).format('M-YY')
    // `${dateObj.getMonth() + 1}`.padStart(2, '0') +
    // `-${dateObj.getUTCFullYear()}`
    downloadXlsx(
      `organisations/${orgId}/reports/${dateString}`,
      'GET',
      null,
      `juralio-confirmed-user-report-${getMonthYearDisplayString(
        dateObj
      ).replaceAll(' ', '-')}.xlsx`
    )
  }

  if (error) {
    return (
      <Paper style={{ padding: '24px' }}>
        <Typography>
          {t('organisationAdmin.confirmationReports.error')}
        </Typography>
      </Paper>
    )
  }

  return (
    <Paper style={{ padding: '24px' }}>
      <ConfirmedUserReports
        loaded={loaded}
        data={data}
        downloadReport={downloadReport}
      />
    </Paper>
  )
}
export default ConfirmedUserReportsContainer
