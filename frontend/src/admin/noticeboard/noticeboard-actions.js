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
import noticeboardService from '../../services/noticeboard/noticeboard-service'

export const REQUEST_NOTICE = 'GET_NOTICE'
export const RECEIVE_NOTICE_FAILURE = 'RECEIVE_NOTICE_FAILURE'
export const RECEIVE_NOTICE_SUCCESS = 'RECEIVE_NOTICE_SUCCESS'
export const RECEIVE_NOTICES_META_SUCCESS = 'RECEIVE_NOTICES_META_SUCCESS'
export const RECEIVE_NOTICE_BY_KEY_SUCCESS = 'RECEIVE_NOTICE_BY_KEY_SUCCESS'
export const RECEIVE_NOTICE_ID_SUCCESS = 'RECEIVE_NOTICE_ID_SUCCESS'
export const RECEIVE_NOTICE_META_SUCCESS = 'RECEIVE_NOTICE_META_SUCCESS'
export const RECEIVE_NOTICE_BY_ID_SUCCESS = 'RECEIVE_NOTICE_BY_ID_SUCCESS'

function requestNotice() {
  return {
    type: REQUEST_NOTICE,
  }
}

function receiveNoticeFailure() {
  return {
    type: RECEIVE_NOTICE_FAILURE,
  }
}

function receiveNoticeSuccessByKey(key, payload) {
  return {
    type: RECEIVE_NOTICE_BY_KEY_SUCCESS,
    notice: payload,
    key: key,
  }
}

function receiveNoticesMetaSuccess(payload) {
  return {
    type: RECEIVE_NOTICES_META_SUCCESS,
    meta: payload,
  }
}

function receiveNoticeByIdSuccess(payload) {
  return {
    type: RECEIVE_NOTICE_BY_ID_SUCCESS,
    noticeSvgData: payload,
  }
}

function receiveNoticeMetaSuccess(payload) {
  return {
    type: RECEIVE_NOTICE_META_SUCCESS,
    meta: payload,
  }
}

function receiveNoticeIdSuccess(payload) {
  return {
    type: RECEIVE_NOTICE_ID_SUCCESS,
    id: payload,
  }
}

export const listNotices = () => dispatch => {
  dispatch(requestNotice())
  return noticeboardService.listNoticesMeta().then(response => {
    if (response.status === StatusCodes.OK) {
      return dispatch(receiveNoticesMetaSuccess(response.body))
    }
  })
}

export const getNoticeById = id => dispatch => {
  dispatch(requestNotice())
  return noticeboardService.getNoticeById(id).then(response => {
    if (response.status !== StatusCodes.OK) {
      return dispatch(receiveNoticeFailure())
    } else {
      return dispatch(receiveNoticeByIdSuccess(response.body))
    }
  })
}

export const getNoticeByIdStoreInList = id => dispatch => {
  dispatch(requestNotice())
  return noticeboardService.getNoticeById(id).then(response => {
    if (response.status !== StatusCodes.OK) {
      return dispatch(receiveNoticeFailure())
    } else {
      return dispatch(receiveNoticeSuccessByKey(id, response.body))
    }
  })
}

export const getNoticeMetaById = id => dispatch => {
  dispatch(requestNotice())
  return noticeboardService.getNoticeMetaById(id).then(response => {
    if (response.status !== StatusCodes.OK) {
      return dispatch(receiveNoticeFailure())
    } else {
      return dispatch(receiveNoticeMetaSuccess(response.body))
    }
  })
}

export const getNoticeId = () => dispatch => {
  dispatch(requestNotice())
  return noticeboardService.getNoticeId().then(response => {
    if (response.status === StatusCodes.OK) {
      return dispatch(receiveNoticeIdSuccess(response.body))
    }
  })
}

export const addNotice = (svg, title, subtitle) => dispatch => {
  return noticeboardService.addNotice(svg, title, subtitle).then(response => {
    if (response.status === StatusCodes.OK) {
      return dispatch(listNotices())
    }
  })
}

export const featureNotice = id => dispatch => {
  return noticeboardService.featureNotice(id).then(response => {
    if (response.status === StatusCodes.OK) {
      return dispatch(listNotices())
    }
  })
}

export const deleteNotice = id => dispatch => {
  return noticeboardService.deleteNotice(id).then(response => {
    if (response.status === StatusCodes.OK) {
      return dispatch(listNotices())
    }
  })
}
