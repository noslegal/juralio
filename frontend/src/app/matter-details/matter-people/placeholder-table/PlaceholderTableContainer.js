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

import { useTranslation } from 'react-i18next'
import { Typography } from '@mui/material'
import {
  renderPlaceholderColumn,
  useUserColumnStyles,
} from '../../../../services/helpers/table/juralio-table-common-columns'
import { compareStrings } from '../../../../services/helpers/table/juralio-table-sorting-helper'
import processData from './matter-placeholder-table-data-provider'
import PlaceholderTable from './PlaceholderTable'
import DeletePlaceholderDialog from '../../placeholders/DeletePlaceholderDialog'
import EditPlaceholderDialog from '../../placeholders/EditPlaceholderDialog'

const PlaceholderTableContainer = props => {
  const { t } = useTranslation()
  const userColumnClasses = useUserColumnStyles()

  const columns = [
    {
      field: '_placeholder',
      headerName: t('common.name'),
      flex: 2,
      filterable: false,
      sortable: true,
      sortComparator: (v1, v2) =>
        compareStrings(
          v1.lastName + ' ' + v1.firstName,
          v2.lastName + ' ' + v2.firstName
        ),
      renderCell: params =>
        renderPlaceholderColumn(
          t,
          userColumnClasses,
          params.row._placeholder,
          params.row.fullname,
          false
        ),
      getApplyQuickFilterFn: filterVal => (value, row) =>
        row._search.includes(filterVal.toLowerCase()),
    },
    {
      field: 'emailAddress',
      headerName: t('common.email'),
      flex: 2,
      filterable: false,
      sortable: true,
      renderCell: params => (
        <div
          data-test="placeholder-email-column"
          title={params.row._placeholder.emailAddress}
        >
          <Typography data-test="placeholder-email-text" variant="caption">
            {params.row._placeholder.emailAddress}
          </Typography>
          <EditPlaceholderDialog
            placeholder={params.row._placeholder}
            callBack={props.callBack}
          />
        </div>
      ),
      getApplyQuickFilterFn: () => () => false,
    },
    {
      field: 'taskCount',
      headerName: t('No. of Tasks'),
      flex: 1,
      filterable: false,
      sortable: true,
      getApplyQuickFilterFn: () => () => false,
    },
    {
      field: 'postCount',
      headerName: t('No. of Posts'),
      flex: 1,
      filterable: false,
      sortable: true,
      getApplyQuickFilterFn: () => () => false,
    },
    {
      field: 'remove',
      headerName: '',
      flex: 1,
      filterable: false,
      sortable: false,
      renderCell: params => (
        <div data-test="placeholder-delete-column" title="Delete">
          <DeletePlaceholderDialog
            placeholder={params.row._placeholder}
            callBack={props.callBack}
          />
        </div>
      ),
      getApplyQuickFilterFn: () => () => false,
    },
  ]

  return (
    <PlaceholderTable
      columns={columns}
      rows={processData(t, props.placeholders)}
      matterId={props.matterId}
      mode={props.mode}
      teamActions={props.teamActions}
      isLoaded={props.placeholdersLoaded}
    />
  )
}
export default PlaceholderTableContainer
