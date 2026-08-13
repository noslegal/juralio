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

import matterService from '../../services/matter/matter-service'
import projectService from '../../services/project/project-service'
import { MATTER_STATUS } from '../constants'
import { getTypeObject } from '../template/project-creation/action-helper'

export const REQUEST_MATTERS = 'REQUEST_MATTERS'
export const RECEIVE_ORG_MATTERS_PAGE = 'RECEIVE_ORG_MATTERS_PAGE'
export const REQUEST_ORG_MATTERS_PAGE = 'REQUEST_ORG_MATTERS_PAGE'
export const RECEIVE_MATTERS = 'RECEIVE_MATTERS'
export const REQUEST_PROJECTS = 'REQUEST_PROJECTS'
export const RECEIVE_PROJECTS_SUCCESS = 'RECEIVE_PROJECTS_SUCCESS'
export const MATTER_LIST_RESET_STATE = 'MATTER_LIST_RESET_STATE'
export const UPDATE_SINGLE_MATTER = 'UPDATE_SINGLE_MATTER'
export const IS_LAZY_LOADING = 'IS_LAZY_LOADING'
export const COMPLETE_LAZY_LOADING = 'COMPLETE_LAZY_LOADING'
const creators = {
  requestMatters() {
    return {
      type: REQUEST_MATTERS,
    }
  },
  receiveMatters(json, isPartialLoad = false) {
    return {
      type: RECEIVE_MATTERS,
      matters: json,
      isPartialLoad: isPartialLoad,
    }
  },
  requestProjects(matterId) {
    return {
      type: REQUEST_PROJECTS,
      matterId,
    }
  },
  receiveProjectsSuccess(matterId, json) {
    return {
      type: RECEIVE_PROJECTS_SUCCESS,
      matterId,
      projects: json,
    }
  },
  requestLazyLoading() {
    return {
      type: IS_LAZY_LOADING,
    }
  },
  requestLazyLoadingComplete() {
    return {
      type: COMPLETE_LAZY_LOADING,
    }
  },
}

const _updateSingleMatter = (matterId, status) =>
  getTypeObject(UPDATE_SINGLE_MATTER, { matterId, status })

function resetState() {
  return {
    type: MATTER_LIST_RESET_STATE,
  }
}

export const cleanState = () => dispatch => {
  return dispatch(resetState())
}

export const fetchMattersNoLoading = (startIndex, endIndex) => dispatch => {
  return matterService
    .getMatters(false, false, startIndex, endIndex)
    .then(response => {
      if (response.status === 200 && response.body) {
        dispatch(
          creators.receiveMatters(
            response.body.filter(
              matter =>
                matter.matterStatus !== MATTER_STATUS.CLOSED ||
                matter.matterStatus !== MATTER_STATUS.PENDING_DELETION ||
                matter.activities.includes('MATTER_ADMIN')
            )
          )
        )
      }
    })
}

export const fetchMatters = (startIndex, endIndex) => dispatch => {
  dispatch(creators.requestMatters())
  return matterService
    .getMatters(false, false, startIndex, endIndex)
    .then(response => {
      if (response.status === 200 && response.body) {
        dispatch(
          creators.receiveMatters(
            response.body.filter(
              matter =>
                matter.matterStatus !== MATTER_STATUS.CLOSED ||
                matter.matterStatus !== MATTER_STATUS.PENDING_DELETION ||
                matter.activities.includes('MATTER_ADMIN')
            ),
            startIndex !== undefined && endIndex !== undefined
          )
        )
        return response.body
      }
    })
}

export const fetchAllMatters = () => dispatch => {
  dispatch(creators.requestMatters())
  return matterService
    .getMatters(false, true)
    .then(response => dispatch(creators.receiveMatters(response.body)))
}

export const fetchOrgMattersPage = params => dispatch => {
  dispatch({ type: REQUEST_ORG_MATTERS_PAGE })
  return matterService.getOrgMattersPaged(params).then(response => {
    if (response.status === 200 && response.body) {
      dispatch({
        type: RECEIVE_ORG_MATTERS_PAGE,
        matters: response.body.matters ?? [],
        totalCount: response.body.totalCount ?? 0,
      })
    }
    return response
  })
}

export const fetchProjects = matter => dispatch => {
  dispatch(creators.requestProjects(matter.id))
  return projectService.getProjectsByMatterId(matter.id).then(response => {
    return dispatch(creators.receiveProjectsSuccess(matter.id, response.body))
  })
}

export const updateSingleMatter = (matterId, status) => dispatch => {
  dispatch(_updateSingleMatter(matterId, status))
}

export const startLazyLoading = () => dispatch => {
  dispatch(creators.requestLazyLoading())
}
export const stopLazyLoading = () => dispatch => {
  dispatch(creators.requestLazyLoadingComplete())
}
