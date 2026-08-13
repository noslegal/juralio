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

import classNames from 'classnames'
import PropTypes from 'prop-types'
import React, { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { withStyles } from 'tss-react/mui'
import withLoader from '../../../../../../components/feedback/with-loader/WithLoader'
import juralioColours from '../../../../../../theme/juralio-colours'
import { NOTE_TYPES, USER_ROLES } from '../../../../../constants'
import PostEditor from '../editor/PostEditor'
import TaskPostMoveContainer from '../move/TaskPostMoveContainer'
import EmbeddedPost from './EmbeddedPost'
import PostDetailHeader from './PostDetailHeader'

const styles = theme => ({
  root: {
    position: 'relative',
    width: '100%',
    height: 'calc(100% - 2px)',
    boxSizing: 'border-box',
    display: 'flex',
    flexDirection: 'column',
    marginTop: 2, // This stops the vertical border hitting the horizontal global bar.
  },
  borderPost: {
    borderLeft: '1px solid ' + juralioColours.control.border,
  },
  mobile: {
    display: 'flex',
    flexDirection: 'column',
  },
  postContent: {
    flex: '1 1 0px',
  },
  postHeader: {
    marginLeft: theme.spacing(3),
    [theme.breakpoints.down('md')]: {
      paddingTop: theme.spacing(1),
    },
    flex: '0 0 auto',
  },
  topPadding: {
    paddingTop: theme.spacing(0),
  },
})

/** Post detail panel displays Header, Footer and content with Editor */
const PostDetailPanel = props => {
  const history = useNavigate()
  const [textAreaReference, setTextAreaReference] = useState(null)
  const project = useSelector(state => state.project)
  const [shouldRenderPostMoveDialog, openMoveDialog] = useState(false)
  const [showEmbededPost, setShowEmbededPost] = useState(true)

  useEffect(() => {
    setShowEmbededPost(true)
  }, [props.post.id])

  const userIsKnowledgeManager = useSelector(state =>
    state.auth.data.auth.roles.includes(USER_ROLES.ROLE_KNOWLEDGE_MANAGER)
  )

  const getTextAreaReference = reference => setTextAreaReference(reference)
  const movePost = () => openMoveDialog(!shouldRenderPostMoveDialog)

  const showPostStatusSelector = !props.isTemplate || userIsKnowledgeManager

  const focusOnText = () => {
    const el = textAreaReference.current?.querySelector('.ProseMirror')
    if (el) el.focus()
  }

  const isembeddedUrl = [
    NOTE_TYPES.GOOGLE_SLIDES,
    NOTE_TYPES.GOOGLE_SHEET,
    NOTE_TYPES.GOOGLE_DOC,
    NOTE_TYPES.MS_WORD,
    NOTE_TYPES.MS_EXCEL,
    NOTE_TYPES.MS_POWERPOINT,
    NOTE_TYPES.MS_VISIO,
    NOTE_TYPES.MIRO,
    NOTE_TYPES.FIGMA,
  ].includes(props.post.type)

  return (
    <div
      className={classNames(props.classes.root, {
        [props.classes.mobile]: props.mobileView,
        [props.classes.topPadding]: !props.mobileView,
        [props.classes.borderPost]: !props.isOverview,
      })}
      data-test="note-detail-panel"
    >
      <div className={props.classes.postHeader}>
        <PostDetailHeader
          post={props.post}
          updateContentHandler={props.updateContentHandler}
          updateNameHandler={props.updateNoteName}
          updateUrlHandler={props.updateUrlHandler}
          updateFinalisedStatus={props.updateFinalisedStatus}
          updateTypeHandler={props.updateTypeHandler}
          clearSaveMetadata={props.clearSaveMetadata}
          mobileView={props.mobileView}
          isOverview={props.isOverview}
          isTemplate={props.isTemplate}
          history={history}
          focusOnText={focusOnText}
          toggleEditMode={props.toggleEditMode}
          movePost={movePost}
          updateTimes={props.updateTimes}
          showPostStatusSelector={showPostStatusSelector}
          isReadOnly={props.isReadOnly}
          handlePostPrivacyChange={props.handlePostPrivacyChange}
          viewOnly={props.viewOnly}
          openInEditMode={props.openInEditMode}
          showEmbededPost={showEmbededPost}
          setShowEmbededPost={setShowEmbededPost}
        />
      </div>
      <div
        className={props.classes.postContent}
        data-test="note-editor-container"
      >
        {(!isembeddedUrl || !showEmbededPost) && (
          <PostEditor
            postId={props.post.id}
            postType={props.post.type}
            postFinalised={props.post.finalised}
            content={props.post.description}
            saveHandler={props.saveContentHandler}
            openContentInEdit={props.openContentInEdit || props?.openInEditMode}
            readOnly={props.isReadOnly || props.post.finalised}
            toggleEditMode={props.toggleEditMode}
            clearSaveMetadata={props.clearSaveMetadata}
            getTextAreaReference={getTextAreaReference}
            savePost={props.updateContentHandler}
            viewOnly={props.viewOnly}
          />
        )}
        {isembeddedUrl && showEmbededPost && (
          <EmbeddedPost url={props.post.url} type={props.post.type} />
        )}
      </div>
      {shouldRenderPostMoveDialog && (
        <TaskPostMoveContainer
          close={movePost}
          project={project}
          task={props.task}
          post={props.post}
          handleClose={movePost}
          isTemplate={props.isTemplate}
        />
      )}
    </div>
  )
}

PostDetailPanel.propTypes = {
  /** Note object */
  post: PropTypes.object.isRequired,
  /** updateContentName Handler*/
  updateContentHandler: PropTypes.func.isRequired,
  /** updateNoteName Handler*/
  updateNoteName: PropTypes.func.isRequired,
  /** updateNotePrivacy Handler*/
  updateNotePrivacy: PropTypes.func,
  /** Handler for updating url of the link */
  updateUrlHandler: PropTypes.func.isRequired,
  /** Handler for updating finalised status of post */
  updateFinalisedStatus: PropTypes.func.isRequired,
  /** Flag to open content in edit mode */
  openContentInEdit: PropTypes.bool,
  /** Flag to render mobile view */
  mobileView: PropTypes.bool,
  /** Template flag */
  isTemplate: PropTypes.bool,
  /** showPrivacyAdvice flag */
  showPrivacyAdvice: PropTypes.bool,
}

export default withLoader(200)(withStyles(PostDetailPanel, styles))
