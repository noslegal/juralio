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
import React, { useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { connect, useDispatch, useSelector } from 'react-redux'
import { useLocation } from 'react-router'
import { bindActionCreators } from 'redux'
import { TASK_MENU_CONTEXT, TASK_STATUS } from '../../../../app/constants'
import TaskBlockerAlert from '../../../../components/data-display/task-blocker-alert/TaskBlockerAlert'
import {
  getTaskIdFromLocation,
  isInTaskDetails,
} from '../../../../components/navigation/common/location-context-helper'
import {
  fetchTaskmapStructure,
  replaceTask,
} from '../../../../redux/ducks/improved-taskmap'
import { hiddenTaskSteps } from '../../../../services/tour/steps/hidden-task-steps'
import {
  clearTour,
  setAvailableTours,
  setTour,
} from '../../../../services/tour/tour-actions'
import tourService from '../../../../services/tour/tour-service'
import { formatUserDisplayName } from '../../../../services/user/helper/user-format-service'
import { displayConfirmationDialog } from '../../../global-confirmation-dialog/global-confirmation-dialog-actions'
import { displaySnackbar } from '../../../global-snackbar/global-snackbar-actions'
import {
  fetchProject,
  fetchProjectOverview,
  fetchProjectWithPostsAndTaskTeam,
} from '../../../project/project-actions'
import {
  fetchTaskDetails,
  RECEIVE_TASK_SUCCESS,
  startEditingTaskName,
  updateProjectSubtasks,
  updateTaskDeliverable,
  updateTaskDetails,
  updateTaskMilestone,
  updateTaskSubtasks,
} from '../../../task-map/selected-task/selected-task-actions'
import { fetchTaskPosts } from '../../task-card-content/task-notes/task-posts-actions'
import TaskDownloadDialog from './TaskDownloadDialog'
import TaskMenu from './TaskMenu'
const getSnackbarNotRequiredChangesText = (t, subtaskChanges) => {
  let snackbarText = ''
  if (subtaskChanges === 0) {
    snackbarText = t('taskStatusChange.singleTaskNotRequired')
  } else if (subtaskChanges === 1) {
    snackbarText = t('taskStatusChange.singleSubTaskNotRequired')
  } else if (subtaskChanges > 1) {
    snackbarText = t('taskStatusChange.multipleSubTasksNotRequired', {
      count: subtaskChanges,
    })
  }
  return snackbarText
}
const getUpdatedSubtaskCount = response => {
  return response.task
    ? response.task.updateMeta?.subtasksUpdated
    : response.project.updateMeta?.subtasksUpdated
}
const TaskMenuContainer = props => {
  const { t } = useTranslation()
  const dispatch = useDispatch()
  const project = useSelector(state => state.project)
  const tours = useSelector(state => state.tour.tours)
  const matterDetails = useSelector(state => state.matterDetails?.matter)
  const statusDone = useSelector(state => state.taskMapFilter.statusDone)
  const task = useSelector(state => state.selectedTask)
  const posts = useSelector(state => state.selectedTaskPostList.postList)
  const location = useLocation()
  const currentUser = useSelector(state => state.auth.data.details)
  const statusNotStarted = useSelector(
    state => state.taskMapFilter.statusNotStarted
  )
  const [showDownloadDialog, setShowDownloadDialog] = useState(false)
  useEffect(() => {
    dispatch(
      fetchTaskPosts(props.matterId, props.task.projectId, props.task.id)
    )
    return () => dispatch(clearTour())
  }, []) //eslint-disable-line
  const updateHandler = (newTaskStatus, statusChanged) => {
    if (!statusChanged) {
      props.closeHandler()
      return
    } else if (props.taskMenuContext === TASK_MENU_CONTEXT.SUBTASK_PANEL) {
      return updateSubtaskInPanel(props, newTaskStatus, t, dispatch)
    } else {
      return updateTask(props, newTaskStatus, t, dispatch, tours)
    }
  }
  const closeTourForever = () => {
    tourService.completeTour('hiddenTask').then(() => {
      dispatch(clearTour())
      tourService.getTours().then(res => {
        if (res.status === 200) {
          dispatch(setAvailableTours(res.body))
        }
      })
    })
  }
  const updateTask = (props, newTaskStatus, t, dispatch, tours) => {
    const maintainTaskConsistencyUpdate = false
    return props.actions
      .updateTaskDetails(
        props.matterId,
        props.task.projectId,
        props.task.id,
        {
          status: newTaskStatus,
        },
        maintainTaskConsistencyUpdate
      )
      .then(response => {
        props.closeHandler()
        dispatch(replaceTask(response.task))
        if (response.task?.status === TASK_STATUS.NOT_REQUIRED) {
          const snackbarText = getSnackbarNotRequiredChangesText(
            t,
            getUpdatedSubtaskCount(response)
          )
          dispatch(displaySnackbar(snackbarText))
        }

        if (
          (props.taskMenuContext === TASK_MENU_CONTEXT.ROADMAP ||
            props.taskMenuContext === TASK_MENU_CONTEXT.TASK_MAP) &&
          response.type === RECEIVE_TASK_SUCCESS
        ) {
          if (newTaskStatus === TASK_STATUS.NOT_STARTED && !statusNotStarted) {
            dispatch(
              displaySnackbar(
                t('filter.hiddenStatusSnackbar', {
                  Status: t('taskStatus.not-started'),
                })
              )
            )
          }
          if (newTaskStatus === TASK_STATUS.DONE && !statusDone) {
            const sessionTours = JSON.parse(
              window.sessionStorage.getItem('juralio_tours')
            )
            const hiddenForSession = sessionTours && sessionTours['hiddenTask']
            !tours.hiddenTask &&
              !hiddenForSession &&
              dispatch(
                setTour('hiddenTask', hiddenTaskSteps(t, closeTourForever))
              )
          }
          let propTask = props.task

          if (propTask.project) {
            let taskFadeout = false
            if (newTaskStatus === TASK_STATUS.DONE) {
              taskFadeout = !statusDone
              if (taskFadeout) {
                window.localStorage.setItem('taskmapFadeOut', props.task.id)
                window.dispatchEvent(new Event('taskmapFadeOut'))
              }
            }
            dispatch(
              fetchTaskmapStructure(
                propTask.matterId,
                propTask.project.id,
                false,
                true,
                taskFadeout ? 1000 : 0
              )
            )
          }

          return props.actions.fetchProjectWithPostsAndTaskTeam(
            props.matterId,
            props.task.projectId
          )
        }
      })
  }
  const updateSubtaskInPanel = (props, newTaskStatus, t, dispatch) => {
    props.closeHandler()
    const maintainTaskConsistencyUpdate =
      newTaskStatus === TASK_STATUS.NOT_REQUIRED
    const taskOrder = props.task.parent.tasks.map(t => ({
      ...t,
      status: t.id === props.task.id ? newTaskStatus : t.status,
    }))
    const isLevelA = props.task.level === 1
    const updateFunction = isLevelA
      ? props.actions.updateProjectTasks
      : props.actions.updateTaskSubtasks
    return updateFunction(
      props.matterId,
      props.task.projectId,
      props.task.id,
      isLevelA ? undefined : props.task.parent.id,
      taskOrder,
      maintainTaskConsistencyUpdate,
      newTaskStatus
    ).then(response => {
      if (newTaskStatus === TASK_STATUS.NOT_REQUIRED) {
        const snackbarText = getSnackbarNotRequiredChangesText(
          t,
          getUpdatedSubtaskCount(response)
        )
        dispatch(displaySnackbar(snackbarText))
      }
    })
  }
  const confirmNotRequired = newTaskStatus => {
    props.closeHandler()
    if (newTaskStatus === props.task.status) return
    const options = {
      actionText: t('common.confirm'),
      titleText: `${t('taskStatus.task-not-required')} : ${props.task.name}`,
      promptText: t('taskStatusChange.confirmation'),
      usageContext: 'TaskDetailsNotRequiredStatusChange',
      extraComponent:
        props.task.blockers?.length > 0 ? (
          <TaskBlockerAlert task={props.task} />
        ) : (
          ''
        ),
    }
    dispatch(
      displayConfirmationDialog(options, () => {
        updateHandler(newTaskStatus, true)
      })
    )
  }
  const confirmStatusChange = properties => {
    const maintainTaskConsistencyUpdate = true
    return props.actions
      .updateTaskDetails(
        props.matterId,
        props.task.projectId,
        props.task.id,
        properties,
        maintainTaskConsistencyUpdate
      )
      .then(() => {
        return props.actions.fetchProjectOverview(
          props.matterId,
          props.task.projectId
        )
      })
  }
  const renameHandler = () => {
    props.actions.startEditingTaskName()
    props.closeHandler()
  }
  const downloadHandler = (paperSize, includePosts) => {
    const tsk = task.isLoaded ? task : props.task
    setShowDownloadDialog(false)
    props.closeHandler()
    dispatch(displaySnackbar(t('exports.common.preparingYourDownload')))
    tsk.posts = tsk.posts ? tsk.posts : posts ? posts : []
    import('../../../../services/export/reports/workstream-task-details/workstream-task-details-report-service').then(
      m =>
        m.default(
          t,
          {
            matter: matterDetails,
            project: project,
            task: tsk,
            posts: tsk.posts,
          },
          {
            printType: paperSize,
            includePosts: includePosts,
            creator: formatUserDisplayName(currentUser),
          }
        )
    )
  }

  const milestoneConversion = e => {
    e.stopPropagation()
    const isMilestone = props.task.isMilestone

    return props.actions
      .updateTaskMilestone(
        props.matterId,
        props.task.projectId,
        props.task.id,
        !isMilestone,
        props.task.status
      )
      .then(() => {
        if (isInTaskDetails(location.pathname)) {
          props.actions.fetchTaskDetails(
            props.matterId,
            props.task.projectId,
            getTaskIdFromLocation(location)
          )
        } else {
          props.actions
            .fetchTaskDetails(
              props.matterId,
              props.task.projectId,
              props.task.id
            )
            .then(res => {
              dispatch(
                fetchTaskmapStructure(
                  props.matterId,
                  props.task.projectId,
                  false,
                  true
                )
              )
              dispatch(replaceTask(res.task))
            })
        }
        props.actions.fetchProjectWithPostsAndTaskTeam(
          props.matterId,
          props.task.projectId
        )
        props.closeHandler()
      })
  }

  const deliverableConversion = e => {
    e.stopPropagation()
    const isDeliverable = props.task.isDeliverable
    return props.actions
      .updateTaskDeliverable(
        props.matterId,
        props.task.projectId,
        props.task.id,
        !isDeliverable,
        props.task.status
      )
      .then(() => {
        if (isInTaskDetails(location.pathname)) {
          props.actions.fetchTaskDetails(
            props.matterId,
            props.task.projectId,
            getTaskIdFromLocation(location)
          )
        } else {
          props.actions
            .fetchTaskDetails(
              props.matterId,
              props.task.projectId,
              props.task.id
            )
            .then(res => {
              dispatch(
                fetchTaskmapStructure(
                  props.matterId,
                  props.task.projectId,
                  false,
                  true
                )
              )
              dispatch(replaceTask(res.task))
            })
        }
        props.actions.fetchProjectWithPostsAndTaskTeam(
          props.matterId,
          props.task.projectId
        )
        props.closeHandler()
      })
  }

  return (
    <>
      <TaskMenu
        {...props}
        updateHandler={updateHandler}
        confirmStatusChangeHandler={confirmStatusChange}
        confirmNotRequiredHandler={confirmNotRequired}
        handleRenameClick={
          props.handleRenameClick ? props.handleRenameClick : renameHandler
        }
        handleMilestoneConversion={milestoneConversion}
        handleDeliverableConversion={deliverableConversion}
        hideRename={props.hideRename}
        dontRedirect={props.dontRedirect}
        downloadHandler={() => {
          setShowDownloadDialog(true)
        }}
        viewOnly={props.viewOnly}
        updateProject={props.updateProject}
      />
      <TaskDownloadDialog
        open={showDownloadDialog}
        close={() => setShowDownloadDialog(false)}
        download={(paperSize, includePosts) => {
          downloadHandler(paperSize, includePosts)
        }}
        taskName={props.task.name}
      />
    </>
  )
}
const mapDispatchToProps = dispatch => {
  return {
    actions: {
      updateTaskDetails: bindActionCreators(updateTaskDetails, dispatch),
      fetchTaskDetails: bindActionCreators(fetchTaskDetails, dispatch),
      updateTaskSubtasks: bindActionCreators(updateTaskSubtasks, dispatch),
      updateProjectTasks: bindActionCreators(updateProjectSubtasks, dispatch),
      updateTaskMilestone: bindActionCreators(updateTaskMilestone, dispatch),
      updateTaskDeliverable: bindActionCreators(
        updateTaskDeliverable,
        dispatch
      ),
      fetchProjectWithPostsAndTaskTeam: bindActionCreators(
        fetchProjectWithPostsAndTaskTeam,
        dispatch
      ),
      fetchProject: bindActionCreators(fetchProject, dispatch),
      fetchProjectOverview: bindActionCreators(fetchProjectOverview, dispatch),
      startEditingTaskName: bindActionCreators(startEditingTaskName, dispatch),
    },
  }
}
TaskMenuContainer.propTypes = {
  /** closeHandler */
  closeHandler: PropTypes.func.isRequired,
  /** matterId */
  matterId: PropTypes.string.isRequired,
}

export default connect(null, mapDispatchToProps)(TaskMenuContainer)
