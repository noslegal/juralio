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

import { DialogContent, Typography } from '@mui/material'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import TaskChip from '../../../../components/data-display/task-chip/TaskChip'
import TaskUpdateChip from '../../../../components/data-display/task-update-chip/TaskUpdateChip'
import JuralioDialog from '../../../../components/dialog/juralio-dialog/JuralioDialog'
import { TASK_STATUS } from '../../../constants'
import { displaySnackbar } from '../../../global-snackbar/global-snackbar-actions'
import UnblockedTasksSnackbarButton from '../../task-card-content/TaskLinks/TaskBlockComponents/UnblockedTasksSnackbarButton'

const ConfirmStatusChange = props => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const isChangingParentTask =
    props.statusChange.statusChangeTargetTaskId === props.task.id
  const task = isChangingParentTask
    ? props.task
    : props.task.tasks.find(
        t => t.id === props.statusChange.statusChangeTargetTaskId
      )

  const getUnblockedTasksWhenMarkedAsDone = () => {
    if (props.statusChange.statusChangePayload?.status === 'done') {
      const blockers = props.task.blockers
      const blockerList =
        blockers === undefined
          ? []
          : blockers
              ?.filter(blocker => blocker.blocker.id === task.id)
              .map(tb => tb.blocked)
      let blockedCount = blockerList?.length
      if (blockedCount > 0) {
        window.localStorage.setItem(
          'unblocked-tasks-list',
          JSON.stringify(blockerList)
        )
        let text = ''
        if (blockedCount > 1) {
          text = t('taskBlocksDialog.tasksUnblocked', {
            blockedCount: blockedCount,
          })
        } else {
          text = t('taskBlocksDialog.taskUnblocked', {
            blockedCount: blockedCount,
          })
        }
        dispatch(displaySnackbar(text, <UnblockedTasksSnackbarButton />))
      }
    }
  }

  const handleConfirm = () => {
    getUnblockedTasksWhenMarkedAsDone()
    props.confirmHandler(props.statusChange.statusChangePayload)
  }

  if (
    props.statusChange &&
    task !== undefined &&
    props.statusChange.affectedTasks
  ) {
    const tasks = props.statusChange.affectedTasks
    return (
      <JuralioDialog
        open={true}
        actionLabel={t('common.continue')}
        handleCancel={props.actions.closeDialog}
        handleAction={handleConfirm}
        titleText={t('taskChange.statusChange') + task.name}
        onClose={props.actions.closeDialog}
      >
        <DialogContent>
          <Typography data-test="dialog-prompt-text">
            {t('taskChange.promptText')}
          </Typography>
          <Typography
            data-test="change-counter"
            variant="button"
            style={{ marginTop: '16px' }}
          >
            {t('taskChange.statusChange')}
            {tasks.length}
          </Typography>
          {tasks.map(item => (
            <div
              data-test="task-update-chip"
              key={item.id}
              style={{ padding: '8px' }}
            >
              <TaskChip
                isLink={false}
                task={item}
                noHover={true}
                closeHandler={() => {}}
              />
              <TaskUpdateChip
                task={item}
                changeTask={task}
                statusChange={props.statusChange.statusChangePayload.status}
                newStatus={
                  task.level > item.level &&
                  props.statusChange.statusChangePayload.status ===
                    TASK_STATUS.DONE
                    ? TASK_STATUS.IN_PROGRESS
                    : props.statusChange.statusChangePayload.status
                }
                blockers={item.blockers}
              />
            </div>
          ))}
        </DialogContent>
      </JuralioDialog>
    )
  }
  return null
}

export default ConfirmStatusChange
