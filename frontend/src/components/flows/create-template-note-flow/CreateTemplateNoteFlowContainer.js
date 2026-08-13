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

import InfoIcon from '@mui/icons-material/Info'
import ArrowDropDownIcon from '@mui/icons-material/ArrowDropDown'
import InsertDriveFileIcon from '@mui/icons-material/InsertDriveFile'
import NoteAddIcon from '@mui/icons-material/NoteAdd'
import {
  Button,
  CircularProgress,
  ListItemIcon,
  Menu,
  MenuItem,
  Tooltip,
  Typography,
} from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { connect, useDispatch } from 'react-redux'
import { bindActionCreators } from 'redux'
import { makeStyles } from 'tss-react/mui'
import { getCurrentOrganisation } from '../../../admin/organisations/organisation-actions'
import { MAX_FIELD_LENGTHS, NOTE_TYPES } from '../../../app/constants'
import { createTemplatePost } from '../../../app/task-details/task-card-content/task-notes/template-task-post-actions'
import { updateSelectedTaskLastUpdated } from '../../../app/task-map/selected-task/selected-task-actions'
import { fetchTemplateOverviewWithPosts } from '../../../app/template/template-actions'
import GoogleDriveIcon from '../../../assets/images/GoogleDriveIcon'
import { getPostType } from '../../../helpers/post-helpers'
import { getLocationParams } from '../../../services/helpers/route/route-helper'
import withRouter from '../../../services/navigation/WithRouter'
import rawColours from '../../../theme/raw-colours'
import {
  createDriveDoc,
  isGoogleDriveConfigured,
  loadPicker,
} from '../../dialog/google-drive/google_drive_dialog'
import { getTemplateTaskPostUrl } from '../../navigation/common/location-context-helper'
import CreateNoteFlow from '../create-note-flow/CreateNoteFlow'
import UrlInput from '../create-note-flow/UrlInput'

const POST = 'Post'

const startTime = undefined
const endTime = undefined

const useStyles = makeStyles()(theme => ({
  googleDriveButton: {
    marginTop: theme.spacing(2),
  },
  googleErrorState: {
    color: rawColours.primary.red.primary,
    marginTop: theme.spacing(),
    marginLeft: theme.spacing(),
    marginRight: theme.spacing(),
  },
  googleErrorStateWrapper: {
    display: 'flex',
  },
  googleErrorStateInfo: {
    marginTop: theme.spacing(0.5),
  },
  driveButtonContainer: {
    display: 'flex',
    position: 'absolute',
    marginTop: '100px',
  },
  driveButton: {
    marginTop: 'auto',
    marginBottom: 'auto',
    height: '42px',
    marginRight: '10px',
  },
  driveButtonLabel: {
    marginLeft: '8px',
  },
  googleDriveErrorTooltip: {
    whiteSpace: 'pre-line',
  },
}))

const CreateTemplateNoteFlowContainer = props => {
  const { t } = useTranslation()
  const { classes } = useStyles()
  const dispatch = useDispatch()

  const [showDestinationDialog, setShowDestinationDialog] = useState(false)
  const [noteName, setNoteName] = useState('')
  const postType = props.type ? props.type : POST

  const [url, setUrl] = useState('')
  const [isValidUrl, setIsValidUrl] = useState(true)
  const [showLoadingBar, setShowLoadingBar] = useState(false)
  const [loadingText, setLoadingText] = useState('')
  const [googleDriveEnabled, setGoogleDriveEnabled] = useState(false)
  const [googleErrorState, setGoogleErrorState] = useState(false)
  const [driveMenuAnchor, setDriveMenuAnchor] = useState(null)
  const [driveLoading, setDriveLoading] = useState(false)

  useEffect(() => {
    if (postType === NOTE_TYPES.WEB || postType === NOTE_TYPES.DOCUMENT) {
      dispatch(getCurrentOrganisation()).then(res => {
        setGoogleDriveEnabled(res.organisation.googleDriveEnabled)
      })
    }
  }, [postType]) // eslint-disable-line

  const displayDestinationDialog = name => {
    setShowDestinationDialog(true)
    setNoteName(name)
  }

  const showLoading = () => {
    setShowLoadingBar(true)
    setLoadingText(
      t('createNoteFlow.creatingLoadingText', {
        type: postType.toLowerCase(),
      })
    )
  }

  const createNote = (templateId, templateTaskId) => {
    const updatedPostType = getPostType(url, postType)
    showLoading()
    props.actions
      .createTemplatePost(
        templateId,
        templateTaskId,
        noteName,
        false,
        updatedPostType,
        url,
        startTime,
        endTime
      )
      .then(response => {
        props.cancelHandler()
        props.router.navigate(
          getTemplateTaskPostUrl(
            templateId,
            templateTaskId,
            response.createdPost.id
          )
        )
      })
  }

  const createTemplateNoteInContext = name => {
    showLoading()
    const updatedPostType = getPostType(url, postType)
    const templateId = getLocationParams('template')
    const taskId = getLocationParams('task')
    props.actions
      .createTemplatePost(
        templateId,
        taskId,
        name,
        false,
        updatedPostType,
        url,
        startTime,
        endTime
      )
      .then(response => {
        props.actions.updateSelectedTaskLastUpdated(
          response.createdPost?.lastUpdated
        )
        props.cancelHandler()
        props.router.navigate(
          getTemplateTaskPostUrl(templateId, taskId, response.createdPost.id)
        )
      })
  }

  const handleCancel = e => {
    if (showDestinationDialog) {
      setShowDestinationDialog(false)
    } else {
      props.cancelHandler(e)
    }
  }

  const gapiCallback = data => {
    setDriveLoading(false)
    if (data.error) {
      setGoogleErrorState(true)
    } else if (data.action === window.google.picker.Action.CANCEL) {
      if (document.querySelector("div[data-test='juralio-dialog']") !== null) {
        // display the juralio dialog again after closing the picker
        document.querySelector(
          "div[data-test='juralio-dialog']"
        ).style.display = 'unset'
      }
    } else if (data.action === window.google.picker.Action.PICKED) {
      if (document.querySelector("div[data-test='juralio-dialog']") !== null) {
        document.querySelector(
          "div[data-test='juralio-dialog']"
        ).style.display = 'unset'
      }

      setNoteName(data.docs[0].name.substring(0, MAX_FIELD_LENGTHS.POST_NAME))
      setUrl(data.docs[0].url.substring(0, MAX_FIELD_LENGTHS.URL))
    }
  }

  return (
    <CreateNoteFlow
      {...props}
      cancelHandler={handleCancel}
      createNote={createNote}
      displayDestinationDialog={displayDestinationDialog}
      createNoteInContext={createTemplateNoteInContext}
      showDestinationDialog={showDestinationDialog}
      isTemplate={true}
      additionalFields={
        postType === NOTE_TYPES.WEB || postType === NOTE_TYPES.DOCUMENT ? (
          <>
            <UrlInput url={url} changeUrl={setUrl} isValidUrl={setIsValidUrl} />
            {googleDriveEnabled && isGoogleDriveConfigured && (
              <div className={classes.driveButtonContainer}>
                <Button
                  data-test="add-from-drive-button"
                  variant="outlined"
                  color="primary"
                  disabled={googleErrorState || driveLoading}
                  endIcon={driveLoading ? null : <ArrowDropDownIcon />}
                  onClick={e => setDriveMenuAnchor(e.currentTarget)}
                  className={classes.driveButton}
                >
                  {driveLoading ? (
                    <CircularProgress size={18} />
                  ) : (
                    <>
                      <GoogleDriveIcon size={18} />
                      <span className={classes.driveButtonLabel}>
                        {t('createNoteFlow.addFromDrive')}
                      </span>
                    </>
                  )}
                </Button>
                <Menu
                  anchorEl={driveMenuAnchor}
                  open={Boolean(driveMenuAnchor)}
                  onClose={() => setDriveMenuAnchor(null)}
                >
                  <MenuItem
                    onClick={() => {
                      setDriveMenuAnchor(null)
                      setDriveLoading(true)
                      loadPicker(gapiCallback)
                    }}
                  >
                    <ListItemIcon>
                      <InsertDriveFileIcon fontSize="small" />
                    </ListItemIcon>
                    {t('createNoteFlow.pickExistingFile')}
                  </MenuItem>
                  <MenuItem
                    onClick={() => {
                      setDriveMenuAnchor(null)
                      setDriveLoading(true)
                      createDriveDoc(
                        gapiCallback,
                        noteName ||
                          `${new Date().toLocaleDateString('en-CA')} Document`
                      )
                    }}
                  >
                    <ListItemIcon>
                      <NoteAddIcon fontSize="small" />
                    </ListItemIcon>
                    {t('createNoteFlow.newGoogleDoc')}
                  </MenuItem>
                </Menu>
              </div>
            )}
            {googleErrorState && (
              <div className={classes.googleErrorStateWrapper}>
                <Typography className={classes.googleErrorState}>
                  {t('createNoteFlow.unableToAccessGoogleDrive')}
                </Typography>
                <Tooltip
                  title={
                    <div className={classes.googleDriveErrorTooltip}>
                      {t('createNoteFlow.googleDriveErrorTips')}
                    </div>
                  }
                >
                  <InfoIcon className={classes.googleErrorStateInfo} />
                </Tooltip>
              </div>
            )}
          </>
        ) : (
          <></>
        )
      }
      type={postType}
      noteName={noteName}
      showLoadingBar={showLoadingBar}
      loadingText={loadingText}
      inContext={props.taskId !== undefined}
      disableSubmit={
        !isValidUrl ||
        ((postType === NOTE_TYPES.WEB || postType === NOTE_TYPES.DOCUMENT) &&
          url.length === 0)
      }
    />
  )
}

function mapStateToProps(state) {
  return {
    parentTask: state.selectedTemplateTask,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      createTemplatePost: bindActionCreators(createTemplatePost, dispatch),
      updateSelectedTaskLastUpdated: bindActionCreators(
        updateSelectedTaskLastUpdated,
        dispatch
      ),
      fetchTemplateOverviewWithPosts: bindActionCreators(
        fetchTemplateOverviewWithPosts,
        dispatch
      ),
    },
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(withRouter(CreateTemplateNoteFlowContainer))
