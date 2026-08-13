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

import ArchiveIcon from '@mui/icons-material/Archive'
import PropTypes from 'prop-types'
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { connect, useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { bindActionCreators } from 'redux'
import { getTaskDetailsUrl } from '../../../../../../components/navigation/common/location-context-helper'
import { formatUserDisplayName } from '../../../../../../services/user/helper/user-format-service'
import { displayConfirmationDialog } from '../../../../../global-confirmation-dialog/global-confirmation-dialog-actions'
import { displaySnackbar } from '../../../../../global-snackbar/global-snackbar-actions'
import {
  archivePost,
  toggleEditMode,
  updatePost,
} from '../../task-posts-actions'
import TaskPostDownloadDialog from './TaskPostDownloadDialog'
import TaskPostOptionMenu from './TaskPostOptionMenu'
/** Container for Menu */
const TaskPostOptionMenuContainer = props => {
  const { t } = useTranslation()
  const currentUser = useSelector(state => state.auth.data.details)
  const dispatch = useDispatch()
  const history = useNavigate()
  const toggleEditMode = isEditMode => {
    props.actions.toggleEditMode(isEditMode)
  }
  const [showDownloadDialog, setShowDownloadDialog] = useState(false)
  const updatePost = flagValue => {
    props.actions.updatePost(
      props.project.matterId,
      props.project.id,
      props.task.id,
      props.post.id,
      { description: props.post.description, finalised: flagValue }
    )
    props.closeHandler()
  }
  const archivePost = () => {
    const options = {
      actionText: t('operationMenuItem.archive'),
      titleText: t('operationMenuItem.archive') + ' : ' + props.post.name,
      promptText: t('postArchive.confirmation'),
      usageContext: 'ProjectPostArchive',
      headerIcon: ArchiveIcon,
    }
    dispatch(
      displayConfirmationDialog(options, () =>
        props.actions
          .archivePost(
            props.project.matterId,
            props.project.id,
            props.task.id,
            props.post.id
          )
          .then(() => {
            history(
              getTaskDetailsUrl(
                props.project.matterId,
                props.project.id,
                props.task.id
              )
            )
          })
      )
    )
    props.closeHandler()
  }

  const downloadPost = paperSize => {
    props.closeHandler()
    dispatch(displaySnackbar(t('exports.common.preparingYourDownload')))
    setShowDownloadDialog(false)
    import('../../../../../../services/export/reports/post/post-report-service').then(
      m =>
        m.default(
          t,
          {
            matter: props.matterDetails?.matter,
            project: props.project,
            task: props.task,
            post: props.post,
          },
          { printType: paperSize, creator: formatUserDisplayName(currentUser) }
        )
    )
  }

  if (!props.anchor || !props.post) return null
  const isPostEditor = props.post.authors
    .map(u => u.user.id)
    .includes(currentUser.id)

  return (
    <>
      <TaskPostOptionMenu
        anchor={props.anchor}
        post={props.post}
        closeHandler={props.closeHandler}
        showDraftMenuItems={props.showDraftMenuItems}
        convertPostHandler={props.convertPostHandler}
        toggleEditMode={toggleEditMode}
        archivePostHandler={archivePost}
        updatePostHandler={updatePost}
        downloadHandler={() => {
          setShowDownloadDialog(true)
        }}
        movePost={props.movePost}
        isTemplate={props.isTemplate}
        makeVisible={props.makeVisible}
        isReadOnly={props.isReadOnly}
        isPostEditor={isPostEditor}
        viewOnly={props.viewOnly}
        isExternal={currentUser.isExternal}
      />
      <TaskPostDownloadDialog
        open={showDownloadDialog}
        close={() => setShowDownloadDialog(false)}
        download={paperSize => {
          downloadPost(paperSize)
        }}
      />
    </>
  )
}

TaskPostOptionMenu.propTypes = {
  /** Close menu handler */
  closeHandler: PropTypes.func.isRequired,
  /** Element where menu is placed */
  anchor: PropTypes.object,
  /** Flag to show draft status menu items */
  showDraftMenuItems: PropTypes.bool,
}

function mapStateToProps(state) {
  return {
    post: state.selectedTaskPostList.postDetails.post,
    project: state.project,
    task: state.selectedTask,
    matterDetails: state.matterDetails,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      updatePost: bindActionCreators(updatePost, dispatch),
      archivePost: bindActionCreators(archivePost, dispatch),
      toggleEditMode: bindActionCreators(toggleEditMode, dispatch),
    },
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(TaskPostOptionMenuContainer)
