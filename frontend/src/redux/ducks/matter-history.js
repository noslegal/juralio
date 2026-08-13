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

import matterHistoryService from '../../services/matter-history/matter-history-service'

// Actions
const REQUEST = 'matterHistory/REQUEST'
const RECEIVE_SUCCESS = 'matterHistory/RECEIVE_SUCCESS'
const RECEIVE_APPEND_SUCCESS = 'matterHistory/RECEIVE_APPEND_SUCCESS'
const RECEIVE_FAILURE = 'matterHistory/RECEIVE_FAILURE'
const RECEIVE_FILTER_OPTIONS = 'matterHistory/RECEIVE_FILTER_OPTIONS'
const SET_FILTERS = 'matterHistory/SET_FILTERS'
const SET_EXPORTING = 'matterHistory/SET_EXPORTING'
const RESET = 'matterHistory/RESET'

const initialFilters = {
  categories: [],
  performedByIds: [],
  fromDate: null,
  toDate: null,
}

const initialState = {
  events: [],
  nextCursor: null,
  filters: initialFilters,
  filterOptions: { categories: [], people: [] },
  loading: false,
  loadingMore: false,
  exporting: false,
  error: false,
  requestId: 0,
}
let requestSequence = 0

// Reducer
export default function matterHistoryReducer(
  state = initialState,
  action = {}
) {
  switch (action.type) {
    case REQUEST:
      return {
        ...state,
        loading: !action.append,
        loadingMore: !!action.append,
        error: false,
        requestId: action.requestId,
      }
    case RECEIVE_SUCCESS:
      return {
        ...state,
        events: action.events,
        nextCursor: action.nextCursor,
        loading: false,
        loadingMore: false,
      }
    case RECEIVE_APPEND_SUCCESS:
      return {
        ...state,
        events: [...state.events, ...action.events],
        nextCursor: action.nextCursor,
        loading: false,
        loadingMore: false,
      }
    case RECEIVE_FAILURE:
      return { ...state, loading: false, loadingMore: false, error: true }
    case RECEIVE_FILTER_OPTIONS:
      return { ...state, filterOptions: action.filterOptions }
    case SET_FILTERS:
      return { ...state, filters: { ...state.filters, ...action.filters } }
    case SET_EXPORTING:
      return { ...state, exporting: action.exporting }
    case RESET:
      return initialState
    default:
      return state
  }
}

// Action creators / thunks
export const resetHistory = () => ({ type: RESET })

export const setHistoryFilters = filters => ({ type: SET_FILTERS, filters })

export const fetchHistoryFilterOptions = matterId => async dispatch => {
  const response = await matterHistoryService.getFilterOptions(matterId)
  if (response && response.status === 200 && response.body) {
    dispatch({ type: RECEIVE_FILTER_OPTIONS, filterOptions: response.body })
  }
}

export const fetchHistory =
  (matterId, { append = false } = {}) =>
  async (dispatch, getState) => {
    const { filters, nextCursor } = getState().matterHistory
    const cursor = append ? nextCursor : null
    const requestId = ++requestSequence
    dispatch({ type: REQUEST, append, requestId })
    const response = await matterHistoryService.getHistory(
      matterId,
      filters,
      cursor
    )
    if (getState().matterHistory.requestId !== requestId) {
      return
    }
    if (!response || response.status !== 200 || !response.body) {
      dispatch({ type: RECEIVE_FAILURE })
      return
    }
    dispatch({
      type: append ? RECEIVE_APPEND_SUCCESS : RECEIVE_SUCCESS,
      events: response.body.items || [],
      nextCursor: response.body.nextCursor || null,
    })
  }

// Replaces the active filters then reloads from the first page.
export const applyHistoryFilters = (matterId, filters) => dispatch => {
  dispatch(setHistoryFilters(filters))
  return dispatch(fetchHistory(matterId, { append: false }))
}

export const downloadHistoryCsv = matterId => async (dispatch, getState) => {
  dispatch({ type: SET_EXPORTING, exporting: true })
  const { filters } = getState().matterHistory
  await matterHistoryService.downloadHistoryCsv(matterId, filters)
  dispatch({ type: SET_EXPORTING, exporting: false })
}
