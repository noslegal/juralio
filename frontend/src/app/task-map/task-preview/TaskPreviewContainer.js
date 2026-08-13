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

import { useMediaQuery } from '@mui/material'
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router'
import { makeStyles } from 'tss-react/mui'
import {
  getMatterIdFromLocation,
  getProjectIdFromLocation,
  getTaskDetailsUrl,
} from '../../../components/navigation/common/location-context-helper'
import {
  fetchTaskmapContent,
  replaceTask,
} from '../../../redux/ducks/improved-taskmap'
import { closePreview } from '../../../redux/ducks/improved-taskmap-interactions'
import { sendTextToClipboard } from '../../../services/clipboard/clipboard-service'
import { isInImprovedTaskmapContext } from '../../../services/helpers/route/route-context-helper'
import { getSiblingTaskCount } from '../../../services/helpers/task/task-util-helper'
import { checkIfPrivateWorkstreamMember } from '../../../services/helpers/user/user-roles-helper'
import withRouter from '../../../services/navigation/WithRouter'
import postService from '../../../services/post/post-service'
import taskService from '../../../services/task/task-service'
import { clearTour } from '../../../services/tour/tour-actions'
import juralioColours from '../../../theme/juralio-colours'
import juralioTheme from '../../../theme/juralio-theme'
import { ACTIVITIES } from '../../constants'
import { showSnackbar } from '../../global-snackbar/global-snackbar-actions'
import { fetchMatterDetails } from '../../matter-details/matter-details-actions'
import { fetchProjectWithPostsAndTaskTeam } from '../../project/project-actions'
import {
  hideTaskPreview,
  updatePreviewTaskTeam,
} from '../../task-details/task-actions'
import {
  fetchTaskDetails,
  updateTaskDetails,
} from '../selected-task/selected-task-actions'
import {
  addTaskTeamMember,
  deleteTaskTeamMember,
} from '../selected-task/selected-task-team-actions'
import TaskPreview from './TaskPreview'

const styles = makeStyles()(theme => ({
  mask: {
    backgroundColor: juralioColours.taskPreview.mask,
    height: '100%',
    width: '100%',
    zIndex: theme.zIndex.appBar - 2,
    position: 'absolute',
  },
  roadmapMask: {
    backgroundColor: juralioColours.taskPreview.mask,
    width: '100%',
    height: '100%',
    zIndex: theme.zIndex.appBar - 2,
    position: 'absolute',
    top: '0px',
  },
  recentMask: {
    backgroundColor: juralioColours.taskPreview.mask,
    width: '100%',
    height: `calc(100% - ${theme.spacing(9)})`,
    top: theme.spacing(9),
    zIndex: theme.zIndex.appBar - 2,
    position: 'absolute',
  },
}))

const TaskPreviewContainer = props => {
  const selectedTaskId = useSelector(state => state.taskmap.selectedTask?.id)

  let isViewOnly = useSelector(state => state.taskmap.viewOnly)
  if (props.viewOnly) {
    isViewOnly = props.viewOnly
  }

  const selectedTaskTeam = useSelector(state => state.selectedTask?.teamMembers)
  const selectedTask = useSelector(state => state.selectedTask)
  const position = useSelector(state => state.taskmap.previewPosition)
  const project = useSelector(state => state.project)
  const matterDetails = useSelector(state => state.matterDetails.matter)

  const team = useSelector(state => state.matterTeam.mainPage.team)
  const { t } = useTranslation()
  const location = useLocation()

  const { classes } = styles()
  const dispatch = useDispatch()
  const [task, setTask] = useState(null)
  const [posts, setPosts] = useState(null)
  const [anchor, setAnchor] = useState(null)
  const [renameAnchor, setRenameAnchor] = useState(null)
  const [showPostFlow, setShowPostFlow] = useState(false)
  const [showSubMenu, setShowSubMenu] = useState(false)
  const [type, setType] = useState(null)
  const [postAnchor, setPostAnchor] = useState(null)
  const [siblingTaskCount, setSiblingTaskCount] = useState(null)

  const matterId = props.forceFetch
    ? selectedTask.matterId
    : getMatterIdFromLocation(location)

  useEffect(() => {
    if (matterId && props.forceFetch) {
      dispatch(fetchMatterDetails(matterId, true))
    }
  }, [dispatch, props.forceFetch, matterId])
  const projectId = project ? project.id : getProjectIdFromLocation(location)

  useEffect(() => {
    if (!selectedTaskId) return
    taskService
      .getTaskById(matterId, projectId, selectedTaskId, true)
      .then(res => {
        if (res.status === 200) {
          setTask(res.body)
        }
      })

    taskService
      .getTaskSiblings(matterId, projectId, selectedTaskId)
      .then(res => {
        if (res.status === 200) {
          setSiblingTaskCount(getSiblingTaskCount(res.body))
        }
      })

    postService
      .getPostsByTaskId(matterId, projectId, selectedTaskId, true, 3)
      .then(res => {
        if (res.status === 200) {
          setPosts(res.body)
        }
      })
  }, [location, selectedTaskId, project.tasks, matterId, projectId, dispatch])

  useEffect(() => {
    if (selectedTaskId) {
      dispatch(fetchTaskDetails(matterId, projectId, selectedTaskId))
    }
  }, [dispatch, matterId, projectId, location, selectedTaskId])

  useEffect(() => {
    return () => {
      dispatch(hideTaskPreview())
      dispatch(fetchProjectWithPostsAndTaskTeam(matterId, projectId))
      dispatch(clearTour())
    } //cleanup
  }, []) //eslint-disable-line

  const isMobileView = useMediaQuery(juralioTheme.breakpoints.down('md'))

  if (props.forceFetch && matterDetails?.id !== selectedTask.matterId) {
    return null
  }

  const renameTask = name => {
    dispatch(updateTaskDetails(matterId, projectId, selectedTaskId, { name }))
  }

  const handleRemoveUser = (user, tree = false) => {
    dispatch(
      deleteTaskTeamMember(matterId, projectId, selectedTaskId, user, tree)
    )
  }

  if (!task || !posts || !selectedTaskId) {
    return null
  }

  const isMatterAdmin =
    matterDetails && matterDetails.activities[0] === ACTIVITIES.MATTER_ADMIN

  const isMatterEditor =
    matterDetails &&
    matterDetails.activities.indexOf(ACTIVITIES.MATTER_TEAM_MEMBER) > -1

  if (project.isPrivate) {
    selectedTaskTeam.map(member => {
      member.isActiveOnWorkstream = checkIfPrivateWorkstreamMember(
        project,
        member
      )
      return member
    })
  }

  const refetchTask = () => {
    taskService
      .getTaskById(matterId, projectId, selectedTaskId, true)
      .then(res => {
        if (res.status === 200) {
          setTask(res.body)
          dispatch(replaceTask(res.body))
        }
      })
  }
  const addToAllSubtasks = user => {
    dispatch(
      addTaskTeamMember(matterId, projectId, selectedTaskId, user, true)
    ).then(() => {
      dispatch(fetchProjectWithPostsAndTaskTeam(matterId, projectId))
      taskService
        .getTaskById(matterId, projectId, selectedTaskId, true)
        .then(res => {
          if (res.status === 200) {
            setTask(res.body)
            dispatch(replaceTask(res.body))
            dispatch(updatePreviewTaskTeam(res.body.teamMembers))
          }
        })
    })
  }
  return (
    <div
      className={
        props.isRoadmap
          ? classes.roadmapMask
          : props.forceFetch
            ? classes.recentMask
            : classes.mask
      }
      style={{
        minHeight: `${
          props.isTaskmap
            ? document.getElementById('improved-taskmap-wrapper')
                ?.scrollHeight + 117
            : document.getElementById('improved-taskmap')?.clientHeight
        }px`,
        minWidth: `${
          props.isTaskmap
            ? document.getElementById('improved-taskmap-wrapper')?.scrollWidth
            : document.getElementById('improved-taskmap')?.clientWidth
        }px`,
      }}
      onClick={() => {
        if (isInImprovedTaskmapContext()) {
          dispatch(fetchTaskmapContent(matterId, projectId))
          dispatch(closePreview())
        }
        dispatch(hideTaskPreview())
      }}
    >
      <TaskPreview
        handleRemoveUser={handleRemoveUser}
        position={position}
        task={task}
        siblingTaskCount={siblingTaskCount}
        matterId={matterId}
        isMobile={isMobileView}
        viewOnly={isViewOnly}
        projectId={projectId}
        project={project}
        posts={posts}
        onClose={() => {
          if (isInImprovedTaskmapContext()) {
            dispatch(fetchTaskmapContent(matterId, projectId))
            dispatch(closePreview())
          }

          dispatch(hideTaskPreview())
        }}
        onOptionsClick={e => {
          setAnchor(e.target)
        }}
        closeOptionsMenu={() => {
          setAnchor(null)
        }}
        isMatterAdmin={isMatterAdmin}
        menuAnchor={anchor}
        isTemplate={window.location.href.includes('/template')}
        renameAnchor={renameAnchor}
        closeRename={() => setRenameAnchor(null)}
        renameTask={renameTask}
        isMatterEditor={isMatterEditor}
        openRename={target => {
          setRenameAnchor(target)
          setAnchor(null)
          refetchTask()
        }}
        addTeamMember={user => {
          dispatch(
            addTaskTeamMember(
              matterId,
              projectId,
              selectedTaskId,
              user.user,
              false,
              selectedTask?.tasks?.length > 0
            )
          ).then(() => {
            taskService
              .getTaskById(matterId, projectId, selectedTaskId, true)
              .then(res => {
                if (res.status === 200) {
                  setTask(res.body)
                  dispatch(updatePreviewTaskTeam(res.body.teamMembers))
                }
              })
          })
        }}
        addToAllSubtasks={addToAllSubtasks}
        addPost={e => {
          setPostAnchor(e.target)
          setShowSubMenu(true)
        }}
        copyRefNumber={() => {
          sendTextToClipboard(
            window.location.href.split('#')[0] +
              '#' +
              getTaskDetailsUrl(matterId, projectId, task.id)
          )
          dispatch(showSnackbar(t('taskDetails.urlOfTaskCopiedToClipbard')))
        }}
        teamSize={matterDetails?.team}
        availableTeam={team}
        showPostFlow={showPostFlow}
        showSubMenu={showSubMenu}
        type={type}
        hidePostFlow={() => setShowPostFlow(false)}
        closeSubMenu={() => setShowSubMenu(false)}
        setType={type => {
          setType(type)
          setShowSubMenu(false)
          setShowPostFlow(true)
        }}
        postAnchor={postAnchor}
        taskTeam={selectedTaskTeam ? selectedTaskTeam : task.teamMembers}
        forceUpdatePreview={() => {
          refetchTask()
        }}
      />
    </div>
  )
}

export default withRouter(TaskPreviewContainer)
