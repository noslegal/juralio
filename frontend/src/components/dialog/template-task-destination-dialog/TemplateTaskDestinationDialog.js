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

import { DialogContent } from '@mui/material'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { withTranslation } from 'react-i18next'
import { withStyles } from 'tss-react/mui'
import { CONFIG, TASK_MAP_LEVELS } from '../../../app/constants'
import { getLocationParams } from '../../../services/helpers/route/route-helper'
import { isLevelFTaskOrGreater } from '../../../services/task/data-provider/task-list-data-provider'
import ErrorBox from '../../data-display/error-box/ErrorBox'
import TemplateSelect from '../../inputs/template-select/TemplateSelect'
import TemplateTaskSelect from '../../inputs/template-task-select/TemplateTaskSelect'
import { TASK_PARENT_TYPE } from '../destination-dialog/task-parent-type-select/TaskParentTypeDefinitions'
import TaskParentTypeSelect from '../destination-dialog/task-parent-type-select/TaskParentTypeSelect'
import JuralioDialog from '../juralio-dialog/JuralioDialog'

const styles = theme => ({
  root: {
    width: theme.spacing(60),
  },
})

/**
 * The Template Task Destination Dialog helps user choose a destination related to a Template.
 */
class TemplateTaskDestinationDialog extends Component {
  state = {
    parentTypeSelection: TASK_PARENT_TYPE.UNDEFINED,
    taskValidationMessage: '',
    levelAValidationMessage: '',
    templateLevelACount: 0,
    showError: false,
    isEmptyProject: false,
  }

  isValidSelection = () => {
    if (
      this.state.taskValidationMessage.length > 0 ||
      this.state.levelAValidationMessage.length > 0
    ) {
      return false
    }

    const isValidLevelADestination =
      this.state.selectedTemplateId &&
      this.state.parentTypeSelection === TASK_PARENT_TYPE.LEVEL_A
    const isValidSubTaskDestination =
      this.state.selectedTemplateId != null &&
      this.state.selectedTaskId != null &&
      this.state.parentTypeSelection === TASK_PARENT_TYPE.SUBTASK_OF
    const isValid = isValidLevelADestination || isValidSubTaskDestination

    return isValid
  }

  componentDidMount = () => {
    const taskLocationParams = getLocationParams('task')
    this.setState({
      selectedTemplateId: getLocationParams('template'),
      selectedTaskId: taskLocationParams,
      parentTypeSelection: taskLocationParams
        ? TASK_PARENT_TYPE.SUBTASK_OF
        : TASK_PARENT_TYPE.UNDEFINED,
    })
  }

  focusTask() {
    return (
      this.state.selectedTemplateId !== undefined &&
      this.state.parentTypeSelection !== TASK_PARENT_TYPE.UNDEFINED &&
      this.state.selectedTaskId === undefined
    )
  }

  focusTemplate() {
    return !(this.state.selectedTemplateId === undefined)
  }

  focusParentType() {
    return (
      this.state.selectedTemplateId !== undefined &&
      this.state.parentTypeSelection === TASK_PARENT_TYPE.UNDEFINED
    )
  }

  handleTemplateChange = template => {
    this.setState({
      parentTypeSelection: TASK_PARENT_TYPE.UNDEFINED,
      selectedTemplateId: template.id,
      selectedTaskId: 0,
      levelAValidationMessage: '',
      templateLevelACount: undefined,
      taskValidationMessage: '',
      showError: false,
      isEmptyProject: false,
    })
  }

  updateLevelAValidationMessage = () => {
    if (
      this.state.parentTypeSelection === TASK_PARENT_TYPE.LEVEL_A &&
      this.state.templateLevelACount >= CONFIG.LEVEL_A_TASK_LIMIT
    ) {
      this.setState({
        levelAValidationMessage: this.props.t(
          'copyTaskDialog.templateCopyMaxValidationMessage',
          {
            maxLevelACount: CONFIG.LEVEL_A_TASK_LIMIT,
          }
        ),
      })
    } else this.setState({ levelAValidationMessage: '' })
  }

  handleParentSelectChange = taskParentType => {
    this.setState(
      {
        parentTypeSelection: taskParentType,
        selectedTaskId: undefined,
        taskValidationMessage: '',
        showError: false,
      },
      () => {
        this.updateLevelAValidationMessage()
      }
    )
  }

  handleTemplateTaskChange = templateTask => {
    this.setState({
      selectedTaskId: templateTask.id,
      showError: false,
    })
  }

  handleCreateTaskValidation = task => {
    let validationMessage = ''
    if (task.level === TASK_MAP_LEVELS.F) {
      validationMessage = this.props.t(
        'taskCreation.validation.levelFTasksCannotHaveSubTasks'
      )
    }

    if (task.tasks.length >= CONFIG.SUBTASK_LIMIT) {
      validationMessage = this.props.t(
        'taskCreation.validation.tasksCannotHaveMoreThanLimitubtasks',
        { limit: CONFIG.SUBTASK_LIMIT }
      )
    }

    this.setState({ taskValidationMessage: validationMessage })
  }

  handleCreateTaskTemplateLevelAValidation = template => {
    if (template.tasks?.length === 0) {
      this.setState({ isEmptyProject: true })
    } else if (template.levelATaskCount !== undefined) {
      this.setState(
        {
          templateLevelACount: template.levelATaskCount,
        },
        () => this.updateLevelAValidationMessage()
      )
    }
  }

  render() {
    return (
      <JuralioDialog
        data-test="destination-dialog"
        open={true}
        onClose={this.props.cancelHandler}
        fullScreen={this.props.fullScreen}
        titleText={this.props.titleText}
        titleIcon={this.props.titleIcon}
        handleAction={this.onCreateClicked}
        handleCancel={this.props.cancelHandler}
        actionLabel="Create"
        disabled={!this.isValidSelection()}
        usageContext="TemplateTaskDestinationDialog"
        cancelText={this.props.cancelText}
      >
        <DialogContent>
          <TemplateSelect
            key={this.state.selectedTemplateId}
            selectionChangeHandler={this.handleTemplateChange}
            templateId={this.state.selectedTemplateId}
            placeholder="Choose a template"
            focus={this.focusTemplate()}
            handleCreateTaskTemplateLevelAValidation={
              this.handleCreateTaskTemplateLevelAValidation
            }
          />
          {this.renderTaskOptions()}
          {this.props.error && this.state.showError && (
            <ErrorBox error={this.props.error} padding={true} />
          )}
        </DialogContent>
      </JuralioDialog>
    )
  }

  renderTaskOptions = () => {
    return this.renderParentSelection()
  }

  renderTaskSelect = () => {
    return (
      <TemplateTaskSelect
        selectedTaskId={this.state.selectedTaskId}
        templateId={this.state.selectedTemplateId}
        taskId={this.state.selectedTaskId}
        onChange={this.handleTemplateTaskChange}
        error={false}
        disabledItemFilter={isLevelFTaskOrGreater}
        focus={this.focusTask()}
        helperText={''}
        handleCreateTaskValidation={this.handleCreateTaskValidation}
        validationMessage={this.state.taskValidationMessage}
      />
    )
  }

  renderParentSelection = () => {
    return (
      <div>
        <TaskParentTypeSelect
          selectedParentType={this.state.parentTypeSelection}
          enabled={this.state.selectedTemplateId !== undefined}
          onChange={this.handleParentSelectChange}
          autoFocus={this.focusParentType()}
          levelACount={this.state.templateLevelACount}
          projectIsEmpty={this.state.isEmptyProject}
          error={this.state.levelAValidationMessage ? true : false}
          validationMessage={this.state.levelAValidationMessage}
        />
        {this.renderSubtaskSelectIfRequired()}
      </div>
    )
  }

  renderSubtaskSelectIfRequired = () => {
    return this.state.parentTypeSelection === TASK_PARENT_TYPE.SUBTASK_OF
      ? this.renderTaskSelect()
      : null
  }

  onCreateClicked = () => {
    this.props.createHandler(
      this.state.selectedTemplateId,
      this.state.selectedTaskId
    )
    this.setState({ showError: true })
  }
}

TemplateTaskDestinationDialog.propTypes = {
  /** cancelHandler */
  cancelHandler: PropTypes.func.isRequired,
  /** fullScreen */
  fullScreen: PropTypes.bool.isRequired,
  /** titleText */
  titleText: PropTypes.string.isRequired,
  /** titleIcon */
  titleIcon: PropTypes.object.isRequired,
  /** createHandler */
  createHandler: PropTypes.func.isRequired,
}

export default withStyles(
  withTranslation()(TemplateTaskDestinationDialog),
  styles
)
