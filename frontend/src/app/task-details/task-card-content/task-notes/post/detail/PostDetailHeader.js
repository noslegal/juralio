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

import { MoreVert } from '@mui/icons-material'
import BookIcon from '@mui/icons-material/Book'
import OpenInNewIcon from '@mui/icons-material/OpenInNew'
import {
  Button,
  FormControlLabel,
  Switch,
  Tooltip,
  Typography,
} from '@mui/material'
import IconButton from '@mui/material/IconButton'
import PropTypes from 'prop-types'
import React, { useEffect, useState } from 'react'
import { useTranslation, withTranslation } from 'react-i18next'
import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { withStyles } from 'tss-react/mui'
import ReadEditField from '../../../../../../components/inputs/read-edit-field/ReadEditField'
import ReadEditUrlField from '../../../../../../components/inputs/read-edit-url-field/ReadEditUrlField'
import { getPostType } from '../../../../../../helpers/post-helpers'
import { getPostTypeIcon } from '../../../../../../services/helpers/post/post-icon-helper'
import {
  checkTextHasNonWhitespaceContent,
  isValidUrl,
  sanitizeUrl,
} from '../../../../../../services/helpers/text/text-util-helper'
import juralioColours from '../../../../../../theme/juralio-colours'
import rawColours from '../../../../../../theme/raw-colours'
import {
  MAX_FIELD_LENGTHS,
  NOTE_TYPES,
  TASK_STATUS,
} from '../../../../../constants'
import { showSnackbar } from '../../../../../global-snackbar/global-snackbar-actions'
import {
  setInitialContentItemSelection,
  updatePost,
} from '../../task-posts-actions'
import { updateTemplatePost } from '../../template-task-post-actions'
import TaskPostOptionMenuContainer from '../menu/TaskPostOptionMenuContainer'
import TemplateTaskPostOptionMenuContainer from '../menu/TemplateTaskPostOptionMenuContainer'
import { getMinutes } from './helpers/time-helpers'
import LinkTypeDropdown from './LinkTypeDropdown'
import MeetingNoteDetails from './MeetingNoteDetails'
import OpenInTaskDetailsButton from './OpenInTaskDetailsButton'
import PostCloseButton from './PostCloseButton'
import PostPeopleContainer from './PostPeopleContainer'
import PostWorkflowBar from './PostWorkflowBar'

// const AUTO_SAVE_INCREMENT_SECONDS = 15
// const AUTO_SAVE_TOTAL_SECONDS = 60

const styles = theme => ({
  root: {
    paddingTop: theme.spacing(),
    minHeight: theme.spacing(12),
    alignItems: 'center',
    width: '100%',
  },
  row: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    width: '100%',
    marginTop: 'auto',
  },
  postDetailName: {
    textAlign: 'left',
    display: 'flex',
    zIndex: '2',
  },
  postDetailDate: {
    color: theme.palette.text.secondary,
    marginTop: theme.spacing(),
  },
  postDetailText: {
    flex: 9,
  },
  optionMenu: {
    display: 'flex',
    marginRight: theme.spacing(),
  },
  button: {
    padding: theme.spacing(1, 3.5),
    height: theme.spacing(5),
  },
  saveText: {
    textAlign: 'center',
    padding: theme.spacing(),
  },
  postHeaderIcon: {
    marginRight: theme.spacing(),
    height: theme.spacing(3),
  },
  linkNoteDiv: {
    display: 'flex',
    marginTop: theme.spacing(1),
    marginBottom: theme.spacing(2),
  },
  urlDiv: {
    marginLeft: theme.spacing(1),
    width: '50%',
  },
  atlassianWrapper: {
    display: 'flex',
    alignItems: 'center',
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
  },
  openLinkButton: {
    marginLeft: theme.spacing(1),
    backgroundColor: juralioColours.named.blue.main,
    color: juralioColours.whiteText.primary,
    height: theme.spacing(4),
    marginRight: theme.spacing(),
    '&:hover': {
      backgroundColor: rawColours.primary.primary.dark,
    },
  },
  openLinkButtonText: {
    textTransform: 'none',
  },
  iconWrapper: {
    display: 'flex',
    alignItems: 'center',
    paddingRight: theme.spacing(1),
  },
  unsupportedText: {
    marginBottom: theme.spacing(2),
  },
  notesSwitch: {
    marginLeft: 'auto',
    marginRight: theme.spacing(2),
  },
  errorLink: {
    cursor: 'pointer',
    color: rawColours.error.primary,
  },
})

/** Display of Post details above the content. */
const PostDetailHeader = props => {
  const getDefaultStartTime = () => {
    let now = new Date()
    let minutes = now.getMinutes()
    if (minutes > 30) {
      //return half past
      now.setMinutes(30)
      now.setSeconds(0)
      now.setMilliseconds(0)
    } else {
      now.setMinutes(0)
      now.setSeconds(0)
      now.setMilliseconds(0)
      //return on the hour before
    }
    return now
  }

  const getDefaultEndTime = () => {
    let now = new Date()
    let minutes = now.getMinutes()
    if (minutes < 30) {
      //return half past
      now.setMinutes(30)
      now.setSeconds(0)
      now.setMilliseconds(0)
    } else {
      now.setHours(now.getHours() + 1)
      now.setMinutes(0)
      now.setSeconds(0)
      now.setMilliseconds(0)
      //return on the next hour
    }
    return now
  }

  const minusAnHour = date => {
    let d = new Date(date)
    d.setHours(d.getHours() - 1)
    return d
  }
  const { t } = useTranslation()
  const [anchorEl, setAnchorEl] = useState(null)
  const [nameValidationMessage, setNameValidationMessage] = useState('')
  const [urlValidationMessage, setUrlValidationMessage] = useState('')
  const [startTime, setStartTime] = useState(getDefaultStartTime())
  const [endTime, setEndTime] = useState(getDefaultEndTime())
  const [date, setDate] = useState(new Date())

  useEffect(() => {
    if (props.post.finalised) {
      props.toggleEditMode(!props.post.finalised)
    }
  }, [props.post.finalised]) //eslint-disable-line

  useEffect(() => {
    if (props.post.type === 'Meeting') {
      getMeetingTimesFromProps()
    }
  }, [props.post.type, props.post.id]) //eslint-disable-line

  const movePost = () => {
    closeOptionMenu()
    props.movePost()
  }

  const updateUrl = value => {
    const sanitizedUrl = sanitizeUrl(value)

    const postType = getPostType(sanitizedUrl, 'Web Link')

    if (isValidUrl(sanitizedUrl)) {
      return props.updateUrlHandler(sanitizedUrl, postType)
    }

    setUrlValidationMessage(props.t('commonValidationMessages.validHttpUrl'))

    return Promise.reject()
  }

  const getMeetingTimesFromProps = () => {
    let startDate = getARealDate(props.post.startTime)
    let startMinutes = getMinutes(props.post.startTime)
    if (props.post.startTime == null) {
      startDate = getDefaultStartTime()
      // startDate.setMinutes(startMinutes)
      // startDate = minusAnHour(startDate)
    }
    let endDate = getARealDate(props.post.endTime)
    let endMinutes = getMinutes(props.post.endTime)
    if (props.post.endTime == null) {
      // endDate.setMinutes(endMinutes)
      endDate = getDefaultEndTime()
    }
    let date = getARealDate(props.post.startTime)

    setStartTime(startDate)
    setEndTime(endDate)
    setDate(date)
    if (props.post.startTime != null || props.post.endTime !== null) {
      updateNoteDates(startDate, endDate)
    }
  }

  const clearNameValidation = () => setNameValidationMessage('')

  const clearUrlValidation = () => setUrlValidationMessage('')

  const getARealDate = value => {
    if (value instanceof Date) {
      return value
    }
    if (value === null) {
      return new Date()
    }
    try {
      return new Date(value)
    } catch {
      return new Date()
    }
  }

  const updateNoteDates = (start, end) => {
    props.updateTimes(start, end)
  }

  const updateMeetingDate = (key, value) => {
    const hrs = value.getHours()
    const mins = value.getMinutes()

    let date = getARealDate(value)
    const isStartTime = key === 'startTime'
    const isEndTime = key === 'endTime'
    const isDate = key === 'date'

    if (isDate) {
      date = value
    }
    let startDate = getARealDate(startTime)
    let startMinutes = getMinutes(startTime)
    if (props.post.startTime == null) {
      startDate.setMinutes(startMinutes)
      startDate = minusAnHour(startDate)
    }
    if (isStartTime) {
      startDate.setHours(hrs)
      startDate.setMinutes(mins)
    }

    let endDate = getARealDate(endTime)

    let endMinutes = getMinutes(endTime)
    if (endDate == null) {
      endDate.setMinutes(endMinutes)
    }
    if (isEndTime) {
      endDate.setHours(hrs)

      endDate.setMinutes(mins)
    }

    if (startDate.getTime() > endDate.getTime() && isStartTime) {
      endDate = new Date(startDate.getTime() + 60 * 60000)
    } else if (isEndTime && endDate.getTime() < startDate.getTime()) {
      startDate = new Date(endDate.getTime() - 60 * 60000)
    }
    if (isDate) {
      let year = date.getFullYear()
      let month = date.getMonth()
      let day = date.getDate()
      startDate.setFullYear(year, month, day)
      endDate.setFullYear(year, month, day)
    }
    setStartTime(startDate)
    setEndTime(endDate)
    setDate(date)

    updateNoteDates(startDate, endDate)
  }

  const updateName = value => {
    if (checkTextHasNonWhitespaceContent(value))
      return props.updateNameHandler(value)
    showFieldRequiredMessage()
    return Promise.reject()
  }

  const renderLinkUrlField = () =>
    props.post.url ? (
      <ReadEditUrlField
        url={props.post.url}
        validationMessage={urlValidationMessage}
        readOnly={props.post.finalised}
        onBlur={updateUrl}
        viewOnly={props.viewOnly}
        clearValidation={clearUrlValidation}
      />
    ) : null

  const showFieldRequiredMessage = () => {
    setNameValidationMessage(t('commonValidationMessages.requiredField'))
  }

  const openOptionMenu = event => setAnchorEl(event.currentTarget)

  const closeOptionMenu = () => setAnchorEl(null)

  const shouldDisplayOptionMenu = () => {
    if (props.viewOnly) {
      return false
    }
    return props.mobileView || props.isOverview ? false : true
  }

  const handlePostStatusChange = status => {
    props.updateFinalisedStatus(!status)
  }

  const convertPostHandler = () => {
    props.isTemplate
      ? props.actions.updateTemplatePost(
          props.template.template.id,
          props.templateTask.id,
          props.post.id,
          { type: props.post.type === null ? 'Meeting' : null },
          false
        )
      : props.actions.updatePost(
          props.project.matterId,
          props.project.id,
          props.task.id,
          props.post.id,
          { type: props.post.type === null ? 'Meeting' : null },
          false
        )
    closeOptionMenu()
  }

  const renderMenuContent = () =>
    props.isTemplate ? (
      <TemplateTaskPostOptionMenuContainer
        anchor={anchorEl}
        closeHandler={closeOptionMenu}
        movePost={movePost}
        convertPostHandler={convertPostHandler}
        viewOnly={props.viewOnly}
      />
    ) : (
      <TaskPostOptionMenuContainer
        anchor={anchorEl}
        makeVisible={() => {
          props.handlePostPrivacyChange(!props.post.privatePost)
        }}
        closeHandler={closeOptionMenu}
        convertPostHandler={convertPostHandler}
        showDraftMenuItems={true}
        movePost={movePost}
        isReadOnly={props.isReadOnly}
        viewOnly={props.viewOnly}
      />
    )

  const renderIcon = (post, selected) => {
    if (post.type) {
      return getPostTypeIcon(props.t, post)
    }
    return <BookIcon />
  }

  const isLink =
    props.post.type !== null && props.post.type !== NOTE_TYPES.MEETING
  const isembeddedUrl = [
    NOTE_TYPES.GOOGLE_SLIDES,
    NOTE_TYPES.GOOGLE_SHEET,
    NOTE_TYPES.GOOGLE_DOC,
    NOTE_TYPES.GOOGLE_FILE,
    NOTE_TYPES.MS_WORD,
    NOTE_TYPES.MS_EXCEL,
    NOTE_TYPES.MS_POWERPOINT,
    NOTE_TYPES.MS_VISIO,
    NOTE_TYPES.MS_ONEDRIVE,
    NOTE_TYPES.MS_ONENOTE,
    NOTE_TYPES.MIRO,
    NOTE_TYPES.FIGMA,
    NOTE_TYPES.ATLASSIAN,
  ].includes(props.post.type)

  const shouldShowToggle =
    isembeddedUrl &&
    (!props.post.finalised ||
      (props.post.finalised &&
        props.post.description !== null &&
        props.post.description !== '<p><br></p>'))

  return (
    <div className={props.classes.root}>
      <div className={props.classes.row}>
        <div className={props.classes.postDetailText}>
          <div
            className={props.classes.postDetailName}
            data-test="note-details-name"
          >
            <div className={props.classes.iconWrapper}>
              {renderIcon(props.post)}
            </div>
            <ReadEditField
              value={props.post.name}
              onBlur={updateName}
              maxLength={MAX_FIELD_LENGTHS.POST_NAME}
              variant="h6"
              multiline={false}
              autoWidth={true}
              validationMessage={nameValidationMessage}
              readOnly={props.isReadOnly || props.post.finalised}
              clearValidation={clearNameValidation}
              usageContext="NoteDetailsName"
              viewOnly={props.viewOnly}
              showEditIcon={
                !props.isReadOnly && !props.post.finalised && !props.viewOnly
              }
              fullWidthOnEdit={true}
            />

            {props.isOverview && <OpenInTaskDetailsButton post={props.post} />}
          </div>
        </div>
        {!props.isTemplate && <PostPeopleContainer viewOnly={props.viewOnly} />}
        {shouldDisplayOptionMenu() ? (
          <div className={props.classes.optionMenu}>
            <IconButton
              data-test="task-content-header-menu-button"
              onClick={openOptionMenu}
              size="large"
            >
              <MoreVert />
            </IconButton>
            <PostCloseButton
              isTemplate={props.isTemplate}
              template={props.template}
              templateTask={props.templateTask}
              project={props.project}
              task={props.task}
            />
            {renderMenuContent()}
          </div>
        ) : null}
      </div>
      {isLink && (
        <Tooltip
          title={
            props.viewOnly
              ? props.isTemplate
                ? props.t('templates.cannotEditProvided')
                : props.t('matter.viewOnly')
              : ''
          }
        >
          <div className={props.classes.linkNoteDiv}>
            {!isembeddedUrl && (
              <LinkTypeDropdown
                disabled={props.post.finalised || props.viewOnly}
                onChange={type => {
                  props.updateTypeHandler(type)
                }}
                value={props.post.type}
              />
            )}
            <div className={props.classes.urlDiv}>{renderLinkUrlField()}</div>
            {isembeddedUrl && shouldShowToggle && (
              <FormControlLabel
                className={props.classes.notesSwitch}
                control={
                  <Switch
                    data-test="show-notes-toggle"
                    checked={!props.showEmbededPost}
                    onChange={() =>
                      props.setShowEmbededPost(!props.showEmbededPost)
                    }
                  />
                }
                label={props.t('common.showNotes')}
              />
            )}
          </div>
        </Tooltip>
      )}
      <PostWorkflowBar
        post={props.post}
        handlePostStatusChange={handlePostStatusChange}
        isTemplate={props.isTemplate}
        isNotRequired={
          props.task.status === TASK_STATUS.NOT_REQUIRED ? true : false
        }
        handlePostPrivacyChange={props.handlePostPrivacyChange}
        viewOnly={props.viewOnly}
      />
      {props.post.type === NOTE_TYPES.ATLASSIAN && (
        <div className={props.classes.atlassianWrapper}>
          <Typography>{props.t('postDetails.atlassian')}</Typography>
          <Button
            className={props.classes.openLinkButton}
            variant="contained"
            onClick={() => window.open(props.post.url, '_blank').focus()}
            endIcon={<OpenInNewIcon />}
          >
            <Typography
              variant="caption"
              className={props.classes.openLinkButtonText}
            >
              {props.t('postDetails.openLink')}
            </Typography>
          </Button>
        </div>
      )}
      {props.post.type === 'Meeting' && (
        <MeetingNoteDetails
          update={updateMeetingDate}
          startTime={startTime}
          endTime={endTime}
          date={date}
          viewOnly={props.viewOnly}
        />
      )}
    </div>
  )
}

PostDetailHeader.propTypes = {
  /** Note that is being displayed */
  post: PropTypes.object.isRequired,
  /** Handler for updating name of the note */
  updateNameHandler: PropTypes.func.isRequired,
  /** Handler for updating url of the link */
  updateUrlHandler: PropTypes.func.isRequired,
  /** Flag to render mobile view */
  mobileView: PropTypes.bool,
  /** Flag to render task details link */
  isOverview: PropTypes.bool,
  /** Flag to indicate if Template or not */
  isTemplate: PropTypes.bool,
  /** Handler for updating the edit mode */
  toggleEditMode: PropTypes.func.isRequired,
}

const mapDispatchToProps = dispatch => ({
  actions: {
    setInitialContentItemSelection: bindActionCreators(
      setInitialContentItemSelection,
      dispatch
    ),
    updatePost: bindActionCreators(updatePost, dispatch),
    updateTemplatePost: bindActionCreators(updateTemplatePost, dispatch),
    showSnackbar: bindActionCreators(showSnackbar, dispatch),
  },
})

const mapStateToProps = (state, ownProps) => {
  const { isTemplate } = ownProps
  return {
    isAutoSaving: isTemplate
      ? state.templateTaskPostList.postDetails.isAutoSaving
      : state.selectedTaskPostList.postDetails.isAutoSaving,
    isSaving: isTemplate
      ? state.templateTaskPostList.postDetails.isSaving
      : state.selectedTaskPostList.postDetails.isSaving,
    editMode: isTemplate
      ? state.templateTaskPostList.postDetails.editMode
      : state.selectedTaskPostList.postDetails.editMode,
    lastSaved: isTemplate
      ? state.templateTaskPostList.postDetails.lastSaved
      : state.selectedTaskPostList.postDetails.lastSaved,
    changesUnsaved: isTemplate
      ? state.templateTaskPostList.postDetails.changesUnsaved
      : state.selectedTaskPostList.postDetails.changesUnsaved,
    project: state.project,
    template: state.template,
    templateTask: state.selectedTemplateTask,
    task: state.selectedTask,
    matterDetails: state.matterDetails,
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withTranslation()(withStyles(PostDetailHeader, styles)))
