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
import React from 'react'
import { withTranslation } from 'react-i18next'
import { connect } from 'react-redux'
import { Navigate } from 'react-router'
import { bindActionCreators } from 'redux'
import { withStyles } from 'tss-react/mui'
import { fetchMatterDetails } from '../../app/matter-details/matter-details-actions'
import {
  isMobileView,
  taskDetailsStyle,
} from '../../app/task-details/TaskCardCommon'
import NoPermission from '../../components/data-display/no-permission/NoPermission'
import {
  getMatterIdFromLocation,
  getPostIdFromLocation,
  getProjectIdFromLocation,
  getTaskDetailsUrl,
  getTaskIdFromLocation,
  getTaskMapUrl,
  isInTaskDetails,
} from '../../components/navigation/common/location-context-helper'
import {
  getSiblingTaskCount,
  getSiblings,
} from '../../services/helpers/task/task-util-helper'
import withRouter from '../../services/navigation/WithRouter'
import taskService from '../../services/task/task-service'

import { ACTIVITIES, MATTER_STATUS, TASK_STATUS } from '../constants'
import MatterClosed from '../../components/data-display/matter-closed/MatterClosed'
import { showSnackbar } from '../global-snackbar/global-snackbar-actions'
import { fetchProjectWithHierarchy } from '../project/project-actions'
import {
  fetchTaskDetails,
  resetSelectedTask,
  stopEditingTaskDescription,
  updateTaskDetails,
  updateTaskSubtasks,
} from '../task-map/selected-task/selected-task-actions'
import { TaskMapConsistencyHelper, Variants } from './TaskMapConsistencyHelper'
import SingleColumnLayout from './task-card-columns/SingleColumnLayout'
import ThreeColumnLayout from './task-card-columns/ThreeColumnLayout'
import {
  clearItemSelection,
  selectItem,
} from './task-card-content/task-notes/task-posts-actions'
import ConfirmStatusChangeContainer from './task-card-header/task-status-menu/ConfirmStatusChangeContainer'

const layoutStyle = {
  marginTop: 0,
  height: '100%',
  overflowY: 'hidden',
}
/** Panel to show full Task details */
export class TaskDetailsContainer extends React.Component {
  state = {
    siblingTaskCount: 0,
    siblings: [],
    siblingsLoading: true,
  }

  onCloseLocation = undefined
  taskMapConsistencyHelper = new TaskMapConsistencyHelper()
  lastMatterId = undefined
  lastProjectId = undefined
  lastTaskId = undefined

  generateTaskMapUrl = () => {
    const matterId = getMatterIdFromLocation(this.props.router.location)
    const projectId = getProjectIdFromLocation(this.props.router.location)
    const taskId = getTaskIdFromLocation(this.props.router.location)
    return getTaskMapUrl(taskId, matterId, projectId)
  }

  handleLocationChange = () => {
    const projectChanged =
      this.lastMatterId !==
        getMatterIdFromLocation(this.props.router.location) ||
      this.lastProjectId !==
        getProjectIdFromLocation(this.props.router.location)
    const taskChanged =
      this.lastTaskId !== getTaskIdFromLocation(this.props.router.location)

    if (projectChanged) {
      this.lastMatterId = getMatterIdFromLocation(this.props.router.location)
      this.lastProjectId = getProjectIdFromLocation(this.props.router.location)

      this.props.actions.fetchMatterDetails(
        getMatterIdFromLocation(this.props.router.location)
      )
    }

    const isMatterClosed =
      this.props.matterDetails?.matterStatus === MATTER_STATUS.CLOSED

    if (!isMatterClosed) {
      this.props.actions.fetchProjectWithHierarchy(
        getMatterIdFromLocation(this.props.router.location),
        getProjectIdFromLocation(this.props.router.location)
      )

      if (projectChanged || taskChanged) {
        this.lastTaskId = getTaskIdFromLocation(this.props.router.location)
        this.props.actions
          .fetchTaskDetails(
            getMatterIdFromLocation(this.props.router.location),
            getProjectIdFromLocation(this.props.router.location),
            getTaskIdFromLocation(this.props.router.location)
          )
          .then(() => {
            this.setState({
              siblingsLoading: true,
            })
          })
          .then(() => {
            getSiblings(
              getMatterIdFromLocation(this.props.router.location),
              getProjectIdFromLocation(this.props.router.location),
              getTaskIdFromLocation(this.props.router.location)
            ).then(siblings => {
              if (!siblings.locked) {
                this.setState({
                  siblingsLoading: false,
                  siblings: [...siblings, this.props.task],
                  siblingTaskCount: getSiblingTaskCount(siblings),
                })
              }
            })
          })
      }
    }

    const { lastLocation, location } = this.props

    this.taskMapConsistencyHelper.updateFromLocationHistory(
      this.props.router.location.pathname,
      lastLocation
    )

    switch (this.taskMapConsistencyHelper.getTaskMapVariant()) {
      default:
        const isVisitingFromTaskDetails = isInTaskDetails(lastLocation)
        if (!isVisitingFromTaskDetails) {
          this.onCloseLocation = lastLocation
        }
        break
      case Variants.Overview:
      case Variants.Interactive:
        this.onCloseLocation = this.generateTaskMapUrl()
        break
    }
  }

  componentDidMount = () => {
    this.handleLocationChange()
  }

  componentDidUpdate = prevProps => {
    if (
      getMatterIdFromLocation(this.props.router.location) !==
        getMatterIdFromLocation(prevProps.router.location) ||
      getProjectIdFromLocation(this.props.router.location) !==
        getProjectIdFromLocation(prevProps.router.location) ||
      getTaskIdFromLocation(this.props.router.location) !==
        getTaskIdFromLocation(prevProps.router.location)
    ) {
      this.handleLocationChange()
      return
    }
    const urlParamPost = getPostIdFromLocation(this.props.router.location)

    if (!urlParamPost && this.props.selectedItemId > 0) {
      this.props.actions.clearItemSelection()
    } else if (
      this.props.selectedItemId !== urlParamPost &&
      this.props.posts.length
    ) {
      if (urlParamPost) {
        const isValidPost =
          this.props.posts.find(p => p.id === parseInt(urlParamPost)) ===
          undefined
        if (!isValidPost) {
          this.props.actions.selectItemInList(
            this.props.history,
            getMatterIdFromLocation(this.props.router.location),
            getProjectIdFromLocation(this.props.router.location),
            getTaskIdFromLocation(this.props.router.location),
            urlParamPost
          )
        }
      }
    }
    if (
      this.props.task &&
      this.props.task.referenceNumber !== prevProps.task.referenceNumber
    ) {
      if (
        this.props.lastLocation &&
        this.props.lastLocation !== '/home' &&
        !this.props.lastLocation.includes('timeline')
      )
        this.props.actions.stopEditingTaskDescription()
    }

    if (
      this.props.project.isLoaded !== prevProps.project.isLoaded &&
      this.props.project.isLoaded &&
      this.state.siblingsLoading === false
    ) {
      getSiblings(
        getMatterIdFromLocation(this.props.router.location),
        getProjectIdFromLocation(this.props.router.location),
        getTaskIdFromLocation(this.props.router.location)
      ).then(siblings => {
        this.setState({
          siblings: [...siblings, this.props.task],
          siblingTaskCount: getSiblingTaskCount(siblings),
        })
      })
    }
  }

  componentWillUnmount = () => {
    this.props.actions.resetSelectedTask()
  }

  updateTaskDetails = properties => {
    return this.props.actions.updateTaskDetails(
      getMatterIdFromLocation(this.props.router.location),
      this.props.projectId,
      this.props.task.id,
      properties,
      false
    )
  }

  confirmStatusChange = properties => {
    const maintainTaskConsistencyUpdate = true

    if (
      this.props.statusChange.statusChangeTargetTaskId === this.props.task.id
    ) {
      return this.props.actions.updateTaskDetails(
        getMatterIdFromLocation(this.props.router.location),
        this.props.projectId,
        this.props.task.id,
        properties,
        maintainTaskConsistencyUpdate
      )
    } else {
      return this.props.actions.updateTaskSubtasks(
        getMatterIdFromLocation(this.props.router.location),
        this.props.projectId,
        this.props.statusChange.statusChangeTargetTaskId,
        properties.parentTaskId,
        properties.taskOrder,
        maintainTaskConsistencyUpdate
      )
    }
  }

  clickBackHandler = () => {
    this.props.actions.clearItemSelection()
    this.props.history(
      getTaskDetailsUrl(
        getMatterIdFromLocation(this.props.router.location),
        getProjectIdFromLocation(this.props.router.location),
        getTaskIdFromLocation(this.props.router.location)
      )
    )
  }

  linkTasks = (enableLink, linkAll) => {
    if (linkAll) {
      taskService
        .linkAllSiblings(
          getMatterIdFromLocation(this.props.router.location),
          getProjectIdFromLocation(this.props.router.location),
          this.props.task.id,
          enableLink
        )
        .then(() => {
          this.props.actions.fetchProjectWithHierarchy(
            getMatterIdFromLocation(this.props.router.location),
            getProjectIdFromLocation(this.props.router.location)
          )
        })
        .then(() => {
          this.props.actions.fetchTaskDetails(
            getMatterIdFromLocation(this.props.router.location),
            getProjectIdFromLocation(this.props.router.location),
            this.props.task.id
          )
        })
    } else {
      taskService
        .linkTaskWithSiblings(
          getMatterIdFromLocation(this.props.router.location),
          getProjectIdFromLocation(this.props.router.location),
          this.props.task.id,
          enableLink
        )
        .then(() => {
          this.props.actions.fetchProjectWithHierarchy(
            getMatterIdFromLocation(this.props.router.location),
            getProjectIdFromLocation(this.props.router.location)
          )
        })
        .then(() => {
          this.props.actions.fetchTaskDetails(
            getMatterIdFromLocation(this.props.router.location),
            getProjectIdFromLocation(this.props.router.location),
            this.props.task.id
          )
        })
    }
  }

  render() {
    const { task, project, matterDetails } = this.props
    if (matterDetails?.matterStatus === MATTER_STATUS.CLOSED) {
      return (
        <MatterClosed
          isAdmin={matterDetails.activities?.includes(ACTIVITIES.MATTER_ADMIN)}
          matterId={getMatterIdFromLocation(this.props.router.location)}
        />
      )
    }
    if (!project.active && project.isLoaded) {
      return (
        <NoPermission text={this.props.t('taskDetails.workstreamClosed')} />
      )
    }
    if (!task || task.isForbidden) {
      return <Navigate push to="/404" />
    }
    if (!task.isLoaded) return null
    const isReadOnly = task.status === TASK_STATUS.NOT_REQUIRED
    return isMobileView(this.props)
      ? this.renderMobile(isReadOnly)
      : this.renderDesktop(isReadOnly)
  }

  renderMobile = isReadOnly => {
    return (
      <div data-test="task-details-container">
        <SingleColumnLayout
          task={this.props.task}
          matterId={getMatterIdFromLocation(this.props.router.location)}
          projectId={getProjectIdFromLocation(this.props.router.location)}
          postId={this.props.selectedItemId}
          posts={this.props.posts}
          isReadOnly={isReadOnly}
          showSnackbarHandler={this.props.actions.showSnackbar}
          updateHandler={this.updateTaskDetails}
          clickBackHandler={this.clickBackHandler}
          dateLinkingDetails={{
            siblingTaskCount: this.state.siblingTaskCount,
            siblings: this.state.siblings,
            siblingsLoading: this.state.siblingsLoading,
            linkTasksHandler: this.linkTasks,
          }}
        />
        <ConfirmStatusChangeContainer
          confirmHandler={this.confirmStatusChange}
          task={this.props.task}
        />
      </div>
    )
  }

  renderDesktop(isReadOnly) {
    return (
      <div data-test="task-details-container" style={layoutStyle}>
        <ThreeColumnLayout
          task={this.props.task}
          posts={this.props.posts}
          matterId={getMatterIdFromLocation(this.props.router.location)}
          projectId={getProjectIdFromLocation(this.props.router.location)}
          postId={this.props.selectedItemId}
          openInEditMode={this.props.router.location?.state?.openInEditMode}
          isReadOnly={
            isReadOnly ||
            this.props.auth.data.details.roles.includes('FROZEN_ORG_USER')
          }
          viewOnly={
            this.props.matterDetails?.activities.includes(
              ACTIVITIES.MATTER_VIEWER
            ) || this.props.auth.data.details.roles.includes('FROZEN_ORG_USER')
          }
          isEditor={
            this.props.matterDetails?.activities.indexOf(
              ACTIVITIES.MATTER_TEAM_MEMBER
            ) > -1
          }
          showSnackbarHandler={this.props.actions.showSnackbar}
          updateHandler={this.updateTaskDetails}
          dateLinkingDetails={{
            siblingTaskCount: this.state.siblingTaskCount,
            siblings: this.state.siblings,
            siblingsLoading: this.state.siblingsLoading,
            linkTasksHandler: this.linkTasks,
          }}
        />
        <ConfirmStatusChangeContainer
          confirmHandler={this.confirmStatusChange}
          task={this.props.task}
        />
      </div>
    )
  }
}

function mapStateToProps(state) {
  return {
    task: state.selectedTask,
    statusChange: state.statusChange,
    projectId: state.project.id,
    project: state.project,
    selectedItemId: state.selectedTaskPostList.selectedItemId,
    posts: state.selectedTaskPostList.postList,
    lastLocation: state.lastLocationRecorder.lastLocation,
    matterDetails: state.matterDetails.matter,
    auth: state.auth,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      showSnackbar: bindActionCreators(showSnackbar, dispatch),
      fetchMatterDetails: bindActionCreators(fetchMatterDetails, dispatch),
      fetchTaskDetails: bindActionCreators(fetchTaskDetails, dispatch),
      resetSelectedTask: bindActionCreators(resetSelectedTask, dispatch),
      updateTaskDetails: bindActionCreators(updateTaskDetails, dispatch),
      updateTaskSubtasks: bindActionCreators(updateTaskSubtasks, dispatch),
      fetchProjectWithHierarchy: bindActionCreators(
        fetchProjectWithHierarchy,
        dispatch
      ),
      selectItemInList: bindActionCreators(selectItem, dispatch),
      clearItemSelection: bindActionCreators(clearItemSelection, dispatch),
      stopEditingTaskDescription: bindActionCreators(
        stopEditingTaskDescription,
        dispatch
      ),
    },
  }
}

export default withTranslation()(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(withRouter(withStyles(TaskDetailsContainer, taskDetailsStyle)))
)

TaskDetailsContainer.propTypes = {
  /** Project Id */
  projectId: PropTypes.number,
  /** Task object to display details from*/
  task: PropTypes.object.isRequired,
  /** For mobile layout - width */
  // width: PropTypes.string.isRequired,
  /** Notes belonging to the task */
  posts: PropTypes.array.isRequired,
}
