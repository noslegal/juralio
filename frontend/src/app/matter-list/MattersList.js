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

import { IconButton } from '@mui/material'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { makeStyles } from 'tss-react/mui'
import WithLoader from '../../components/feedback/with-loader/WithLoader'
import JuralioTable from '../../components/table/JuralioTable'
import { renderHeaderWithToolTip } from '../../services/helpers/table/juralio-table-helper'
import juralioColours from '../../theme/juralio-colours'
import { DeleteIcon } from '../../theme/navigation/CommonIcons'
import { MATTER_STATUS } from '../constants'
import { displayConfirmationDialog } from '../global-confirmation-dialog/global-confirmation-dialog-actions'
import { showSnackbar } from '../global-snackbar/global-snackbar-actions'
import MatterStatusToggle from '../matter-details/matter-card/MatterStatusToggle'
import { RECEIVE_MATTER_DETAILS_SUCCESS } from '../matter-details/matter-details-actions'
import ClientMatterAvatar from './ClientMatterAvatar'
import { fetchOrgMattersPage } from './matter-list-actions'
import { getTableHeader } from './matter-list-helper'

const PAGE_SIZE_OPTIONS = [10, 25, 50]
const DEFAULT_PAGE_SIZE = 10
const SEARCH_DEBOUNCE_MS = 300

// DataGrid sortField -> backend sortField
const SORT_FIELD_MAP = {
  matter: 'clientName',
  status: 'matterStatus',
}

const _MattersList = props => (
  <div>
    {props.title}
    <JuralioTable
      rows={props.rows}
      columns={props.columns}
      filters={props.filters}
      filterValues={props.filterValues}
      onFilterValuesChange={props.onFilterValuesChange}
      quickFilterValue={props.quickFilterValue}
      onQuickFilterChange={props.onQuickFilterChange}
      paginationModel={props.paginationModel}
      onPaginationModelChange={props.onPaginationModelChange}
      sortModel={props.sortModel}
      onSortModelChange={props.onSortModelChange}
      rowCount={props.rowCount}
      loading={props.loading}
      onRowClick={props.onRowClick}
      rowDataTest="matters-list-item"
      noRowsText={props.noRowsText}
      tableBodyHeight="calc(100vh - 300px)"
      pageSizeOptions={PAGE_SIZE_OPTIONS}
      serverSide
    />
  </div>
)

const SpinnerTable = WithLoader(200)(_MattersList)

const useStyles = makeStyles()(theme => ({
  root: {
    display: 'flex',
    alignItems: 'center',
    width: '100%',
  },
  header: {
    display: 'flex',
    flexDirection: 'row',
    width: '100%',
    alignItems: 'center',
    textAlign: 'center',
    justifyItems: 'center',
  },
  infoIcon: {
    paddingLeft: theme.spacing(),
    color: juralioColours.darkText.secondary,
  },
  settingsIcon: { paddingRight: theme.spacing(2) },
}))

const MattersListWithLoader = props => {
  const { classes } = useStyles()
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const page = useSelector(state => state.matters.organisationPage)

  const [paginationModel, setPaginationModel] = useState({
    page: 0,
    pageSize: DEFAULT_PAGE_SIZE,
  })
  const [sortModel, setSortModel] = useState([{ field: 'matter', sort: 'asc' }])
  const [quickFilter, setQuickFilter] = useState('')
  const [debouncedQuickFilter, setDebouncedQuickFilter] = useState('')
  const [filterValues, setFilterValues] = useState({})

  // Reset to page 0 whenever a query input changes. Bundling each input
  // update with the page reset (rather than running it in a separate
  // effect) means a single fetch fires per change.
  const resetToFirstPage = () =>
    setPaginationModel(prev => (prev.page === 0 ? prev : { ...prev, page: 0 }))

  const handleSortModelChange = newSort => {
    setSortModel(newSort)
    resetToFirstPage()
  }

  const handleFilterValuesChange = newFilters => {
    setFilterValues(newFilters)
    resetToFirstPage()
  }

  // Debounce the quick-filter input so we don't fire a request per keystroke.
  useEffect(() => {
    const id = setTimeout(() => {
      setDebouncedQuickFilter(prev =>
        prev === quickFilter ? prev : quickFilter
      )
      setPaginationModel(prev =>
        prev.page === 0 ? prev : { ...prev, page: 0 }
      )
    }, SEARCH_DEBOUNCE_MS)
    return () => clearTimeout(id)
  }, [quickFilter])

  // Translate UI selections into backend params and fetch.
  const fetchPage = useCallback(() => {
    const startIndex = paginationModel.page * paginationModel.pageSize
    const endIndex = startIndex + paginationModel.pageSize

    const sort = sortModel[0]
    const sortField = sort ? (SORT_FIELD_MAP[sort.field] ?? sort.field) : null
    const sortOrder = sort?.sort ?? null

    // Backend expects raw matterStatus values, not translated labels.
    const statuses = (filterValues.status ?? [])
      .map(label =>
        label === t('common.active')
          ? MATTER_STATUS.ACTIVE
          : label === t('common.closed')
            ? MATTER_STATUS.CLOSED
            : null
      )
      .filter(Boolean)

    dispatch(
      fetchOrgMattersPage({
        startIndex,
        endIndex,
        q: debouncedQuickFilter || null,
        statuses,
        sortField,
        sortOrder,
      })
    )
  }, [
    dispatch,
    paginationModel.page,
    paginationModel.pageSize,
    sortModel,
    debouncedQuickFilter,
    filterValues.status,
    t,
  ])

  useEffect(() => {
    fetchPage()
  }, [fetchPage])

  const handleMatterDelete = useCallback(
    (e, matter) => {
      e.stopPropagation()
      const confirmOptions = {
        actionText: t('common.delete'),
        titleText: t('matterDeletion.deleteConfirmationTitle', {
          matterName: matter.name,
        }),
        promptText: t('matterDeletion.deleteConfirmationPrompt'),
        usageContext: 'DeleteMatter',
        headerIcon: DeleteIcon,
        dontTranslatePromptText: true,
        cancel: () => {},
      }
      dispatch(
        displayConfirmationDialog(confirmOptions, () => {
          props
            .updateMatter(matter.id, {
              matterStatus: MATTER_STATUS.PENDING_DELETION,
            })
            .then(res => {
              if (res.type === RECEIVE_MATTER_DETAILS_SUCCESS) {
                dispatch(
                  showSnackbar(t('matterDeletion.markForDeletionSuccess'))
                )
                fetchPage()
              } else {
                dispatch(showSnackbar(t('common.error')))
              }
            })
        })
      )
    },
    [dispatch, fetchPage, props, t]
  )

  const columns = useMemo(
    () => [
      {
        field: 'matter',
        headerName: t('organisationAdmin.matters.matterClient'),
        flex: 2,
        sortable: true,
        renderCell: params => <ClientMatterAvatar matter={params.row.matter} />,
      },
      {
        field: 'numProjects',
        renderHeader: () =>
          renderHeaderWithToolTip(
            classes,
            t('entity.projects'),
            t('organisationAdmin.matters.tooltip.workstreams')
          ),
        flex: 1,
        sortable: false,
      },
      {
        field: 'people',
        renderHeader: () =>
          renderHeaderWithToolTip(
            classes,
            t('common.people'),
            t('organisationAdmin.matters.tooltip.users')
          ),
        flex: 1,
        sortable: false,
      },
      {
        field: 'status',
        renderHeader: () =>
          renderHeaderWithToolTip(
            classes,
            t('common.status'),
            t('organisationAdmin.matters.tooltip.status')
          ),
        flex: 1,
        sortable: true,
        renderCell: params => (
          <MatterStatusToggle
            currentValue={params.row.status.toLowerCase()}
            updateStatus={event =>
              props.updateMatter(params.row.matter.id, {
                matterStatus: event.target.value,
              })
            }
            readOnly={params.row.matter.matterStatus === MATTER_STATUS.ACTIVE}
          />
        ),
      },
      {
        field: 'delete',
        headerName: t('common.delete'),
        flex: 0.5,
        sortable: false,
        renderCell: params =>
          params.row.matter.matterStatus !== MATTER_STATUS.PENDING_DELETION && (
            <IconButton
              aria-label="Delete matter"
              data-test="delete-matter-button"
              onClick={e => handleMatterDelete(e, params.row.matter)}
            >
              <DeleteIcon />
            </IconButton>
          ),
      },
    ],
    [classes, t, props, handleMatterDelete]
  )

  const rows = useMemo(
    () =>
      page.items.map(matter => ({
        id: matter.id,
        matter,
        numProjects: matter.numProjects ?? 0,
        people: (matter.team ?? 0) + (matter.viewers ?? 0),
        status:
          matter.matterStatus === MATTER_STATUS.ACTIVE
            ? t('common.active')
            : t('common.closed'),
      })),
    [page.items, t]
  )

  const filters = useMemo(
    () => [
      {
        name: 'status',
        label: t('common.status'),
        options: [t('common.active'), t('common.closed')],
      },
    ],
    [t]
  )

  return (
    <SpinnerTable
      isLoaded={page.isLoaded}
      title={getTableHeader(classes, t)}
      rows={rows}
      columns={columns}
      filters={filters}
      filterValues={filterValues}
      onFilterValuesChange={handleFilterValuesChange}
      quickFilterValue={quickFilter}
      onQuickFilterChange={setQuickFilter}
      paginationModel={paginationModel}
      onPaginationModelChange={setPaginationModel}
      sortModel={sortModel}
      onSortModelChange={handleSortModelChange}
      rowCount={page.totalCount}
      loading={page.isLoading}
      onRowClick={params => props.setSelectedMatter(params.row.matter)}
      noRowsText={t('organisationAdmin.matters.zeroState')}
    />
  )
}

export default MattersListWithLoader
