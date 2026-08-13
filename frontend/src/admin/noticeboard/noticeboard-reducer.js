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
  REQUEST_NOTICE,
  RECEIVE_NOTICE_FAILURE,
  RECEIVE_NOTICE_SUCCESS,
  RECEIVE_NOTICES_META_SUCCESS,
  RECEIVE_NOTICE_BY_KEY_SUCCESS,
  RECEIVE_NOTICE_ID_SUCCESS,
  RECEIVE_NOTICE_META_SUCCESS,
  RECEIVE_NOTICE_BY_ID_SUCCESS,
} from './noticeboard-actions'

const initialNoticeboardState = {
  noticeboard: {
    meta: undefined,
    notices: undefined,
    chosenNoticeId: undefined,
  },
}

export default function noticeboardReducer(
  state = initialNoticeboardState,
  action
) {
  switch (action.type) {
    case REQUEST_NOTICE:
      return {
        ...state,
      }
    case RECEIVE_NOTICE_FAILURE:
      return {
        ...state,
      }
    case RECEIVE_NOTICE_SUCCESS:
      return {
        ...state,
        notice: action.notice,
      }
    case RECEIVE_NOTICES_META_SUCCESS:
      return {
        ...state,
        meta: action.meta,
      }
    case RECEIVE_NOTICE_BY_KEY_SUCCESS:
      return {
        ...state,
        notices: {
          ...state.notices,
          [action.key]: action.notice,
        },
      }
    case RECEIVE_NOTICE_ID_SUCCESS:
      return {
        ...state,
        chosenNoticeId: action.id,
      }
    case RECEIVE_NOTICE_META_SUCCESS:
      return {
        ...state,
        meta: action.meta,
      }
    case RECEIVE_NOTICE_BY_ID_SUCCESS:
      return {
        ...state,
        noticeSvgData: action.noticeSvgData,
      }

    default:
      return state
  }
}
