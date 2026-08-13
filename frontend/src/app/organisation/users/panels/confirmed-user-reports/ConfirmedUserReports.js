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

import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import { Link, Typography } from '@mui/material'
import { useTranslation } from 'react-i18next'
import { makeStyles } from 'tss-react/mui'
import BigDataSpinner from '../../../../../components/feedback/big-data-spinner/BigDataSpinner'
import JuralioTable from '../../../../../components/table/JuralioTable'
import { getMonthYearDisplayString } from '../../../../../services/helpers/date-helper'

const styles = makeStyles()(theme => ({
  spinner: {
    paddingTop: '30%',
  },
  downloadLink: {
    cursor: 'pointer',
  },
  titleWrapper: {
    display: 'flex',
  },
  title: {
    marginLeft: theme.spacing(),
  },
}))

const ConfirmedUserReports = props => {
  const { classes } = styles()
  const { t } = useTranslation()

  if (!props.loaded) {
    return (
      <div className={classes.spinner}>
        <BigDataSpinner size={80} />
      </div>
    )
  }

  const columns = [
    {
      field: 'summaryDate',
      headerName: t('organisationAdmin.confirmationReports.month'),
      flex: 1,
      filterable: false,
      renderCell: params => (
        <div>{getMonthYearDisplayString(params.row.summaryDate)}</div>
      ),
      getApplyQuickFilterFn: filterVal => (value, row) =>
        row._search.includes(filterVal.toLowerCase()),
    },
    {
      field: 'confirmedActiveUsers',
      headerName: t(
        'organisationAdmin.confirmationReports.activeConfirmedUsers'
      ),
      flex: 1,
      filterable: false,
      sortable: true,
      getApplyQuickFilterFn: () => () => false,
    },
    {
      field: 'seats',
      headerName: t('organisationAdmin.confirmationReports.seats'),
      flex: 1,
      filterable: false,
      sortable: true,
      getApplyQuickFilterFn: () => () => false,
    },
    {
      field: 'download',
      headerName: t('organisationAdmin.confirmationReports.downloadReport'),
      flex: 1,
      filterable: false,
      sortable: false,
      renderCell: params => (
        <Link
          className={classes.downloadLink}
          onClick={() =>
            props.downloadReport(params.row.summaryDate, params.row.summaryDate)
          }
        >
          <Typography>
            {t('organisationAdmin.confirmationReports.download')}
          </Typography>
        </Link>
      ),
      getApplyQuickFilterFn: () => () => false,
    },
  ]

  const rows = props.data.map(d => ({
    id: `${d.orgId}_${d.summaryDate}`,
    summaryDate: d.summaryDate,
    confirmedActiveUsers: d.confirmedActiveUsers,
    seats: d.seats,
    _search: getMonthYearDisplayString(d.summaryDate).toLowerCase(),
  }))

  return (
    <div>
      <JuralioTable
        columns={columns}
        rows={rows}
        title={
          <div className={classes.titleWrapper}>
            <CheckCircleIcon />
            <Typography className={classes.title}>
              {t('organisationAdmin.confirmationReports.header')}
            </Typography>
          </div>
        }
      />
    </div>
  )
}
export default ConfirmedUserReports
