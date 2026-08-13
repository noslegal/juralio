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

import PropTypes from 'prop-types'
import React from 'react'
import { withTranslation } from 'react-i18next'
import {
  ACTIVITIES,
  MAX_FIELD_LENGTHS,
  TASK_STATUS,
} from '../../../app/constants'
import { handleInvalidSubtaskCreationContexts } from '../../../app/task-details/TaskCardCommon'
import {
  isInRoadmapContext,
  isInTaskContext,
  isInTaskmapContext,
} from '../../../services/helpers/route/route-context-helper'
import { getLocationParams } from '../../../services/helpers/route/route-helper'
import { TaskIcon } from '../../../theme/navigation/CommonIcons'
import TaskDestinationDialog from '../../dialog/task/TaskDestinationDialog'
import TextPromptDialog from '../../dialog/text-prompt-dialog/TextPromptDialog'
import TextWithDestinationDialog from '../../dialog/text-with-destination-dialog/TextWithDestinationDialog'

class CreateTaskFlow extends React.Component {
  state = {
    NameEntered: false,
    redirect: false,
    error: '',
  }

  width = false

  componentDidMount() {
    if (isInTaskContext()) {
      handleInvalidSubtaskCreationContexts(
        this.props.t,
        this.props.cancelHandler,
        this.props.parentTask,
        this.props.actions.displaySnackbar
      )
    }
  }

  displayDestinationDialog = name => {
    this.setState({ NameEntered: true })
    this.taskName = name
  }
  createTask = (matterId, projectId, parentId) => {
    this.props.actions
      .createNewTask(
        matterId,
        projectId,
        parentId,
        TASK_STATUS.NOT_STARTED,
        this.taskName
      )
      .then(response => {
        if (response.type === 'CREATE_TASK_FAILURE') {
          this.setState({
            error: response.message,
          })
          return
        }
        if (isInTaskmapContext() || isInRoadmapContext()) {
          this.props.actions.fetchProjectOverview(matterId, projectId)
          this.props.actions.fetchProjectWithPostsAndTaskTeam(
            matterId,
            projectId
          )
        }
        this.props.cancelHandler()
      })
  }

  createTaskInContext = name => {
    this.taskName = name
    this.createTask(
      getLocationParams('matter'),
      getLocationParams('workstream'),
      getLocationParams('task')
    )
  }

  handleBack = () => {
    this.setState({ NameEntered: false })
  }

  render() {
    return this.state.NameEntered ? (
      <TaskDestinationDialog
        cancelHandler={this.handleBack}
        createHandler={this.createTask}
        fullScreen={this.getFullScreenMode()}
        error={this.state.error}
        cancelText={this.props.t('common.back')}
      />
    ) : (
      this.renderEntryDialog()
    )
  }

  renderEntryDialog() {
    const isMatterViewer =
      this.props.matter?.activities.includes(ACTIVITIES.MATTER_VIEWER) ||
      this.props.auth.data.details.roles.includes('FROZEN_ORG_USER')
    const { t } = this.props
    return isInTaskContext() &&
      !isMatterViewer &&
      this.props.parentTask.status !== TASK_STATUS.NOT_REQUIRED ? (
      <TextWithDestinationDialog
        titleText={t('taskCreation.nameYourNewTask')}
        titleIcon={TaskIcon}
        placeholderText={t('taskCreation.taskNamePlaceHolder')}
        maximumLength={MAX_FIELD_LENGTHS.POST_NAME}
        actionText={t('common.create')}
        cancelHandler={this.props.cancelHandler}
        actionHandler={this.createTaskInContext}
        fullScreen={this.getFullScreenMode()}
        destinationParentTask={this.props.parentTask}
        editDestination={this.displayDestinationDialog}
        destinationLabelText={t('taskCreation.asASubtaskOf')}
        usageContext="CreateTaskFlowInTaskContext"
        error={this.state.error}
      />
    ) : (
      <TextPromptDialog
        titleText={t('taskCreation.nameYourNewTask')}
        titleIcon={TaskIcon}
        placeholderText={t('taskCreation.taskNamePlaceHolder')}
        maximumLength={MAX_FIELD_LENGTHS.POST_NAME}
        actionText={t('common.next')}
        cancelHandler={this.props.cancelHandler}
        actionHandler={this.displayDestinationDialog}
        fullScreen={this.getFullScreenMode()}
        usageContext="CreateTaskFlow"
      />
    )
  }

  getFullScreenMode = () => this.width
}

CreateTaskFlow.propTypes = {
  /** actions */
  actions: PropTypes.object.isRequired,
  /** cancelHandler */
  cancelHandler: PropTypes.func.isRequired,
  /** parentTask */
  parentTask: PropTypes.object.isRequired,
  /** width */
  width: PropTypes.string.isRequired,
}

export default withTranslation()(CreateTaskFlow)
