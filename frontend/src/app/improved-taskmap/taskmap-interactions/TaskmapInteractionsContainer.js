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

import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router'
import { isInTemplate } from '../../../components/navigation/common/location-context-helper'
import { closeOptionsMenu } from '../../../redux/ducks/improved-taskmap-interactions'
import { DATE_VARIABLES, TASK_STATUS } from '../../constants'
import ConfirmDateTimeChangeContainer from '../../task-details/task-card-content/TaskDates/ConfirmDateTimeChangeContainer'
import ConfirmStatusChangeContainer from '../../task-details/task-card-header/task-status-menu/ConfirmStatusChangeContainer'
import DateChangePopover from '../../task-map/date-change/DateChangePopover'
import TaskPreviewContainer from '../../task-map/task-preview/TaskPreviewContainer'
import {
  deleteTemplate,
  editingActions,
  showCopyTemplateDialog,
  showDeleteTemplateDialog,
  updateTemplate,
} from '../../template/template-actions'
import SchemeOptionsContainer from '../../template/template-options/SchemeOptionsContainer'
import { confirmStatusChange } from '../taskmap-interaction-helpers/status-helpers'
import DropZone from './DropZone'
import NewTaskHighlightBulkClose from './NewTaskHighlightBulkClose'
import TaskOptions from './TaskOptions'
import TaskRename from './TaskRename'

const TaskmapInteractionsContainer = props => {
  const history = useNavigate()
  const taskmapInteractions = useSelector(
    state => state.improvedTaskmapInteractions
  )
  const taskmap = useSelector(state => state.taskmap)
  const dispatch = useDispatch()
  const statusChange = useSelector(state => state.statusChange)
  const tasks = useSelector(state => state.improvedTaskmap.tasks)
  const newTasks = useSelector(state => state.improvedTaskmap.newTasks)
  const task = tasks.find(t => t.id === taskmapInteractions.taskId)
  const template = useSelector(state => state.template)
  const isTemplate = isInTemplate(window.location.href)
  const statusDone = useSelector(state => state.taskMapFilter.statusDone)

  useEffect(() => {
    if (statusChange.statusChangeTargetTaskId && taskmapInteractions.options) {
      dispatch(closeOptionsMenu(false))
    }
  }, [statusChange]) //eslint-disable-line

  return (
    <>
      {taskmapInteractions.rename && (
        <TaskRename task={task} projectId={props.project.id} />
      )}
      {taskmapInteractions.dragging && <DropZone />}
      {taskmapInteractions.preview && <TaskPreviewContainer isTaskmap={true} />}
      {taskmapInteractions.dates && (
        <DateChangePopover
          inTaskMap={true}
          task={task}
          forceFetch={true}
          dateType={taskmap.dateType}
          fullType={
            taskmap.dateType === DATE_VARIABLES.END
              ? task?.status === TASK_STATUS.DONE
                ? DATE_VARIABLES.AED
                : DATE_VARIABLES.PED
              : DATE_VARIABLES.PSD
          }
        />
      )}
      {taskmapInteractions.options && (
        <TaskOptions
          task={task}
          isTemplate={isTemplate}
          viewOnly={props.viewOnly}
        />
      )}
      {!isTemplate && statusChange.statusChangeTargetTaskId && task && (
        <ConfirmStatusChangeContainer
          task={task}
          confirmHandler={properties => {
            confirmStatusChange(
              properties,
              statusChange.affectedTasks,
              tasks,
              task,
              dispatch,
              statusDone
            )
          }}
        />
      )}
      {newTasks.length > 0 && (
        <NewTaskHighlightBulkClose
          newTasks={newTasks}
          matterId={props.matterId}
          projectId={props.project.id}
        />
      )}
      <ConfirmDateTimeChangeContainer
        matterId={task && task.matterId}
        projectId={task && task.project && task.project.id}
        isTaskmap={true}
        tasks={tasks}
        task={task}
        onCancel={() => {}}
      />
      <SchemeOptionsContainer
        isTemplate
        isEditingName={template.editingState.isEditingName}
        name={template.template.name}
        project={template.template}
        editing={{
          isEditingName: template.editingState.isEditingName,
          saveName: name =>
            dispatch(
              updateTemplate(template.id, {
                name,
              })
            ),
          clearEditing: () => dispatch(editingActions.clearEditing()),
        }}
        showCopyDialog={template.showCopyDialog}
        showDeleteDialog={template.showDeleteDialog}
        setShowCopyDialog={() =>
          dispatch(showCopyTemplateDialog(!template.showCopyDialog))
        }
        setShowDeleteDialog={() =>
          dispatch(showDeleteTemplateDialog(!template.showDeleteDialog))
        }
        deleteTemplate={() => {
          dispatch(deleteTemplate(template.template.id))
          history('/templates')
        }}
      />
    </>
  )
}
export default TaskmapInteractionsContainer
