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
import { useTranslation } from 'react-i18next'
import { useDispatch } from 'react-redux'
import { updateTasksList } from '../../../../redux/ducks/improved-taskmap'
import { isInImprovedTaskmapContext } from '../../../../services/helpers/route/route-context-helper'
import taskService from '../../../../services/task/task-service'
import KnockOnDatesConfirmationDialog from './KnockOnDatesConfirmationDialog'

export default function ConfirmDateTimeChange(props) {
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const handleConfirm = () => {
    props.actions
      .confirmHandler(
        props.task.matterId ? props.task.matterId : props.matterId,
        props.task.projectId ? props.task.projectId : props.projectId,
        props.task.id,
        props.dateChange.dateChangePayload,
        true,
        props.inTaskmap,
        true
      )
      .then(res => {
        if (props.isOOC) {
          props.setTask(res.task)
          let tasks = props.allTasks
          tasks[props.taskIndex] = res.task
          props.setTasks(tasks)
        }
        if (isInImprovedTaskmapContext()) {
          let newTasks = taskService.getTasks(
            props.task.matterId ? props.task.matterId : props.matterId,
            props.task.projectId ? props.task.projectId : props.projectId
          )
          newTasks.promise.then(response => {
            if (response.status === 200) {
              dispatch(updateTasksList(response.body))
            }
          })
        }
      })
  }

  const getConfirmationDialog = updatedTasks => {
    return (
      <KnockOnDatesConfirmationDialog
        titleText={t('taskChange.impactOfDateChange', {
          taskId: props.task.referenceNumber?.slice(3),
          taskName: props.task.name,
        })}
        updatedTasks={updatedTasks}
        tasks={props.tasks}
        cancelHandler={props.closeDialog}
        actionHandler={handleConfirm}
        task={props.task}
        dateChange={props.dateChange.dateChangePayload}
        usageContext="ConfirmDateTimeChange"
      />
    )
  }

  if (!props.dateChange?.dateChangeConsistency) {
    return null
  }
  let updatedTasks = props.dateChange.dateChangeConsistency.body

  return getConfirmationDialog(updatedTasks)
}
