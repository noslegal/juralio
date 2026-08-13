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

import { requestNotifications } from '../../../components/navigation/global-notifications/redux/global-notifications-actions'

const NotificationFetcherStyle = {
  display: 'none',
  position: 'absolute',
  top: -100,
  left: -100,
  zIndex: -100,
}

const NOTIFICATION_CHECK_INTERVAL = 60000

const NotificationFetcher = () => {
  const dispatch = useDispatch()
  const currentNotificationCount = useSelector(
    state => state.globalNotifications.totalNotificationCount
  )
  const currentUser = useSelector(state => state.auth.data.details)
  window.notificationCount = currentNotificationCount // Needs refreshed so setTimeout function can get value.

  if (window.notificationFetcher === undefined) {
    if (!localStorage.logoutInProgress) {
      dispatch(requestNotifications(currentNotificationCount, currentUser.id))

      window.notificationFetcher = setInterval(() => {
        // If user still logged in then fetch.
        if (localStorage.userData) {
          dispatch(
            requestNotifications(window.notificationCount, currentUser.id)
          )
        }
      }, NOTIFICATION_CHECK_INTERVAL)
    }
  }

  return <div style={NotificationFetcherStyle}>&nbsp;</div>
}

export default NotificationFetcher
