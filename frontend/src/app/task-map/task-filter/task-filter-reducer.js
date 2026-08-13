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

import { OPERATOR, TASK_MAP_VIEW_MODE_ENUM } from '../../constants'
import { taskActionTypes } from './task-filter-actions'

const initialState = {
  email: undefined,
  id: undefined,
  filterSelectionText: 'Anyone’s tasks',
  taskTypeSelectionText: 'All task types',
  fetchingFilterUserRecency: false,
  filterSelectionUser: {},
  filterUserRecency: undefined,
  personFilter: undefined,
  filterOptions: {
    taskMemberOf: false,
    following: false,
    logicOperator: OPERATOR.AND,
  },
  filterOn: false,
  userFilter: false,
  statusDone: false,
  statusNotStarted: true,
  statusNotRequired: false,
  statusMilestone: false,
  statusDeliverable: false,
  statusAll: false,
  expandCollapseTaskFilter: [],
  expandCollapse: false,
  currentTasks: [],
  filterLabels: [],
  detailedView: {
    viewMode: TASK_MAP_VIEW_MODE_ENUM.STANDARD,
    showRisk: true,
    templateViewMode: TASK_MAP_VIEW_MODE_ENUM.COMPACT,
  },
  levelFilter: 0,
}
const clearUserFilter = {
  email: undefined,
  id: undefined,
  filterSelectionText: 'Anyone’s tasks',
  taskTypeSelectionText: 'All task types',
  fetchingFilterUserRecency: false,
  filterSelectionUser: {},
  filterUserRecency: undefined,
  personFilter: undefined,
  filterOptions: {
    taskMemberOf: false,
    following: false,
    logicOperator: OPERATOR.AND,
  },
  filterOn: false,
  filterLabels: [],
  userFilter: false,
  levelFilter: 0,
}

const clearUserFilterQuickAdd = {
  email: undefined,
  id: undefined,
  filterSelectionText: 'Anyone’s tasks',
  taskTypeSelectionText: 'All task types',
  fetchingFilterUserRecency: false,
  filterSelectionUser: {},
  filterUserRecency: undefined,
  personFilter: undefined,
  filterOptions: {
    taskMemberOf: false,
    following: false,
    logicOperator: OPERATOR.AND,
  },
  filterLabels: [],
  userFilter: false,
  levelFilter: 0,
  statusMilestone: false,
  statusDeliverable: false,
  filterOn: false,
}

const resetFilters = {
  email: undefined,
  id: undefined,
  filterSelectionText: 'Anyone’s tasks',
  taskTypeSelectionText: 'All task types',
  fetchingFilterUserRecency: false,
  filterSelectionUser: {},
  filterUserRecency: undefined,
  personFilter: undefined,
  filterOptions: {
    taskMemberOf: false,
    following: false,
    logicOperator: OPERATOR.AND,
  },
  filterOn: false,
  userFilter: false,
  statusDone: false,
  statusNotStarted: true,
  statusNotRequired: false,
  statusMilestone: false,
  statusDeliverable: false,
  statusAll: false,
  expandCollapseTaskFilter: [],
  expandCollapse: false,
  currentTasks: [],
  filterLabels: [],
  levelFilter: 0,
}

const taskFilterReducer = (state = initialState, action) => {
  switch (action.type) {
    case taskActionTypes.COLLAPSE_TASK:
      let x = state.expandCollapseTaskFilter
      x.push(action.toAdd)
      return {
        ...state,
        expandCollapseTaskFilter: x,
      }
    case taskActionTypes.EXPAND_TASK:
      return {
        ...state,
        expandCollapseTaskFilter: state.expandCollapseTaskFilter.filter(
          item => item !== action.toRemove
        ),
      }

    case taskActionTypes.SET_LEVEL_FILTER:
      return {
        ...state,
        levelFilter: action.levelFilter,
      }
    case taskActionTypes.SET_STATUS_MILESTONE:
      return {
        ...state,
        statusMilestone: !action.statusMilestone,
        filterOn:
          !action.statusMilestone ||
          state.userFilter ||
          state.statusDeliverable,
      }
    case taskActionTypes.SET_STATUS_DELIVERABLE:
      return {
        ...state,
        statusDeliverable: !action.statusDeliverable,
        filterOn:
          !action.statusDeliverable ||
          state.userFilter ||
          state.statusMilestone,
      }
    case taskActionTypes.SET_TASK_TYPE_TEXT:
      return {
        ...state,
        taskTypeSelectionText: action.taskTypeSelectionText,
      }
    case taskActionTypes.SET_STATUS_ALL:
      return { ...state, statusAll: !action.statusAll }
    case taskActionTypes.SET_STATUS_DONE:
      return { ...state, statusDone: !action.statusDone }

    case taskActionTypes.SET_STATUS_NOT_STARTED:
      return { ...state, statusNotStarted: !action.statusNotStarted }

    case taskActionTypes.SET_STATUS_NOT_REQUIRED:
      return { ...state, statusNotRequired: !action.statusNotRequired }
    case taskActionTypes.SET_EMAIL_TO_FILTER_FOR:
      return {
        ...state,
        email: action.email,
        filterSelectionText: action.filterSelectionText,
        filterOn: true,
        userFilter: true,
      }
    case taskActionTypes.SET_ID_TO_FILTER_FOR:
      return {
        ...state,
        id: action.id,
        filterSelectionText: action.filterSelectionText,
        filterOn: true,
        userFilter: true,
      }
    case taskActionTypes.SET_FILTER_OPTIONS:
      return {
        ...state,
        filterOptions: {
          taskMemberOf: action.taskMemberOf,
          following: action.following,
          logicOperator: action.logicOperator,
        },
      }
    case taskActionTypes.RESET_EMAIL_TO_FILTER_FOR:
      return {
        ...state,
        ...clearUserFilter,
        filterOn: state.statusDeliverable || state.statusMilestone,
      }
    case taskActionTypes.RESET_ALL_FILTERS:
      return {
        ...state,
        ...resetFilters,
      }
    case taskActionTypes.RESET_FILTERS_QUICK_ADD:
      return {
        ...state,
        ...clearUserFilterQuickAdd,
      }
    case taskActionTypes.SET_FETCHING_FILTER_USER_RECENCY:
      return {
        ...state,
        filterUserRecency: undefined,
        fetchingFilterUserRecency: true,
      }
    case taskActionTypes.SET_TASK_FILTER_USER_RECENCY:
      return {
        ...state,
        filterUserRecency: action.users,
        fetchingFilterUserRecency: false,
      }
    case taskActionTypes.SET_TASK_FILTER_PERSON_FILTER:
      let updatedFilterUserRecency
      return {
        ...state,
        personFilter: action.filterPerson,
        filterSelectionText: action.filterSelectionText,
        filterSelectionUser: action.filterSelectionUser,
        filterUserRecency: updatedFilterUserRecency
          ? updatedFilterUserRecency
          : state.filterUserRecency,
      }
    case taskActionTypes.RESET_TASK_FILTER_PERSON_FILTER:
      return { ...state, ...initialState }
    case taskActionTypes.SET_EXPAND_COLLAPSE:
      return { ...state, expandCollapse: action.expandCollapse }
    case taskActionTypes.SET_CURRENT_TASKS:
      return { ...state, currentTasks: action.currentTasks }
    case taskActionTypes.SET_LABEL_FILTER:
      return { ...state, filterLabels: action.filterLabels }
    case taskActionTypes.SET_DETAILED_VIEW:
      return {
        ...state,
        detailedView: {
          viewMode: action.viewMode,
          showRisk: action.showRisk,
          templateViewMode: state.detailedView.templateViewMode,
        },
      }
    case taskActionTypes.SET_DETAILED_TEMPLATE_VIEW:
      return {
        ...state,
        detailedView: {
          viewMode: state.detailedView.viewMode,
          showRisk: state.detailedView.showRisk,
          templateViewMode: action.templateViewMode,
        },
      }
    default:
      return state
  }
}

export default taskFilterReducer
