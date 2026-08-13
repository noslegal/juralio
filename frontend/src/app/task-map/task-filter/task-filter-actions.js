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
import { removeZeroStateTask } from '../../../redux/ducks/improved-taskmap'
import taskFilterUserRecency from '../../../services/task/task-filter-user-recency-service'
import { OPERATOR, TASK_MAP_VIEW_MODE_ENUM } from '../../constants'

export const taskActionTypes = {
  SET_EMAIL_TO_FILTER_FOR: 'SET_EMAIL_TO_FILTER_FOR',
  SET_FILTER_OPTIONS: 'SET_FILTER_OPTIONS',
  RESET_EMAIL_TO_FILTER_FOR: 'RESET_EMAIL_TO_FILTER_FOR',
  RESET_TASK_FILTER_PERSON_FILTER: 'RESET_TASK_FILTER_PERSON_FILTER',
  SET_FETCHING_FILTER_USER_RECENCY: 'SET_FETCHING_FILTER_USER_RECENCY',
  SET_TASK_FILTER_USER_RECENCY: 'SET_TASK_FILTER_USER_RECENCY',
  SET_TASK_FILTER_PERSON_FILTER: 'SET_TASK_FILTER_PERSON_FILTER',
  SET_STATUS_DONE: 'SET_STATUS_DONE',
  SET_STATUS_NOT_STARTED: 'SET_STATUS_NOT_STARTED',
  SET_STATUS_NOT_REQUIRED: 'SET_STATUS_NOT_REQUIRED',
  SET_STATUS_ALL: 'SET_STATUS_ALL',
  SET_STATUS_MILESTONE: 'SET_STATUS_MILESTONE',
  SET_STATUS_DELIVERABLE: 'SET_STATUS_DELIVERABLE',
  SET_TASK_TYPE_TEXT: 'SET_TASK_TYPE_TEXT',
  SET_EXPAND_COLLAPSE: 'SET_EXPAND_COLLAPSE',
  SET_CURRENT_TASKS: 'SET_CURRENT_TASKS',
  SET_LABEL_FILTER: 'SET_LABEL_FILTER',
  SET_DETAILED_VIEW: 'SET_DETAILED_VIEW',
  SET_DETAILED_TEMPLATE_VIEW: 'SET_DETAILED_TEMPLATE_VIEW',
  SET_ID_TO_FILTER_FOR: 'SET_ID_TO_FILTER_FOR',
  RESET_ALL_FILTERS: 'RESET_ALL_FILTERS',
  RESET_FILTERS_QUICK_ADD: 'RESET_FILTERS_QUICK_ADD',
  SET_LEVEL_FILTER: 'SET_LEVEL_FILTER',
  COLLAPSE_TASK: 'COLLAPSE_TASK',
  EXPAND_TASK: 'EXPAND_TASK',
}

const _resetFiltersQuickAdd = () => {
  return { type: taskActionTypes.RESET_FILTERS_QUICK_ADD }
}

const _resetAllFilters = () => {
  return { type: taskActionTypes.RESET_ALL_FILTERS }
}

const _collapseTask = id => {
  return { type: taskActionTypes.COLLAPSE_TASK, toAdd: id }
}

const _expandTask = id => {
  return { type: taskActionTypes.EXPAND_TASK, toRemove: id }
}

const _setLevelFilter = current => {
  return {
    type: taskActionTypes.SET_LEVEL_FILTER,
    levelFilter: current,
  }
}

const _setStatusMilestone = current => {
  return {
    type: taskActionTypes.SET_STATUS_MILESTONE,
    statusMilestone: current,
  }
}
const _setStatusDeliverable = current => {
  return {
    type: taskActionTypes.SET_STATUS_DELIVERABLE,
    statusDeliverable: current,
  }
}
const _taskTypeSelectionText = text => {
  return {
    type: taskActionTypes.SET_TASK_TYPE_TEXT,
    taskTypeSelectionText: text,
  }
}
const _setStatusAll = current => {
  return {
    type: taskActionTypes.SET_STATUS_ALL,
    statusAll: current,
  }
}

const _setStatusDone = current => {
  return {
    type: taskActionTypes.SET_STATUS_DONE,
    statusDone: current,
  }
}

const _setStatusNotStarted = current => {
  return {
    type: taskActionTypes.SET_STATUS_NOT_STARTED,
    statusNotStarted: current,
  }
}

const _setStatusNotRequired = current => {
  return {
    type: taskActionTypes.SET_STATUS_NOT_REQUIRED,
    statusNotRequired: current,
  }
}

const _setCurrentLabels = current => {
  return {
    type: taskActionTypes.SET_LABEL_FILTER,
    filterLabels: current,
  }
}

const _setExpandCollapse = current => {
  return {
    type: taskActionTypes.SET_EXPAND_COLLAPSE,
    expandCollapse: current,
  }
}

const _setCurrentTasks = current => {
  return {
    type: taskActionTypes.SET_CURRENT_TASKS,
    currentTasks: current,
  }
}

const _setEmailToFilterFor = (email, filterSelectionText) => {
  return {
    type: taskActionTypes.SET_EMAIL_TO_FILTER_FOR,
    email: email,
    filterSelectionText: filterSelectionText,
  }
}

const _setIdToFilterFor = (id, filterSelectionText) => {
  return {
    type: taskActionTypes.SET_ID_TO_FILTER_FOR,
    id: id,
    filterSelectionText: filterSelectionText,
  }
}

const _setFilterOptions = (taskMemberOf, following, logicOperator) => {
  return {
    type: taskActionTypes.SET_FILTER_OPTIONS,
    taskMemberOf: taskMemberOf,
    following: following,
    logicOperator: logicOperator,
  }
}

const _resetEmailToFilterFor = () => {
  return {
    type: taskActionTypes.RESET_EMAIL_TO_FILTER_FOR,
  }
}

const _resetTaskFilterPersonFilter = () => {
  return {
    type: taskActionTypes.RESET_TASK_FILTER_PERSON_FILTER,
  }
}

const _setFetchingFilterUserRecency = () => {
  return {
    type: taskActionTypes.SET_FETCHING_FILTER_USER_RECENCY,
  }
}

const _setFilterUserRecency = users => {
  return {
    type: taskActionTypes.SET_TASK_FILTER_USER_RECENCY,
    users: users,
  }
}

const _updateTaskFilterPersonFilter = (
  filterValue,
  filterSelectionText,
  filterSelectionUser
) => {
  return {
    type: taskActionTypes.SET_TASK_FILTER_PERSON_FILTER,
    filterPerson: filterValue,
    filterSelectionText: filterSelectionText,
    filterSelectionUser: filterSelectionUser,
  }
}

export const taskFilterActions = {
  setLevelFilter: current => dispatch => {
    dispatch(_setLevelFilter(current))
  },
  setStatusMilestone: current => dispatch => {
    dispatch(removeZeroStateTask())
    dispatch(_setStatusMilestone(current))
  },
  setStatusDeliverable: current => dispatch => {
    dispatch(removeZeroStateTask())
    dispatch(_setStatusDeliverable(current))
  },
  setTaskTypeSelectionText: text => dispatch => {
    dispatch(_taskTypeSelectionText(text))
  },
  setStatusAll: current => dispatch => {
    dispatch(removeZeroStateTask())

    dispatch(_setStatusAll(current))
  },
  setStatusDone: current => dispatch => {
    dispatch(removeZeroStateTask())

    dispatch(_setStatusDone(current))
  },
  setStatusNotStarted: current => dispatch => {
    dispatch(removeZeroStateTask())

    dispatch(_setStatusNotStarted(current))
  },
  setStatusNotRequired: current => dispatch => {
    dispatch(removeZeroStateTask())

    dispatch(_setStatusNotRequired(current))
  },
  setExpandCollapse: current => dispatch => {
    dispatch(removeZeroStateTask())

    dispatch(_setExpandCollapse(current))
  },
  setCurrentTasks: current => dispatch => {
    dispatch(removeZeroStateTask())

    dispatch(_setCurrentTasks(current))
  },
  setCurrentLabels: current => dispatch => {
    dispatch(removeZeroStateTask())

    dispatch(_setCurrentLabels(current))
  },
  setEmailToFilterFor:
    (
      email,
      filterSelectionText,
      {
        taskMemberOf = true,
        following = true,
        logicOperator = OPERATOR.AND,
      } = {}
    ) =>
    dispatch => {
      dispatch(_setEmailToFilterFor(email, filterSelectionText))
      dispatch(_setFilterOptions(taskMemberOf, following, logicOperator))
    },
  resetEmailToFilterFor: () => dispatch => {
    dispatch(_resetEmailToFilterFor())
  },
  setIdToFilterFor:
    (
      id,
      filterSelectionText,
      {
        taskMemberOf = true,
        following = true,
        logicOperator = OPERATOR.AND,
      } = {}
    ) =>
    dispatch => {
      dispatch(_setIdToFilterFor(id, filterSelectionText))
      dispatch(_setFilterOptions(taskMemberOf, following, logicOperator))
    },
  updateTaskFilterPersonFilter:
    (filterValue, filterSelectionText, filterSelectionUser) => dispatch =>
      dispatch(
        _updateTaskFilterPersonFilter(
          filterValue,
          filterSelectionText,
          filterSelectionUser
        )
      ),
  resetTaskFilterPersonFilter: () => dispatch => {
    dispatch(_resetTaskFilterPersonFilter())
  },
  fetchFilterUserRecency: matterId => dispatch => {
    dispatch(_setFetchingFilterUserRecency())

    return taskFilterUserRecency
      .getNotificationFilterUserRecency(matterId)
      .then(response => {
        if (response.status === StatusCodes.OK) {
          dispatch(_setFilterUserRecency(response.body[0]))
        }
      })
  },
  resetFilterUserRecency: () => dispatch => {
    dispatch(_setFilterUserRecency())
  },
  setFetchingFilterUserRecency: () => dispatch => {
    return dispatch(_setFetchingFilterUserRecency())
  },
  postFilterUserRecency: (matterId, userId) => dispatch => {
    return taskFilterUserRecency.saveNotificationFilterUserRecency(
      matterId,
      userId
    )
  },
  setDetailedView:
    (viewMode = TASK_MAP_VIEW_MODE_ENUM.STANDARD, showRisk = true) =>
    dispatch => {
      dispatch({
        type: taskActionTypes.SET_DETAILED_VIEW,
        viewMode: viewMode,
        showRisk: showRisk,
      })
    },
  setDetailedTemplateView:
    (viewMode = TASK_MAP_VIEW_MODE_ENUM.STANDARD) =>
    dispatch => {
      dispatch({
        type: taskActionTypes.SET_DETAILED_TEMPLATE_VIEW,
        templateViewMode: viewMode,
      })
    },

  resetFiltersQuickAdd: () => dispatch => {
    dispatch(_resetFiltersQuickAdd())
  },

  resetAllFilters: () => dispatch => {
    dispatch(_resetTaskFilterPersonFilter())
    taskFilterActions.setStatusDone(true)
    taskFilterActions.setStatusNotStarted(false)
    taskFilterActions.setStatusNotRequired(true)
    taskFilterActions.setStatusAll(false)
    taskFilterActions.setDetailedView(false, true)
  },
  resetAllFiltersTemplate: () => dispatch => {
    dispatch(taskFilterActions.setStatusMilestone(true))
    taskFilterActions.setStatusDone(true)
    taskFilterActions.setStatusNotStarted(false)
    taskFilterActions.setStatusNotRequired(true)
    taskFilterActions.setStatusAll(false)
  },

  resetAllFilter: () => dispatch => {
    dispatch(_resetAllFilters())
  },

  collapseTask: id => dispatch => {
    dispatch(_collapseTask(id))
  },
  expandTask: id => dispatch => {
    dispatch(_expandTask(id))
  },
}
