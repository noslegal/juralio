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

import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { makeStyles } from 'tss-react/mui'
import { getActiveUsers } from '../../app/users/users-actions'
import JuralioTable from '../../components/table/JuralioTable'
import juralioColours from '../../theme/juralio-colours'
import { JuralioCoreColors } from '../../theme/juralio-core-colors'
import {
  getDownloadColumn,
  getMonthColumn,
  getTableHeader,
  loadingComponent,
  processActiveUsersRecords,
} from './active-users-helper'

const useStyles = makeStyles()(theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
  },
  title: {
    paddingLeft: theme.spacing(2.5),
    paddingRight: 8,
  },
  infoIcon: {
    paddingLeft: theme.spacing(1.5),
    color: juralioColours.darkText.secondary,
  },
  settingsIcon: { marginLeft: '-20px' },
  downloadLink: {
    color: JuralioCoreColors.primary.main,
    '&:hover': {
      cursor: 'pointer',
    },
  },
}))

const ActiveUsers = () => {
  const { t } = useTranslation()
  const { classes } = useStyles()
  const dispatch = useDispatch()
  const activeUsers = useSelector(state => state.users.ActiveUsers)

  const columns = [
    getMonthColumn(t),
    {
      field: 'activeUserCount',
      headerName: t('sysAdmin.activeUsers.headerActive'),
      flex: 1,
      filterable: false,
      sortable: true,
      getApplyQuickFilterFn: () => () => false,
    },
    getDownloadColumn(t, classes),
  ]

  useEffect(() => {
    dispatch(getActiveUsers())
  }, [dispatch])

  return (
    <div className={classes.root}>
      {activeUsers == null && loadingComponent}
      {activeUsers != null && (
        <div>
          <JuralioTable
            columns={columns}
            rows={processActiveUsersRecords(activeUsers)}
            title={getTableHeader(classes, t)}
          />
        </div>
      )}
    </div>
  )
}

export default ActiveUsers
