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

import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useSelector } from 'react-redux'
import { makeStyles } from 'tss-react/mui'
import TaskChip from '../../../../components/data-display/task-chip/TaskChip'
import TaskReferenceNumber from '../../../../components/data-display/task-reference-number/TaskReferenceNumber'
import JuralioLink from '../../../../components/navigation/juralio-link/JuralioLink'
import JuralioTable from '../../../../components/table/JuralioTable'
import { getDateDisplayString } from '../../../../services/helpers/date-helper'
import juralioColours from '../../../../theme/juralio-colours'
import { getTasks, loadingComponent } from './archive-helper'
import UnarchiveDialog from './UnarchiveDialog'

const useStyles = makeStyles()(theme => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    width: '100%',
  },
}))

const TASK_COLUMN_WIDTH = 350

const TaskArchiveTable = props => {
  const { matterId, archivedTasks } = props
  const { t } = useTranslation()
  const { classes } = useStyles()

  const [showDialog, setShowDialog] = useState(false)
  const auth = useSelector(state => state.auth)
  const [task, setTask] = useState()

  const openRestoreDialog = task => {
    if (!auth.data.details.roles.includes('FROZEN_ORG_USER')) {
      setTask(task)
      setShowDialog(true)
    }
  }

  const closeRestoreDialog = () => setShowDialog(false)

  const columns = [
    {
      field: 'task',
      headerName: t('archiveHeaders.headerTask'),
      width: TASK_COLUMN_WIDTH,
      filterable: false,
      sortable: false,
      renderCell: params => (
        <TaskChip
          task={params.row.task}
          matterid={params.row.task.matterId}
          projectid={params.row.task.projectId}
          isLink={false}
          noHover={true}
          compact={true}
          closeHandler={() => {}}
        />
      ),
      getApplyQuickFilterFn: filterVal => (value, row) =>
        row._search.includes(filterVal.toLowerCase()),
    },
    {
      field: 'refNumber',
      headerName: t('archiveHeaders.headerTaskNumber'),
      flex: 1,
      filterable: false,
      sortable: false,
      renderCell: params => (
        <TaskReferenceNumber
          compact
          task={params.row.task}
          index={params.row.task.id}
        />
      ),
      getApplyQuickFilterFn: () => () => false,
    },
    {
      field: 'subtasksCount',
      headerName: t('archiveHeaders.headerSubtask'),
      flex: 1,
      sortable: false,
      filterable: false,
      getApplyQuickFilterFn: () => () => false,
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
      sortable: false,
      filterable: false,
      getApplyQuickFilterFn: () => () => false,
    },
    {
      field: 'action',
      headerName: t('archiveHeaders.headerAction'),
      flex: 1,
      sortable: false,
      filterable: false,
      renderCell: params => (
        <JuralioLink
          data-test={`Restore${params.row.task.id}`}
          style={{ color: juralioColours.greenBlue.primary }}
          onClick={() => openRestoreDialog(params.row.task)}
          value={t('unarchiveDialog.restore')}
        />
      ),
      getApplyQuickFilterFn: () => () => false,
    },
  ]

  const rows = (archivedTasks ?? []).map(archiveTask => ({
    id: archiveTask.id,
    task: archiveTask,
    refNumber: archiveTask.referenceNumber,
    subtasksCount: getTasks(archiveTask).length,
    archivedDate: archiveTask.archivedDate,
    archivedByName: archiveTask.archivedByName,
    milestoneType: archiveTask.isMilestone
      ? t('entity.milestone')
      : t('entity.task'),
    _search: `${archiveTask.name} ${archiveTask.referenceNumber}`.toLowerCase(),
  }))

  return (
    <div className={classes.root}>
      <div>
        {archivedTasks == null ? (
          loadingComponent
        ) : (
          <JuralioTable
            columns={columns}
            rows={rows}
            filters={[
              {
                name: 'milestoneType',
                label: t('archiveHeaders.headerAllTasksMilestones'),
                options: Array.from(new Set(rows.map(r => r.milestoneType))),
                matchFn: (row, selected) =>
                  selected.includes(row.milestoneType),
              },
            ].filter(f => f.options.length > 0)}
            noRowsText={t('unarchiveDialog.zeroState')}
            tableBodyHeight="calc(100vh - 360px)"
          />
        )}
      </div>

      {showDialog && (
        <UnarchiveDialog
          showDialog={showDialog}
          handleClose={closeRestoreDialog}
          task={task}
          matterId={matterId}
        />
      )}
    </div>
  )
}

export default TaskArchiveTable
