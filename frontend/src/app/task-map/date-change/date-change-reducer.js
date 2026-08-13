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

import {
  CANCEL_CONFIRMATION_DIALOG,
  CLEAR_TASK,
  CONFIRM_DATE_CONSISTENCY_ISSUE,
  CONFIRM_HAS_PARENT_IN_PROGRESS_ASD_LATER_THAN_CHILD_DONE_AED,
  CONFIRM_LINKED_TASK_WOULD_END_AFTER,
  CONFIRM_LINKED_TASK_WOULD_END_BEFORE_IT_STARTED,
  CONFIRM_LINKED_TASK_WOULD_START_AFTER_IT_FINISHED,
  CONFIRM_LINKED_TASK_WOULD_START_BEFORE,
  RECEIVE_TASK_FAILURE,
  RECEIVE_TASK_SUCCESS,
} from '../selected-task/selected-task-actions'

const initialTaskState = {
  isLoaded: false,
  isForbidden: false,
}

export default function dateChangeReducer(state = initialTaskState, action) {
  switch (action.type) {
    case RECEIVE_TASK_SUCCESS:
      return {
        ...state,
        ...action.task,
        isLoaded: true,
        isForbidden: false,
        handleHasParentInProgressASDLaterThanChildDoneAED: false,
        previousTaskOrder: undefined,
        linkedTaskWouldStartBefore: false,
        linkedTaskWouldEndAfter: false,
        linkedTaskWouldStartAfterItFinished: false,
        linkedTaskWouldEndBeforeItStarted: false,
        dateChangeConsistency: false,
        handleDateConsistencyIssue: false,
      }

    case RECEIVE_TASK_FAILURE:
      return { ...state, isLoaded: true, isForbidden: true }

    case CLEAR_TASK:
      return initialTaskState

    case CONFIRM_HAS_PARENT_IN_PROGRESS_ASD_LATER_THAN_CHILD_DONE_AED:
      return {
        ...state,
        handleHasParentInProgressASDLaterThanChildDoneAED: true,
        dateChangePayload: action.payload,
        dateChangeConsistency: action.consistency,
      }
    case CONFIRM_DATE_CONSISTENCY_ISSUE:
      return {
        ...state,
        handleDateConsistencyIssue: true,
        dateChangePayload: action.payload,
        dateChangeConsistency: action.consistency,
      }
    case CONFIRM_LINKED_TASK_WOULD_END_AFTER:
      return {
        ...state,
        linkedTaskWouldEndAfter: true,
        dateChangePayload: action.payload,
        dateChangeConsistency: action.consistency,
      }
    case CONFIRM_LINKED_TASK_WOULD_START_BEFORE:
      return {
        ...state,
        linkedTaskWouldStartBefore: true,
        dateChangePayload: action.payload,
        dateChangeConsistency: action.consistency,
      }
    case CONFIRM_LINKED_TASK_WOULD_END_BEFORE_IT_STARTED:
      return {
        ...state,
        linkedTaskWouldStartAfterItFinished: true,
        dateChangePayload: action.payload,
        dateChangeConsistency: action.consistency,
      }
    case CONFIRM_LINKED_TASK_WOULD_START_AFTER_IT_FINISHED:
      return {
        ...state,
        linkedTaskWouldEndBeforeItStarted: true,
        dateChangePayload: action.payload,
        dateChangeConsistency: action.consistency,
      }
    case CANCEL_CONFIRMATION_DIALOG:
      return {
        ...state,
        handleHasParentInProgressASDLaterThanChildDoneAED: false,
        linkedTaskWouldStartBefore: false,
        linkedTaskWouldEndAfter: false,
        linkedTaskWouldStartAfterItFinished: false,
        linkedTaskWouldEndBeforeItStarted: false,
        dateChangeConsistency: false,
        handleDateConsistencyIssue: false,
      }

    default:
      return state
  }
}
