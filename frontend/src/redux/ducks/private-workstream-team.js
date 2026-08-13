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
import privateWorkstreamService from '../../services/project/private-workstream-team-service'

const initialTeamState = {
  mainPage: {
    team: [],
    isLoaded: false,
    error: false,
  },
}

// Actions
const MAIN_PAGE = {
  REQUEST_TEAM: 'matterTeam/mainPage/REQUEST_TEAM',
  RECEIVE_TEAM_SUCCESS: 'matterTeam/mainPage/RECEIVE_TEAM_SUCCESS',
  RECEIVE_TEAM_FAILURE: 'matterTeam/mainPage/RECEIVE_TEAM_FAILURE',
  REQUEST_ADD_MEMBER: 'matterTeam/mainPage/REQUEST_ADD_MEMBER',
  RECEIVE_ADD_MEMBER_SUCCESS: 'matterTeam/mainPage/RECEIVE_ADD_MEMBER_SUCCESS',
  RECEIVE_ADD_MEMBER_FAILURE: 'matterTeam/mainPage/RECEIVE_ADD_MEMBER_FAILURE',
  REQUEST_REMOVE_MEMBER: 'matterTeam/mainPage/REQUEST_REMOVE_MEMBER',
  RECEIVE_REMOVE_MEMBER_SUCCESS:
    'matterTeam/mainPage/RECEIVE_REMOVE_MEMBER_SUCCESS',
  RECEIVE_REMOVE_MEMBER_FAILURE:
    'matterTeam/mainPage/RECEIVE_REMOVE_MEMBER_FAILURE',
}

const STATE_DESTINATION = {
  MAIN_PAGE: 'MAIN_PAGE',
}
const DEFAULT_STATE = STATE_DESTINATION.MAIN_PAGE
const STATES = {
  MAIN_PAGE,
}
const REDUX_STATE_DESTINATION = {
  MAIN_PAGE: 'mainPage',
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
    case STATES[`${variableStateDestination}`]['REQUEST_ADD_MEMBER']: {
      return {
        ...state,
        [`${reduxStateDestination}`]: {
          ...state[`${reduxStateDestination}`],
          isLoaded: false,
        },
      }
    }
    case STATES[`${variableStateDestination}`]['RECEIVE_ADD_MEMBER_SUCCESS']: {
      return {
        ...state,
        [`${reduxStateDestination}`]: {
          ...state[`${reduxStateDestination}`],
          isLoaded: true,
          error: false,
        },
      }
    }
    case STATES[`${variableStateDestination}`]['RECEIVE_ADD_MEMBER_FAILURE']: {
      return {
        ...state,
        [`${reduxStateDestination}`]: {
          ...state[`${reduxStateDestination}`],
          isLoaded: true,
          error: true,
        },
      }
    }

    case STATES[`${variableStateDestination}`]['REQUEST_ADD_MEMBER']: {
      return {
        ...state,
        [`${reduxStateDestination}`]: {
          ...state[`${reduxStateDestination}`],
          isLoaded: false,
        },
      }
    }

    case STATES[`${variableStateDestination}`]['RECEIVE_ADD_MEMBER_SUCCESS']: {
      return {
        ...state,
        [`${reduxStateDestination}`]: {
          ...state[`${reduxStateDestination}`],
          isLoaded: true,
          error: false,
        },
      }
    }

    case STATES[`${variableStateDestination}`]['RECEIVE_ADD_MEMBER_FAILURE']: {
      return {
        ...state,
        [`${reduxStateDestination}`]: {
          ...state[`${reduxStateDestination}`],
          isLoaded: true,
          error: true,
        },
      }
    }

    case STATES[`${variableStateDestination}`]['REQUEST_REMOVE_MEMBER']: {
      return {
        ...state,
        [`${reduxStateDestination}`]: {
          ...state[`${reduxStateDestination}`],
          isLoaded: false,
        },
      }
    }
    case STATES[`${variableStateDestination}`][
      'RECEIVE_REMOVE_MEMBER_SUCCESS'
    ]: {
      return {
        ...state,
        [`${reduxStateDestination}`]: {
          ...state[`${reduxStateDestination}`],
          isLoaded: true,
          error: false,
        },
      }
    }
    case STATES[`${variableStateDestination}`][
      'RECEIVE_REMOVE_MEMBER_FAILURE'
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

    case STATES[`${variableStateDestination}`]['REQUEST_REMOVE_MEMBER']: {
      return {
        ...state,
        [`${reduxStateDestination}`]: {
          ...state[`${reduxStateDestination}`],
          isLoaded: false,
        },
      }
    }

    case STATES[`${variableStateDestination}`][
      'RECEIVE_REMOVE_MEMBER_SUCCESS'
    ]: {
      return {
        ...state,
        [`${reduxStateDestination}`]: {
          ...state[`${reduxStateDestination}`],
          isLoaded: true,
          error: false,
        },
      }
    }

    case STATES[`${variableStateDestination}`][
      'RECEIVE_REMOVE_MEMBER_FAILURE'
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
  requestAddMember(stateDestination = DEFAULT_STATE) {
    return {
      type: STATES[`${stateDestination}`]['REQUEST_ADD_MEMBER'],
    }
  },
  receiveAddMemberSuccess(json, stateDestination = DEFAULT_STATE) {
    return {
      type: STATES[`${stateDestination}`]['RECEIVE_ADD_MEMBER_SUCCESS'],
      users: json,
    }
  },
  receiveAddMemberFailure(stateDestination = DEFAULT_STATE) {
    return {
      type: STATES[`${stateDestination}`]['RECEIVE_ADD_MEMBER_FAILURE'],
    }
  },
  requestRemoveMember(stateDestination = DEFAULT_STATE) {
    return {
      type: STATES[`${stateDestination}`]['REQUEST_REMOVE_MEMBER'],
    }
  },
  receiveRemoveMemberSuccess(adminId, stateDestination = DEFAULT_STATE) {
    return {
      type: STATES[`${stateDestination}`]['RECEIVE_REMOVE_MEMBER_SUCCESS'],
      adminId: adminId,
    }
  },
  receiveRemoveMemberFailure(stateDestination = DEFAULT_STATE) {
    return {
      type: STATES[`${stateDestination}`]['RECEIVE_REMOVE_MEMBER_FAILURE'],
    }
  },
}

export const addMember =
  (matterId, workstreamId, userIds, stateDestination = DEFAULT_STATE) =>
  dispatch => {
    if (!Array.isArray(userIds)) userIds = [userIds]
    dispatch(creators.requestAddMember())
    return privateWorkstreamService
      .addMembers(matterId, workstreamId, userIds)
      .then(response => {
        if (response.status === StatusCodes.OK) {
          return dispatch(
            creators.receiveAddMemberSuccess(response.body, stateDestination)
          )
        }
        return dispatch(creators.receiveAddMemberFailure(stateDestination))
      })
  }

export const removeMember =
  (
    matterId,
    workstreamId,
    privateWorkstreamMemberId,
    stateDestination = DEFAULT_STATE
  ) =>
  dispatch => {
    if (privateWorkstreamMemberId === 0) return
    dispatch(creators.requestRemoveMember())
    return privateWorkstreamService
      .removeMember(matterId, workstreamId, privateWorkstreamMemberId)
      .then(response => {
        if (response.status === StatusCodes.OK) {
          return dispatch(
            creators.receiveRemoveMemberSuccess(
              privateWorkstreamMemberId,
              stateDestination
            )
          )
        }
        return dispatch(creators.receiveRemoveMemberFailure(stateDestination))
      })
  }

export const removeFromAllTeams =
  (matterId, userId, stateDestination = DEFAULT_STATE) =>
  dispatch => {
    dispatch(creators.requestRemoveMember())
    return privateWorkstreamService
      .removeFromAllTeams(matterId, userId)
      .then(response => {
        if (response.status === StatusCodes.OK) {
          return dispatch(
            creators.receiveRemoveMemberSuccess(userId, stateDestination)
          )
        }
        return dispatch(creators.receiveRemoveMemberFailure(stateDestination))
      })
  }
