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
import { useTranslation } from 'react-i18next'
import { connect, useDispatch } from 'react-redux'
import { displayConfirmationDialog } from '../../../../../global-confirmation-dialog/global-confirmation-dialog-actions'
import { deleteTemplatePost } from '../../template-task-post-actions'
import TaskPostOptionMenu from './TaskPostOptionMenu'

/** Container for Menu */
const TemplateTaskPostOptionMenuContainer = props => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const deletePost = () => {
    const options = {
      actionText: t('operationMenuItem.delete'),
      titleText: t('operationMenuItem.delete') + ' : ' + props.post.name,
      promptText: t('postDelete.confirmation'),
      usageContext: 'TemplatePostDelete',
    }
    dispatch(
      displayConfirmationDialog(options, () =>
        dispatch(
          deleteTemplatePost(props.template.id, props.task.id, props.post.id)
        )
      )
    )
    props.closeHandler()
  }

  if (!props.anchor || !props.post) return null

  return (
    <TaskPostOptionMenu
      anchor={props.anchor}
      post={props.post}
      closeHandler={props.closeHandler}
      convertPostHandler={props.convertPostHandler}
      deletePostHandler={deletePost}
      isTemplate={true}
      movePost={props.movePost}
      isPostEditor={false}
    />
  )
}

TemplateTaskPostOptionMenuContainer.propTypes = {
  /** Close menu handler */
  closeHandler: PropTypes.func.isRequired,
  /** Element where menu is placed */
  anchor: PropTypes.object,
}

function mapStateToProps(state) {
  return {
    post: state.templateTaskPostList.postDetails.post,
    task: state.selectedTemplateTask,
    template: state.template.template,
  }
}

export default connect(
  mapStateToProps,
  undefined
)(TemplateTaskPostOptionMenuContainer)
