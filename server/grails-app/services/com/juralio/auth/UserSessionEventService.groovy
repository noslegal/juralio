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

package com.juralio.auth

import grails.gorm.transactions.Transactional

import java.sql.Timestamp


@Transactional
class UserSessionEventService {

    def userService

    def recordLoginSuccess(long userId, String remoteIP) {
        recordEvent(UserSessionEventType.LOGIN_SUCCESS, userId, remoteIP)
    }

    def recordLogout(long userId, String remoteIP) {
        recordEvent(UserSessionEventType.LOGOUT, userId, remoteIP)
    }

    def recordSessionExpiry(long userId) {
        recordEvent(UserSessionEventType.SESSION_TIMEOUT, userId, null)
    }

    def recordSessionExpiry(String username) {
        try {
            recordSessionExpiry(userService.findByUsername(username, [:]).id)
        } catch (Exception) {

        }
    }

    def recordSessionExpiry(List<String> usernames) {
        for (String username : usernames) {
            recordSessionExpiry(username)
        }
    }

    private void recordEvent(UserSessionEventType eventType, long userId, String remoteIP) {
        UserSessionEvent event = new UserSessionEvent([user: [id: userId], eventType: eventType, time: new Date(), requestIssuerIpAddress: remoteIP])
        event.save(flush: true)
    }

    Timestamp getLatestLogin(AppUser user) {
        List<UserSessionEvent> events = UserSessionEvent.findAllByUserAndEventType(user, UserSessionEventType.LOGIN_SUCCESS.value()).sort { it.time }
        if (events.size() > 0) {
            return events[0].time
        } else {
            return null
        }
    }

    List<Timestamp> getAllLogins(AppUser user){
        List<UserSessionEvent> events = UserSessionEvent.findAllByUserAndEventType(user, UserSessionEventType.LOGIN_SUCCESS.value()).sort { it.time }
        if (events.size() > 0) {
            return events
        } else {
            return null
        }
    }
}
