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
  fetchProjectOverview,
  fetchProjectWithPostsAndTaskTeam,
} from '../../../app/project/project-actions'
import { createNewTask } from '../../../app/task-details/task-actions'
import CreateTaskFlow from './CreateTaskFlow'

function CreateTaskFlowContainer(props) {
  return <CreateTaskFlow {...props} />
}

function mapStateToProps(state) {
  return {
    matter: state.matterDetails.matter,
    parentTask: state.selectedTask,
    auth: state.auth,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      displaySnackbar: bindActionCreators(displaySnackbar, dispatch),
      createNewTask: bindActionCreators(createNewTask, dispatch),
      fetchProjectOverview: bindActionCreators(fetchProjectOverview, dispatch),
      fetchProjectWithPostsAndTaskTeam: bindActionCreators(
        fetchProjectWithPostsAndTaskTeam,
        dispatch
      ),
    },
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CreateTaskFlowContainer)
