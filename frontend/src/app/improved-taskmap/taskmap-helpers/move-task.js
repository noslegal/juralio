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

import { performTemplateMove } from '../../../redux/ducks/improved-taskmap-interactions'
import templateService from '../../../services/template/template-service'
import { displayConfirmationDialog } from '../../global-confirmation-dialog/global-confirmation-dialog-actions'
import { showSnackbar } from '../../global-snackbar/global-snackbar-actions'
import { taskMoveKnockOnDialog } from '../../task-details/task-options/task-move/task-move-dialog/TaskMoveKnockOnDialog'
import { moveTask } from '../../task-map/selected-task/selected-task-menu-actions'
export const moveTaskToNewParent = (
  matterId,
  projectId,
  taskToMove,
  newParent,
  dispatch,
  t,
  cancelMove,
  projectTasks = [],
  callback = () => {},
  force = false
) => {
  const destination = newParent ? 'TASK' : 'PROJECT'
  const previousState = null
  const updateWithMovedTask = true
  dispatch(
    moveTask(
      matterId,
      projectId,
      taskToMove.id,
      destination,
      projectId,
      newParent,
      previousState,
      updateWithMovedTask,
      force
    )
  ).then(res => {
    if (res.type && res.type === 'MOVE_TASK_KNOCK_ON_EFFECTS') {
      taskMoveKnockOnDialog(
        res.knockOnEffects,
        taskToMove,
        projectTasks,
        t,
        () => {
          moveTaskToNewParent(
            matterId,
            projectId,
            taskToMove,
            newParent,
            dispatch,
            t,
            cancelMove,
            projectTasks,
            callback,
            true
          )
        },
        cancelMove,
        (options, func) => dispatch(displayConfirmationDialog(options, func))
      )
    } else {
      const oldParentStatus = newParent ? newParent.status : undefined
      const itemStatus = res.task?.status
      let updatedParent
      switch (itemStatus) {
        case 'in-progress':
          if (['done', 'not-started'].includes(oldParentStatus)) {
            updatedParent = 'in-progress'
          }
          break
        case 'done':
          if (['not-started'].includes(oldParentStatus)) {
            updatedParent = 'in-progress'
          }
          break
        case 'not-started':
          if (['done'].includes(oldParentStatus)) {
            updatedParent = 'in-progress'
          }
          break
        default:
          break
      }
      if (res.type === 'RECIEVE_TASK_SUCCESS') {
        dispatch(
          showSnackbar(
            updatedParent
              ? t('taskMap.moveSuccessUpdateParent', {
                  taskStatus: updatedParent,
                })
              : t('taskMap.moveSuccess')
          )
        )
      }
      callback(res.task, force)
    }
  })
}

export const moveTemplateTaskToNewParent = (
  templateId,
  taskToMove,
  newParent,
  dispatch,
  t,
  cancelMove,
  projectTasks = [],
  callback = () => {},
  force = false
) => {
  const destination = newParent ? 'TASK' : 'PROJECT'
  const x = destination === 'PROJECT' ? templateId : newParent
  templateService
    .moveTemplateTask(templateId, taskToMove, destination, x)
    .then(res => {
      dispatch(performTemplateMove(templateId))
      callback()
    })
}
