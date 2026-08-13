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

import { DialogContent } from '@mui/material'
import PropTypes from 'prop-types'
import React from 'react'
import { withTranslation } from 'react-i18next'
import {
  MAX_FIELD_LENGTHS,
  NOTE_TYPES,
  TASK_STATUS,
} from '../../../app/constants'
import JurDocumentLink from '../../../assets/images/JurLinkedDocument.svg'
import JurMeetingNote from '../../../assets/images/JurMeetingNote.svg'
import JurNote from '../../../assets/images/JurNote.svg'
import JurWebLink from '../../../assets/images/JurWebLink.svg'
import IsWidthDown from '../../../hooks/width-helper'
import { isInTaskContext } from '../../../services/helpers/route/route-context-helper'
import { NoteIcon } from '../../../theme/navigation/CommonIcons'
import JuralioDialog from '../../dialog/juralio-dialog/JuralioDialog'
import PostDestinationDialog from '../../dialog/post/PostDestinationDialog'
import TemplatePostDestinationDialog from '../../dialog/template-post/TemplatePostDestinationDialog'
import TextPromptDialog from '../../dialog/text-prompt-dialog/TextPromptDialog'
import TextWithDestinationDialog from '../../dialog/text-with-destination-dialog/TextWithDestinationDialog'
import BigDataSpinner from '../../feedback/big-data-spinner/BigDataSpinner'
import LoadingScreen from '../../loading-screen/LoadingScreen'

const CreateNoteFlow = props => {
  const getFullScreenMode = () => IsWidthDown('sm', props.width)

  const translatePostType = type => {
    switch (type) {
      case NOTE_TYPES.BLANK:
        return 'note'
      case NOTE_TYPES.MEETING:
        return 'meeting note'
      case NOTE_TYPES.WEB:
        return 'web link'
      case NOTE_TYPES.DOCUMENT:
        return 'document link'
      default:
        return 'post'
    }
  }

  const getPlaceholderText = type => {
    switch (type) {
      case NOTE_TYPES.DOCUMENT:
        return props.t('createNoteFlow.whatDoYouWantToCallThisDocument')
      default:
        return props.t('createNoteFlow.whatDoYouWantToCallThis', {
          type: translatePostType(type),
        })
    }
  }

  const getIcon = () => {
    switch (props.type) {
      case NOTE_TYPES.BLANK:
        return JurNote
      case NOTE_TYPES.MEETING:
        return JurMeetingNote
      case NOTE_TYPES.DOCUMENT:
        return JurDocumentLink
      case NOTE_TYPES.WEB:
        return JurWebLink
      default:
        return NoteIcon
    }
  }

  const renderEntryDialog = () => {
    return isInTaskContext(props.inContext) &&
      props.parentTask.status !== TASK_STATUS.NOT_REQUIRED &&
      !props.isMatterViewer ? (
      <TextWithDestinationDialog
        titleText={
          props.isTemplate
            ? props.t('createNoteFlow.createNewTemplateNote')
            : props.t('createNoteFlow.createANew', {
                type: translatePostType(props.type),
              })
        }
        titleIcon={getIcon()}
        label={getPlaceholderText(props.type)}
        text={props.noteName}
        maximumLength={MAX_FIELD_LENGTHS.POST_NAME}
        actionText={props.t('common.create')}
        cancelHandler={props.cancelHandler}
        actionHandler={props.createNoteInContext}
        switchValue={props.createAsPrivate}
        switchToggler={props.toggleCreateAsPrivate}
        switchLabel={props.t('privacyBar.keepPrivate')}
        fullScreen={getFullScreenMode()}
        destinationParentTask={
          props.parentTask.name ? props.parentTask : props.selectedTaskOverride
        }
        editDestination={props.displayDestinationDialog}
        destinationLabelText={props.t('createNoteFlow.asPostOf')}
        usageContext="CreateNoteFlow"
        AdditionalFields={props.additionalFields}
        showLoadingBar={props.showLoadingBar}
        loadingText={props.loadingText}
        additionalValidator={() => {
          return !props.disableSubmit
        }}
      />
    ) : (
      <TextPromptDialog
        titleText={
          props.isTemplate
            ? props.t('createNoteFlow.createNewTemplateNote')
            : props.t('createNoteFlow.createANew', {
                type: translatePostType(props.type),
              })
        }
        titleIcon={getIcon()}
        label={getPlaceholderText(props.type)}
        defaultInput={props.noteName}
        maximumLength={MAX_FIELD_LENGTHS.POST_NAME}
        actionText={props.t('common.next')}
        cancelHandler={props.cancelHandler}
        actionHandler={props.displayDestinationDialog}
        switchValue={props.createAsPrivate}
        switchToggler={props.toggleCreateAsPrivate}
        switchLabel={props.t('privacyBar.keepPrivate')}
        fullScreen={getFullScreenMode()}
        usageContext="CreateNoteFlow"
        AdditionalFields={props.additionalFields}
        showLoadingBar={props.showLoadingBar}
        loadingText={props.loadingText}
        additionalValidator={() => {
          return !props.disableSubmit
        }}
      />
    )
  }

  const renderLoadingDialog = () => {
    return (
      <JuralioDialog
        open={true}
        titleText={props.t('createNoteFlow.creatingYourPost')}
        titleIcon={NoteIcon}
        handleCancel={props.cancelHandler}
        onClose={props.closeHandler}
        hideAction={true}
        hideCancel={true}
        loadingText={props.t('createNoteFlow.creatingYourPost')}
      >
        <DialogContent data-test="dialog-content">
          <LoadingScreen />
          <BigDataSpinner size={150} />
        </DialogContent>
      </JuralioDialog>
    )
  }

  return !props.showDestinationDialog ? (
    !props.autoCreateNote ? (
      <div data-test="create-note-flow-dialog">{renderEntryDialog()}</div>
    ) : (
      renderLoadingDialog()
    )
  ) : props.isTemplate ? (
    <TemplatePostDestinationDialog
      titleText={props.t('createNoteFlow.chooseANoteDestination')}
      titleIcon={getIcon()}
      cancelHandler={props.cancelHandler}
      createHandler={props.createNote}
      fullScreen={getFullScreenMode()}
      cancelText={props.t('common.back')}
    />
  ) : (
    <PostDestinationDialog
      titleText={props.t('createNoteFlow.chooseANoteDestination')}
      createHandler={props.createNote}
      closeHandler={props.cancelHandler}
      fullScreen={getFullScreenMode()}
      cancelText={
        props.type === NOTE_TYPES.BLANK || props.type === NOTE_TYPES.MEETING
          ? props.t('common.cancel')
          : props.t('common.back')
      }
    />
  )
}

CreateNoteFlow.propTypes = {
  cancelHandler: PropTypes.func.isRequired,
}

export default withTranslation()(CreateNoteFlow)
