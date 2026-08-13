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
import grails.plugin.springsecurity.SpringSecurityService
import grails.plugin.springsecurity.annotation.Secured
import org.apache.commons.logging.Log
import org.apache.commons.logging.LogFactory
import org.springframework.http.HttpStatus

import static org.springframework.http.HttpStatus.OK

@Secured(['IS_AUTHENTICATED_FULLY'])
class NotificationFilterUserRecencyController {
    static allowedMethods = [index: "GET"]
    protected final Log logger = LogFactory.getLog(getClass())

    SpringSecurityService springSecurityService
    NotificationFilterUserRecencyService notificationFilterUserRecencyService

    @Secured("!hasRole('ROLE_SYSADMIN')")
    def index() {
        if (params.projectId) {
            AppUser currentUser = springSecurityService.getCurrentUser()
            List<AppUser> filters = notificationFilterUserRecencyService.retrieveUserFilterRecency(currentUser, params.projectId as long)
            respond filters, [status: OK]
        } else {
            respond status: HttpStatus.NO_CONTENT
        }
    }
}
