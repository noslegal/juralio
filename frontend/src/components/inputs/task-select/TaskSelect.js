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
import React, { Component } from 'react'

import { TASK_STATUS } from '../../../app/constants'
import taskService from '../../../services/task/task-service'
import TaskSelectBase from './base/TaskSelectBase'

export default class TaskSelect extends Component {
  state = {
    selectedTask: '',
  }

  performSearch = searchTerm => {
    if (this.props.matterId && this.props.projectId) {
      if (this.searchCall) {
        this.searchCall.cancel()
      }

      this.searchCall = taskService.getTasks(
        this.props.matterId,
        this.props.projectId,
        searchTerm
      )

      return this.searchCall.promise.then(response => {
        return response.body.filter(task =>
          this.props.showNotRequired
            ? true
            : task.status !== TASK_STATUS.NOT_REQUIRED
        )
      })
    }
  }

  getTask() {
    taskService
      .getTaskById(
        this.props.matterId,
        this.props.projectId,
        this.props.taskId,
        true
      )
      .then(response => {
        this.setState(
          {
            selectedTask: response.body,
          },
          () => {
            this.props.handleCreateTaskValidation(this.state.selectedTask)
          }
        )
      })
  }

  componentDidMount() {
    if (this.props.matterId && this.props.projectId && this.props.taskId) {
      this.getTask()
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.taskId !== this.props.taskId) {
      this.getTask()
    }
  }

  render() {
    return (
      <div data-test="task-select">
        <TaskSelectBase
          performSearch={this.performSearch}
          selectedTask={this.state.selectedTask}
          placeholder="Choose a task"
          disabled={!this.props.projectId}
          onChange={this.props.onChange}
          disabledItemFilter={this.props.disabledItemFilter}
          focus={this.props.focus}
          error={this.props.validationMessage ? true : false}
          helperText={this.props.validationMessage}
          filterOutMilestones={this.props.filterOutMilestones}
        />
      </div>
    )
  }
}

TaskSelect.propTypes = {
  matterId: PropTypes.number,
  projectId: PropTypes.number,
  taskId: PropTypes.number,
  onChange: PropTypes.func.isRequired,
  disabledItemFilter: PropTypes.func,
  error: PropTypes.bool,
  helperText: PropTypes.string,
  focus: PropTypes.bool,
  filterOutMilestones: PropTypes.bool,
}
