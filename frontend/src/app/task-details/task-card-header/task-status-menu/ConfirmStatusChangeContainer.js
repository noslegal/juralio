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

import React from 'react'
import { useSelector, useDispatch } from 'react-redux'

import { closeConfirmationDialog } from '../../../task-map/selected-task/selected-task-actions'
import ConfirmStatusChange from './ConfirmStatusChange'
import { triggerResetDialog } from '../../../../components/navigation/common/dialog-triggers/dialog-trigger-actions'
import UnblockedTasksDialog from '../../task-card-content/TaskLinks/UnblockedTasksDialog'

const ConfirmStatusChangeContainer = props => {
  const statusChange = useSelector(state => state.statusChange)
  const dispatch = useDispatch()
  const showUnblockedTasksDialog = useSelector(
    state => state.dialogTriggers.UNBLOCKED_TASKS_DIALOG
  )

  const actions = {
    closeDialog: () => dispatch(closeConfirmationDialog()),
  }
  const handleUnblockedDialogClose = () => {
    dispatch(triggerResetDialog())
    window.localStorage.removeItem('unblocked-tasks-list')
  }

  return (
    <>
      <ConfirmStatusChange
        {...props}
        actions={actions}
        statusChange={statusChange}
      />
      {showUnblockedTasksDialog && (
        <UnblockedTasksDialog
          task={props.task}
          blockerslist={JSON.parse(
            window.localStorage.getItem('unblocked-tasks-list')
          )}
          matterId={props.matterId}
          projectId={props.projectId}
          onClose={() => handleUnblockedDialogClose()}
        />
      )}
    </>
  )
}

export default ConfirmStatusChangeContainer
