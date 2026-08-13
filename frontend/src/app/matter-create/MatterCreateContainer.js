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

import { createMatter, resetMatterState } from './matter-create-actions'
import {
  createProject,
  createProjectFromTemplate,
} from '../matter-details/projects/projects-actions'
import CreateMatter from '../matter-details/matter-card/CreateMatter'

const MatterCreateContainer = props => {
  return (
    <CreateMatter
      closeHandler={props.closeHandler}
      createHandler={props.actions.createMatter}
      createProject={props.actions.createProject}
      resetMatter={props.actions.resetMatterState}
      createProjectFromTemplate={props.actions.createProjectFromTemplate}
    />
  )
}

const mapStateToProps = state => {
  return { ...state.matterCreate }
}

const mapDispatchToProps = dispatch => {
  return {
    actions: {
      createMatter: bindActionCreators(createMatter, dispatch),
      resetMatterState: bindActionCreators(resetMatterState, dispatch),
      createProject: bindActionCreators(createProject, dispatch),
      createProjectFromTemplate: bindActionCreators(
        createProjectFromTemplate,
        dispatch
      ),
    },
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(MatterCreateContainer)
