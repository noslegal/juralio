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
import projectService from '../../services/project/project-service'

const initialWorkstreamResourcesState = {
  resources: [],
  workstreamId: undefined,
  hasMatterResources: false,
  isLoaded: false,
  error: false,
}

const WORKSTREAM_RESOURCES = {
  REQUEST_RESOURCES: 'workstreamResources/REQUEST_RESOURCES',
  RECEIVE_RESOURCES_SUCCESS: 'workstreamResources/RECEIVE_RESOURCES_SUCCESS',
  RECEIVE_RESOURCES_FAILURE: 'workstreamResources/RECEIVE_RESOURCES_FAILURE',
  REQUEST_ADD_RESOURCE: 'workstreamResources/REQUEST_RESOURCES',
  ADD_RESOURCE_SUCCESS: 'workstreamResources/ADD_RESOURCE_SUCCESS',
  ADD_RESOURCE_FAILURE: 'workstreamResources/ADD_RESOURCE_FAILURE',
  REQUEST_DELETE_RESOURCE: 'workstreamResources/REQUEST_DELETE_RESOURCE',
  RECIEVE_DELETE_RESOURCE_SUCCESS:
    'workstreamResources/RECIEVE_DELETE_RESOURCE_SUCCESS',
  RECIEVE_DELETE_RESOURCE_FAILURE:
    'workstreamResources/RECIEVE_DELETE_RESOURCE_FAILURE',
}

export default function reducer(
  state = initialWorkstreamResourcesState,
  action = {}
) {
  switch (action.type) {
    case WORKSTREAM_RESOURCES.REQUEST_RESOURCES:
      return {
        ...state,
        isLoaded: false,
        workstreamId: action.workstreamId,
      }
    case WORKSTREAM_RESOURCES.RECEIVE_RESOURCES_SUCCESS:
      return {
        ...state,
        isLoaded: true,
        resources: action.resources,
        hasMatterResources: action.hasMatterResources,
      }
    case WORKSTREAM_RESOURCES.RECEIVE_RESOURCES_FAILURE:
      return {
        ...state,
        resources: [],
        isLoaded: false,
        error: true,
      }

    case WORKSTREAM_RESOURCES.REQUEST_ADD_RESOURCE:
      return {
        ...state,
        workstreamId: action.workstreamId,
      }
    case WORKSTREAM_RESOURCES.ADD_RESOURCE_SUCCESS:
      return {
        ...state,
        isLoaded: true,
        resources: [action.resource, ...state.resources],
      }
    case WORKSTREAM_RESOURCES.ADD_RESOURCE_FAILURE:
      return {
        ...state,
        error: true,
      }
    case WORKSTREAM_RESOURCES.REQUEST_DELETE_RESOURCE:
      return {
        ...state,
      }
    case WORKSTREAM_RESOURCES.RECIEVE_DELETE_RESOURCE_SUCCESS:
      return {
        ...state,
        resources: state.resources.filter(i => i.id !== action.resourceId),
      }
    case WORKSTREAM_RESOURCES.RECIEVE_DELETE_RESOURCE_FAILURE:
      return {
        ...state,
        error: true,
      }
    default:
      return state
  }
}

const creators = {
  requestWorkstreamResources(workstreamId) {
    return {
      type: WORKSTREAM_RESOURCES.REQUEST_RESOURCES,
      workstreamId: workstreamId,
    }
  },
  receiveWorkstreamResourcesSuccess(resources, hasMatterResources) {
    return {
      type: WORKSTREAM_RESOURCES.RECEIVE_RESOURCES_SUCCESS,
      resources: resources,
      hasMatterResources: hasMatterResources,
    }
  },
  receiveWorkstreamResourcesFailure() {
    return {
      type: WORKSTREAM_RESOURCES.RECEIVE_RESOURCES_FAILURE,
    }
  },
  requestAddResource(workstreamId) {
    return {
      type: WORKSTREAM_RESOURCES.REQUEST_ADD_RESOURCE,
      workstreamId: workstreamId,
    }
  },
  addResourceSuccess(resource) {
    return {
      type: WORKSTREAM_RESOURCES.ADD_RESOURCE_SUCCESS,
      resource: resource,
    }
  },
  addResourceFailure() {
    return {
      type: WORKSTREAM_RESOURCES.ADD_RESOURCE_FAILURE,
    }
  },
  requestDeleteResource() {
    return {
      type: WORKSTREAM_RESOURCES.REQUEST_DELETE_RESOURCE,
    }
  },
  deleteResourceSuccess(resourceId) {
    return {
      type: WORKSTREAM_RESOURCES.RECIEVE_DELETE_RESOURCE_SUCCESS,
      resourceId: resourceId,
    }
  },
  deleteResourceFailure() {
    return {
      type: WORKSTREAM_RESOURCES.RECIEVE_DELETE_RESOURCE_FAILURE,
      error: true,
    }
  },
}

export const fetchWorkstreamResources =
  (matterId, workstreamId) => dispatch => {
    dispatch(creators.requestWorkstreamResources(workstreamId))
    return projectService
      .getWorkstreamResources(matterId, workstreamId)
      .then(response => {
        if (response.status === StatusCodes.OK) {
          return dispatch(
            creators.receiveWorkstreamResourcesSuccess(
              response.body.linkResources,
              response.body.hasTreeRelatedResources
            )
          )
        }
        return dispatch(creators.receiveWorkstreamResourcesFailure())
      })
  }

export const addWorkstreamResource =
  (workstreamId, name, url, image) => dispatch => {
    dispatch(creators.requestAddResource(workstreamId))
    return projectService
      .addWorkstreamResource(workstreamId, name, url, image)
      .then(response => {
        if (response.status === StatusCodes.OK) {
          return dispatch(creators.addResourceSuccess(response.body))
        }
        return dispatch(creators.addResourceFailure())
      })
  }

export const deleteWorkstreamResource =
  (matterId, workstreamId, linkId) => dispatch => {
    dispatch(creators.requestDeleteResource(workstreamId, linkId))
    projectService
      .deleteWorkstreamResource(matterId, workstreamId, linkId)
      .then(response => {
        if (response.status === StatusCodes.OK) {
          return dispatch(creators.deleteResourceSuccess(linkId))
        }
        return dispatch(creators.deleteResourceFailure())
      })
  }
