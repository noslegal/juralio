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

import api from '../helpers/fetch/fetch-helper'

export default {
  completeTour(tourName) {
    return api(`settings/user/completeTour`, 'POST', {
      tourName: tourName,
    })
  },
  getTours() {
    return api(`settings/user/tours`, 'GET')
  },
  resetTours(userId) {
    return api(`settings/user/${userId}/resetTours`, 'GET')
  },

  hideForSession(tourName) {
    let sessionTours = window.sessionStorage.getItem('juralio_tours')
    if (sessionTours) {
      sessionTours = JSON.parse(sessionTours)
      sessionTours[tourName] = true
      window.sessionStorage.setItem(
        'juralio_tours',
        JSON.stringify(sessionTours)
      )
    } else {
      let tours = {}
      tours[tourName] = true
      window.sessionStorage.setItem('juralio_tours', JSON.stringify(tours))
    }
  },
}
