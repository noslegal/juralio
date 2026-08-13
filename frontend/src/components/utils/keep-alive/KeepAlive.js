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

import React from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { SSO } from '../../../app/constants'
import { doLogout } from '../../../services/user/auth/auth-actions'
import { SessionLogout } from '../../../services/user/session-logout/SessionLogout'

const keepAliveStyle = {
  display: 'none',
  position: 'absolute',
  top: -100,
  left: -100,
  zIndex: -100,
}

// The KeepAlive component handles management of a check on the time since the last api access.
const KeepAlive = () => {
  const dispatch = useDispatch()
  const user = useSelector(state => state.auth)
  if (window.sessionMonitor === undefined) {
    window.sessionMonitor = new SessionLogout().initiate()
    window.performLogout = () => {
      window.sessionStorage.setItem('logoutUrl', window.location.href)
      window.sessionStorage.setItem('logoutId', user.data.details.id)
      const isMicrosoftUser = user.microsoftData !== undefined
      dispatch(doLogout(isMicrosoftUser ? SSO.MICROSOFT : undefined))
      window.sessionMonitor = undefined
    }
  }

  return <div style={keepAliveStyle}>&nbsp;</div>
}

export default KeepAlive
