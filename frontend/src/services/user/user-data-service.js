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

import { path } from 'ramda'
import store from '../../store/configure-store'
import { receiveLogin } from './auth/auth-actions'

function setCookie(cname, cvalue, exdays) {
  var d = new Date()
  d.setTime(d.getTime() + exdays * 24 * 60 * 60 * 1000)
  var expires = 'expires=' + d.toUTCString()
  document.cookie = cname + '=' + cvalue + ';' + expires + ';path=/'
}

function getCookie(cname) {
  var name = cname + '='
  var decodedCookie = decodeURIComponent(document.cookie)
  var ca = decodedCookie.split(';')
  for (var i = 0; i < ca.length; i++) {
    var c = ca[i]
    while (c.charAt(0) === ' ') {
      c = c.substring(1)
    }
    if (c.indexOf(name) === 0) {
      return c.substring(name.length, c.length)
    }
  }
  return ''
}

export const getSessionUserData = () => {
  let userData
  try {
    userData = window.top.localStorage.getItem('userData')
  } catch {
    userData = getCookie('userData')
  }

  return userData && userData.length ? JSON.parse(userData) : null
}

export const getAuthAttribute = attributePath => {
  return path(['auth', ...attributePath], store.getState().auth.data)
}

export const getDetailsAttribute = attributePath => {
  return path(['details', ...attributePath], store.getState().auth.data)
}

export const setSessionUserData = userData => {
  localStorage.setItem('userData', JSON.stringify(userData))
  try {
    userData = window.top.localStorage.getItem('userData')
  } catch {
    setCookie('userData', JSON.stringify(userData))
  }
}

export function loadAccessToken() {
  const userData = getSessionUserData()
  if (userData && userData.auth && userData.details) {
    return store.dispatch(receiveLogin(userData))
  } else if (userData) {
    localStorage.removeItem('userData')
  }
}
