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
import grails.converters.JSON
import grails.plugin.springsecurity.SpringSecurityService
import grails.plugin.springsecurity.annotation.Secured

import static org.springframework.http.HttpStatus.OK

@Secured(['IS_AUTHENTICATED_FULLY'])
class UserNotificationController {

    static allowedMethods = [index: 'GET', count: 'GET', markRead: 'POST', markAllRead: 'POST', dismiss: 'POST']

    UserNotificationQueryService userNotificationQueryService
    UserNotificationService userNotificationService
    SpringSecurityService springSecurityService

    @Secured("!hasRole('ROLE_SYSADMIN')")
    def index() {
        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
        UserNotificationSearchFilter filter = new UserNotificationSearchFilter(
            cursor: UserNotificationQueryService.decodeCursor(params.cursor as String),
            pageSize: params.pageSize ? (params.pageSize as Integer) : null,
            unreadOnly: params.boolean('unreadOnly') ?: false,
            matterId: params.long('matterId'),
            eventType: params.eventType as String
        )
        Map result = userNotificationQueryService.search(currentUser, filter)
        render(
            view: '/userNotification/_userNotificationList',
            model: [userNotifications: result.items, nextCursor: result.nextCursor]
        )
    }

    @Secured("!hasRole('ROLE_SYSADMIN')")
    def count() {
        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
        render([count: userNotificationQueryService.countUnread(currentUser)] as JSON)
    }

    @Secured("!hasRole('ROLE_SYSADMIN')")
    def markRead() {
        userNotificationService.markRead(params.long('id'), springSecurityService.getCurrentUser() as AppUser)
        respond status: OK
    }

    @Secured("!hasRole('ROLE_SYSADMIN')")
    def markAllRead() {
        userNotificationService.markAllRead(springSecurityService.getCurrentUser() as AppUser)
        respond status: OK
    }

    @Secured("!hasRole('ROLE_SYSADMIN')")
    def dismiss() {
        userNotificationService.dismiss(params.long('id'), springSecurityService.getCurrentUser() as AppUser)
        respond status: OK
    }
}
