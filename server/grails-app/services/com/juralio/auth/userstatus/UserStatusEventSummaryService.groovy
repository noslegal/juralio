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

package com.juralio.auth.userstatus


import com.juralio.auth.UserRoleService
import com.juralio.auth.UserService
import com.juralio.auth.UserStatusEvent
import com.juralio.users.ActiveUserSummaryDTO
import grails.gorm.transactions.Transactional

import java.time.Instant
import java.time.LocalDate
import java.time.LocalDateTime
import java.time.ZoneId
import java.time.temporal.ChronoUnit

@Transactional
class UserStatusEventSummaryService {

    UserStatusEventService userStatusEventService
    UserRoleService userRoleService
    UserService userService

    def groovySql

    def getActiveUsersSummary() {
        def events = UserStatusEvent.all
        events.sort { it.time }

        Date earliestActivation = events.size() == 0 ? new Date(119, 1, 1) : events[0].time
        LocalDateTime startDate = earliestActivation.toInstant().atZone(ZoneId.systemDefault()).toLocalDate().atStartOfDay()
        LocalDateTime endDate = LocalDate.now().plusDays(1).atStartOfDay().minus(1, ChronoUnit.SECONDS)

        return generateActiveUsersSummary(startDate, endDate)
    }

    def generateActiveUsersSummary(LocalDateTime startDate, LocalDateTime endDate) {
        def results = []
        ActiveUserSummaryDTO monthlyRecord
        def records

        int startYear = startDate.year - 1900
        int startMonth = startDate.monthValue - 1

        int endYear = endDate.year - 1900
        int endMonth = endDate.monthValue - 1

        int currentYear = startYear
        int currentMonth = startMonth

        int nextYear = startYear
        int nextMonth = startMonth + 1

        if (currentMonth == 12) {
            currentMonth = 0
            endYear += 1
        }

        boolean complete = false
        while (!complete) {
            Date intervalStartDate = new Date(currentYear, currentMonth, 1)
            Date intervalEndDate = new Date(nextYear, nextMonth, 1)
            records = userStatusEventService.getActiveUserRecordsForInterval(intervalStartDate, intervalEndDate)
            monthlyRecord = new ActiveUserSummaryDTO(new Date(currentYear, currentMonth, 1, 22, 59), records == null ? 0 : records.size())
            results.add(monthlyRecord)

            currentMonth += 1
            nextMonth += 1

            if (currentMonth > endMonth && currentYear == endYear) {
                complete = true
            }

            if (currentMonth == 12) {
                currentMonth = 0
                currentYear += 1

                nextMonth = 1
                nextYear = currentYear
            } else if (nextMonth == 12) {
                nextMonth = 0
                nextYear += 1
            }
        }

        return results
    }

    def getMonthDetail(Date period) {
        def events = UserStatusEvent.all
        events.sort { it.time }

        LocalDateTime requestedPeriod = Instant.ofEpochMilli(period.getTime()).atZone(ZoneId.systemDefault()).toLocalDateTime()
        Date rangeStart = new Date(requestedPeriod.getYear() - 1900, requestedPeriod.getMonthValue() - 1, 1)
        Date rangeEnd = new Date(requestedPeriod.getYear() - 1900, requestedPeriod.getMonthValue(), 1)

        return userStatusEventService.getActiveUserRecordsForInterval(rangeStart, rangeEnd)
    }

    def generateLegacyRecords() {
        groovySql.eachRow(
                "SELECT id, username FROM app_user WHERE id not in (SELECT user_id FROM user_status_event) AND username<>'matter.creator@juralio.com'",
                { user ->
                    boolean isSysadmin = userRoleService.hasSysadminRole(userService.getUserById(user.id))

                    if (!isSysadmin) {
                        println('Generating... for' + user.username)
                        userStatusEventService.recordLegacyActivation(user.id as long)
                    }
                })
    }
}
