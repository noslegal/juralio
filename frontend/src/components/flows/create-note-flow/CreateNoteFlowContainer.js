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
import { connect, useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { bindActionCreators } from 'redux'
import { makeStyles } from 'tss-react/mui'
import { getCurrentOrganisation } from '../../../admin/organisations/organisation-actions'
import {
  ACTIVITIES,
  MAX_FIELD_LENGTHS,
  NOTE_TYPES,
  TASK_STATUS,
} from '../../../app/constants'
import { fetchProjectWithPosts } from '../../../app/project/project-actions'
import { createPost } from '../../../app/task-details/task-card-content/task-notes/task-posts-actions'
import { updateSelectedTaskLastUpdated } from '../../../app/task-map/selected-task/selected-task-actions'
import GoogleDriveIcon from '../../../assets/images/GoogleDriveIcon'
import { getPostType, POST } from '../../../helpers/post-helpers'
import { useIsViewOnly } from '../../../hooks/matter/viewer/matter-viewer-hooks'
import { getLocationParams } from '../../../services/helpers/route/route-helper'
import { webLinkCreate } from '../../../services/tour/steps/web-link-create-steps'
import {
  clearTour,
  setAvailableTours,
  setTour,
} from '../../../services/tour/tour-actions'
import tourService from '../../../services/tour/tour-service'
import juralioColours from '../../../theme/juralio-colours'
import rawColours from '../../../theme/raw-colours'
import {
  createDriveDoc,
  isGoogleDriveConfigured,
  loadPicker,
} from '../../dialog/google-drive/google_drive_dialog'
import { getWorkstreamTaskPostUrl } from '../../navigation/common/location-context-helper'
import CreateNoteFlow from './CreateNoteFlow'
import UrlInput from './UrlInput'

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
  miroDriveReminder: {
    color: juralioColours.darkText.disabled,
    marginTop: '8px',
    fontStyle: 'italic',
  },
  driveButtonContainer: {
    display: 'flex',
    position: 'absolute',
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

const CreateNoteFlowContainer = props => {
  const { t } = useTranslation()
  const { classes } = useStyles()
  const dispatch = useDispatch()
  const tours = useSelector(state => state.tour.tours)
  const currentTour = useSelector(state => state.tour.currentTour)
  const matter = useSelector(state => state.matterDetails.matter)
  const parentTask = useSelector(state => state.selectedTask)

  const [showDestinationDialog, setShowDestinationDialog] = useState(false)
  const [autoCreateNote, setAutoCreateNote] = useState(false)
  const [createAsPrivate, setCreateAsPrivate] = useState(false)
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
  const history = useNavigate()
  const isMatterViewer = useIsViewOnly(matter)

  useEffect(() => {
    if (postType === NOTE_TYPES.WEB || postType === NOTE_TYPES.DOCUMENT) {
      dispatch(getCurrentOrganisation()).then(res => {
        setGoogleDriveEnabled(res.organisation.googleDriveEnabled)
      })
    }

    if (postType === NOTE_TYPES.BLANK || postType === NOTE_TYPES.MEETING) {
      if (props?.parentTask?.id === undefined) {
        displayDestinationDialog(generateNoteName())
      } else if (
        props?.parentTask?.id !== undefined &&
        parentTask.status !== TASK_STATUS.NOT_REQUIRED &&
        !autoCreateNote &&
        !matter?.activities.includes(ACTIVITIES.MATTER_VIEWER)
      ) {
        setAutoCreateNote(true)
        createNoteInContext(generateNoteName(), false)
      }
    }
  }, []) // eslint-disable-line

  useEffect(() => {
    const sessionTours = JSON.parse(
      window.sessionStorage.getItem('juralio_tours')
    )
    const isLink =
      postType === NOTE_TYPES.WEB || postType === NOTE_TYPES.DOCUMENT
    const hiddenForSession = sessionTours && sessionTours['weblinkCreate']
    if (
      !tours.weblinkCreate &&
      !hiddenForSession &&
      !props.isMobile &&
      isLink
    ) {
      dispatch(setTour('weblinkCreate', webLinkCreate(t, closeTourForever)))
    } else if (currentTour === 'weblinkCreate') {
      dispatch(clearTour())
    }
  }, []) //eslint-disable-line

  const closeTourForever = () => {
    tourService.completeTour('weblinkCreate').then(() => {
      dispatch(clearTour())
      tourService.getTours().then(res => {
        if (res.status === 200) {
          dispatch(setAvailableTours(res.body))
        }
      })
    })
  }
  useEffect(() => {
    return () => dispatch(clearTour())
  }, []) //eslint-disable-line

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

  const createNote = (matterId, projectId, taskId) => {
    const updatedPostType = getPostType(url, postType)
    showLoading()
    props.actions
      .createPost(
        matterId,
        projectId,
        taskId,
        noteName,
        createAsPrivate,
        updatedPostType,
        url,
        startTime,
        endTime
      )
      .then(response => {
        props.cancelHandler()
        history({
          pathname: getWorkstreamTaskPostUrl(
            matterId,
            projectId,
            taskId,
            response.createdPost.id
          ),
          state: {
            openInEditMode:
              postType === NOTE_TYPES.BLANK || postType === NOTE_TYPES.MEETING,
          },
        })
      })
  }

  const createNoteInContext = (name, showLoadingBar = true) => {
    if (showLoadingBar) showLoading()

    const matterId = props.matterId
      ? props.matterId
      : getLocationParams('matter')
    const projectId = props.projectId
      ? props.projectId
      : getLocationParams('workstream')
    const updatedPostType = getPostType(url, postType)
    const taskId = props.taskId ? props.taskId : getLocationParams('task')

    props.actions
      .createPost(
        matterId,
        projectId,
        taskId,
        name,
        createAsPrivate,
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

        history({
          pathname: getWorkstreamTaskPostUrl(
            matterId,
            projectId,
            taskId,
            response.createdPost.id
          ),
          state: {
            openInEditMode:
              postType === NOTE_TYPES.BLANK || postType === NOTE_TYPES.MEETING,
          },
        })
      })
  }

  const handleCancel = e => {
    if (showDestinationDialog) {
      setShowDestinationDialog(false)
      if (postType === NOTE_TYPES.BLANK || postType === NOTE_TYPES.MEETING) {
        props.cancelHandler(e)
      }
    } else {
      props.cancelHandler(e)
    }
  }

  const gapiCallback = data => {
    setDriveLoading(false)
    if (data.error) {
      setGoogleErrorState(true)
    } else if (data.action === window.google.picker.Action.CANCEL) {
      // display the juralio dialog again after closing the picker
      if (document.querySelector("div[data-test='juralio-dialog']") !== null) {
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

  const toggleCreateAsPrivate = () => setCreateAsPrivate(!createAsPrivate)

  const generateNoteName = () =>
    `${new Date().toLocaleDateString('en-CA')} ${
      props.type === NOTE_TYPES.BLANK ? 'Note' : 'Meeting'
    }`

  return (
    <CreateNoteFlow
      {...props}
      cancelHandler={handleCancel}
      createNote={createNote}
      displayDestinationDialog={displayDestinationDialog}
      createNoteInContext={createNoteInContext}
      toggleCreateAsPrivate={toggleCreateAsPrivate}
      showDestinationDialog={showDestinationDialog}
      createAsPrivate={createAsPrivate}
      additionalFields={
        postType === NOTE_TYPES.WEB || postType === NOTE_TYPES.DOCUMENT ? (
          <>
            <UrlInput url={url} changeUrl={setUrl} isValidUrl={setIsValidUrl} />
            {!url && (
              <Typography className={classes.miroDriveReminder}>
                {t('createNoteFlow.miroDriveReminder')}
              </Typography>
            )}
            {googleDriveEnabled && isGoogleDriveConfigured && (
              <div
                className={classes.driveButtonContainer}
                style={{
                  marginTop:
                    (props.taskId
                      ? props.taskId
                      : getLocationParams('task')) !== undefined
                      ? '150px'
                      : '100px',
                }}
              >
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
      isMatterViewer={isMatterViewer}
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
      parentTask={parentTask}
      autoCreateNote={autoCreateNote}
    />
  )
}

function mapStateToProps(state) {
  return {
    parentTask: state.selectedTask,
  }
}

function mapDispatchToProps(dispatch) {
  return {
    actions: {
      createPost: bindActionCreators(createPost, dispatch),
      updateSelectedTaskLastUpdated: bindActionCreators(
        updateSelectedTaskLastUpdated,
        dispatch
      ),
      fetchProjectWithPosts: bindActionCreators(
        fetchProjectWithPosts,
        dispatch
      ),
    },
  }
}

export default connect(
  mapStateToProps,
  mapDispatchToProps
)(CreateNoteFlowContainer)
