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

import isEqual from 'lodash/isEqual'
import React from 'react'
import { withTranslation } from 'react-i18next'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { fetchProjectWithPostsAndTaskTeam } from '../../../app/project/project-actions'
import { fetchTeam } from '../../../redux/ducks/matter-team'
import { getPartitionData } from '../common/data/data-provider'
import { filterTasksByEmail } from '../desktop/helper/filter-tasks/filter-tasks'
import MobileIcicle from './MobileIcicle'

class MobileIcicleContainer extends React.Component {
  constructor(props) {
    super(props)
    const partitionData = this.getUpdatedPartitionData()
    this.state = {
      partitionData: partitionData,
    }
  }

  getUpdatedPartitionData = () => {
    if (this.props.matterId)
      this.props.actions.fetchTeamHandler(this.props.matterId)
    return getPartitionData(this.props.data, this.props.childrenPropertyName)
  }

  updatePartitionDataState = () => {
    let updatedData = this.getUpdatedPartitionData()
    this.setState({
      partitionData: updatedData,
      highlightedTaskList: undefined,
    })
    this.filterTasksByUser()
  }

  filterTasksByUser = () => {
    let { taskMemberOf, following, logicOperator, isTemplate } = this.props
    if (!isTemplate) {
      this.setState({
        highlightedTaskList: filterTasksByEmail(
          this.state.partitionData,
          this.props.emailToFilterTasks,
          this.props.matterTeam,
          { taskMemberOf, following, logicOperator }
        ),
      })
    }
  }

  componentDidUpdate(prevProps) {
    this.filterToggle = false
    if (
      !isEqual(prevProps.data, this.props.data) &&
      !isEqual(prevProps.data.tasks, this.props.data.tasks)
    ) {
      const partitionData = this.getUpdatedPartitionData()
      this.setState({
        partitionData: partitionData,
      })
    }

    if (prevProps.emailToFilterTasks !== this.props.emailToFilterTasks) {
      this.filterTasksByUser()
    }
    if (
      prevProps.statusDoneToFilterTasks !==
        this.props.statusDoneToFilterTasks ||
      prevProps.statusNotStartedToFilterTasks !==
        this.props.statusNotStartedToFilterTasks
    ) {
      this.props.actions.fetchProjectWithPostsAndTaskTeam(
        this.props.project.matterId,
        this.props.project.id
      )
      this.filterToggle = true
      this.updatePartitionDataState()
    }
  }

  render() {
    return (
      <MobileIcicle
        {...this.props}
        partitionData={this.state.partitionData}
        highlightedTaskList={
          this.props.isUserFilterActive
            ? this.state.highlightedTaskList
            : this.props.highlightedTaskList
        }
        filterTasksByEmailOn={this.props.filterTasksByEmailOn}
        filteredLabels={this.props.filteredLabels}
      />
    )
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      fetchProjectWithPostsAndTaskTeam: bindActionCreators(
        fetchProjectWithPostsAndTaskTeam,
        dispatch
      ),
      fetchTeamHandler: bindActionCreators(fetchTeam, dispatch),
    },
  }
}

function mapStateToProps(state) {
  return {
    immediateAddTaskProject: state.project.immediateAddTask,
    immediateAddTaskTemplate: state.template.immediateAddTask,
    emailToFilterTasks: state.taskMapFilter.email,
    statusDoneToFilterTasks: state.taskMapFilter.statusDone,
    statusNotStartedToFilterTasks: state.taskMapFilter.statusNotStarted,
    taskMemberOf: state.taskMapFilter.filterOptions.taskMemberOf,
    following: state.taskMapFilter.filterOptions.following,
    logicOperator: state.taskMapFilter.filterOptions.logicOperator,
    filterSelectionUser: state.taskMapFilter.filterSelectionUser,
    isUserFilterActive: state.taskMapFilter.filterOn,
    matterTeam: state.matterTeam.mainPage.team,
    taskmap: state.taskmap,
    project: state.project,
    filterTasksByEmailOn: state.taskMapFilter.filterOn,
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTranslation()(MobileIcicleContainer))
