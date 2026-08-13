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
import { connect } from 'react-redux'
import {
  ACTIVITIES,
  CONFIG,
  TASK_MAP_LEVELS,
  TASK_STATUS,
} from '../../../app/constants'
import { getLocationParams } from '../../../services/helpers/route/route-helper'
import { getLevelATaskCount } from '../../../services/helpers/task/task-util-helper'
import { isLevelFTaskOrGreater } from '../../../services/task/data-provider/task-list-data-provider'
import ErrorBox from '../../data-display/error-box/ErrorBox'
import BigDataSpinner from '../../feedback/big-data-spinner/BigDataSpinner'
import MatterSelect from '../../inputs/matter-select/MatterSelect'
import TaskSelect from '../../inputs/task-select/TaskSelect'
import WorkstreamSelect from '../../inputs/workstream-select/WorkstreamSelect'
import JuralioDialog from '../juralio-dialog/JuralioDialog'
import { TASK_PARENT_TYPE } from './task-parent-type-select/TaskParentTypeDefinitions'
import TaskParentTypeSelect from './task-parent-type-select/TaskParentTypeSelect'

/**
 * Destination Dialog helps a User select a Task/Level A destination, picking up context as appropriate.
 */
class DestinationDialog extends Component {
  state = {
    selectedMatterId: undefined,
    selectedProjectId: undefined,
    selectedTaskId: undefined,
    parentTypeSelection: TASK_PARENT_TYPE.UNDEFINED,
    projectIsEmpty: false,
    taskValidationMessage: '',
    levelAValidationMessage: '',
    projectLevelACount: 0,
    projectLoaded: false,
    projectLoading: false,
    showError: false,
  }

  handleProjectLoading = () => {
    this.setState({ projectLoading: true, projectLoaded: false })
  }
  handleProjectLoaded = () => {
    this.setState({ projectLoading: false, projectLoaded: true })
  }

  isValidSelection = () => {
    if (
      this.state.taskValidationMessage.length > 0 ||
      this.state.levelAValidationMessage.length > 0 ||
      (this.props.usageContext === 'PostDestinationDialog' &&
        !this.state.selectedTaskId)
    )
      return false

    return (
      this.state.selectedMatterId &&
      this.state.selectedProjectId &&
      (this.state.selectedTaskId ||
        this.state.parentTypeSelection === TASK_PARENT_TYPE.LEVEL_A)
    )
  }
  parseId = id => parseInt(id, 10) || undefined

  handleMatterChange = matter =>
    this.setState({
      selectedMatterId: this.parseId(matter && matter.id),
      selectedProjectId: undefined,
      selectTaskId: undefined,
      parentTypeSelection: TASK_PARENT_TYPE.UNDEFINED,
      taskValidationMessage: '',
      levelAValidationMessage: '',
      showError: false,
    })

  handleProjectInitialised = project =>
    this.setLevelADestinationIfEmptyProject(project)

  handleProjectChange = project => {
    this.setState({ parentTypeSelection: TASK_PARENT_TYPE.UNDEFINED })
    this.setLevelADestinationIfEmptyProject(project)
    this.setState({
      selectedProjectId: this.parseId(project && project.id),
      selectedTaskId: undefined,
      levelAValidationMessage: '',
      taskValidationMessage: '',
      projectLevelACount: undefined,
      showError: false,
    })
  }

  handleTaskChange = task => {
    this.setState({
      selectedTaskId: task ? task.id : undefined,
      showError: false,
    })
  }

  handleParentSelectChange = taskParentType => {
    this.setState({
      parentTypeSelection: taskParentType,
      selectedTaskId: undefined,
      taskValidationMessage: '',
      showError: false,
    })
    if (
      taskParentType === TASK_PARENT_TYPE.LEVEL_A &&
      this.state.projectLevelACount === CONFIG.LEVEL_A_TASK_LIMIT
    ) {
      this.setState({
        levelAValidationMessage: this.props.t(
          'destinationDialog.validation.levelALimit',
          {
            limit: CONFIG.LEVEL_A_TASK_LIMIT,
          }
        ),
      })
    } else {
      this.setState({ levelAValidationMessage: '' })
    }
  }

  setLevelADestinationIfEmptyProject(project) {
    if (project && project.taskCounts) {
      let taskCount = Object.values(project.taskCounts).reduce(
        (total, num) => total + num
      )
      if (taskCount === 0) {
        this.setState({
          parentTypeSelection: TASK_PARENT_TYPE.LEVEL_A,
          projectIsEmpty: true,
        })
      }
    } else if (!project || project.tasks.length === 0) {
      this.setState({
        parentTypeSelection: TASK_PARENT_TYPE.LEVEL_A,
        projectIsEmpty: true,
      })
    }
  }

  componentDidMount() {
    let taskId
    if (!this.props.showNotRequired) {
      if (this.props.selectedTask.status !== TASK_STATUS.NOT_REQUIRED) {
        taskId = this.props.selectedTask.id
      }
    } else {
      taskId = getLocationParams('task')
    }

    if (!this.props.isMilestone) {
      if (
        this.props.roles.matter?.activities &&
        (this.props.roles.matter.activities.includes(
          ACTIVITIES.MATTER_VIEWER
        ) ||
          this.props.auth.data.details.roles.includes('FROZEN_ORG_USER'))
      )
        return
      this.setState({
        selectedMatterId:
          getLocationParams('matter') || getLocationParams('matteradmin'),
        selectedProjectId: getLocationParams('workstream'),
        selectedTaskId: taskId,
        parentTypeSelection: taskId
          ? TASK_PARENT_TYPE.SUBTASK_OF
          : TASK_PARENT_TYPE.UNDEFINED,
      })
    } else {
      this.setState({
        selectedMatterId:
          getLocationParams('matter') || getLocationParams('matteradmin'),
        selectedProjectId: getLocationParams('workstream'),
      })
    }
  }

  onCreateClicked = () => {
    this.props.createHandler(
      this.state.selectedMatterId,
      this.state.selectedProjectId,
      this.state.selectedTaskId
    )
    this.setState({ showError: true })
  }

  autoFocusProject = () =>
    this.state.selectedMatterId && !this.state.selectedProjectId

  autoFocusMatter = () => !this.state.selectedMatterId

  autoFocusTask = () =>
    this.state.selectedMatterId &&
    this.state.selectedProjectId &&
    !this.state.selectedTaskId

  handleCreateTaskValidation = task => {
    let validationMessage = ''
    if (this.props.taskCreateFlow && task.level === TASK_MAP_LEVELS.F) {
      validationMessage = this.props.t(
        'taskCreation.validation.levelFTasksCannotHaveSubTasks'
      )
    }

    if (
      this.props.taskCreateFlow &&
      task.tasks.length === CONFIG.SUBTASK_LIMIT
    ) {
      validationMessage = this.props.t(
        'taskCreation.validation.tasksCannotHaveMoreThanLimitubtasks',
        { limit: CONFIG.SUBTASK_LIMIT }
      )
    }
    this.setState({ taskValidationMessage: validationMessage })
  }

  handleCreateTaskProjectLevelAValidation = project => {
    const taskCount = getLevelATaskCount(project)
    this.setState({
      projectLevelACount: taskCount,
    })
  }

  render() {
    return (
      <JuralioDialog
        data-test="destination-dialog"
        open={true}
        onClose={this.props.closeHandler}
        fullScreen={this.props.fullScreen}
        titleText={this.props.titleText}
        titleIcon={this.props.titleIcon}
        handleAction={this.onCreateClicked}
        handleCancel={this.props.closeHandler}
        actionLabel={this.props.t('common.create')}
        disabled={!this.isValidSelection()}
        usageContext={`${this.props.usageContext}.DestinationDialog`}
        cancelText={this.props.cancelText}
      >
        <DialogContent>
          <MatterSelect
            onChange={this.handleMatterChange}
            matterId={this.state.selectedMatterId}
            focus={this.autoFocusMatter()}
          />
          <WorkstreamSelect
            key={this.state.selectedMatterId}
            initialisedHandler={this.handleProjectInitialised}
            selectionChangeHandler={this.handleProjectChange}
            matterId={this.state.selectedMatterId}
            projectId={this.state.selectedProjectId}
            focus={this.autoFocusProject()}
            handleCreateTaskProjectLevelAValidation={
              this.handleCreateTaskProjectLevelAValidation
            }
            handleProjectLoading={this.handleProjectLoading}
            handleProjectLoaded={this.handleProjectLoaded}
            placeholder={this.props.t('common.chooseAWorkstream')}
            selectFirstProject={false}
          />
          {this.renderTaskOptions()}
          {this.props.error !== '' && this.state.showError === true && (
            <ErrorBox error={this.props.error} padding={true} />
          )}
        </DialogContent>
      </JuralioDialog>
    )
  }

  renderTaskOptions = () => {
    if (
      this.props.showLevelATaskOption &&
      !this.state.projectLoading &&
      this.state.projectLoaded
    ) {
      return this.renderParentSelection()
    } else if (!this.props.showLevelATaskOption && this.state.projectLoaded) {
      return this.renderTaskSelect()
    } else if (this.state.selectedProjectId && this.state.projectLoading) {
      return this.renderSpinner()
    }
  }

  renderSpinner = () => {
    return <BigDataSpinner size={20} />
  }
  renderTaskSelect = () => {
    return (
      <TaskSelect
        key={this.state.selectedProjectId}
        matterId={this.state.selectedMatterId}
        projectId={this.state.selectedProjectId}
        taskId={this.state.selectedTaskId}
        onChange={this.handleTaskChange}
        disabledItemFilter={isLevelFTaskOrGreater}
        focus={this.autoFocusTask()}
        handleCreateTaskValidation={this.handleCreateTaskValidation}
        validationMessage={
          (this.props.usageContext === 'PostDestinationDialog' &&
            !this.isValidSelection() &&
            this.props.t('destinationDialog.validation.noSelectedTask')) ||
          this.state.taskValidationMessage
        }
        filterOutMilestones={this.props.filterOutMilestones}
        showNotRequired={this.props.showNotRequired}
      />
    )
  }

  renderParentSelection = () => {
    return (
      <div>
        <TaskParentTypeSelect
          selectedParentType={this.state.parentTypeSelection}
          enabled={this.state.selectedProjectId !== undefined}
          onChange={this.handleParentSelectChange}
          autoFocus={true}
          projectIsEmpty={this.state.projectIsEmpty}
          levelACount={this.state.projectLevelACount}
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
}

function mapStateToProps(state) {
  return {
    selectedTask: state.selectedTask,
    roles: state.matterDetails,
    auth: state.auth,
  }
}

DestinationDialog.propTypes = {
  /**
   * Action to initiate when the User hits Create.
   */
  createHandler: PropTypes.func,
  /**
   * Action to initiate when the dialog is closed.
   */
  closeHandler: PropTypes.func.isRequired,
  /**
   * Icon to display in the dialog header.
   */
  titleIcon: PropTypes.object.isRequired,
  /**
   * Text to display in the dialog header.
   */
  titleText: PropTypes.string.isRequired,
  /**
   * Allow the User to select level A.
   */
  showLevelATaskOption: PropTypes.bool,
  /**
   * Flag for whether dialog is being used in task create flow context.
   */
  taskCreateFlow: PropTypes.bool,
  /**
   * Prevent the User from selecting level F.
   */
  disableLevelFtaskSelection: PropTypes.bool,
  /**
   * Flag for mobile display
   */
  fullScreen: PropTypes.bool.isRequired,
  filterOutMilestones: PropTypes.bool,
}

export default connect(mapStateToProps)(withTranslation()(DestinationDialog))
