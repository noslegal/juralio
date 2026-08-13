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

import { UPDATE_USER_SUCCESS } from '../../../app/users/users-actions'
import {
  BULK_UPDATE_FTUE,
  LOGOUT,
  RECEIVE_LOGIN,
  RECEIVE_MICROSOFT_LOGIN,
  RECEIVE_USER_DATA_UPDATE,
} from './auth-actions'

export default function auth(
  state = {
    isLoggedIn: false,
    data: {},
  },
  action
) {
  switch (action.type) {
    case LOGOUT:
      localStorage.clear()
      return {
        ...state,
        isLoggedIn: false,
        data: action.data,
      }
    case RECEIVE_LOGIN:
      return {
        ...state,
        ...{
          isLoggedIn: true,
          data: { ...action.userData },
        },
      }

    case UPDATE_USER_SUCCESS:
      let data = state.data
      if (action.user?.id === data.details?.id) {
        //when you update yourself
        data.auth.roles = action.user.roles
        data.details.firstname = action.user.firstname
        data.details.lastname = action.user.lastname
        data.details.avatarImageIndex = action.user.avatarImageIndex
        data.details.avatarColorIndex = action.user.avatarColorIndex
      }
      return { ...state, data }
    case RECEIVE_MICROSOFT_LOGIN:
      return {
        ...state,
        ...{
          microsoftData: { ...action.microsoftUserData.extra },
        },
      }
    case RECEIVE_USER_DATA_UPDATE: {
      return {
        ...state,
        data: {
          ...action.data,
        },
      }
    }
    case BULK_UPDATE_FTUE:
      let d = state.data
      d.details.firstTimeUserExperience = action.payload

      return {
        ...state,
        d,
      }
    default:
      return state
  }
}
