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
import { withTranslation } from 'react-i18next'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { withStyles } from 'tss-react/mui'
import zeroStateImage from '../../../../../../assets/images/rabbit.svg'
import NoContent from '../../../../../../components/data-display/no-content/NoContent'
import BigDataSpinner from '../../../../../../components/feedback/big-data-spinner/BigDataSpinner'
import WithUser from '../../../../../../services/with-user/WithUser'
import { ACTIVITIES, TASK_STATUS } from '../../../../../constants'
import { displayConfirmationDialog } from '../../../../../global-confirmation-dialog/global-confirmation-dialog-actions'
import InboxZeroState from '../../../../../home/zero-state/InboxZeroState'
import { addPostAuthor } from '../../../TaskAuthors/task-authors-actions'
import {
  clearSaveMetadata,
  fetchPostDetails,
  resetDetailsInitialEdit,
  savePost,
  toggleEditMode,
  updatePost,
  updatePostButDontFetch,
} from '../../task-posts-actions'
import PostDetailPanel from './PostDetailPanel'

const styles = () => ({
  bigDataSpinner: {
    height: '100%',
    left: '400px',
    top: '250px',
    position: 'absolute',
  },
})

class PostDetailContainer extends React.Component {
  componentDidMount() {
    this.fetchPost()
  }

  componentDidUpdate(prevProps) {
    if (prevProps.selectedItemId !== this.props.selectedItemId) {
      this.fetchPost()
      if (this.props.newCreated === undefined) {
        this.props.actions.resetDetailsInitialEdit()
      }
    }
  }

  fetchPost = () => {
    if (this.props.selectedItemId > 0) {
      this.props.actions.fetchPostDetails(
        this.props.matterId,
        this.props.task.projectId,
        this.props.task.id,
        this.props.selectedItemId
      )
    }
  }

  toggleEditMode = payload => {
    this.props.actions.toggleEditMode(payload)
  }

  clearSaveMetadata = () => {
    this.props.actions.clearSaveMetadata()
  }

  savePost = payload => {
    this.props.actions.savePost(payload)
    this.updatePost({ description: payload }, false)
  }

  updatePost = (payload, isAutoSaving) => {
    if (this.props.postDetails) {
      this.props.actions.updatePost(
        this.props.matterId,
        this.props.task?.projectId,
        this.props.task?.id,
        this.props.postDetails?.id,
        payload,
        isAutoSaving
      )
    }
  }
  addPostAuthor = () => {
    this.props.actions.addPostAuthor(
      this.props.matterId,
      this.props.task.projectId,
      this.props.task.id,
      this.props.postDetails.id,
      this.props.userData
    )
  }

  isUserAlreadyAnAuthor = () => {
    return (
      this.props.postDetails.authors.findIndex(
        author => author.user.id === this.props.userData.id
      ) !== -1
    )
  }

  userIsNotAdminOrEditorOfFinalisedPost = () => {
    if (!this.props.postDetails.finalised) {
      return false
    }
    if (this.isUserAlreadyAnAuthor()) {
      return false
    }
    const isMatterAdmin =
      this.props.matterDetails?.matter?.activities?.includes(
        ACTIVITIES.MATTER_ADMIN
      )
    if (isMatterAdmin) {
      return false
    }
    return true
  }

  savePostContent = value => this.savePost(value)

  updatePostContent = (value, isAutoSaving) => {
    this.updatePost({ description: value }, isAutoSaving)
  }

  updateFinalisedStatus = value => {
    const payload = { finalised: value }
    if (value) {
      payload.description = this.props.postDetails.description
    }
    this.updatePost(payload)
  }

  handlePostPrivacyChange = value => {
    if (value === false) {
      const options = {
        actionText: this.props.t('common.confirm'),
        titleText: this.props.t('privacyBar.confirmation.title'),
        promptText: this.props.t('privacyBar.confirmation.body'),
        usageContext: 'ProjectDetailContainer',
      }
      this.props.actions.displayConfirmationDialog(options, () => {
        this.updatePost({
          privatePost: value,
        })
      })
    } else {
      this.updatePost({
        privatePost: value,
      })
    }
  }

  updateTypeHandler = value => {
    this.updatePost({
      type: value,
    })
  }
  updateNoteName = value => this.updatePost({ name: value })

  updateLinkUrl = (url, type) => this.updatePost({ url: url, type: type })

  updateNotePrivacy = value => {
    this.updatePost({ privatePost: value }).then(res => {
      if (res) {
        this.fetchPost()
      }
    })
  }

  updatePostTimes = (start, end) => {
    this.updatePost({ startTime: start, endTime: end })
  }

  render() {
    if (
      !this.props.isLoaded ||
      (this.props.postDetail &&
        this.props.postDetails.id !== parseInt(this.props.selectedItemId))
    ) {
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
        updateContentHandler={this.updatePostContent}
        updateFinalisedStatus={this.updateFinalisedStatus}
        updateTypeHandler={this.updateTypeHandler}
        updateNoteName={this.updateNoteName}
        updateNotePrivacy={this.updateNotePrivacy}
        updateUrlHandler={this.updateLinkUrl}
        toggleEditMode={this.toggleEditMode}
        clearSaveMetadata={this.clearSaveMetadata}
        openContentInEdit={this.props.openContentInEdit}
        mobileView={this.props.mobileView}
        isOverview={this.props.isOverview}
        task={this.props.task}
        updateTimes={this.updatePostTimes}
        handlePostPrivacyChange={this.handlePostPrivacyChange}
        isReadOnly={this.props.task.status === TASK_STATUS.NOT_REQUIRED}
        viewOnly={
          this.props.viewOnly || this.userIsNotAdminOrEditorOfFinalisedPost()
        }
        openInEditMode={this.props.openInEditMode}
      />
    ) : (
      <NoContent data-test="overview-archived-post">
        <InboxZeroState
          image={zeroStateImage}
          title={this.props.t('postDetails.archivedPost')}
          imageDimensions={{ width: '90%', height: '90%' }}
        />
      </NoContent>
    )
  }
}

function mapStateToProps(state) {
  return {
    postDetails: state.selectedTaskPostList.postDetails.post,
    isLoaded: state.selectedTaskPostList.postDetails.isLoaded,
    openContentInEdit: state.selectedTaskPostList.initialDetailsInEdit,
    selectedItemId: state.selectedTaskPostList.selectedItemId,
    newCreated: state.selectedTaskPostList.newCreated,
    matterDetails: state.matterDetails,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      addPostAuthor: bindActionCreators(addPostAuthor, dispatch),
      fetchPostDetails: bindActionCreators(fetchPostDetails, dispatch),
      updatePost: bindActionCreators(updatePost, dispatch),
      savePost: bindActionCreators(savePost, dispatch),
      resetDetailsInitialEdit: bindActionCreators(
        resetDetailsInitialEdit,
        dispatch
      ),
      displayConfirmationDialog: bindActionCreators(
        displayConfirmationDialog,
        dispatch
      ),
      toggleEditMode: bindActionCreators(toggleEditMode, dispatch),
      clearSaveMetadata: bindActionCreators(clearSaveMetadata, dispatch),
      updatePostButDontFetch: bindActionCreators(
        updatePostButDontFetch,
        dispatch
      ),
    },
  }
}

export default withTranslation()(
  connect(
    mapStateToProps,
    mapDispatchToProps
  )(withTranslation()(WithUser(withStyles(PostDetailContainer, styles))))
)
