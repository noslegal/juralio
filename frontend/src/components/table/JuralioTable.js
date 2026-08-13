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
import { DataGrid } from '@mui/x-data-grid'
import { useMemo, useState } from 'react'
import { MuiDataGridTheme } from '../../services/helpers/table/juralio-table-theme-helper'
import { CustomToolbar } from './global-table-helper'

const applyFilters = (rows, filters, filterValues) => {
  if (!filters?.length) return rows ?? []
  const active = filters.filter(
    f => f.matchFn && (filterValues[f.name]?.length ?? 0) > 0
  )
  if (!active.length) return rows ?? []
  return (rows ?? []).filter(row =>
    active.every(f => f.matchFn(row, filterValues[f.name]))
  )
}

const JuralioTable = ({
  columns,
  rows,
  onRowClick,
  onCellClick,
  tableBodyHeight,
  noRowsText,
  pageSizeOptions,
  initialPageSize,
  dataTest,
  rowDataTest,
  title,
  columnVisibilityModel,
  filters,
  // Server-side mode: when `serverSide` is true, the parent owns pagination,
  // sort and filter state and is expected to fetch the matching slice from
  // the backend. The DataGrid is wired to controlled models and emits
  // change events instead of filtering/sorting in memory.
  serverSide,
  rowCount,
  loading,
  paginationModel,
  onPaginationModelChange,
  sortModel,
  onSortModelChange,
  quickFilterValue,
  onQuickFilterChange,
  filterValues: filterValuesProp,
  onFilterValuesChange,
  hideSearch,
  hideToolbar,
  hideFooter,
}) => {
  const [internalFilterValues, setInternalFilterValues] = useState({})
  const [internalQuickFilter, setInternalQuickFilter] = useState('')

  const filterValues = useMemo(
    () => (serverSide ? (filterValuesProp ?? {}) : internalFilterValues),
    [serverSide, filterValuesProp, internalFilterValues]
  )

  const handleFilterChange = (name, value) => {
    if (serverSide) {
      onFilterValuesChange?.({ ...filterValues, [name]: value })
    } else {
      setInternalFilterValues(prev => ({ ...prev, [name]: value }))
    }
  }

  const handleFilterClear = () => {
    if (serverSide) {
      onFilterValuesChange?.({})
    } else {
      setInternalFilterValues({})
    }
  }

  const filteredRows = useMemo(
    () =>
      serverSide ? (rows ?? []) : applyFilters(rows, filters, filterValues),
    [serverSide, rows, filters, filterValues]
  )

  const activeQuickFilter = serverSide ? quickFilterValue : internalQuickFilter
  const handleQuickFilterChange = serverSide
    ? onQuickFilterChange
    : setInternalQuickFilter

  return (
    <div
      data-test={dataTest}
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        minHeight: 0,
      }}
    >
      <Typography variant="subtitle1">{title}</Typography>
      <DataGrid
        columns={columns}
        rows={filteredRows}
        slots={hideToolbar ? undefined : { toolbar: CustomToolbar }}
        slotProps={{
          ...(hideToolbar
            ? {}
            : {
                toolbar: {
                  filters,
                  filterValues,
                  onFilterChange: handleFilterChange,
                  onFilterClear: handleFilterClear,
                  quickFilterValue: activeQuickFilter,
                  onQuickFilterChange: handleQuickFilterChange,
                  hideSearch,
                },
              }),
          ...(rowDataTest ? { row: { 'data-test': rowDataTest } } : {}),
        }}
        onRowClick={onRowClick}
        onCellClick={onCellClick}
        onCellKeyDown={(_, event) => {
          if (event.key === ' ') {
            event.defaultMuiPrevented = true
          }
        }}
        pageSizeOptions={pageSizeOptions ?? [10, 25, 50, 100]}
        {...(serverSide
          ? {
              paginationMode: 'server',
              sortingMode: 'server',
              rowCount: rowCount ?? 0,
              paginationModel,
              onPaginationModelChange,
              sortModel,
              onSortModelChange,
              loading,
            }
          : {
              filterModel: {
                items: [],
                quickFilterValues: internalQuickFilter
                  ? [internalQuickFilter]
                  : [],
              },
              initialState: {
                pagination: {
                  paginationModel: { pageSize: initialPageSize ?? 10 },
                },
              },
            })}
        columnVisibilityModel={columnVisibilityModel}
        localeText={noRowsText ? { noRowsLabel: noRowsText } : undefined}
        sx={{
          ...MuiDataGridTheme,
          ...(tableBodyHeight === '100%'
            ? { flex: 1, minHeight: 0 }
            : { height: tableBodyHeight ?? 600 }),
        }}
        showToolbar={!hideToolbar}
        hideFooter={hideFooter}
        disableRowSelectionOnClick
        disableColumnFilter
        hideFooterSelectedRowCount
      />
    </div>
  )
}

export default JuralioTable
