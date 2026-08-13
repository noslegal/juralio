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

import { StatusCodes } from 'http-status-codes'
import PropTypes from 'prop-types'
import React, { Component } from 'react'
import { withStyles } from 'tss-react/mui'
import { removeProjectFromProjects } from '../../../services/project/data-provider/project-list-data-provider'
import projectService from '../../../services/project/project-service'
import Search from '../search/Search'
import WorkstreamListItem from './WorkstreamListItem'

const formatProjectItemPlainText = item => (item ? item.name : '')

const styles = theme => ({
  searchContainer: {
    paddingTop: theme.spacing(2),
  },
})

/** Workstream selection for the Task Move and Destination Dialogs */
class WorkstreamSelect extends Component {
  state = {
    items: '',
    disabled: true,
    selectedProject: undefined,
  }

  async fetchProjects() {
    this.setState({
      disabled: true,
    })

    let response = await projectService.getProjectsByMatterId(
      this.props.matterId,
      true
    )

    if (response.status !== StatusCodes.OK) return

    const itemsToSet = this.props.excludedProject
      ? removeProjectFromProjects(response.body, this.props.excludedProject)
      : response.body

    if (itemsToSet.length === 1) {
      this.props.selectionChangeHandler(itemsToSet[0])
    }
    this.setState({
      items: itemsToSet,
      disabled: false,
      selectedProject:
        itemsToSet.length === 1 ? itemsToSet[0] : this.state.selectedProject,
    })
  }

  focusOnProjects = () =>
    this.state.items.length > 0 && this.props.focus ? true : false

  componentDidMount() {
    if (this.props.matterId) {
      this.fetchProjects()
    }

    if (this.props.projectId) {
      this.getSelectedProjectDetails()
    }
  }

  componentDidUpdate(prevProps) {
    if (prevProps.projectId !== this.props.projectId) {
      this.getSelectedProjectDetails()
    }
  }

  performSearch = searchTerm => {
    return Promise.resolve(
      this.state.items.filter(item =>
        item.name.toLowerCase().includes(searchTerm.toLowerCase())
      )
    )
  }

  getSelectedProjectFromId() {
    if (this.state.items) {
      if (this.props.projectId) {
        return this.state.items.find(
          project => project.id === this.props.projectId
        )
      }
      if (this.props.selectFirstProject) {
        let project = this.state.items[0]
        this.props.selectionChangeHandler(project)
        return project.id
      }
    }
    return ''
  }

  async getSelectedProjectDetails() {
    if (
      this.props.matterId &&
      this.props.projectId &&
      this.props.handleCreateTaskProjectLevelAValidation
    ) {
      this.props.handleProjectLoading()

      let response = await projectService.getProject(
        this.props.matterId,
        this.props.projectId,
        { includeFullHierarchy: true }
      )

      if (response.status !== StatusCodes.OK) return

      this.setState(
        {
          selectedProject: response.body,
        },
        () => {
          this.props.initialisedHandler(response.body)
          this.props.handleProjectLoaded()
          this.props.handleCreateTaskProjectLevelAValidation(
            this.state.selectedProject
          )
        }
      )
    }
  }

  render() {
    if (this.state.items.length === 1 && !this.props.isMove) {
      return null
    }
    return (
      <div
        data-test="project-select-container"
        className={this.props.classes.searchContainer}
      >
        <Search
          selectedItem={this.getSelectedProjectFromId()}
          onChange={this.props.selectionChangeHandler}
          performSearch={this.performSearch}
          placeholder={this.props.placeholder}
          renderItemContent={item => <WorkstreamListItem item={item} />}
          formatSelectedItem={formatProjectItemPlainText}
          className={this.props.classes.searchContainer}
          showDropDownArrow
          disabled={this.state.disabled}
          focus={this.focusOnProjects()}
          error={this.props.error}
          filterHidden={true}
          usageContext="ProjectSelect"
          onFocus={() => {}}
          onBlur={() => {}}
          showNoResults={true}
        />
      </div>
    )
  }
}

WorkstreamSelect.propTypes = {
  /** Placeholder text*/
  placeholder: PropTypes.string.isRequired,
  /** Handler Change of selection*/
  selectionChangeHandler: PropTypes.func.isRequired,
  /** Id of the current Matter*/
  matterId: PropTypes.number,
  /** Id of the currently selected Project*/
  projectId: PropTypes.number,
  /** Object of the  excludedProject*/
  excludedProject: PropTypes.object,
  /** Error flag*/
  error: PropTypes.bool,
  /** Focus flag*/
  focus: PropTypes.bool,
  /** Handler to validate create operations on level A*/
  handleCreateTaskProjectLevelAValidation: PropTypes.func,
  /** Handler triggered when control initial selection is set*/
  initialisedHandler: PropTypes.func,
  /** Select the first project in the list automatically */
  selectFirstProject: PropTypes.bool,
}

export default withStyles(WorkstreamSelect, styles)
