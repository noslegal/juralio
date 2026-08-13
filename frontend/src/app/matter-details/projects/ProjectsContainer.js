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

import React, { Component } from 'react'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { addMember } from '../../../redux/ducks/private-workstream-team'
import { fetchMatterDetails } from '../matter-details-actions'
import Projects from './Projects'
import {
  clearErrorMessage,
  createProject,
  createProjectFromTemplate,
  fetchProjects,
  fetchWorkstreamAdminList,
  updateProject,
} from './projects-actions'

export class ProjectsContainer extends Component {
  state = {
    projects: [],
    isLoaded: false,
    canViewProjects: false,
    errorMessage: undefined,
  }

  fetchProjects() {
    this.props.actions.fetchWorkstreamAdminList(this.props.matter.id)
  }

  componentDidMount() {
    this.fetchProjects()
    this.setState({ isLoaded: false })
  }

  componentDidUpdate(prevProps) {
    if (prevProps.matter.id !== this.props.matter.id) {
      this.fetchProjects()
      return
    }
    if (prevProps.projects.items.length !== this.props.projects.items.length) {
      this.fetchProjects()
      return
    }

    const propProjects = this.props.projects
    const isForCorrectMatter =
      `${propProjects.meta.matterId}` === this.props.matter.id.toString()

    if (isForCorrectMatter) {
      const projectsDiffer =
        propProjects.items.length !== this.state.projects.length ||
        propProjects.items.some(
          (v, i) =>
            this.state.projects[i].id !== v.id ||
            this.state.projects[i].name !== v.name ||
            this.state.projects[i].active !== v.active ||
            this.state.projects[i].errorMessage !== v.errorMessage
        )

      const metaDataDiffers =
        propProjects.meta.canViewProjects !== this.state.canViewProjects ||
        propProjects.meta.isLoaded !== this.state.isLoaded ||
        propProjects.meta.errorMessage !== this.state.errorMessage

      const shouldUpdate = projectsDiffer || metaDataDiffers

      if (shouldUpdate) {
        this.setState({
          projects: propProjects.items,
          isLoaded: propProjects.meta.isLoaded,
          canViewProjects: propProjects.meta.canViewProjects,
          errorMessage: propProjects.meta.errorMessage,
        })
      }
    }
  }

  render() {
    return (
      <Projects
        {...this.state}
        actions={this.props.actions}
        mode={this.props.mode}
        matter={this.props.matter}
        setSelectedWorkstreamIndex={this.props.setSelectedWorkstreamIndex}
        projects={this.props.projects.items}
      />
    )
  }
}

export function mapStateToProps(state) {
  return {
    projects: state.projects,
  }
}

export function mapDispatchToProps(dispatch) {
  return {
    actions: {
      fetchProjects: bindActionCreators(fetchProjects, dispatch),
      fetchWorkstreamAdminList: bindActionCreators(
        fetchWorkstreamAdminList,
        dispatch
      ),
      createProject: bindActionCreators(createProject, dispatch),
      createProjectFromTemplate: bindActionCreators(
        createProjectFromTemplate,
        dispatch
      ),
      updateProject: bindActionCreators(updateProject, dispatch),
      clearErrorMessage: bindActionCreators(clearErrorMessage, dispatch),
      fetchMatterDetails: bindActionCreators(fetchMatterDetails, dispatch),
      addMember: bindActionCreators(addMember, dispatch),
    },
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(ProjectsContainer)
