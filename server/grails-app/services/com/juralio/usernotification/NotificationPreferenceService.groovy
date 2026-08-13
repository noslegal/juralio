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

package com.juralio.usernotification

import com.juralio.auth.AppUser
import grails.gorm.transactions.Transactional
import groovy.transform.CompileDynamic
import groovy.transform.CompileStatic

@CompileStatic
@Transactional(readOnly = true)
class NotificationPreferenceService {

    @CompileDynamic
    Set<AppUser> filterToSubscribed(Set<AppUser> users, String eventType, boolean defaultOptOut) {
        if (!users) return users
        List<Long> userIds = users*.id
        List<NotificationPreference> prefs = NotificationPreference.createCriteria().list {
            inList('user.id', userIds)
            eq('eventType', eventType)
        }
        Map<Long, Boolean> byUser = prefs.collectEntries { [(it.user.id): it.enabled] }
        return users.findAll { user ->
            Boolean explicit = byUser[user.id]
            explicit != null ? explicit : !defaultOptOut
        }.toSet()
    }
}
