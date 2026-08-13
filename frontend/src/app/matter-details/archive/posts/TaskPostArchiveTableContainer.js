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

import { Typography, useTheme } from '@mui/material'
import { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import JuralioLink from '../../../../components/navigation/juralio-link/JuralioLink'
import { useIsViewOnly } from '../../../../hooks/matter/viewer/matter-viewer-hooks'
import { getDateDisplayString } from '../../../../services/helpers/date-helper'
import { getPostTypeIcon } from '../../../../services/helpers/post/post-icon-helper'
import juralioColours from '../../../../theme/juralio-colours'
import PostRestoreDialog from './restore/PostRestoreDialog'
import {
  getArchivedPosts,
  resetArchivedPosts,
  showRestorePostDialog,
} from './task-post-archive-actions'
import processData from './task-post-archive-table-data-provider'
import TaskPostArchiveTable from './TaskPostArchiveTable'

// Handles display of archived Posts in a Matter.
const TaskPostArchiveTableContainer = props => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const theme = useTheme()
  const postArchive = useSelector(
    state => state.postArchive.archive.archivedPosts
  )

  const isLoading = useSelector(state => state.postArchive.isLoading)
  const isLoaded = useSelector(state => state.postArchive.isLoaded)
  const isRestoreDialogVisible = useSelector(
    state => state.postArchive.restore.showDialog
  )
  const isViewOnly = useIsViewOnly({ activities: [] })

  useEffect(() => {
    if (!isLoaded && !isLoading) {
      dispatch(getArchivedPosts(props.matter.id))
    } else if (isLoaded)
      return () => {
        dispatch(resetArchivedPosts())
      }
  }, [dispatch, isLoaded, isLoading, props.matter.id])

  const columns = [
    {
      field: '_post',
      headerName: t('archiveHeaders.headerPost'),
      flex: 2,
      filterable: false,
      sortable: false,
      renderCell: params => (
        <div style={{ display: 'flex' }} data-test="postColumnHeader">
          <div style={{ color: theme.palette.grey.A700 }}>
            {getPostTypeIcon(t, params.row._post)}
          </div>
          <Typography
            data-test="name-text"
            variant="caption"
            style={{ marginTop: 'auto', marginBottom: 'auto', marginLeft: 8 }}
          >
            {params.row._post.name}
          </Typography>
        </div>
      ),
      getApplyQuickFilterFn: filterVal => (value, row) =>
        row._search.includes(filterVal.toLowerCase()),
    },
    {
      field: 'archivedDate',
      headerName: t('archiveHeaders.headerArchivedOn'),
      flex: 1,
      filterable: false,
      sortable: true,
      renderCell: params => (
        <div>{getDateDisplayString(params.row.archivedDate)}</div>
      ),
      getApplyQuickFilterFn: () => () => false,
    },
    {
      field: 'archivedByName',
      headerName: t('archiveHeaders.headerArchivedBy'),
      flex: 1,
      filterable: true,
      sortable: false,
      getApplyQuickFilterFn: () => () => false,
    },
    {
      field: 'action',
      headerName: t('archiveHeaders.headerAction'),
      flex: 1,
      filterable: false,
      sortable: false,
      renderCell: params => (
        <JuralioLink
          data-test="restore-post"
          disabled={true}
          style={{ color: juralioColours.greenBlue.primary }}
          onClick={() => {
            if (!isViewOnly) {
              dispatch(showRestorePostDialog(params.row._post))
            }
          }}
          value={t('unarchiveDialog.restore')}
        />
      ),
      getApplyQuickFilterFn: () => () => false,
    },
  ]

  const rows = processData(t, postArchive)

  const filters = [
    {
      name: 'archivedByName',
      label: t('archiveHeaders.headerArchivedBy'),
      options: Array.from(
        new Set(rows.map(r => r.archivedByName).filter(Boolean))
      ),
      matchFn: (row, selected) => selected.includes(row.archivedByName),
    },
  ].filter(f => f.options.length > 0)

  return (
    <div>
      {isRestoreDialogVisible && <PostRestoreDialog matter={props.matter} />}
      <TaskPostArchiveTable
        columns={columns}
        rows={rows}
        filters={filters}
        isLoading={isLoading}
      />
    </div>
  )
}

export default TaskPostArchiveTableContainer
