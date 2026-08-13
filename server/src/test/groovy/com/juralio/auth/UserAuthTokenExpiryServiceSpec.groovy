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
import grails.testing.gorm.DataTest
import grails.testing.services.ServiceUnitTest
import helper.DomainTestHelper
import org.apache.commons.lang3.RandomStringUtils
import spock.lang.Specification

class UserAuthTokenExpiryServiceSpec extends Specification implements ServiceUnitTest<UserAuthTokenExpiryService>, DataTest {

    void setup() {
        mockDomain UserAuthToken
    }

    void "expireTokens"() {
        final MOCK_TOKEN_EXPIRY_IN_MINUTES = 2

        given: "there are a range of tokens that are both active an inactive"
        service.dateUtilService = Mock(DateUtilService)
        service.dateUtilService.getCurrentDateTime() >> new Date(2019, 0, 15, 12, 0, 0)
        service.configService = Mock(ConfigService)
        service.configService.getTokenExpiryMinutes() >> MOCK_TOKEN_EXPIRY_IN_MINUTES
        service.userSessionEventService = Mock(UserSessionEventService)

        //Clearly falls into inactive category by 1 minute
        def clearlyInactive = createAuthToken(new Date(2019, 0, 15, 11, 57, 0))
        //Falls into inactive category by 1 second
        def justInactive = createAuthToken(new Date(2019, 0, 15, 11, 57, 59))
        //Equal to the earliest allowed active time
        def earliestAllowed = createAuthToken(new Date(2019, 0, 15, 11, 58, 0))
        //Fall into the active category by 1 second
        def justActive = createAuthToken(new Date(2019, 0, 15, 11, 58, 1))
        //Clearly falls into the active category by 1 minute
        def clearlyActive = createAuthToken(new Date(2019, 0, 15, 11, 59, 0))

        when:
        service.expireTokens()

        then: "only tokens within the active window should still exist"
        UserAuthToken.list().size() == 3
        UserAuthToken.list().contains(earliestAllowed)
        UserAuthToken.list().contains(justActive)
        UserAuthToken.list().contains(clearlyActive)
    }

    def createAuthToken(Date date) {
        UserAuthToken token
        //Disabling autoTimestamp functionality to set date to a known value not
        //controlled by GORM
        DomainTestHelper.executeWithoutTimestamps(UserAuthToken, {
            token = new UserAuthToken(
                    username: RandomStringUtils.random(5),
                    tokenValue: RandomStringUtils.random(5)).save(flush: true)
            token.lastUpdated = date
            token.save(flush: true)
        })
        return token
    }
}
