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
import { MAX_FIELD_LENGTHS } from '../../../app/constants'
import { handleInvalidSubtaskCreationContexts } from '../../../app/task-details/TaskCardCommon'
import IsWidthDown from '../../../hooks/width-helper'
import {
  isInSpecificTemplateContext,
  isInTaskContext,
  isInTaskmapContext,
} from '../../../services/helpers/route/route-context-helper'
import { getLocationParams } from '../../../services/helpers/route/route-helper'
import { TemplatesIcon } from '../../../theme/navigation/CommonIcons'
import TemplateTaskDestinationDialog from '../../dialog/template-task-destination-dialog/TemplateTaskDestinationDialog'
import TextPromptDialog from '../../dialog/text-prompt-dialog/TextPromptDialog'
import TextWithDestinationDialog from '../../dialog/text-with-destination-dialog/TextWithDestinationDialog'

class CreateTemplateTaskFlow extends React.Component {
  state = { NameEntered: false, error: '' }

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

  createTemplateTask = (templateId, parentId) => {
    this.props.actions
      .createNewTemplateTask(templateId, parentId, this.taskName)
      .then(response => {
        if (response.status) {
          this.setState({ error: response.body.message })
          return
        }
        if (isInTaskmapContext() && isInSpecificTemplateContext(templateId)) {
          this.props.actions.fetchTemplateTasks(templateId)
        }
        this.props.cancelHandler()
      })
  }

  createTemplateTaskInContext = name => {
    this.taskName = name
    this.props.actions
      .createNewTemplateTask(
        getLocationParams('template'),
        getLocationParams('task'),
        this.taskName
      )
      .then(response => {
        if (response.status) {
          this.setState({ error: response.body.message })
          return
        }

        this.props.cancelHandler()
      })
  }

  cancelHandler = e => {
    if (this.state.NameEntered) {
      this.setState({ NameEntered: false })
    } else {
      this.props.cancelHandler(e)
    }
  }

  render() {
    const { t } = this.props
    return this.state.NameEntered ? (
      <TemplateTaskDestinationDialog
        titleText={t('templates.templateTaskDestination')}
        titleIcon={TemplatesIcon}
        cancelHandler={this.cancelHandler}
        createHandler={this.createTemplateTask}
        fullScreen={this.getFullScreenMode()}
        error={this.state.error}
        cancelText={t('common.back')}
      />
    ) : (
      this.renderEntryDialog()
    )
  }

  getFullScreenMode = () => IsWidthDown('sm', this.props.width)

  renderEntryDialog() {
    const { t } = this.props
    return isInTaskContext() ? (
      <TextWithDestinationDialog
        titleText={t('templates.nameYourNewTemplateTask')}
        titleIcon={TemplatesIcon}
        placeholderText={t('templates.templateTaskName')}
        maximumLength={MAX_FIELD_LENGTHS.POST_NAME}
        actionText={t('common.create')}
        cancelHandler={this.props.cancelHandler}
        actionHandler={this.createTemplateTaskInContext}
        fullScreen={this.getFullScreenMode()}
        destinationParentTask={this.props.parentTask}
        editDestination={this.displayDestinationDialog}
        destinationLabelText={t('taskCreation.asASubtaskOf')}
        usageContext="CreateTemplateTaskFlowInTaskContext"
        error={this.state.error}
      />
    ) : (
      <TextPromptDialog
        titleText={t('templates.nameYourNewTemplateTask')}
        titleIcon={TemplatesIcon}
        placeholderText={t('templates.templateTaskName')}
        maximumLength={MAX_FIELD_LENGTHS.POST_NAME}
        actionText={t('common.next')}
        cancelHandler={this.props.cancelHandler}
        actionHandler={this.displayDestinationDialog}
        fullScreen={this.getFullScreenMode()}
        usageContext="CreateTemplateTaskFlow"
      />
    )
  }
}

CreateTemplateTaskFlow.propTypes = {
  /** cancel dialog function handler */
  cancelHandler: PropTypes.func.isRequired,
  /** parentTask */
  parentTask: PropTypes.object.isRequired,
}

export default withTranslation()(CreateTemplateTaskFlow)
