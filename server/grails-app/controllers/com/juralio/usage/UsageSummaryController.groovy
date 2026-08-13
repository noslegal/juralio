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

package com.juralio.usage

import com.juralio.auth.userstatus.UserStatusEventSummaryService
import com.juralio.common.DateUtilService
import grails.plugin.springsecurity.annotation.Secured
import org.apache.commons.logging.Log
import org.apache.commons.logging.LogFactory

@Secured(['IS_AUTHENTICATED_FULLY'])
class UsageSummaryController {
    static allowedMethods = [showSummary: "GET", getMonthDetail: "POST"]

    DateUtilService dateUtilService
    UserStatusEventSummaryService userStatusEventSummaryService
    protected final Log logger = LogFactory.getLog(getClass())

    @Secured("hasRole('ROLE_SYSADMIN')")
    def showSummary() {
        userStatusEventSummaryService.generateLegacyRecords()
        respond userStatusEventSummaryService.getActiveUsersSummary()
    }

    @Secured("hasRole('ROLE_SYSADMIN')")
    def getMonthDetail() {
        String period = request.JSON.period
        period = period.replace("Z", ".000Z")
        def results = userStatusEventSummaryService.getMonthDetail(dateUtilService.parseDatetime(period))
        respond results
    }
}
