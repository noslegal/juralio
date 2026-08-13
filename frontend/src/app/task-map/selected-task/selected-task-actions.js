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

import { StatusCodes } from 'http-status-codes'
import i18n from 'i18next'
import { fetchTaskmapContent } from '../../../redux/ducks/improved-taskmap'
import { getSiblings } from '../../../services/helpers/task/task-util-helper'
import projectService from '../../../services/project/project-service'
import taskBlockerService from '../../../services/task/task-blocker-service'
import taskService from '../../../services/task/task-service'
import { DateLinkingIcon } from '../../../theme/navigation/CommonIcons'
import { API_ERROR_CODE, TASK_STATUS } from '../../constants'
import { displayConfirmationDialog } from '../../global-confirmation-dialog/global-confirmation-dialog-actions'
import {
  displaySnackbar,
  showSnackbar,
} from '../../global-snackbar/global-snackbar-actions'
import { confirmStatusChange } from '../../improved-taskmap/taskmap-interaction-helpers/status-helpers'
import {
  fetchProjectOverview,
  fetchProjectWithPostsAndTaskTeam,
  receiveProjectSuccess,
  requestUpdateLevelATasks,
} from '../../project/project-actions'
import { hideTaskmapDatePickerForTask } from '../../task-details/task-actions'
import { isInRoadmapContext } from '../../../services/helpers/route/route-context-helper'
import { updateTaskInfo } from '../../project/project-actions'

export const REQUEST_TASK = 'REQUEST_TASK'
export const REQUEST_UPDATE_TASK = 'REQUEST_UPDATE_TASK'
export const REQUEST_UPDATE_SUBTASKS = 'REQUEST_UPDATE_SUBTASKS'
export const RECEIVE_TASK_SUCCESS = 'RECEIVE_TASK_SUCCESS'
export const RECEIVE_TASK_FAILURE = 'RECEIVE_TASK_FAILURE'
export const CANCEL_CONFIRMATION_DIALOG = 'CANCEL_CONFIRMATION_DIALOG'
export const CLEAR_TASK = 'CLEAR_TASK'
export const CONFIRM_STATUS_CHANGE_FOR_NOT_REQUIRED_PARENTS =
  'CONFIRM_STATUS_CHANGE_FOR_NOT_REQUIRED_PARENTS'
export const CONFIRM_STATUS_CHANGE_FOR_NOT_REQUIRED_PARENTS_AND_CHILDREN =
  'CONFIRM_STATUS_CHANGE_FOR_NOT_REQUIRED_PARENTS_AND_CHILDREN'
export const CONFIRM_STATUS_CHANGE_FOR_NOT_REQUIRED_CHILDREN =
  'CONFIRM_STATUS_CHANGE_FOR_NOT_REQUIRED_CHILDREN'
export const CONFIRM_STATUS_CHANGE_FOR_NOT_STARTED_PARENTS =
  'CONFIRM_STATUS_CHANGE_FOR_NOT_STARTED_PARENTS'
export const CONFIRM_STATUS_CHANGE_FOR_NOT_DONE_CHILDREN =
  'CONFIRM_STATUS_CHANGE_FOR_NOT_DONE_CHILDREN'
export const CONFIRM_STATUS_CHANGE_FOR_DONE_PARENTS =
  'CONFIRM_STATUS_CHANGE_FOR_DONE_PARENTS'
export const CONFIRM_STATUS_CHANGE_FOR_ACTIVE_AND_DONE_CHILDREN =
  'CONFIRM_STATUS_CHANGE_FOR_ACTIVE_AND_DONE_CHILDREN'
export const CONFIRM_STATUS_CHANGE_FOR_NOT_STARTED_PARENTS_AND_NOT_DONE_CHILDREN =
  'CONFIRM_STATUS_CHANGE_FOR_NOT_STARTED_PARENTS_AND_NOT_DONE_CHILDREN'
export const CONFIRM_STATUS_CHANGE_FOR_DONE_PARENTS_AND_DONE_CHILDREN =
  'CONFIRM_STATUS_CHANGE_FOR_DONE_PARENTS_AND_DONE_CHILDREN'
export const CONFIRM_HAS_PARENT_IN_PROGRESS_ASD_LATER_THAN_CHILD_DONE_AED =
  'CONFIRM_HAS_PARENT_IN_PROGRESS_ASD_LATER_THAN_CHILD_DONE_AED'

export const CONFIRM_DATE_CONSISTENCY_ISSUE = 'CONFIRM_DATE_CONSISTENCY_ISSUE'
export const CONFIRM_LINKED_TASK_WOULD_START_BEFORE =
  'CONFIRM_LINKED_TASK_WOULD_START_BEFORE'
export const CONFIRM_LINKED_TASK_WOULD_END_AFTER =
  'CONFIRM_LINKED_TASK_WOULD_END_AFTER'
export const START_EDITING_TASK_NAME = 'START_EDITING_NAME'
export const STOP_EDITING_TASK_NAME = 'STOP_EDITING_NAME'
export const CONFIRM_LINKED_TASK_WOULD_END_BEFORE_IT_STARTED =
  'CONFIRM_LINKED_TASK_WOULD_END_BEFORE_IT_STARTED'
export const CONFIRM_LINKED_TASK_WOULD_START_AFTER_IT_FINISHED =
  'CONFIRM_LINKED_TASK_WOULD_START_AFTER_IT_FINISHED'
export const CONFIRM_HAS_PARENTS_WITH_NO_START_DATES =
  'CONFIRM_HAS_PARENTS_WITH_NO_START_DATES'
export const CONFIRM_HAS_PARENTS_WITH_NO_END_DATES =
  'CONFIRM_HAS_PARENTS_WITH_NO_END_DATES'
export const CONFIRM_STATUS_CHANGE_FOR_BLOCKED_BY =
  'CONFIRM_STATUS_CHANGE_FOR_BLOCKED_BY'

export const START_EDITING_TASK_DESCRIPTION = 'START_EDITING_DESCRIPTION'
export const STOP_EDITING_TASK_DESCRIPTION = 'STOP_EDITING_DESCRIPTION'

export const UPDATE_TASK_LAST_UPDATED_DATE = 'UPDATE_TASK_LAST_UPDATED_DATE'
export const FOLLOW_TASK_CURRENT_USER = 'FOLLOW_TASK_CURRENT_USER'
export const UNFOLLOW_TASK_CURRENT_USER = 'UNFOLLOW_TASK_CURRENT_USER'

export const SET_TASK_DATES_LINKED = 'SET_TASK_DATES_LINKED'

export const ADD_TASK_BLOCKER_NO_FETCH = 'ADD_TASK_BLOCKER_NO_FETCH'
export const ADD_TASK_BLOCKER_ERROR = 'ADD_TASK_BLOCKER_ERROR'

export const ADD_TASK_BLOCKED_NO_FETCH = 'ADD_TASK_BLOCKED_NO_FETCH'
export const ADD_TASK_BLOCKED_ERROR = 'ADD_TASK_BLOCKED_ERROR'

export const DELETE_TASK_BLOCKER_NO_FETCH = 'DELETE_TASK_BLOCKER_NO_FETCH'
export const DELETE_TASK_BLOCKER_ERROR = 'DELETE_TASK_BLOCKER_ERROR'

export const CLEAR_BLOCKER_ERROR_MESSAGE = 'CLEAR_BLOCKER_ERROR_MESSAGE'

export const FETCH_BLOCKERS_LIST = 'FETCH_BLOCKERS_LIST'
export const FETCH_BLOCKER_LIST_ERROR = 'FETCH_BLOCKER_LIST_ERROR'
export const FETCH_BLOCKER_LIST_SUCCESS = 'FETCH_BLOCKER_LIST_SUCCESS'

function followTaskAsCurrentUser(payload) {
  return {
    type: FOLLOW_TASK_CURRENT_USER,
    ...payload,
  }
}

function unfollowTaskAsCurrentUser(followerId) {
  return {
    type: UNFOLLOW_TASK_CURRENT_USER,
    followerId: followerId,
  }
}

function startEditingDescription() {
  return {
    type: START_EDITING_TASK_DESCRIPTION,
  }
}

function stopEditingDescription() {
  return {
    type: STOP_EDITING_TASK_DESCRIPTION,
  }
}

const _setTaskDatesLinked = isLinked => {
  return {
    type: SET_TASK_DATES_LINKED,
    isLinked,
  }
}

export const setTaskDatesLinked = isLinked => dispatch =>
  dispatch(_setTaskDatesLinked(isLinked))

export const startEditingTaskDescription = () => dispatch =>
  dispatch(startEditingDescription())

export const stopEditingTaskDescription = () => dispatch =>
  dispatch(stopEditingDescription())

function startEditingName() {
  return {
    type: START_EDITING_TASK_NAME,
  }
}

function stopEditingName() {
  return {
    type: STOP_EDITING_TASK_NAME,
  }
}

export const startEditingTaskName = () => dispatch =>
  dispatch(startEditingName())

export const stopEditingTaskName = () => dispatch => dispatch(stopEditingName())

function requestTask() {
  return {
    type: REQUEST_TASK,
  }
}

function requestUpdateTask() {
  return {
    type: REQUEST_UPDATE_TASK,
  }
}

function requestUpdateSubtasks(payload) {
  return {
    type: REQUEST_UPDATE_SUBTASKS,
    ...payload,
  }
}

export function receiveTaskSuccess(json) {
  return {
    type: RECEIVE_TASK_SUCCESS,
    task: json,
  }
}

function receiveTaskFailure() {
  return {
    type: RECEIVE_TASK_FAILURE,
  }
}

function clearTask() {
  return {
    type: CLEAR_TASK,
  }
}

function cancelConfirmationDialog() {
  return {
    type: CANCEL_CONFIRMATION_DIALOG,
  }
}

const confirmStatusChangeForNotRequiredParents = (
  statusChangeTargetTaskId,
  payload,
  body
) => {
  return {
    type: CONFIRM_STATUS_CHANGE_FOR_NOT_REQUIRED_PARENTS,
    statusChangeTargetTaskId,
    payload,
    body,
  }
}

const confirmStatusChangeForNotRequiredParentsAndChildren = (
  statusChangeTargetTaskId,
  payload,
  body
) => {
  return {
    type: CONFIRM_STATUS_CHANGE_FOR_NOT_REQUIRED_PARENTS_AND_CHILDREN,
    statusChangeTargetTaskId,
    payload,
    body,
  }
}

const confirmStatusChangeForNotRequiredChildren = (
  statusChangeTargetTaskId,
  payload,
  body
) => {
  return {
    type: CONFIRM_STATUS_CHANGE_FOR_NOT_REQUIRED_CHILDREN,
    statusChangeTargetTaskId,
    payload,
    body,
  }
}

function confirmStatusChangeForNotStartedParents(
  statusChangeTargetTaskId,
  payload,
  body
) {
  return {
    type: CONFIRM_STATUS_CHANGE_FOR_NOT_STARTED_PARENTS,
    statusChangeTargetTaskId,
    payload,
    body,
  }
}

function confirmStatusChangeForNotDoneChildren(
  statusChangeTargetTaskId,
  payload,
  body
) {
  return {
    type: CONFIRM_STATUS_CHANGE_FOR_NOT_DONE_CHILDREN,
    statusChangeTargetTaskId,
    payload,
    body,
  }
}

function confirmStatusChangeForDoneParents(
  statusChangeTargetTaskId,
  payload,
  body
) {
  return {
    type: CONFIRM_STATUS_CHANGE_FOR_DONE_PARENTS,
    statusChangeTargetTaskId,
    payload,
    body,
  }
}

function confirmStatusChangeForActiveAndDoneChildren(
  statusChangeTargetTaskId,
  payload,
  body
) {
  return {
    type: CONFIRM_STATUS_CHANGE_FOR_ACTIVE_AND_DONE_CHILDREN,
    statusChangeTargetTaskId,
    payload,
    body,
  }
}

function confirmStatusChangeForBlockedBy(
  statusChangeTargetTaskId,
  payload,
  body
) {
  return {
    type: CONFIRM_STATUS_CHANGE_FOR_BLOCKED_BY,
    statusChangeTargetTaskId,
    payload,
    body,
  }
}

function confirmStatusChangeForNotStartedParentsAndNotDoneChildren(
  statusChangeTargetTaskId,
  payload,
  body
) {
  return {
    type: CONFIRM_STATUS_CHANGE_FOR_NOT_STARTED_PARENTS_AND_NOT_DONE_CHILDREN,
    statusChangeTargetTaskId,
    payload,
    body,
  }
}

function confirmStatusChangeForDoneParentsAndDoneChildren(
  statusChangeTargetTaskId,
  payload,
  body
) {
  return {
    type: CONFIRM_STATUS_CHANGE_FOR_DONE_PARENTS_AND_DONE_CHILDREN,
    statusChangeTargetTaskId,
    payload,
    body,
  }
}

function confirmHasParentInProgressASDLaterThanChildDoneAED(payload) {
  return {
    type: CONFIRM_HAS_PARENT_IN_PROGRESS_ASD_LATER_THAN_CHILD_DONE_AED,
    payload,
  }
}

function confirmDateConsistency(payload, consistency) {
  return {
    type: CONFIRM_DATE_CONSISTENCY_ISSUE,
    payload,
    consistency,
  }
}

function updateTaskLastUpdated(newDate) {
  return {
    type: UPDATE_TASK_LAST_UPDATED_DATE,
    date: newDate,
  }
}

function confirmLinkedTaskWouldStartBefore(payload, consistency) {
  return {
    type: CONFIRM_LINKED_TASK_WOULD_START_BEFORE,
    payload,
    consistency,
  }
}
function confirmLinkedTaskWouldEndAfter(payload, consistency) {
  return {
    type: CONFIRM_LINKED_TASK_WOULD_END_AFTER,
    payload,
    consistency,
  }
}
function confirmLinkedTaskWouldStartAfterItFinished(payload, consistency) {
  return {
    type: CONFIRM_LINKED_TASK_WOULD_START_AFTER_IT_FINISHED,
    payload,
    consistency,
  }
}
function confirmLinkedTaskWouldEndBeforeItStarted(payload, consistency) {
  return {
    type: CONFIRM_LINKED_TASK_WOULD_END_BEFORE_IT_STARTED,
    payload,
    consistency,
  }
}

export const updateSelectedTaskLastUpdated = newUpdatedDate => dispatch =>
  dispatch(updateTaskLastUpdated(newUpdatedDate))

export const fetchTaskDetails =
  (matterId, projectId, taskId, skipRecency = false) =>
  dispatch => {
    dispatch(requestTask())
    return taskService
      .getTaskById(matterId, projectId, taskId, skipRecency)
      .then(response => {
        if (response.status !== StatusCodes.OK) {
          return dispatch(receiveTaskFailure())
        } else {
          return dispatch(receiveTaskSuccess(response.body))
        }
      })
  }

// const hasValidSubtaskToUpdate = (task, updateKey) => {
//   const flatTasks = flatTaskListFromTree(task)
//   switch (task.status) {
//     case TASK_STATUS.NOT_STARTED:
//       return flatTasks.filter(t => t[updateKey] && t[updateKey] !== null).length
//     case TASK_STATUS.IN_PROGRESS:
//       return flatTasks.filter(
//         t =>
//           [TASK_STATUS.NOT_STARTED, TASK_STATUS.IN_PROGRESS].includes(
//             t.status
//           ) &&
//           t[updateKey] &&
//           t[updateKey] !== null
//       ).length
//     default:
//       return false
//   }
// }

// const calculateDateShift = (oldDate, newDate) => {
//   if (oldDate === null || newDate === null) {
//     return null
//   }
//   const date1 = new Date(oldDate)
//   const date2 = new Date(newDate)
//   const diffTime = date2 - date1
//   const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
//   return diffDays
// }
// const confirmIfSubtasksDatesShouldBeImpacted = (
//   dispatch,
//   matterId,
//   projectId,
//   updatedTask,
//   oldTask,
//   updateProperties,
//   callback = () => {}
// ) => {
//   const propertyKeys = Object.keys(updateProperties)
//   const dateKeys = ['plannedStartDate', 'plannedEndDate']
//   propertyKeys.forEach(key => {
//     if (dateKeys.includes(key)) {
//       //check if we're updating a date
//       if (hasValidSubtaskToUpdate(updatedTask, key)) {
//         ///check there is a subtask we might want to update
//         const daysToShift = calculateDateShift(oldTask[key], updatedTask[key])
//         if (daysToShift === null) {
//           callback()
//           return
//         }
//         const options = {
//           actionText: 'common.yes',
//           cancelText: 'common.no',
//           titleText: 'taskSubtaskDates.header',
//           promptText: 'taskSubtaskDates.promptText',
//           usageContext: 'UpdateTaskDetails',
//           cancel: callback,
//         }
//         dispatch(
//           displayConfirmationDialog(options, () => {
//             taskService
//               .applyDateOffsetToSubtasks(
//                 matterId,
//                 projectId,
//                 updatedTask.id,
//                 key,
//                 daysToShift
//               )
//               .then(() => {
//                 callback()
//               })
//           })
//         )
//       } else {
//         callback()
//       }
//     } else {
//       callback()
//     }
//   })
// }

const tryInitiateFlowForStatusError = (
  dispatch,
  response,
  statusChangeTargetTaskId,
  properties
) => {
  const errorCode = response.status
  if (properties.status !== undefined) {
    return taskService
      .getAffectedTasks(statusChangeTargetTaskId, properties)
      .then(response => {
        if (response.body.length === 0) {
          return false
        }
        switch (errorCode) {
          case API_ERROR_CODE.HAS_NOT_REQUIRED_PARENTS:
            return dispatch(
              confirmStatusChangeForNotRequiredParents(
                statusChangeTargetTaskId,
                properties,
                response.body
              )
            )
          case API_ERROR_CODE.HAS_NOT_REQUIRED_PARENTS_AND_CHILDREN:
            return dispatch(
              confirmStatusChangeForNotRequiredParentsAndChildren(
                statusChangeTargetTaskId,
                properties,
                response.body
              )
            )
          case API_ERROR_CODE.HAS_NOT_REQUIRED_CHILDREN:
            return dispatch(
              confirmStatusChangeForNotRequiredChildren(
                statusChangeTargetTaskId,
                properties,
                response.body
              )
            )
          case API_ERROR_CODE.HAS_NOT_STARTED_PARENTS:
            return dispatch(
              confirmStatusChangeForNotStartedParents(
                statusChangeTargetTaskId,
                properties,
                response.body
              )
            )
          case API_ERROR_CODE.HAS_NOT_DONE_CHILDREN:
            return dispatch(
              confirmStatusChangeForNotDoneChildren(
                statusChangeTargetTaskId,
                properties,
                response.body
              )
            )
          case API_ERROR_CODE.HAS_DONE_PARENTS:
            return dispatch(
              confirmStatusChangeForDoneParents(
                statusChangeTargetTaskId,
                properties,
                response.body
              )
            )
          case API_ERROR_CODE.HAS_ACTIVE_AND_DONE_CHILDREN:
            return dispatch(
              confirmStatusChangeForActiveAndDoneChildren(
                statusChangeTargetTaskId,
                properties,
                response.body
              )
            )
          case API_ERROR_CODE.HAS_NOT_STARTED_PARENTS_AND_NOT_DONE_CHILDREN:
            return dispatch(
              confirmStatusChangeForNotStartedParentsAndNotDoneChildren(
                statusChangeTargetTaskId,
                properties,
                response.body
              )
            )
          case API_ERROR_CODE.HAS_DONE_PARENTS_AND_DONE_CHILDREN:
            return dispatch(
              confirmStatusChangeForDoneParentsAndDoneChildren(
                statusChangeTargetTaskId,
                properties,
                response.body
              )
            )
          case API_ERROR_CODE.TASK_BLOCKED_BY_IN_PROGRESS:
            return dispatch(
              confirmStatusChangeForBlockedBy(
                statusChangeTargetTaskId,
                properties,
                response.body
              )
            )
          default:
            return false
        }
      })
  }
}

const tryInitiateFlowForDateError = (
  dispatch,
  response,
  properties,
  consistency
) => {
  switch (response.status) {
    case API_ERROR_CODE.HAS_DONE_PARENTS_AND_DONE_CHILDREN:
      return dispatch(
        confirmStatusChangeForDoneParentsAndDoneChildren(
          properties,
          consistency
        )
      )
    case API_ERROR_CODE.HAS_PARENT_IN_PROGRESS_ASD_LATER_THAN_CHILD_DONE_AED:
      return dispatch(
        confirmHasParentInProgressASDLaterThanChildDoneAED(
          properties,
          consistency
        )
      )
    case API_ERROR_CODE.DATE_CONSISTENCY_EXCEPTION:
      return dispatch(confirmDateConsistency(properties, consistency))
    case API_ERROR_CODE.LINKED_TASK_WOULD_START_BEFORE_PARENT:
      return dispatch(
        confirmLinkedTaskWouldStartBefore(properties, consistency)
      )
    case API_ERROR_CODE.LINKED_TASK_WOULD_END_AFTER_PARENT:
      return dispatch(confirmLinkedTaskWouldEndAfter(properties, consistency))
    case API_ERROR_CODE.LINKED_TASK_WOULD_START_AFTER_IT_FINISHED:
      return dispatch(
        confirmLinkedTaskWouldStartAfterItFinished(properties, consistency)
      )
    case API_ERROR_CODE.LINKED_TASK_WOULD_END_BEFORE_IT_STARTED:
      return dispatch(
        confirmLinkedTaskWouldEndBeforeItStarted(properties, consistency)
      )
    default:
      return false
  }
}

export const updateProjectSubtasks =
  (
    matterId,
    projectId,
    statusChangeTargetTaskId,
    parentTaskId,
    orderedTasks,
    maintainTaskConsistencyUpdate
  ) =>
  dispatch => {
    const properties = {
      parentTaskId,
      taskOrder: orderedTasks,
    }

    dispatch(
      requestUpdateLevelATasks({
        taskOrder: orderedTasks,
        statusChangeTargetTaskId,
      })
    )

    return taskService
      .updateTaskSubtasks(
        matterId,
        projectId,
        parentTaskId,
        orderedTasks,
        maintainTaskConsistencyUpdate
      )
      .then(response => {
        if (response.status === StatusCodes.OK) {
          dispatch(fetchProjectOverview(matterId, projectId))
          return dispatch(
            receiveProjectSuccess({
              matterId,
              project: response.body,
            })
          )
        } else {
          const statusErrorResponse = tryInitiateFlowForStatusError(
            dispatch,
            response,
            statusChangeTargetTaskId,
            properties
          )

          if (statusErrorResponse) {
            return statusErrorResponse
          } else if (
            response.status === API_ERROR_CODE.DATE_CONSISTENCY_EXCEPTION
          ) {
            taskService
              .checkDateConsistency(
                matterId,
                projectId,
                statusChangeTargetTaskId,
                properties
              )
              .then(res => {
                const dateErrorResponse = tryInitiateFlowForDateError(
                  dispatch,
                  response,
                  properties,
                  res
                )

                if (dateErrorResponse) {
                  return dateErrorResponse
                } else {
                  return Promise.reject()
                }
              })
          }
        }
      })
  }

export const updateTaskSubtasks =
  (
    matterId,
    projectId,
    statusChangeTargetTaskId,
    parentTaskId,
    orderedTasks,
    maintainTaskConsistencyUpdate,
    newTaskStatus
  ) =>
  dispatch => {
    const properties = {
      parentTaskId,
      taskOrder: orderedTasks,
      status: newTaskStatus,
    }
    dispatch(
      requestUpdateSubtasks({
        parentTaskId,
        taskOrder: orderedTasks,
        statusChangeTargetTaskId,
      })
    )

    return taskService
      .updateTaskSubtasks(
        matterId,
        projectId,
        parentTaskId,
        orderedTasks,
        maintainTaskConsistencyUpdate
      )
      .then(response => {
        if (response.status === StatusCodes.OK) {
          return dispatch(receiveTaskSuccess(response.body))
        } else {
          const statusErrorResponse = tryInitiateFlowForStatusError(
            dispatch,
            response,
            statusChangeTargetTaskId,
            properties
          )

          if (statusErrorResponse) {
            return statusErrorResponse
          } else if (
            response.status === API_ERROR_CODE.DATE_CONSISTENCY_EXCEPTION
          ) {
            taskService
              .checkDateConsistency(
                matterId,
                projectId,
                statusChangeTargetTaskId,
                properties
              )
              .then(res => {
                const dateErrorResponse = tryInitiateFlowForDateError(
                  dispatch,
                  response,
                  properties,
                  res
                )

                if (dateErrorResponse) {
                  return dateErrorResponse
                } else {
                  return Promise.reject()
                }
              })
          }
        }
      })
  }

export const updateTaskDescription =
  (matterId, projectId, taskId, description) => dispatch => {
    dispatch(requestUpdateTask())
    return taskService.updateTask(matterId, projectId, taskId, {
      description: description,
    })
  }

export const updateTaskMilestone =
  (matterId, projectId, taskId, isMilestone, currentStatus) => dispatch => {
    dispatch(requestUpdateTask())
    let status =
      currentStatus === TASK_STATUS.DONE
        ? TASK_STATUS.DONE
        : TASK_STATUS.NOT_STARTED

    return taskService.updateTask(matterId, projectId, taskId, {
      isMilestone: isMilestone,
      status: status,
    })
  }

export const updateTaskDeliverable =
  (matterId, projectId, taskId, isDeliverable, currentStatus) => dispatch => {
    dispatch(requestUpdateTask())
    return taskService.updateTask(matterId, projectId, taskId, {
      isDeliverable: isDeliverable,
    })
  }

export const updateTaskDetails =
  (
    matterId,
    projectId,
    taskId,
    properties,
    maintainTaskConsistencyUpdate,
    inTaskmap = false,
    ignoreSubtasksUpdate = false
  ) =>
  dispatch => {
    dispatch(requestUpdateTask())
    return taskService
      .getTaskById(matterId, projectId, taskId)
      .then(selectedTask => {
        dispatch(requestUpdateTask())
        return getSiblings(matterId, projectId, taskId).then(
          uneditiedSiblings => {
            return taskService
              .updateTask(
                matterId,
                projectId,
                taskId,
                properties,
                maintainTaskConsistencyUpdate
              )
              .then(response => {
                if (
                  response.status === StatusCodes.OK ||
                  response.status ===
                    API_ERROR_CODE.INCONSISTENT_PLANNED_DATES_REMOVED
                ) {
                  if (
                    response.status ===
                    API_ERROR_CODE.INCONSISTENT_PLANNED_DATES_REMOVED
                  ) {
                    dispatch(showSnackbar(i18n.t('taskDates.datesWiped')))
                  }
                  if (response.body.datesLinkedToSiblings) {
                    if (
                      properties.plannedStartDate !== undefined ||
                      properties.plannedEndDate !== undefined
                    ) {
                      getSiblings(matterId, projectId, taskId).then(
                        siblings => {
                          if (properties.plannedStartDate !== undefined) {
                            siblings = siblings.filter(
                              task => task.plannedStartDate !== null
                            )
                          }

                          if (properties.plannedEndDate !== undefined) {
                            siblings = siblings.filter(
                              task => task.plannedEndDate !== null
                            )
                          }

                          const didUpdateSiblings = siblings
                            .map(sibling => {
                              const foundSibling = uneditiedSiblings.filter(
                                t => t.id === sibling.id
                              )[0]

                              return (
                                foundSibling.plannedStartDate !==
                                  sibling.plannedStartDate ||
                                foundSibling.plannedEndDate !==
                                  sibling.plannedEndDate
                              )
                            })

                            .includes(true)

                          if (siblings.length && didUpdateSiblings) {
                            dispatch(
                              displaySnackbar('taskLinking.linkedTasksUpdated')
                            )
                          }
                        }
                      )
                    }
                  }

                  if (
                    [TASK_STATUS.DONE, TASK_STATUS.NOT_REQUIRED].includes(
                      selectedTask.body.status
                    ) &&
                    properties.status &&
                    [TASK_STATUS.NOT_STARTED, TASK_STATUS.IN_PROGRESS].includes(
                      properties.status
                    )
                  ) {
                    getSiblings(matterId, projectId, taskId).then(siblings => {
                      const hasLinkedSiblings = siblings.filter(
                        sibling => sibling.datesLinkedToSiblings === true
                      ).length

                      if (hasLinkedSiblings) {
                        const options = {
                          actionText: 'taskLinking.linkDates',
                          titleText: 'taskLinking.updatedStatusLinkTitle',
                          promptText: 'taskLinking.updatedStatusLinkBody',
                          usageContext: 'StatusdChangeWithLinkedTask',
                          cancelText: 'taskLinking.keepUnlinked',
                          headerIcon: DateLinkingIcon,
                        }

                        dispatch(
                          displayConfirmationDialog(options, () => {
                            taskService
                              .linkTaskWithSiblings(
                                matterId,
                                projectId,
                                taskId,
                                true
                              )
                              .then(() => {
                                if (inTaskmap) {
                                  dispatch(
                                    fetchTaskmapContent(matterId, projectId)
                                  )
                                }
                                dispatch(
                                  fetchProjectWithPostsAndTaskTeam(
                                    matterId,
                                    projectId
                                  )
                                )
                              })
                          })
                        )
                      }
                    })
                  }

                  if (inTaskmap) {
                    dispatch(hideTaskmapDatePickerForTask())
                  }
                  if (response.body.updateMeta?.updatedParentStatus) {
                    dispatch(
                      showSnackbar(
                        i18n.t('taskMap.updatedParentTaskTo', {
                          status: i18n.t(
                            'taskStatus.' +
                              response.body.updateMeta.updatedParentStatus.toLowerCase()
                          ),
                        })
                      )
                    )
                  }

                  if (
                    isInRoadmapContext() &&
                    (properties.plannedStartDate !== undefined ||
                      properties.plannedEndDate !== undefined ||
                      properties.actualStartDate !== undefined ||
                      properties.actualEndDate !== undefined)
                  ) {
                    dispatch(updateTaskInfo(response.body))
                  } else {
                    dispatch(
                      fetchProjectWithPostsAndTaskTeam(matterId, projectId)
                    )
                  }

                  if (
                    window.location.href.includes('improvedTaskmap') &&
                    properties.status
                  ) {
                    projectService
                      .getFlatTasksList(matterId, projectId)
                      .then(res => {
                        let tasks = res.body
                        confirmStatusChange(
                          properties,
                          [],
                          tasks,
                          selectedTask.body,
                          dispatch,
                          false,
                          false
                        )
                      })
                  }
                  return dispatch(receiveTaskSuccess(response.body))
                } else {
                  const statusErrorResponse = tryInitiateFlowForStatusError(
                    dispatch,
                    response,
                    taskId,
                    properties
                  )

                  if (statusErrorResponse) {
                    return statusErrorResponse
                  } else if (
                    response.status ===
                    API_ERROR_CODE.DATE_CONSISTENCY_EXCEPTION
                  ) {
                    taskService
                      .checkDateConsistency(
                        matterId,
                        projectId,
                        taskId,
                        properties
                      )
                      .then(res => {
                        if (res.status === StatusCodes.OK) {
                          const dateErrorResponse = tryInitiateFlowForDateError(
                            dispatch,
                            response,
                            properties,
                            res
                          )

                          if (dateErrorResponse) {
                            return dateErrorResponse
                          }
                        } else {
                          //Else change is not allowed stop flow
                        }
                      })
                  }
                }
              })
          }
        )
      })
  }

export const closeConfirmationDialog = () => dispatch =>
  dispatch(cancelConfirmationDialog())

export const followTask = (matterId, projectId, taskId) => dispatch => {
  return taskService.followTask(matterId, projectId, taskId).then(response => {
    if (response.status !== StatusCodes.OK) return Promise.reject()
    dispatch(followTaskAsCurrentUser({ follower: response.body }))
  })
}

export const unfollowTask =
  (matterId, projectId, taskId, userId) => dispatch => {
    return taskService
      .unfollowTask(matterId, projectId, taskId, userId)
      .then(response => {
        if (response.status !== StatusCodes.NO_CONTENT) return Promise.reject()
        dispatch(unfollowTaskAsCurrentUser(userId))
      })
  }

export const resetSelectedTask = () => dispatch => dispatch(clearTask())

function addTaskBlockerError(response) {
  //maybe a better error message here
  return {
    type: ADD_TASK_BLOCKER_ERROR,
  }
}

function addTaskBlockerResponse(body) {
  //maybe a better error message here
  return {
    type: ADD_TASK_BLOCKER_NO_FETCH,
    newBlocker: body,
  }
}

export const addTaskBlocker =
  (blockerId, blockedId, projectId, matterId) => dispatch => {
    return taskBlockerService
      .addBlocker(blockerId, blockedId, projectId, matterId)
      .then(res => {
        if (res.status === 201) {
          dispatch(addTaskBlockerResponse(res.body))
        } else {
          dispatch(addTaskBlockerError(res))
          setTimeout(() => dispatch(clearBlockerErrorMessage()), 5000)
        }
      })
  }

function addTaskBlockedError(response) {
  return {
    type: ADD_TASK_BLOCKED_ERROR,
  }
}

function addTaskBlockedResponse(body) {
  return {
    type: ADD_TASK_BLOCKED_NO_FETCH,
    newBlocker: body,
  }
}

export const addTaskBlocked =
  (blockedId, blockerId, projectId, matterId) => dispatch => {
    return taskBlockerService
      .addBlocked(blockedId, blockerId, projectId, matterId)
      .then(res => {
        if (res.status === 201) {
          dispatch(addTaskBlockedResponse(res.body))
        } else {
          dispatch(addTaskBlockedError(res))
          setTimeout(() => dispatch(clearBlockerErrorMessage()), 5000)
        }
      })
  }

function deleteTaskBlockerError(response) {
  return {
    type: DELETE_TASK_BLOCKER_ERROR,
  }
}

function deleteTaskBlockerResponse(id) {
  return {
    type: DELETE_TASK_BLOCKER_NO_FETCH,
    blockerId: id,
  }
}

function clearBlockerErrorMessage() {
  return {
    type: CLEAR_BLOCKER_ERROR_MESSAGE,
  }
}

export const deleteTaskBlocker =
  (blockedId, blockerId, projectId, matterId, taskBlockerId) => dispatch => {
    return taskBlockerService
      .deleteBlocker(blockedId, blockerId, projectId, matterId)
      .then(res => {
        if (res.status === 200) {
          dispatch(deleteTaskBlockerResponse(taskBlockerId))
        } else {
          dispatch(deleteTaskBlockerError())
          setTimeout(() => dispatch(clearBlockerErrorMessage()), 5000)
        }
      })
  }

export const fetchBlockerList = (matterId, projectId, taskId) => dispatch => {
  return taskBlockerService
    .getBlockDetailsForTask(taskId, projectId, matterId)
    .then(res => {
      if (res.status === 200) {
        dispatch(fetchBlockerListResponse(res.body))
      } else {
        dispatch(fetchBlockerListError())
        setTimeout(() => dispatch(clearBlockerErrorMessage()), 5000)
      }
    })
}

function fetchBlockerListResponse(body) {
  return {
    type: FETCH_BLOCKER_LIST_SUCCESS,
    blockers: body,
  }
}

function fetchBlockerListError() {
  return {
    type: FETCH_BLOCKER_LIST_ERROR,
  }
}
