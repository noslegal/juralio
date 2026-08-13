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
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import withRouter from '../../../../../../services/navigation/WithRouter'
import {
  fetchTemplateTaskPosts,
  resetNewCreated,
  resetTemplateTaskPostList,
  selectItem,
} from '../../template-task-post-actions'
import PostList from './PostList'

/** Container for Template Task posts list */
class TemplatePostListContainer extends React.Component {
  componentDidMount = () => this.fetchPosts()

  componentDidUpdate(previousProps) {
    if (this.props.templateTask.id !== previousProps.templateTask.id)
      this.fetchPosts()
  }

  fetchPosts() {
    this.props.actions.fetchTemplateTaskPosts(
      this.props.templateId,
      this.props.templateTask.id
    )
  }

  componentWillUnmount = () => this.props.actions.reset()

  showTemplatePost = (event, index, item) => {
    this.props.actions.selectItem(
      this.props.router,
      this.props.templateId,
      this.props.templateTask.id,
      item.id
    )
  }

  render = () => {
    return (
      <PostList
        isMobileView={this.props.isMobileView}
        isLoaded={this.props.isLoaded}
        newCreated={this.props.newCreated}
        posts={this.props.posts}
        isTemplate={true}
        templateId={this.props.templateId}
        taskId={this.props.templateTask.id}
        clickHandler={this.showTemplatePost}
        selectedItemId={this.props.selectedItemId}
        actions={{
          resetNewCreated: this.props.actions.resetNewCreated,
          selectItem: this.props.actions.selectItem,
        }}
        isEditor={this.props.isEditor}
        isReadOnly={this.props.isReadOnly}
        viewOnly={this.props.viewOnly}
        isSmallScreen={this.props.isSmallScreen}
        isSmallPanel={this.props.isSmallPanel}
        isMilestone={this.props.isMilestone}
        isDeliverable={this.props.isDeliverable}
      />
    )
  }
}

function mapStateToProps(state) {
  return {
    isLoaded: state.templateTaskPostList.isLoaded,
    newCreated: state.templateTaskPostList.newCreated,
    posts: state.templateTaskPostList.postList,
    selectedItemId: state.templateTaskPostList.selectedItemId,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      resetNewCreated: bindActionCreators(resetNewCreated, dispatch),
      fetchTemplateTaskPosts: bindActionCreators(
        fetchTemplateTaskPosts,
        dispatch
      ),
      reset: bindActionCreators(resetTemplateTaskPostList, dispatch),
      selectItem: bindActionCreators(selectItem, dispatch),
    },
  }
}

TemplatePostListContainer.propTypes = {
  /** The template Id */
  templateId: PropTypes.string.isRequired,
  /** Posts */
  posts: PropTypes.array,
  /** The Template Task */
  templateTask: PropTypes.object.isRequired,
  /** Flag for control being in read only mode */
  isReadOnly: PropTypes.bool,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(TemplatePostListContainer))
