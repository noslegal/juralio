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
import { bindActionCreators } from 'redux'
import { connect } from 'react-redux'

import CreateTemplateTaskFlow from './CreateTemplateTaskFlow'
import { fetchTemplateTasks } from '../../../app/template/template-actions'
import { createNewTemplateTask } from '../../../app/template-task-details/template-task-actions'
import { displaySnackbar } from '../../../app/global-snackbar/global-snackbar-actions'

function CreateTemplateTaskFlowContainer(props) {
  return <CreateTemplateTaskFlow {...props} />
}

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      fetchTemplateTasks: bindActionCreators(fetchTemplateTasks, dispatch),
      createNewTemplateTask: bindActionCreators(
        createNewTemplateTask,
        dispatch
      ),
      displaySnackbar: bindActionCreators(displaySnackbar, dispatch),
    },
  }
}

function mapStateToProps(state) {
  return {
    parentTask: state.selectedTemplateTask,
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CreateTemplateTaskFlowContainer)
