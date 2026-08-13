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

package com.juralio.auth.mfa

import com.juralio.auth.AppUser
import com.juralio.auth.exception.MfaTokenInvalidException
import com.juralio.auth.exception.MfaTokenRequiredException
import com.juralio.mfa.GetMfaSeedResponse
import grails.testing.gorm.DataTest
import grails.testing.services.ServiceUnitTest
import spock.lang.Specification

class MfaServiceSpec extends Specification implements ServiceUnitTest<MfaService>, DataTest {

    def setup() {
        mockDomain AppUser
        service.googleAuthService = Mock(GoogleAuthService)
    }

    void "getMfaSeed()"() {

        GetMfaSeedResponse mockResponseBody, result
        AppUser mockUser = new AppUser(username: 'mock_username@test.com')

        setup:
        mockResponseBody = new GetMfaSeedResponse('some_code', 'some_url')

        when:
        result = service.getMfaSeed(mockUser)

        then:
        1 * service.googleAuthService.generateMfaSeedResponse(mockUser) >> mockResponseBody

        then:
        result == mockResponseBody
    }

    void "verify() - called without an mfaToken parameter"() {
        when:
        service.verify("some_key", null)

        then:
        thrown(MfaTokenRequiredException)
    }

    void "verify() - when no errors occur in verification"() {
        when:
        service.verify("some_key", 123)

        then:
        1 * service.googleAuthService.verifyToken('some_key', 123) >> true

        then: "no exceptions should be raised"
        noExceptionThrown()
    }

    void "verify() - when called with invalid token"() {
        when:
        service.verify("some_key", 123)

        then:
        thrown(MfaTokenInvalidException)
    }
}