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
import React, { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { withStyles } from 'tss-react/mui'
import { displayConfirmationDialog } from '../../../../../global-confirmation-dialog/global-confirmation-dialog-actions'
import { updatePost } from '../../task-posts-actions'
import TaskPostMoveContainer from '../move/TaskPostMoveContainer'
import MobileTaskContentHeader from './MobileTaskContentHeader'

const styles = () => ({
  root: {
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
  },
})

/** Panel to show post details in mobile view */
const MobilePostDisplay = props => {
  const dispatch = useDispatch()
  const { t } = useTranslation()
  const [shouldRenderPostMoveDialog, openMoveDialog] = useState(false)
  const project = useSelector(state => state.project)
  const currentUser = useSelector(state => state.auth.data.details)

  const movePost = (wasMoved = true) => {
    if (wasMoved && shouldRenderPostMoveDialog) {
      props.clickBackHandler()
    }
    openMoveDialog(!shouldRenderPostMoveDialog)
  }

  const handlePostPrivacyChange = value => {
    if (value === false) {
      const options = {
        actionText: t('common.confirm'),
        titleText: t('privacyBar.confirmation.title'),
        promptText: t('privacyBar.confirmation.body'),
        usageContext: 'ProjectDetailContainer',
      }
      dispatch(
        displayConfirmationDialog(options, () => {
          dispatch(
            updatePost(
              project.matterId,
              project.id,
              props.task.id,
              props.post.id,
              {
                privatePost: value,
              }
            )
          )
        })
      )
    } else {
      dispatch(
        updatePost(project.matterId, project.id, props.task.id, props.post.id, {
          privatePost: value,
        })
      )
    }
  }

  return (
    <div className={props.classes.root}>
      <MobileTaskContentHeader
        makeVisible={handlePostPrivacyChange}
        name={props.task.name}
        post={props.post}
        clickBackHandler={props.clickBackHandler}
        showDraftMenuItems={!props.isTemplatePost}
        currentUser={currentUser}
        movePost={movePost}
        viewOnly={props.viewOnly}
      />
      {props.children}
      {props.post && shouldRenderPostMoveDialog && (
        <TaskPostMoveContainer
          close={movePost}
          project={project}
          task={props.task}
          post={props.post}
          handleClose={movePost}
          isTemplate={props.isTemplatePost}
        />
      )}
    </div>
  )
}

MobilePostDisplay.propTypes = {
  /** Post object */
  post: PropTypes.object,
  /** Flag for whether showing template post */
  isTemplatePost: PropTypes.bool,
  /** Task object */
  task: PropTypes.object.isRequired,
  /** clickBackHandler */
  clickBackHandler: PropTypes.func.isRequired,
}

export default withStyles(MobilePostDisplay, styles)
