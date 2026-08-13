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
import matterService from '../../services/matter/matter-service'

const initialMatterResourcesState = {
  resources: [],
  hasWorkstreamResources: false,
  matterId: undefined,
  isLoaded: false,
  error: false,
  workstreamResources: [],
}

const MATTER_RESOURCES = {
  REQUEST_RESOURCES: 'matterResources/REQUEST_RESOURCES',
  RECEIVE_RESOURCES_SUCCESS: 'matterResources/RECEIVE_RESOURCES_SUCCESS',
  RECEIVE_RESOURCES_FAILURE: 'matterResources/RECEIVE_RESOURCES_FAILURE',
  REQUEST_ADD_RESOURCE: 'matterResources/REQUEST_RESOURCES',
  ADD_RESOURCE_SUCCESS: 'matterResources/ADD_RESOURCE_SUCCESS',
  ADD_RESOURCE_FAILURE: 'matterResources/ADD_RESOURCE_FAILURE',
  REQUEST_DELETE_RESOURCE: 'matterResources/REQUEST_DELETE_RESOURCE',
  RECIEVE_DELETE_RESOURCE_SUCCESS:
    'matterResources/RECIEVE_DELETE_RESOURCE_SUCCESS',
  RECIEVE_DELETE_RESOURCE_FAILURE:
    'matterResources/RECIEVE_DELETE_RESOURCE_FAILURE',
  REQUEST_WORKSTREAM_RESOURCES: 'matterResources/workstreams/REQUEST_RESOURCES',
  RECEIVE_WORKSTREAM_RESOURCES_SUCCESS:
    'matterResources/workstreams/RECEIVE_RESOURCES_SUCCESS',
  RECEIVE_WORKSTREAM_RESOURCES_FAILURE:
    'matterResources/workstreams/RECEIVE_RESOURCES_FAILURE',
}

export default function reducer(
  state = initialMatterResourcesState,
  action = {}
) {
  switch (action.type) {
    case MATTER_RESOURCES.REQUEST_RESOURCES:
      return {
        ...state,
        isLoaded: false,
        matterId: action.matterId,
      }
    case MATTER_RESOURCES.RECEIVE_RESOURCES_SUCCESS:
      return {
        ...state,
        isLoaded: true,
        resources: action.resources,
        hasWorkstreamResources: action.hasWorkstreamResources,
      }
    case MATTER_RESOURCES.RECEIVE_RESOURCES_FAILURE:
      return {
        ...state,
        resources: [],
        isLoaded: false,
        error: true,
      }

    case MATTER_RESOURCES.REQUEST_ADD_RESOURCE:
      return {
        ...state,
        matterId: action.matterId,
      }
    case MATTER_RESOURCES.ADD_RESOURCE_SUCCESS:
      return {
        ...state,
        isLoaded: true,
        resources: [action.resource, ...state.resources],
      }
    case MATTER_RESOURCES.ADD_RESOURCE_FAILURE:
      return {
        ...state,
        error: true,
      }
    case MATTER_RESOURCES.REQUEST_DELETE_RESOURCE:
      return {
        ...state,
      }
    case MATTER_RESOURCES.RECIEVE_DELETE_RESOURCE_SUCCESS:
      return {
        ...state,
        resources: state.resources.filter(i => i.id !== action.resourceId),
      }
    case MATTER_RESOURCES.RECIEVE_DELETE_RESOURCE_FAILURE:
      return {
        ...state,
        error: true,
      }
    case MATTER_RESOURCES.REQUEST_WORKSTREAM_RESOURCES:
      return state
    case MATTER_RESOURCES.RECEIVE_WORKSTREAM_RESOURCES_SUCCESS:
      return {
        ...state,
        workstreamResources: action.resources,
      }
    case MATTER_RESOURCES.RECEIVE_WORKSTREAM_RESOURCES_FAILURE:
      return {
        ...state,
        workstreamResources: [],
        hasWorkstreamResources: false,
      }
    default:
      return state
  }
}

const creators = {
  requestMatterResources(matterId) {
    return {
      type: MATTER_RESOURCES.REQUEST_RESOURCES,
      matterId: matterId,
    }
  },
  receiveMatterResourcesSuccess(resources, hasWorkstreamResources) {
    return {
      type: MATTER_RESOURCES.RECEIVE_RESOURCES_SUCCESS,
      resources: resources,
      hasWorkstreamResources: hasWorkstreamResources,
    }
  },
  receiveMatterResourcesFailure() {
    return {
      type: MATTER_RESOURCES.RECEIVE_RESOURCES_FAILURE,
    }
  },
  requestAddResource(matterId) {
    return {
      type: MATTER_RESOURCES.REQUEST_ADD_RESOURCE,
      matterId: matterId,
    }
  },
  addResourceSuccess(resource) {
    return {
      type: MATTER_RESOURCES.ADD_RESOURCE_SUCCESS,
      resource: resource,
    }
  },
  addResourceFailure() {
    return {
      type: MATTER_RESOURCES.ADD_RESOURCE_FAILURE,
    }
  },
  requestDeleteResource() {
    return {
      type: MATTER_RESOURCES.REQUEST_DELETE_RESOURCE,
    }
  },
  deleteResourceSuccess(resourceId) {
    return {
      type: MATTER_RESOURCES.RECIEVE_DELETE_RESOURCE_SUCCESS,
      resourceId: resourceId,
    }
  },
  deleteResourceFailure() {
    return {
      type: MATTER_RESOURCES.RECIEVE_DELETE_RESOURCE_FAILURE,
      error: true,
    }
  },
  requestMatterWorkstreamResources() {
    return {
      type: MATTER_RESOURCES.REQUEST_WORKSTREAM_RESOURCES,
    }
  },
  receiveMatterWorkstreamResourcesSuccess(resources) {
    return {
      type: MATTER_RESOURCES.RECEIVE_WORKSTREAM_RESOURCES_SUCCESS,
      resources: resources,
    }
  },
  receiveMatterWorkstreamResourcesFailure() {
    return {
      type: MATTER_RESOURCES.RECEIVE_WORKSTREAM_RESOURCES_FAILURE,
    }
  },
}

export const fetchMatterResources = matterId => dispatch => {
  dispatch(creators.requestMatterResources(matterId))
  return matterService.getMatterResources(matterId).then(response => {
    if (response.status === StatusCodes.OK) {
      return dispatch(
        creators.receiveMatterResourcesSuccess(
          response.body.linkResources,
          response.body.hasTreeRelatedResources
        )
      )
    }
    return dispatch(creators.receiveMatterResourcesFailure())
  })
}

export const addMatterResource = (matterId, name, url, image) => dispatch => {
  dispatch(creators.requestAddResource(matterId))
  return matterService
    .addMatterResource(matterId, name, url, image)
    .then(response => {
      if (response.status === StatusCodes.OK) {
        return dispatch(creators.addResourceSuccess(response.body))
      }
      return dispatch(creators.addResourceFailure())
    })
}

export const deleteMatterResource = (matterId, linkId) => dispatch => {
  dispatch(creators.requestDeleteResource(matterId, linkId))
  matterService.deleteMatterResource(matterId, linkId).then(response => {
    if (response.status === StatusCodes.OK) {
      return dispatch(creators.deleteResourceSuccess(linkId))
    }
    return dispatch(creators.deleteResourceFailure())
  })
}

export const fetchMatterWorkstreamResources = matterId => dispatch => {
  dispatch(creators.requestMatterWorkstreamResources())
  return matterService.getMatterWorkstreamResources(matterId).then(response => {
    if (response.status === StatusCodes.OK) {
      return dispatch(
        creators.receiveMatterWorkstreamResourcesSuccess(response.body)
      )
    }
    return dispatch(creators.receiveMatterWorkstreamResourcesFailure())
  })
}
