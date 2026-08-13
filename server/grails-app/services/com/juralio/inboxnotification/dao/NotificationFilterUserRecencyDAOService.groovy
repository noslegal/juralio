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

package com.juralio.inboxnotification.dao

import com.juralio.auth.AppUser
import com.juralio.inboxnotification.NotificationFilterUserRecency
import com.juralio.inboxnotification.NotificationFilterUserRecencyService
import com.juralio.project.Project
import grails.gorm.transactions.Transactional

@Transactional
class NotificationFilterUserRecencyDAOService {

    List<NotificationFilterUserRecency> deleteRecency(AppUser user, AppUser filterUser, Project project) {
        List<NotificationFilterUserRecency> results = NotificationFilterUserRecency.findAllByUserAndFilterUserAndProject(user, filterUser, project)
        results.each { it -> it.delete(flush: true) }
    }

    List<NotificationFilterUserRecency> fetchRecency(AppUser user, Project project) {
        return NotificationFilterUserRecency.findAllByUserAndProject(user, project)
    }

    NotificationFilterUserRecency saveRecency(AppUser user, AppUser filterUser, Project project) {
        NotificationFilterUserRecency filterUserRecency = new NotificationFilterUserRecency()
        filterUserRecency.user = user
        filterUserRecency.filterUser = filterUser
        filterUserRecency.project = project
        filterUserRecency.save(failOnError: true, flush: true)
    }

    void maintainRecencyCap(AppUser user, Project project) {
        def results = NotificationFilterUserRecency.findAllByUserAndProject(user, project).sort {
            it.dateCreated
        }.reverse()

        while (results.size() > NotificationFilterUserRecencyService.MAXIMUM_RECENT_USER_FILTER) {
            def recencyFilter = results.removeLast()
            recencyFilter.delete()
        }
    }
}
