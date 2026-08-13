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

import dayjs from 'dayjs'
import { getDetailsAttribute } from '../user-data-service'

const SESSION_CHECK_INTERVAL = 5000
const getLastAPICallTime = () => localStorage.getItem('lastAPICall')

let intervalId

export class SessionLogout {
  initiate = () => {
    const sessionTimeout = getDetailsAttribute(['sessionTimeout']) * 1000
    if (intervalId) clearInterval(intervalId)
    intervalId = setInterval(() => {
      const timeSinceLastCall =
        new Date() - dayjs(getLastAPICallTime()).toDate()
      if (
        !navigator.userAgent.includes('Cypress!') &&
        (getLastAPICallTime() === null || timeSinceLastCall > sessionTimeout)
      ) {
        this.shutdown()
        window.performLogout()
      }
    }, SESSION_CHECK_INTERVAL)
  }

  shutdown = () => clearInterval(intervalId)
}
