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

import ArchiveIcon from '@mui/icons-material/Archive'
import React from 'react'
import { useTranslation } from 'react-i18next'
import { useNavigate } from 'react-router'
import TaskBlockerAlert from '../../../../components/data-display/task-blocker-alert/TaskBlockerAlert'
import ConfirmationDialog from '../../../../components/dialog/confirmation-dialog/ConfirmationDialog'
import { getTaskMapUrl } from '../../../../components/navigation/common/location-context-helper'
import { getMilestoneOrTaskString } from '../../../../services/helpers/task/task-util-helper'
import withRouter from '../../../../services/navigation/WithRouter'
import { TASK_MENU_CONTEXT } from '../../../constants'

const ArchiveTask = withRouter(props => {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const archiveTask = () => {
    return props.actions
      .archiveTask(props.matterId, props.task.projectId, props.task.id)
      .then(() => {
        const taskParentId =
          !props.task.parent || props.task.parent.type === 'PROJECT'
            ? null
            : props.task.parent.id

        switch (props.taskMenuContext) {
          case (TASK_MENU_CONTEXT.TASK_MAP, TASK_MENU_CONTEXT.ROADMAP): {
            props.updateProject(props.matterId, props.task.projectId)
            props.cancelHandler()
            props.updateProjectTaskmap(
              props.matterId,
              props.task.projectId,
              true
            )
            props.actions.resetSelectedTask()
            return
          }
          case TASK_MENU_CONTEXT.SUBTASK_PANEL: {
            props.cancelHandler()
            props.updateProjectTaskmap(
              props.matterId,
              props.task.projectId,
              true
            )
            return props.task.level > 1
              ? props.actions.fetchTaskDetails(
                  props.matterId,
                  props.task.projectId,
                  taskParentId
                )
              : props.actions.fetchProjectOverview(
                  props.matterId,
                  props.task.projectId
                )
          }
          default: {
            props.cancelHandler()
            props.updateProjectTaskmap(
              props.matterId,
              props.task.projectId,
              true
            )
            props.actions.resetSelectedTask()
            if (!props.dontRedirect) {
              navigate(
                getTaskMapUrl(
                  taskParentId,
                  props.matterId,
                  props.task.projectId
                )
              )
            }
          }
        }
      })
  }

  return props.display ? (
    <ConfirmationDialog
      titleText={
        `Archive ${getMilestoneOrTaskString(props.task)}: ` + props.task.name
      }
      promptText={
        props.task.isMilestone
          ? t('milestoneDetails.archivePrompt')
          : t('taskDetails.archivePrompt')
      }
      actionText={'Archive'}
      cancelHandler={props.cancelHandler}
      actionHandler={archiveTask}
      data-test="archive-confirmation-dialog"
      usageContext="ArchiveTask"
      loadingText="Archiving"
      headerIcon={ArchiveIcon}
      extraComponent={
        props.task.blockers?.length > 0 ? (
          <TaskBlockerAlert task={props.task} />
        ) : (
          <></>
        )
      }
      warningText={null}
    />
  ) : null
})

export default ArchiveTask
