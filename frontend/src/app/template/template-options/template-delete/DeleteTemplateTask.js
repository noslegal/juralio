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

import DeleteIcon from '@mui/icons-material/Delete'
import PropTypes from 'prop-types'
import React from 'react'
import { useTranslation } from 'react-i18next'

import ConfirmationDialog from '../../../../components/dialog/confirmation-dialog/ConfirmationDialog'
import withRouter from '../../../../services/navigation/WithRouter'
import { TASK_MENU_CONTEXT } from '../../../constants'
import { getTemplateIdFromLocation } from '../../../../components/navigation/common/location-context-helper'

const DeleteTemplateTask = props => {
  const { t } = useTranslation()
  const templateId = getTemplateIdFromLocation(props.router.location)

  const deleteTask = () => {
    const isDeletingSelectedTemplateTask =
      props.taskMenuContext !== TASK_MENU_CONTEXT.SUBTASK_PANEL
    props.actions
      .deleteTemplateTask(
        templateId,
        props.task.id,
        isDeletingSelectedTemplateTask
      )
      .then(() => {
        handleContextUpdate(props)
      })
  }

  const handleContextUpdate = () => {
    if (props.taskMenuContext === TASK_MENU_CONTEXT.TASK_MAP) {
      props.actions
        .fetchTemplateTasks(templateId)
        .then(() => props.cancelHandler())
    } else {
      if (props.taskMenuContext === TASK_MENU_CONTEXT.SUBTASK_PANEL) {
        if (props.task.level === 1) {
          props.actions.fetchTemplateOverview(templateId)
        }
      } else {
        props.actions.clearTemplateTaskState()
      }

      props.cancelHandler()
    }
  }

  return props.display ? (
    <ConfirmationDialog
      headerIcon={DeleteIcon}
      titleText={t('taskDelete.deleteTaskHeader', {
        taskName: props.task.name,
      })}
      actionText={t('common.delete')}
      promptText={t('taskDelete.deleteTaskConfirmationPrompt')}
      actionHandler={deleteTask}
      cancelHandler={props.cancelHandler}
      data-test="delete-confirmation-dialog"
      usageContext="DeleteTemplate"
      warningText={null}
    />
  ) : null
}

DeleteTemplateTask.propTypes = {
  /** actions */
  actions: PropTypes.object.isRequired,
  /** taskMenuContext */
  taskMenuContext: PropTypes.string.isRequired,
  /** cancelHandler */
  cancelHandler: PropTypes.func.isRequired,
  /** display */
  display: PropTypes.bool.isRequired,
}

export default withRouter(DeleteTemplateTask)
