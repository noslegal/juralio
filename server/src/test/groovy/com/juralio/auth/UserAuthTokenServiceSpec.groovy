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

import grails.testing.gorm.DataTest
import grails.testing.services.ServiceUnitTest
import spock.lang.Specification


class UserAuthTokenServiceSpec extends Specification implements ServiceUnitTest<UserAuthTokenService>, DataTest {

    void setup() {
        mockDomain(UserAuthToken)
    }

    void "invalidateAllSessions"() {
        final String USER_TO_INVALIDATE = 'USER_TO_INVALIDATE'
        final String ANOTHER_USER = 'ANOTHER_USER'

        when: 'a number of tokens have been created for multiple users'
        createToken(USER_TO_INVALIDATE)
        createToken(USER_TO_INVALIDATE)
        createToken(USER_TO_INVALIDATE)
        createToken(ANOTHER_USER)

        then: 'the expected number of auth tokens should be present'
        UserAuthToken.count() == 4

        then: 'invalidateAllSessions is called with a user'
        service.invalidateAllSessions(new AppUser(username: USER_TO_INVALIDATE))

        then: 'all of the auth tokens for the given user should have been deleted'
        UserAuthToken.count() == 1

        and: 'the only remaining token should not belong to the given user'
        UserAuthToken.findByUsername(ANOTHER_USER).count() == 1
    }

    def createToken(username) {
        def authToken = new UserAuthToken(username: username, tokenValue: 'token')
        authToken.save(failOnError: true)
    }
}
