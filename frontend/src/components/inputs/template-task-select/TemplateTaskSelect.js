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
import { withTranslation } from 'react-i18next'

import templateService from '../../../services/template/template-service'
import TaskSelectBase from '../task-select/base/TaskSelectBase'

class TemplateTaskSelect extends Component {
  state = {
    selectedTask: '',
  }

  performSearch = searchTerm => {
    if (this.props.templateId) {
      if (this.searchCall) this.searchCall.cancel()

      this.searchCall = templateService.getFilteredTemplateTasks(
        this.props.templateId,
        searchTerm
      )

      return this.searchCall.promise.then(response => {
        return response.body
      })
    }
  }

  getTemplateTask() {
    templateService
      .getTemplateTask(this.props.templateId, this.props.selectedTaskId)
      .then(response => {
        this.setState(
          {
            selectedTask: response.body,
          },
          () =>
            this.props.handleCreateTaskValidation &&
            this.props.handleCreateTaskValidation(this.state.selectedTask)
        )
      })
  }

  componentDidMount() {
    if (this.props.selectedTaskId) this.getTemplateTask()
  }

  componentDidUpdate(prevProps) {
    if (prevProps.selectedTaskId !== this.props.selectedTaskId) {
      this.props.selectedTaskId
        ? this.getTemplateTask()
        : this.setState({
            selectedTask: '',
          })
    }
  }

  render() {
    return (
      <div data-test="template-task-select">
        <TaskSelectBase
          performSearch={this.performSearch}
          selectedTask={this.state.selectedTask}
          placeholder={this.props.t('templates.chooseATemplateTask')}
          disabled={!this.props.templateId}
          onChange={this.props.onChange}
          disabledItemFilter={this.props.disabledItemFilter}
          focus={this.props.focus}
          error={this.props.validationMessage ? true : false}
          helperText={this.props.validationMessage}
          filterOutMilestones={true}
        />
      </div>
    )
  }
}

TemplateTaskSelect.propTypes = {
  /** control focus */
  focus: PropTypes.bool,
  /** templateId */
  templateId: PropTypes.number,
  /** handleCreateTaskValidation */
  handleCreateTaskValidation: PropTypes.func,
  /** selectedTaskId */
  selectedTaskId: PropTypes.number,
  /** onChange */
  onChange: PropTypes.func.isRequired,
  /** disabledItemFilter */
  disabledItemFilter: PropTypes.func,
  /** validationMessage */
  validationMessage: PropTypes.string,
}

export default withTranslation()(TemplateTaskSelect)
