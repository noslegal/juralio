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
  COMPLETE_LAZY_LOADING,
  IS_LAZY_LOADING,
  MATTER_LIST_RESET_STATE,
  RECEIVE_MATTERS,
  RECEIVE_ORG_MATTERS_PAGE,
  RECEIVE_PROJECTS_SUCCESS,
  REQUEST_MATTERS,
  REQUEST_ORG_MATTERS_PAGE,
  REQUEST_PROJECTS,
  UPDATE_SINGLE_MATTER,
} from './matter-list-actions'

const initialState = {
  matters: [],
  organisationPage: {
    items: [],
    totalCount: 0,
    isLoading: false,
    isLoaded: false,
  },
  isLoaded: false,
  isLoading: false,
  isLazyLoading: false,
}

export default function matterListReducer(state = initialState, action) {
  function updateMatterState(matters, getNewState) {
    return matters.map(matter =>
      matter.id === action.matterId ? getNewState(matter) : matter
    )
  }

  switch (action.type) {
    case REQUEST_MATTERS:
      return { ...state, isLoading: true }
    case RECEIVE_MATTERS:
      return {
        ...state,
        matters: action.isPartialLoad
          ? [...state.matters, ...action.matters]
          : [...action.matters],
        isLoaded: true,
        isLoading: false,
      }
    case REQUEST_ORG_MATTERS_PAGE:
      return {
        ...state,
        organisationPage: {
          ...state.organisationPage,
          isLoading: true,
        },
      }
    case RECEIVE_ORG_MATTERS_PAGE:
      return {
        ...state,
        organisationPage: {
          items: action.matters,
          totalCount: action.totalCount,
          isLoading: false,
          isLoaded: true,
        },
      }
    case REQUEST_PROJECTS:
      return {
        ...state,
        matters: updateMatterState(state.matters, matter => ({
          ...matter,
          projects: { isLoaded: false },
        })),
      }
    case RECEIVE_PROJECTS_SUCCESS:
      return {
        ...state,
        matters: updateMatterState(state.matters, matter => ({
          ...matter,
          projects: {
            isLoaded: true,
            items: [...action.projects],
          },
        })),
      }
    case MATTER_LIST_RESET_STATE:
      return { ...state, ...initialState }
    case UPDATE_SINGLE_MATTER:
      return {
        ...state,
        isLazyLoading: false,
        organisationPage: {
          ...state.organisationPage,
          items: updateMatterState(state.organisationPage.items, matter => ({
            ...matter,
            matterStatus: action.status.matterStatus,
          })),
        },
      }
    case IS_LAZY_LOADING: {
      return {
        ...state,
        isLazyLoading: true,
      }
    }
    case COMPLETE_LAZY_LOADING: {
      return {
        ...state,
        isLazyLoading: false,
      }
    }
    default:
      return state
  }
}
