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
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { displaySnackbar } from '../../../app/global-snackbar/global-snackbar-actions'
import {
  clearErrorMessage,
  createProjectFromTemplate,
  createProjectFromTemplateTask,
} from '../../../app/matter-details/projects/projects-actions'
import { enterSelectionMode } from '../../../app/project/project-actions'
import {
  createTaskFromTemplateTask,
  createTasksFromTemplateProject,
} from '../../../app/task-details/task-actions'
import { templateToProject } from '../../../app/template/project-creation/template-to-project-actions'
import CreateWorkstreamFromWorkstreamFlow from './CreateWorkstreamFromWorkstreamFlow'

function CreateWorkstreamFromWorkstreamFlowContainer(props) {
  return <CreateWorkstreamFromWorkstreamFlow {...props} />
}

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      displaySnackbar: bindActionCreators(displaySnackbar, dispatch),
      createProjectFromTemplate: bindActionCreators(
        createProjectFromTemplate,
        dispatch
      ),
      createProjectFromTemplateTask: bindActionCreators(
        createProjectFromTemplateTask,
        dispatch
      ),
      createTaskFromTemplateTask: bindActionCreators(
        createTaskFromTemplateTask,
        dispatch
      ),
      createTasksFromTemplateProject: bindActionCreators(
        createTasksFromTemplateProject,
        dispatch
      ),
      clearErrorMessage: bindActionCreators(clearErrorMessage, dispatch),
      enterSelectionMode: bindActionCreators(enterSelectionMode, dispatch),
      updateNewProjectName: bindActionCreators(
        templateToProject.updateNewProjectName,
        dispatch
      ),
    },
  }
}

export function mapStateToProps(state) {
  return {
    newProjectName: state.templateToProject.newProjectName,
    selectedList: state.template.highlightList,
    includePosts: state.templateToProject.includePosts,
    useFullTemplate: state.templateToProject.useFullTemplate,
    useTemplateOptionConfirmed:
      state.templateToProject.useTemplateOptionConfirmed,
    errorMessage: state.projects.meta.errorMessage,
    taskSelectionConfirmed: state.templateToProject.taskSelectionConfirmed,
    selectionMode: state.template.selectionMode,
    matterId: state.projects.meta.matterId,
    projectId: state.projects.items[0].id,
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CreateWorkstreamFromWorkstreamFlowContainer)
