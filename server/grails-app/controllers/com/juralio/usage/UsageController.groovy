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

import com.juralio.auth.userstatus.UserStatusEventService
import com.juralio.common.DateUtilService
import grails.plugin.springsecurity.annotation.Secured

@Secured(['IS_AUTHENTICATED_FULLY'])
class UsageController {
    static allowedMethods = [show: "GET"]

    UserStatusEventService userStatusEventService
    DateUtilService dateUtilService

    @Secured("hasRole('ROLE_SYSADMIN')")
    def show() {
        def now = new Date()
        def start = params.startDate ? dateUtilService.parseDatetime(params.startDate) : null

        if (!start) {
            Calendar cal = Calendar.getInstance()
            cal.setTime(now)
            cal.add(Calendar.MONTH, -1)
            start = cal.getTime()
        }

        def end = params.endDate ? dateUtilService.parseDatetime(params.endDate) : now

        if (params.month) {
            Calendar cal = Calendar.getInstance()

            int currentMonth = now.month + 1
            int year = now.year

            if (params.month > currentMonth) {
                --year
            }

            cal.setTimeZone(TimeZone.getTimeZone('UTC'))
            cal.set(year + 1901, (params.month as Integer) - 1, 1, 0, 1)
            start = cal.getTime()
            cal.add(Calendar.MONTH, 1)
            cal.add(Calendar.MINUTE, -2)
            end = cal.getTime()
        }

        def users = userStatusEventService.getActiveUsersInInterval(start, end)

        def result = [
                startDate      : start,
                endDate        : end,
                activeUserCount: users.size(),
                users          : users*.username
        ]

        respond result
    }
}
