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
  CREATE_MILESTONE_FLOW,
  CREATE_NEW_MATTER_FLOW,
  CREATE_NOTE_FLOW,
  CREATE_ORGANISATION_FLOW,
  CREATE_TASK_FLOW,
  CREATE_TASK_FROM_TEMPLATE_FLOW,
  CREATE_TEMPLATE_FLOW,
  CREATE_TEMPLATE_MILESTONE_FLOW,
  CREATE_TEMPLATE_NOTE_FLOW,
  CREATE_TEMPLATE_TASK_FLOW,
  CREATE_USER_FLOW,
  RESET_DIALOG,
  UNBLOCKED_TASKS_DIALOG,
} from './dialog-trigger-actions'

const defaultState = {
  CREATE_ORGANISATION_FLOW: false,
  CREATE_NOTE_FLOW: false,
  CREATE_TASK_FLOW: false,
  CREATE_TASK_FROM_TEMPLATE_FLOW: false,
  CREATE_TEMPLATE_FLOW: false,
  CREATE_TEMPLATE_TASK_FLOW: false,
  CREATE_TEMPLATE_MILESTONE_FLOW: false,
  CREATE_USER_FLOW: false,
  CREATE_TEMPLATE_NOTE_FLOW: false,
  CREATE_NEW_MATTER_FLOW: false,
  CREATE_MILESTONE_FLOW: false,
  UNBLOCKED_TASKS_DIALOG: false,
  showSubMenu: false,
  subMenuRef: undefined,
  type: null,
}

export default function tour(state = defaultState, action) {
  switch (action.type) {
    case CREATE_ORGANISATION_FLOW:
      return {
        ...state,
        CREATE_ORGANISATION_FLOW: true,
      }
    case CREATE_NOTE_FLOW:
      return {
        ...state,
        CREATE_NOTE_FLOW: true,
      }
    case CREATE_TASK_FLOW:
      return {
        ...state,
        CREATE_TASK_FLOW: true,
      }
    case CREATE_TASK_FROM_TEMPLATE_FLOW:
      return {
        ...state,
        CREATE_TASK_FROM_TEMPLATE_FLOW: true,
      }
    case CREATE_TEMPLATE_FLOW:
      return {
        ...state,
        CREATE_TEMPLATE_FLOW: true,
      }
    case CREATE_TEMPLATE_TASK_FLOW:
      return {
        ...state,
        CREATE_TEMPLATE_TASK_FLOW: true,
      }
    case CREATE_TEMPLATE_MILESTONE_FLOW:
      return {
        ...state,
        CREATE_TEMPLATE_MILESTONE_FLOW: true,
      }
    case CREATE_USER_FLOW:
      return {
        ...state,
        CREATE_USER_FLOW: true,
      }
    case CREATE_TEMPLATE_NOTE_FLOW:
      return {
        ...state,
        CREATE_TEMPLATE_NOTE_FLOW: true,
      }
    case CREATE_NEW_MATTER_FLOW:
      return {
        ...state,
        CREATE_NEW_MATTER_FLOW: true,
      }
    case CREATE_MILESTONE_FLOW:
      return {
        ...state,
        CREATE_MILESTONE_FLOW: true,
      }
    case RESET_DIALOG:
      return {
        ...defaultState,
      }
    case UNBLOCKED_TASKS_DIALOG:
      return {
        ...state,
        UNBLOCKED_TASKS_DIALOG: true,
      }
    default:
      return state
  }
}
