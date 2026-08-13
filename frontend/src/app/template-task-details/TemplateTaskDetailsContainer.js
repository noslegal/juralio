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
import {
  isMobileView,
  taskDetailsStyle,
} from '../../app/task-details/TaskCardCommon'
import {
  getMatterIdFromLocation,
  getPostIdFromLocation,
  getProjectIdFromLocation,
  getTaskIdFromLocation,
  getTemplateIdFromLocation,
  getTemplateTaskDetailsUrl,
} from '../../components/navigation/common/location-context-helper'
import withRouter from '../../services/navigation/WithRouter'
import { isKnowledgeManager } from '../../services/user/helper/user-role-service'
import { showSnackbar } from '../global-snackbar/global-snackbar-actions'
import SingleColumnLayout from '../task-details/task-card-columns/SingleColumnLayout'
import ThreeColumnLayout from '../task-details/task-card-columns/ThreeColumnLayout'
import { setInitialContentItemSelection } from '../task-details/task-card-content/task-notes/task-posts-actions'
import {
  clearItemSelection,
  resetTemplateTaskPostList,
  selectItem,
} from '../task-details/task-card-content/task-notes/template-task-post-actions'
import ConfirmStatusChangeContainer from '../task-details/task-card-header/task-status-menu/ConfirmStatusChangeContainer'
import { fetchTemplate } from '../template/template-actions'
import {
  fetchTemplateTask,
  updateTemplateTaskDetails,
} from './template-task-actions'
const layoutStyle = {
  marginTop: 0,
  height: '100%',
  overflowY: 'hidden',
}

/** Panel to show full Template Task details */
export class TemplateTaskDetailsContainer extends React.Component {
  fetchRequiredData = () => {
    this.props.actions.fetchTemplate(
      getTemplateIdFromLocation(this.props.router.location)
    )
    this.props.actions.fetchTemplateTask(
      getTemplateIdFromLocation(this.props.router.location),
      getTaskIdFromLocation(this.props.router.location)
    )
  }

  componentDidMount = () => this.fetchRequiredData()

  componentDidUpdate = prevProps => {
    if (
      getTemplateIdFromLocation(prevProps.router.location) !==
        getTemplateIdFromLocation(this.props.router.location) ||
      getTaskIdFromLocation(prevProps.router.location) !==
        getTaskIdFromLocation(this.props.router.location)
    ) {
      this.fetchRequiredData()
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
          this.props.posts.find(p => p.id === parseInt(urlParamPost)) !==
          undefined
        if (isValidPost) {
          this.props.actions.selectItem(
            this.props.router,
            getTemplateIdFromLocation(this.props.router.location),
            getTaskIdFromLocation(this.props.router.location),
            urlParamPost
          )
        }
      }
    }
  }

  updateHandler = properties => {
    if (properties.description)
      properties = { noticeboardText: properties.description }

    return this.props.actions.updateTemplateTaskDetails(
      getTemplateIdFromLocation(this.props.router.location),
      this.props.task.id,
      properties
    )
  }

  setExpanded = isExpanded => {
    this.setState({ expanded: isExpanded })
  }

  clickBackHandler = () => {
    this.props.actions.clearItemSelection()
    this.props.router.navigate(
      getTemplateTaskDetailsUrl(
        getTemplateIdFromLocation(this.props.router.location),
        getTaskIdFromLocation(this.props.router.location)
      )
    )
  }

  render() {
    if (this.props.userDetails.isExternal) {
      return <Navigate push to="/404" />
    }
    if (
      (this.props.task && !this.props.task.isLoaded) ||
      (this.props.task.id !==
        parseInt(getTaskIdFromLocation(this.props.router.location)) &&
        this.props.task.id !== null)
    ) {
      return null
    }

    const isReadOnly =
      !isKnowledgeManager(this.props.userAuth) ||
      this.props.template.template.isSystemTemplate
    return isMobileView(this.props)
      ? this.renderMobile(isReadOnly)
      : this.renderDesktop(isReadOnly)
  }

  renderMobile = isReadOnly => {
    return (
      <div data-test="task-details-container">
        <SingleColumnLayout
          task={this.props.task}
          templateId={getTemplateIdFromLocation(this.props.router.location)}
          postId={this.props.selectedItemId}
          post={this.props.postDetails}
          posts={this.props.posts}
          isReadOnly={isReadOnly}
          showSnackbarHandler={this.props.actions.showSnackbar}
          updateHandler={this.updateHandler}
          clickBackHandler={this.clickBackHandler}
          viewOnly={isReadOnly}
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
          matterId={getMatterIdFromLocation(this.props.router.location)}
          projectId={getProjectIdFromLocation(this.props.router.location)}
          templateId={getTemplateIdFromLocation(this.props.router.location)}
          postId={this.props.selectedItemId}
          isReadOnly={isReadOnly}
          posts={this.props.posts}
          viewOnly={
            isReadOnly ||
            this.props.auth.data.details.roles.includes('FROZEN_ORG_USER')
          }
          showSnackbarHandler={this.props.actions.showSnackbar}
          updateHandler={this.updateHandler}
          isEditor={isKnowledgeManager(this.props.userAuth)}
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
    task: state.selectedTemplateTask,
    template: state.template,
    selectedItemId: state.templateTaskPostList.selectedItemId,
    posts: state.templateTaskPostList.postList,
    userAuth: state.auth.data.auth,
    userDetails: state.auth.data.details,
    auth: state.auth,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      clearItemSelection: bindActionCreators(clearItemSelection, dispatch),
      showSnackbar: bindActionCreators(showSnackbar, dispatch),
      resetTemplateTaskPostList: bindActionCreators(
        resetTemplateTaskPostList,
        dispatch
      ),
      selectItem: bindActionCreators(selectItem, dispatch),
      setInitialContentItemSelection: bindActionCreators(
        setInitialContentItemSelection,
        dispatch
      ),
      fetchTemplate: bindActionCreators(fetchTemplate, dispatch),
      fetchTemplateTask: bindActionCreators(fetchTemplateTask, dispatch),
      updateTemplateTaskDetails: bindActionCreators(
        updateTemplateTaskDetails,
        dispatch
      ),
    },
  }
}

export default withTranslation()(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(withRouter(withStyles(TemplateTaskDetailsContainer, taskDetailsStyle)))
)

TemplateTaskDetailsContainer.propTypes = {
  /** Task object to display details from*/
  task: PropTypes.object.isRequired,
  /** Template */
  template: PropTypes.object.isRequired,
  /** Flag for control being in read only mode */
  isReadOnly: PropTypes.bool,
}
