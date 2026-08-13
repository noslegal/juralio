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

package com.juralio.auth.dao

import com.juralio.auth.AppUser
import com.juralio.auth.UserSessionEvent
import com.juralio.auth.UserSessionEventType
import grails.gorm.transactions.Transactional

@Transactional
class UserSessionEventDAOService {

    List<UserSessionEvent> getUserLatestLoginDetails(AppUser user) {
        List<UserSessionEvent> events = new ArrayList<>()

        List<UserSessionEvent> loginEvents = UserSessionEvent.findAllByUserAndEventType(user, UserSessionEventType.LOGIN_SUCCESS, [max: 1, sort: 'time', order: "desc"])
        List<UserSessionEvent> logoutEvents = UserSessionEvent.findAllByUserAndEventType(user, UserSessionEventType.LOGOUT, [max: 1, sort: 'time', order: "desc"])
        List<UserSessionEvent> timeoutEvents = UserSessionEvent.findAllByUserAndEventType(user, UserSessionEventType.SESSION_TIMEOUT, [max: 1, sort: 'time', order: "desc"])

        events.add(loginEvents.size() == 1 ? loginEvents[0] : null)
        events.add(logoutEvents.size() == 1 ? logoutEvents[0] : null)
        events.add(timeoutEvents.size() == 1 ? timeoutEvents[0] : null)

        return events
    }
}
