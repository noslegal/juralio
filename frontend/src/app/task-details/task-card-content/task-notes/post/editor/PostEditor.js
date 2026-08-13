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
import React, { useEffect, useRef, useState } from 'react'
import { withTranslation } from 'react-i18next'
import { withStyles } from 'tss-react/mui'
import RichTextReadEdit from '../../../../../../components/inputs/rich-text-read-edit/RichTextReadEdit'
import { NOTE_TYPES } from '../../../../../constants'

const styles = () => ({
  root: {
    height: '100%',
    overflow: 'hidden',
    padding: 0,
  },
})

const ToolbarHeight = 340

const PostEditor = props => {
  const divElement = useRef()
  const height = window.innerHeight - ToolbarHeight
  const [editorText, setEditorText] = useState(props.content)
  const [postId, setPostId] = useState(props.postId)
  const [finalised, setFinalised] = useState(props.postFinalised)

  useEffect(() => {
    if (props.postFinalised !== finalised) {
      setFinalised(props.finalised)
      setEditorText(props.content)
    }
    if (props.postId !== postId) {
      setPostId(props.postId)
      setEditorText(props.content)
      if (!props.openContentInEdit) {
        props.toggleEditMode(false)
      }
      props.clearSaveMetadata()
    }
  }, [props.postFinalised, props.postId]) //eslint-disable-line

  const updateText = value => {
    props.saveHandler(value)
  }

  const getPlaceHolderText = () => {
    if (!props.postType) {
      return props.readOnly
        ? props.t('postDetails.emptyNoteReadOnlyPlaceholder')
        : props.t('postDetails.emptyNotePlaceholder')
    } else if (props.postType === NOTE_TYPES.MEETING) {
      return props.t('postDetails.meetingNotePlaceholder')
    } else if (props.postType === NOTE_TYPES.DOCUMENT) {
      return props.t('postDetails.documentNotePlaceholder')
    } else if (props.postType === NOTE_TYPES.WEB) {
      return props.t('postDetails.webNotePlaceholder')
    }
    return props.t('postDetails.addSomeNotesAboutThis', {
      postType: props.postType.toLowerCase(),
    })
  }

  return (
    <div className={props.classes.root} ref={divElement}>
      <RichTextReadEdit
        placeholderText={getPlaceHolderText()}
        model={editorText}
        onModelChange={updateText}
        initializeInEdit={props.openContentInEdit}
        height={height}
        readOnly={props.readOnly || props.viewOnly}
        finalised={finalised}
        usageContext="PostEditor"
        toggleEditMode={props.toggleEditMode}
        getTextAreaReference={props.getTextAreaReference}
        savePost={props.savePost}
      />
    </div>
  )
}

PostEditor.propTypes = {
  /** Text content of note*/
  content: PropTypes.string,
  /** Flag to open note in edit mode */
  openContentInEdit: PropTypes.bool,
  /** Handler to deal with content save */
  saveHandler: PropTypes.func.isRequired,
  /** Flag for blocking edit mode */
  readOnly: PropTypes.bool,
}
export default withTranslation()(withStyles(PostEditor, styles))
