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

package com.juralio.auth.mfa.registration

import com.juralio.auth.AppUser
import com.juralio.auth.AppUserDetailsService
import com.juralio.auth.UserService
import com.juralio.auth.exception.MfaTokenRequiredException
import com.juralio.auth.mfa.MfaService
import com.juralio.mfa.GetMfaSeedResponse
import grails.testing.gorm.DataTest
import grails.testing.services.ServiceUnitTest
import spock.lang.Specification

class MfaRegistrationServiceSpec extends Specification implements DataTest, ServiceUnitTest<MfaRegistrationService> {

    def setup() {
        service.mfaService = Mock(MfaService)
        service.userDetailsService = new AppUserDetailsService()
        service.userDetailsService.userService = Mock(UserService)
        mockDomain AppUser
    }

    void "beginRegistration()"() {

        GetMfaSeedResponse mockMfaSeedResponse
        AppUser mockUser, reloadedUser
        def result

        setup:
        mockUser = new AppUser(username: 'mock_username@test.com')
        reloadedUser = new AppUser(username: 'mock_username@test.com')
        mockMfaSeedResponse = new GetMfaSeedResponse('mock_mfa_key', 'mock_mfa_qr')

        when:
        result = service.beginRegistration(mockUser)

        then: "getMfaSeed should be called on the mfaService"
        1 * service.mfaService.getMfaSeed(mockUser) >> mockMfaSeedResponse

        then: "the user record should be re-loaded"
        1 * service.userDetailsService.userService.findByUsername("mock_username@test.com", [:]) >> reloadedUser

        then: "the loaded user's record should be updated with the returned mfa key"
        reloadedUser.mfaKey == 'mock_mfa_key'

        then: "the loaded user's record should remain not mfa registered"
        !mockUser.mfaRegistered

        then: "the return value should be response from the getMfaSeed call"
        result == mockMfaSeedResponse
    }

    void "completeRegistration() - where no errors occurred during verification"() {
        AppUser user, reloadedUser

        setup:
        user = new AppUser(username: "mock_username@test.com")

        reloadedUser = new AppUser()
        reloadedUser.mfaKey = 'some_key'

        when:
        service.completeRegistration(user, 123)

        then: "the user record should be re-loaded"
        1 * service.userDetailsService.userService.findByUsername("mock_username@test.com", [:]) >> reloadedUser

        then: "verify should be called on the mfaService (no exceptions are raised)"
        1 * service.mfaService.verify('some_key', 123)

        then: "the user's mfaRegistered field should be set to true"
        reloadedUser.mfaRegistered
    }

    void "completeRegistration() - where an error occurred during verification"() {
        AppUser user, reloadedUser

        setup:
        user = new AppUser(username: "mock_username@test.com")

        reloadedUser = new AppUser()
        reloadedUser.mfaKey = 'some_key'

        when:
        service.completeRegistration(user, 123)

        then: "the user record should be re-loaded"
        1 * service.userDetailsService.userService.findByUsername("mock_username@test.com", [:]) >> reloadedUser

        then: "verify should be called on the mfaService (exception is raised)"
        1 * service.mfaService.verify('some_key', 123) >> {
            throw new MfaTokenRequiredException()
        }

        then: "the exception raised by mfaService.verify should bubble up"
        thrown(MfaTokenRequiredException)

        then: "the user's mfaRegistered field should continue to be false"
        !reloadedUser.mfaRegistered
    }
}
