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

import StatusCodes from 'http-status-codes'
import matterService from '../../services/matter/matter-service'
//import { removeFromAllTeams } from './private-workstream-team'

const initialTeamState = {
  matterSwitcher: {
    team: [],
    isLoaded: false,
    error: false,
  },
  mainPage: {
    team: [],
    isLoaded: false,
    error: false,
  },
}

// Actions
const MATTER_SWITCHER = {
  REQUEST_TEAM: 'matterTeam/matterSwitcher/REQUEST_TEAM',
  RECEIVE_TEAM_SUCCESS: 'matterTeam/matterSwitcher/RECEIVE_TEAM_SUCCESS',
  RECEIVE_TEAM_FAILURE: 'matterTeam/matterSwitcher/RECEIVE_TEAM_FAILURE',
}
const MAIN_PAGE = {
  REQUEST_TEAM: 'matterTeam/mainPage/REQUEST_TEAM',
  RECEIVE_TEAM_SUCCESS: 'matterTeam/mainPage/RECEIVE_TEAM_SUCCESS',
  RECEIVE_TEAM_FAILURE: 'matterTeam/mainPage/RECEIVE_TEAM_FAILURE',
  REQUEST_ADD_VIEWER: 'matterTeam/mainPage/REQUEST_ADD_VIEWER',
  RECEIVE_ADD_VIEWER_SUCCESS: 'matterTeam/mainPage/RECEIVE_ADD_VIEWER_SUCCESS',
  RECEIVE_ADD_VIEWER_FAILURE: 'matterTeam/mainPage/RECEIVE_ADD_VIEWER_FAILURE',
  REQUEST_ADD_EDITOR: 'matterTeam/mainPage/REQUEST_ADD_EDITOR',
  RECEIVE_ADD_EDITOR_SUCCESS: 'matterTeam/mainPage/RECEIVE_ADD_EDITOR_SUCCESS',
  RECEIVE_ADD_EDITOR_FAILURE: 'matterTeam/mainPage/RECEIVE_ADD_EDITOR_FAILURE',
  REQUEST_ADD_ADMIN: 'matterTeam/mainPage/REQUEST_ADD_ADMIN',
  RECEIVE_ADD_ADMIN_SUCCESS: 'matterTeam/mainPage/RECEIVE_ADD_ADMIN_SUCCESS',
  RECEIVE_ADD_ADMIN_FAILURE: 'matterTeam/mainPage/RECEIVE_ADD_ADMIN_FAILURE',
  REQUEST_REMOVE_VIEWER: 'matterTeam/mainPage/REQUEST_REMOVE_VIEWER',
  RECEIVE_REMOVE_VIEWER_SUCCESS:
    'matterTeam/mainPage/RECEIVE_REMOVE_VIEWER_SUCCESS',
  RECEIVE_REMOVE_VIEWER_FAILURE:
    'matterTeam/mainPage/RECEIVE_REMOVE_VIEWER_FAILURE',
  REQUEST_REMOVE_EDITOR: 'matterTeam/mainPage/REQUEST_REMOVE_EDITOR',
  RECEIVE_REMOVE_EDITOR_SUCCESS:
    'matterTeam/mainPage/RECEIVE_REMOVE_EDITOR_SUCCESS',
  RECEIVE_REMOVE_EDITOR_FAILURE:
    'matterTeam/mainPage/RECEIVE_REMOVE_EDITOR_FAILURE',
  REQUEST_REMOVE_ADMIN: 'matterTeam/mainPage/REQUEST_REMOVE_ADMIN',
  RECEIVE_REMOVE_ADMIN_SUCCESS:
    'matterTeam/mainPage/RECEIVE_REMOVE_ADMIN_SUCCESS',
  RECEIVE_REMOVE_ADMIN_FAILURE:
    'matterTeam/mainPage/RECEIVE_REMOVE_ADMIN_FAILURE',
  RECEIVE_REMOVE_COSTS_SUCCESS:
    'matterTeam/mainPage/RECEIVE_REMOVE_COSTS_SUCCESS',
  RECEIVE_REMOVE_COSTS_FAILURE:
    'matterTeam/mainPage/RECEIVE_REMOVE_COSTS_FAILURE',
  RECEIVE_ADD_COSTS_SUCCESS: 'matterTeam/mainPage/RECEIVE_ADD_COSTS_SUCCESS',
  RECEIVE_ADD_COSTS_FAILURE: 'matterTeam/mainPage/RECEIVE_ADD_COSTS_FAILURE',
  RECEIVE_REMOVE_USER_SUCCESS:
    'matterTeam/mainPage/RECEIVE_REMOVE_USER_SUCCESS',
}
const STATE_DESTINATION = {
  MATTER_SWITCHER: 'MATTER_SWITCHER',
  MAIN_PAGE: 'MAIN_PAGE',
}
const DEFAULT_STATE = STATE_DESTINATION.MAIN_PAGE
const STATES = {
  MATTER_SWITCHER,
  MAIN_PAGE,
}
const REDUX_STATE_DESTINATION = {
  MATTER_SWITCHER: 'matterSwitcher',
  MAIN_PAGE: 'mainPage',
}
const USER_ROLE_KEYS = {
  matterViewerId: 'matterViewerId',
  teamMemberId: 'teamMemberId',
  matterAdminId: 'matterAdminId',
  costsId: 'costsId',
}
export const MATTER_TEAM = {
  STATE_DESTINATION,
}

// Reducer
export default function reducer(state = initialTeamState, action = {}) {
  let reduxStateDestination = REDUX_STATE_DESTINATION.MAIN_PAGE
  let variableStateDestination = STATE_DESTINATION.MAIN_PAGE

  if (action.type.includes(REDUX_STATE_DESTINATION.MATTER_SWITCHER)) {
    reduxStateDestination = REDUX_STATE_DESTINATION.MATTER_SWITCHER
    variableStateDestination = STATE_DESTINATION.MATTER_SWITCHER
  }
  switch (action.type) {
    case STATES[`${variableStateDestination}`]['REQUEST_TEAM']: {
      return {
        ...state,
        [`${reduxStateDestination}`]: {
          ...state[`${reduxStateDestination}`],
          isLoaded: false,
        },
      }
    }
    case STATES[`${variableStateDestination}`]['RECEIVE_TEAM_SUCCESS']: {
      return {
        ...state,
        [`${reduxStateDestination}`]: {
          ...state[`${reduxStateDestination}`],
          team: action.team,
          isLoaded: true,
          error: false,
        },
      }
    }
    case STATES[`${variableStateDestination}`]['RECEIVE_TEAM_FAILURE']: {
      return {
        ...state,
        [`${reduxStateDestination}`]: {
          ...state[`${reduxStateDestination}`],
          isLoaded: true,
          error: true,
        },
      }
    }
    case STATES[`${variableStateDestination}`]['REQUEST_ADD_VIEWER']: {
      return {
        ...state,
        [`${reduxStateDestination}`]: {
          ...state[`${reduxStateDestination}`],
          isLoaded: false,
        },
      }
    }
    case STATES[`${variableStateDestination}`]['RECEIVE_ADD_VIEWER_SUCCESS']: {
      return {
        ...state,
        [`${reduxStateDestination}`]: {
          ...state[`${reduxStateDestination}`],
          team: addToTeam(
            state[`${reduxStateDestination}`].team,
            action.users,
            USER_ROLE_KEYS.matterViewerId
          ),
          isLoaded: true,
          error: false,
        },
      }
    }
    case STATES[`${variableStateDestination}`]['RECEIVE_ADD_VIEWER_FAILURE']: {
      return {
        ...state,
        [`${reduxStateDestination}`]: {
          ...state[`${reduxStateDestination}`],
          isLoaded: true,
          error: true,
        },
      }
    }
    case STATES[`${variableStateDestination}`]['REQUEST_ADD_EDITOR']: {
      return {
        ...state,
        [`${reduxStateDestination}`]: {
          ...state[`${reduxStateDestination}`],
          isLoaded: false,
        },
      }
    }
    case STATES[`${variableStateDestination}`]['RECEIVE_ADD_EDITOR_SUCCESS']: {
      return {
        ...state,
        [`${reduxStateDestination}`]: {
          ...state[`${reduxStateDestination}`],
          team: addToTeam(
            state[`${reduxStateDestination}`].team,
            action.users,
            USER_ROLE_KEYS.teamMemberId
          ),
          isLoaded: true,
          error: false,
        },
      }
    }
    case STATES[`${variableStateDestination}`]['RECEIVE_ADD_EDITOR_FAILURE']: {
      return {
        ...state,
        [`${reduxStateDestination}`]: {
          ...state[`${reduxStateDestination}`],
          isLoaded: true,
          error: true,
        },
      }
    }
    case STATES[`${variableStateDestination}`]['REQUEST_ADD_ADMIN']: {
      return {
        ...state,
        [`${reduxStateDestination}`]: {
          ...state[`${reduxStateDestination}`],
          isLoaded: false,
        },
      }
    }
    case STATES[`${variableStateDestination}`]['RECEIVE_ADD_ADMIN_SUCCESS']: {
      return {
        ...state,
        [`${reduxStateDestination}`]: {
          ...state[`${reduxStateDestination}`],
          team: addToTeam(
            state[`${reduxStateDestination}`].team,
            action.users,
            USER_ROLE_KEYS.matterAdminId
          ),
          isLoaded: true,
          error: false,
        },
      }
    }
    case STATES[`${variableStateDestination}`]['RECEIVE_ADD_ADMIN_FAILURE']: {
      return {
        ...state,
        [`${reduxStateDestination}`]: {
          ...state[`${reduxStateDestination}`],
          isLoaded: true,
          error: true,
        },
      }
    }
    case STATES[`${variableStateDestination}`]['REQUEST_REMOVE_VIEWER']: {
      return {
        ...state,
        [`${reduxStateDestination}`]: {
          ...state[`${reduxStateDestination}`],
          isLoaded: false,
        },
      }
    }
    case STATES[`${variableStateDestination}`][
      'RECEIVE_REMOVE_VIEWER_SUCCESS'
    ]: {
      return {
        ...state,
        [`${reduxStateDestination}`]: {
          ...state[`${reduxStateDestination}`],
          team: removeFromTeam(
            state[`${reduxStateDestination}`].team,
            action.viewerId,
            USER_ROLE_KEYS.matterViewerId
          ),
          isLoaded: true,
          error: false,
        },
      }
    }
    case STATES[`${variableStateDestination}`][
      'RECEIVE_REMOVE_VIEWER_FAILURE'
    ]: {
      return {
        ...state,
        [`${reduxStateDestination}`]: {
          ...state[`${reduxStateDestination}`],
          isLoaded: true,
          error: true,
        },
      }
    }
    case STATES[`${variableStateDestination}`]['REQUEST_REMOVE_EDITOR']: {
      return {
        ...state,
        [`${reduxStateDestination}`]: {
          ...state[`${reduxStateDestination}`],
          isLoaded: false,
        },
      }
    }
    case STATES[`${variableStateDestination}`][
      'RECEIVE_REMOVE_EDITOR_SUCCESS'
    ]: {
      return {
        ...state,
        [`${reduxStateDestination}`]: {
          ...state[`${reduxStateDestination}`],
          team: removeFromTeam(
            state[`${reduxStateDestination}`].team,
            action.editorId,
            USER_ROLE_KEYS.teamMemberId
          ),
          isLoaded: true,
          error: false,
        },
      }
    }
    case STATES[`${variableStateDestination}`][
      'RECEIVE_REMOVE_EDITOR_FAILURE'
    ]: {
      return {
        ...state,
        [`${reduxStateDestination}`]: {
          ...state[`${reduxStateDestination}`],
          isLoaded: true,
          error: true,
        },
      }
    }
    case STATES[`${variableStateDestination}`]['REQUEST_REMOVE_ADMIN']: {
      return {
        ...state,
        [`${reduxStateDestination}`]: {
          ...state[`${reduxStateDestination}`],
          isLoaded: false,
        },
      }
    }
    case STATES[`${variableStateDestination}`][
      'RECEIVE_REMOVE_ADMIN_SUCCESS'
    ]: {
      return {
        ...state,
        [`${reduxStateDestination}`]: {
          ...state[`${reduxStateDestination}`],
          team: removeFromTeam(
            state[`${reduxStateDestination}`].team,
            action.adminId,
            USER_ROLE_KEYS.matterAdminId
          ),
          isLoaded: true,
          error: false,
        },
      }
    }
    case STATES[`${variableStateDestination}`][
      'RECEIVE_REMOVE_ADMIN_FAILURE'
    ]: {
      return {
        ...state,
        [`${reduxStateDestination}`]: {
          ...state[`${reduxStateDestination}`],
          isLoaded: true,
          error: true,
        },
      }
    }
    case STATES[`${variableStateDestination}`]['RECEIVE_ADD_COSTS_SUCCESS']: {
      return {
        ...state,
        [`${reduxStateDestination}`]: {
          ...state[`${reduxStateDestination}`],
          team: addToTeam(
            state[`${reduxStateDestination}`].team,
            action.users,
            USER_ROLE_KEYS.costsId
          ),
          isLoaded: true,
          error: false,
        },
      }
    }
    case STATES[`${variableStateDestination}`]['RECEIVE_REMOVE_USER_SUCCESS']: {
      return {
        ...state,
        [`${reduxStateDestination}`]: {
          ...state[`${reduxStateDestination}`],
          team: removeUserFromTeam(
            state[`${reduxStateDestination}`].team,
            action.user
          ),
          isLoaded: true,
          error: false,
        },
      }
    }
    case STATES[`${variableStateDestination}`]['RECEIVE_ADD_COSTS_FAILURE']: {
      return {
        ...state,
        [`${reduxStateDestination}`]: {
          ...state[`${reduxStateDestination}`],
          isLoaded: true,
          error: true,
        },
      }
    }
    case STATES[`${variableStateDestination}`][
      'RECEIVE_REMOVE_COSTS_SUCCESS'
    ]: {
      return {
        ...state,
        [`${reduxStateDestination}`]: {
          ...state[`${reduxStateDestination}`],
          team: removeFromTeam(
            state[`${reduxStateDestination}`].team,
            action.costsId,
            USER_ROLE_KEYS.costsId
          ),
          isLoaded: true,
          error: false,
        },
      }
    }
    case STATES[`${variableStateDestination}`][
      'RECEIVE_REMOVE_COSTS_FAILURE'
    ]: {
      return {
        ...state,
        [`${reduxStateDestination}`]: {
          ...state[`${reduxStateDestination}`],
          isLoaded: true,
          error: true,
        },
      }
    }
    default:
      return state
  }
}

// Action Creators
const creators = {
  requestTeam(stateDestination = DEFAULT_STATE) {
    return {
      type: STATES[`${stateDestination}`]['REQUEST_TEAM'],
    }
  },
  receiveTeamSuccess(json, stateDestination = DEFAULT_STATE) {
    return {
      type: STATES[`${stateDestination}`]['RECEIVE_TEAM_SUCCESS'],
      team: json,
    }
  },
  receiveTeamFailure(stateDestination = DEFAULT_STATE) {
    return {
      type: STATES[`${stateDestination}`]['RECEIVE_TEAM_FAILURE'],
    }
  },
  requestAddViewer(stateDestination = DEFAULT_STATE) {
    return {
      type: STATES[`${stateDestination}`]['REQUEST_ADD_VIEWER'],
    }
  },
  receiveAddViewerSuccess(json, stateDestination = DEFAULT_STATE) {
    return {
      type: STATES[`${stateDestination}`]['RECEIVE_ADD_VIEWER_SUCCESS'],
      users: json,
    }
  },
  receiveAddViewerFailure(stateDestination = DEFAULT_STATE) {
    return {
      type: STATES[`${stateDestination}`]['RECEIVE_ADD_VIEWER_FAILURE'],
    }
  },
  requestAddEditor(stateDestination = DEFAULT_STATE) {
    return {
      type: STATES[`${stateDestination}`]['REQUEST_ADD_EDITOR'],
    }
  },
  receiveAddEditorSuccess(json, stateDestination = DEFAULT_STATE) {
    return {
      type: STATES[`${stateDestination}`]['RECEIVE_ADD_EDITOR_SUCCESS'],
      users: json,
    }
  },
  receiveAddEditorFailure(stateDestination = DEFAULT_STATE) {
    return {
      type: STATES[`${stateDestination}`]['RECEIVE_ADD_EDITOR_FAILURE'],
    }
  },
  requestAddAdmin(stateDestination = DEFAULT_STATE) {
    return {
      type: STATES[`${stateDestination}`]['REQUEST_ADD_ADMIN'],
    }
  },
  receiveAddAdminSuccess(json, stateDestination = DEFAULT_STATE) {
    return {
      type: STATES[`${stateDestination}`]['RECEIVE_ADD_ADMIN_SUCCESS'],
      users: json,
    }
  },
  receiveAddAdminFailure(stateDestination = DEFAULT_STATE) {
    return {
      type: STATES[`${stateDestination}`]['RECEIVE_ADD_ADMIN_FAILURE'],
    }
  },
  requestRemoveViewer(stateDestination = DEFAULT_STATE) {
    return {
      type: STATES[`${stateDestination}`]['REQUEST_REMOVE_VIEWER'],
    }
  },
  receiveRemoveViewerSuccess(viewerId, stateDestination = DEFAULT_STATE) {
    return {
      type: STATES[`${stateDestination}`]['RECEIVE_REMOVE_VIEWER_SUCCESS'],
      viewerId: viewerId,
    }
  },
  receiveRemoveViewerFailure(stateDestination = DEFAULT_STATE) {
    return {
      type: STATES[`${stateDestination}`]['RECEIVE_REMOVE_VIEWER_FAILURE'],
    }
  },
  requestRemoveEditor(stateDestination = DEFAULT_STATE) {
    return {
      type: STATES[`${stateDestination}`]['REQUEST_REMOVE_EDITOR'],
    }
  },
  receiveRemoveEditorSuccess(editorId, stateDestination = DEFAULT_STATE) {
    return {
      type: STATES[`${stateDestination}`]['RECEIVE_REMOVE_EDITOR_SUCCESS'],
      editorId: editorId,
    }
  },
  receiveRemoveEditorFailure(stateDestination = DEFAULT_STATE) {
    return {
      type: STATES[`${stateDestination}`]['RECEIVE_REMOVE_EDITOR_FAILURE'],
    }
  },
  requestRemoveAdmin(stateDestination = DEFAULT_STATE) {
    return {
      type: STATES[`${stateDestination}`]['REQUEST_REMOVE_ADMIN'],
    }
  },
  receiveRemoveAdminSuccess(adminId, stateDestination = DEFAULT_STATE) {
    return {
      type: STATES[`${stateDestination}`]['RECEIVE_REMOVE_ADMIN_SUCCESS'],
      adminId: adminId,
    }
  },
  receiveRemoveAdminFailure(stateDestination = DEFAULT_STATE) {
    return {
      type: STATES[`${stateDestination}`]['RECEIVE_REMOVE_ADMIN_FAILURE'],
    }
  },

  receiveRemoveCostsSuccess(costsId, stateDestination = DEFAULT_STATE) {
    return {
      type: STATES[`${stateDestination}`]['RECEIVE_REMOVE_COSTS_SUCCESS'],
      costsId: costsId,
    }
  },
  receiveRemoveCostsFailure(stateDestination = DEFAULT_STATE) {
    return {
      type: STATES[`${stateDestination}`]['RECEIVE_REMOVE_COSTS_FAILURE'],
    }
  },
  receiveRemoveUserSuccess(user, stateDestination = DEFAULT_STATE) {
    return {
      type: STATES[`${stateDestination}`]['RECEIVE_REMOVE_USER_SUCCESS'],
      user: user,
    }
  },
  receiveAddCostsSuccess(json, stateDestination = DEFAULT_STATE) {
    return {
      type: STATES[`${stateDestination}`]['RECEIVE_ADD_COSTS_SUCCESS'],
      users: json,
    }
  },
  receiveAddCostsFailure(stateDestination = DEFAULT_STATE) {
    return {
      type: STATES[`${stateDestination}`]['RECEIVE_ADD_COSTS_FAILURE'],
    }
  },
}

export const fetchTeam =
  (
    id,
    includeTaskCount = false,
    includePlaceholders = false,
    stateDestination = DEFAULT_STATE
  ) =>
  dispatch => {
    dispatch(creators.requestTeam(stateDestination))
    return matterService
      .getMatterTeam(id, includeTaskCount, includePlaceholders)
      .then(response => {
        if (response.status === StatusCodes.OK) {
          return dispatch(
            creators.receiveTeamSuccess(response.body, stateDestination)
          )
        }
        return dispatch(creators.receiveTeamFailure(stateDestination))
      })
  }

export const addViewOnly =
  (userIds, matterId, costAccess, stateDestination = DEFAULT_STATE) =>
  dispatch => {
    if (!Array.isArray(userIds)) userIds = [userIds]
    dispatch(creators.requestAddViewer())
    return matterService
      .addViewOnly(userIds, matterId, costAccess)
      .then(response => {
        if (response.status === StatusCodes.OK) {
          dispatch(
            creators.receiveAddViewerSuccess(response.body, stateDestination)
          )
          if (costAccess) {
            response.body.forEach(res => {
              dispatch(
                creators.receiveAddCostsSuccess(
                  [{ id: res.user.costsId, user: res.user }],
                  stateDestination
                )
              )
            })
          }
          return
        }
        return dispatch(creators.receiveAddViewerFailure(stateDestination))
      })
  }

export const addEditor =
  (userIds, matterId, costAccess, stateDestination = DEFAULT_STATE) =>
  dispatch => {
    if (!Array.isArray(userIds)) userIds = [userIds]
    dispatch(creators.requestAddEditor())
    return matterService
      .addEditor(userIds, matterId, costAccess)
      .then(response => {
        if (response.status === StatusCodes.OK) {
          dispatch(
            creators.receiveAddEditorSuccess(response.body, stateDestination)
          )
          if (costAccess) {
            response.body.forEach(res => {
              dispatch(
                creators.receiveAddCostsSuccess(
                  [{ id: res.user.costsId, user: res.user }],
                  stateDestination
                )
              )
            })
          }
          return
        }
        return dispatch(creators.receiveAddEditorFailure(stateDestination))
      })
  }

export const addAdmin =
  (userIds, matterId, costAccess, stateDestination = DEFAULT_STATE) =>
  dispatch => {
    if (!Array.isArray(userIds)) userIds = [userIds]
    dispatch(creators.requestAddAdmin())
    return matterService
      .addAdmin(userIds, matterId, costAccess)
      .then(response => {
        if (response.status === StatusCodes.OK) {
          dispatch(
            creators.receiveAddAdminSuccess(response.body, stateDestination)
          )
          if (costAccess) {
            response.body.forEach(res => {
              dispatch(
                creators.receiveAddCostsSuccess(
                  [{ id: res.user.costsId, user: res.user }],
                  stateDestination
                )
              )
            })
          }
          return
        }
        return dispatch(creators.receiveAddAdminFailure(stateDestination))
      })
  }

export const removeViewOnly =
  (viewerId, matterId, stateDestination = DEFAULT_STATE) =>
  dispatch => {
    if (viewerId === 0) return
    dispatch(creators.requestRemoveViewer())
    return matterService.removeViewOnly(matterId, viewerId).then(response => {
      if (response.status === StatusCodes.OK) {
        return dispatch(
          creators.receiveRemoveViewerSuccess(viewerId, stateDestination)
        )
      }
      return dispatch(creators.receiveRemoveViewerFailure(stateDestination))
    })
  }

export const removeEditor =
  (editorId, matterId, stateDestination = DEFAULT_STATE) =>
  dispatch => {
    if (editorId === 0) return
    dispatch(creators.requestRemoveEditor())
    return matterService.removeEditor(matterId, editorId).then(response => {
      if (response.status === StatusCodes.OK) {
        return dispatch(
          creators.receiveRemoveEditorSuccess(editorId, stateDestination)
        )
      }
      return dispatch(creators.receiveRemoveEditorFailure(stateDestination))
    })
  }

export const removeAdmin =
  (adminId, matterId, stateDestination = DEFAULT_STATE) =>
  dispatch => {
    if (adminId === 0) return
    dispatch(creators.requestRemoveAdmin())
    return matterService.removeAdmin(matterId, adminId).then(response => {
      if (response.status === StatusCodes.OK) {
        return dispatch(
          creators.receiveRemoveAdminSuccess(adminId, stateDestination)
        )
      }
      return dispatch(creators.receiveRemoveAdminFailure(stateDestination))
    })
  }

export const addCosts =
  (userId, matterId, stateDestination = DEFAULT_STATE) =>
  dispatch => {
    return matterService.addCosts(userId, matterId).then(response => {
      if (response.status === StatusCodes.OK) {
        return dispatch(
          creators.receiveAddCostsSuccess(response.body, stateDestination)
        )
      }
      return dispatch(creators.receiveAddCostsFailure(stateDestination))
    })
  }

export const removeCosts =
  (costsId, matterId, stateDestination = DEFAULT_STATE) =>
  dispatch => {
    if (costsId === 0) return
    return matterService.removeCosts(matterId, costsId).then(response => {
      if (response.status === StatusCodes.OK) {
        return dispatch(
          creators.receiveRemoveCostsSuccess(costsId, stateDestination)
        )
      }
      return dispatch(creators.receiveRemoveCostsFailure(stateDestination))
    })
  }

export const removeUser =
  (user, matterId, stateDestination = DEFAULT_STATE) =>
  dispatch => {
    return matterService
      .removeUserFromMatter(user.user.id, matterId)
      .then(res => {
        if (res.status === StatusCodes.OK) {
          return dispatch(
            creators.receiveRemoveUserSuccess(user.user.id, stateDestination)
          )
        }
      })
  }

// Side effects

/*
  Add user to team, if they're already in the team add the role to them.
 */
const addToTeam = (team, users, roleKey) => {
  let newUsers = []
  users.forEach(user => {
    const existingUserIndex = team.findIndex(
      teamUser => teamUser.user.id === user.user.id
    )
    if (existingUserIndex > -1) {
      team[existingUserIndex][roleKey] = user.id
    } else {
      newUsers.push({
        ...user,
        [roleKey]: user.id,
      })
    }
  })
  return [...team, ...newUsers]
}

/*
  Remove role from user. If user has no roles, remove them from the team entirely.
 */
const removeFromTeam = (team, roleId, roleKey) => {
  const userToUpdate = team.findIndex(teamUser => teamUser[roleKey] === roleId)
  if (userToUpdate > -1) {
    team[userToUpdate][roleKey] = 0
    let shouldRemoveUser = true
    Object.values(USER_ROLE_KEYS).forEach(userRoleKey => {
      if (team[userToUpdate][userRoleKey] > 0) {
        shouldRemoveUser = false
      }
    })
    if (shouldRemoveUser) {
      team = team.filter(
        teamUser => teamUser.user.id !== team[userToUpdate].user.id
      )
    }
  }
  return team
}

const removeUserFromTeam = (team, user) =>
  team.filter(teamUser => teamUser.user.id !== user)
