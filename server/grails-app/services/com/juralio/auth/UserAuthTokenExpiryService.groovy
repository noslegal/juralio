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

import com.juralio.common.DateUtilService
import com.juralio.config.ConfigService
import grails.gorm.transactions.Transactional
import groovy.transform.CompileStatic
import org.springframework.scheduling.annotation.Scheduled

@CompileStatic
@Transactional
class UserAuthTokenExpiryService {

    boolean lazyInit = false
    ConfigService configService
    DateUtilService dateUtilService
    UserSessionEventService userSessionEventService

    @Scheduled(fixedDelay = 30000L)
    def expireTokens() {
        final Date currentDateTime = dateUtilService.getCurrentDateTime()

        log.trace('Attempting to delete inactive auth tokens...')
        final int tokenExpiryInMilliseconds = configService.tokenExpiryMinutes * 60 * 1000
        Date earliestAllowedInactiveTime = new Date(currentDateTime.getTime() - tokenExpiryInMilliseconds)

        List<UserAuthToken> inactiveTokens = UserAuthToken.where {
            lastUpdated < earliestAllowedInactiveTime
        }.list()

        userSessionEventService.recordSessionExpiry(inactiveTokens*.username)

        log.trace("Found ${inactiveTokens.size()} inactive auth tokens to be deleted")
        inactiveTokens*.delete()
        log.debug("Deleted ${inactiveTokens.size()} inactive auth tokens")
    }
}