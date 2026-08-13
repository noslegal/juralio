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

package com.juralio.inboxnotification

import com.juralio.auth.AppUser
import com.juralio.auth.UserService
import com.juralio.inboxnotification.dao.NotificationFilterUserRecencyDAOService
import com.juralio.matter.MatterTeamMemberSearchService
import com.juralio.project.Project
import com.juralio.project.ProjectAuthorisationService
import com.juralio.project.ProjectService
import grails.gorm.transactions.Transactional
import grails.plugin.springsecurity.SpringSecurityService
import groovy.transform.CompileStatic

@CompileStatic
@Transactional
class NotificationFilterUserRecencyService {
    public static final int MAXIMUM_RECENT_USER_FILTER = 5

    ProjectService projectService
    UserService userService
    NotificationFilterUserRecencyDAOService notificationFilterUserRecencyDAOService
    MatterTeamMemberSearchService matterTeamMemberSearchService
    SpringSecurityService springSecurityService
    ProjectAuthorisationService projectAuthorisationService

    def retrieveUserFilterRecency(AppUser user, long projectId) {
        if (!projectAuthorisationService.hasReadAccess(projectId)) {
            throw new Exception()
        }
        Project project = projectService.getProjectOnly(projectId)
        List<NotificationFilterUserRecency> recencies = notificationFilterUserRecencyDAOService.fetchRecency(user, project)
        List<AppUser> users = []
        recencies.each { it -> users.push(userService.getUserById(it.filterUser.id)) }

        if (users.size() < MAXIMUM_RECENT_USER_FILTER) {
            List<AppUser> matterUsers = matterTeamMemberSearchService.getMatterUsers(project.matterId as long, (MAXIMUM_RECENT_USER_FILTER + 1) - users.size())
            users.addAll(matterUsers)
            users.unique { a, b -> a.id <=> b.id }
            users.remove(springSecurityService.getCurrentUser())
        }

        if (users.size() > MAXIMUM_RECENT_USER_FILTER) {
            users = users.subList(0, MAXIMUM_RECENT_USER_FILTER)
        }

        return users
    }

    def recordUserFilterRecency(AppUser user, AppUser filterUser, Project project) {
        notificationFilterUserRecencyDAOService.deleteRecency(user, filterUser, project)
        notificationFilterUserRecencyDAOService.saveRecency(user, filterUser, project)
        notificationFilterUserRecencyDAOService.maintainRecencyCap(user, project)
    }
}
