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
import { bindActionCreators } from 'redux'
import { withStyles } from 'tss-react/mui'
import BigDataSpinner from '../../../../../../components/feedback/big-data-spinner/BigDataSpinner'
import WithUser from '../../../../../../services/with-user/WithUser'
import {
  clearSaveMetadata,
  fetchTemplatePostDetails,
  resetDetailsInitialEdit,
  savePost,
  toggleEditMode,
  updateTemplatePost,
} from '../../template-task-post-actions'
import PostDetailPanel from './PostDetailPanel'

const styles = () => ({
  bigDataSpinner: {
    height: '100%',
    display: 'flex',
  },
})
class TemplatePostDetailContainer extends React.Component {
  componentDidMount() {
    this.fetchPost()
  }

  componentDidUpdate(prevProps) {
    if (
      prevProps.selectedItemId !== this.props.selectedItemId ||
      prevProps.task.id !== this.props.task.id
    ) {
      this.fetchPost()
      if (this.props.newCreated === undefined) {
        this.props.actions.resetDetailsInitialEdit()
      }
    }
  }

  toggleEditMode = payload => {
    setTimeout(
      function () {
        this.props.actions.toggleEditMode(payload)
      }.bind(this),
      200
    )
  }

  clearSaveMetadata = () => {
    this.props.actions.clearSaveMetadata()
  }

  savePost = payload => this.props.actions.savePost(payload)

  fetchPost = () => {
    if (this.props.selectedItemId > 0) {
      this.props.actions.fetchTemplatePostDetails(
        this.props.templateId,
        this.props.task.id,
        this.props.selectedItemId
      )
    }
  }

  updatePost = (payload, isAutoSaving) => {
    this.props.actions.updateTemplatePost(
      this.props.templateId,
      this.props.task.id,
      this.props.selectedItemId,
      payload,
      isAutoSaving
    )
  }

  updatePostTimes = (start, end) => {
    this.updatePost({ startTime: start, endTime: end })
  }

  updateFinalisedStatus = value =>
    this.updatePost({
      finalised: value,
      description: this.props.postDetails.description,
    })

  savePostContent = value => {
    this.savePost(value)
    this.updatePostContent(value, false)
  }

  updatePostContent = (value, isAutoSaving) =>
    this.updatePost({ description: value }, isAutoSaving)

  updateNoteName = value => this.updatePost({ name: value })

  updateTypeHandler = value => {
    this.updatePost({
      type: value,
    })
  }

  handlePostPrivacyChange = value => {
    this.updatePost({
      privatePost: value,
    })
  }

  updateLinkUrl = value => this.updatePost({ url: value })

  render() {
    if (!this.props.isLoaded) {
      return (
        <div className={this.props.classes.bigDataSpinner}>
          <BigDataSpinner size={200} />
        </div>
      )
    }

    return this.props.postDetails ? (
      <PostDetailPanel
        isLoaded={this.props.isLoaded}
        post={this.props.postDetails}
        saveContentHandler={this.savePostContent}
        updateNoteName={this.updateNoteName}
        updateContentHandler={this.updatePostContent}
        updateFinalisedStatus={this.updateFinalisedStatus}
        updateUrlHandler={this.updateLinkUrl}
        toggleEditMode={this.toggleEditMode}
        clearSaveMetadata={this.clearSaveMetadata}
        openContentInEdit={this.props.openContentInEdit}
        mobileView={this.props.mobileView}
        isOverview={false}
        isTemplate={true}
        updateTimes={this.updatePostTimes}
        updateTypeHandler={this.updateTypeHandler}
        handlePostPrivacyChange={this.handlePostPrivacyChange}
        viewOnly={this.props.viewOnly}
      />
    ) : null
  }
}

function mapStateToProps(state) {
  return {
    postDetails: state.templateTaskPostList.postDetails.post,
    isLoaded: state.templateTaskPostList.postDetails.isLoaded,
    openContentInEdit: state.templateTaskPostList.initialDetailsInEdit,
    selectedItemId: state.templateTaskPostList.selectedItemId,
    newCreated: state.templateTaskPostList.newCreated,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      updateTemplatePost: bindActionCreators(updateTemplatePost, dispatch),
      fetchTemplatePostDetails: bindActionCreators(
        fetchTemplatePostDetails,
        dispatch
      ),
      resetDetailsInitialEdit: bindActionCreators(
        resetDetailsInitialEdit,
        dispatch
      ),
      savePost: bindActionCreators(savePost, dispatch),
      toggleEditMode: bindActionCreators(toggleEditMode, dispatch),
      clearSaveMetadata: bindActionCreators(clearSaveMetadata, dispatch),
    },
  }
}

TemplatePostDetailContainer.propTypes = {
  /** task */
  task: PropTypes.object.isRequired,
  /** templateId */
  templateId: PropTypes.string.isRequired,
  /** flag for overview */
  isOverview: PropTypes.bool,
  /** postDetails */
  postDetails: PropTypes.object,
  /** isLoaded */
  isLoaded: PropTypes.bool.isRequired,
  /** userData */
  userData: PropTypes.object.isRequired,
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTranslation()(WithUser(withStyles(TemplatePostDetailContainer, styles))))
