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

package com.juralio.auth.password

import com.juralio.auth.AppUser
import com.juralio.auth.UserAuthTokenService
import com.juralio.auth.UserService
import com.juralio.aws.SESService
import com.juralio.config.ConfigService
import grails.testing.gorm.DomainUnitTest
import grails.testing.services.ServiceUnitTest
import org.grails.spring.beans.factory.InstanceFactoryBean
import spock.lang.Specification

class TemporaryPasswordServiceSpec extends Specification implements ServiceUnitTest<TemporaryPasswordService>, DomainUnitTest<AppUser> {

    void setup() {
        ConfigService configServiceMock = Mock()
        SESService sesServiceMock = Mock()
        defineBeans {
            configService(InstanceFactoryBean, configServiceMock, ConfigService)
            sesService(InstanceFactoryBean, sesServiceMock, SESService)
        }
    }

    def "getTemporaryPassword"() {
        TemporaryPassword result
        AppUser mockUser
        TemporaryPassword temporaryPassword

        setup:
        mockDomain(AppUser)
        mockUser = new AppUser(passwordExpired: false)
        temporaryPassword = new TemporaryPassword('mock_temp_password')

        service.userService = Mock(UserService)
        service.passwordGeneratorService = Mock(PasswordGeneratorService)
        service.userAuthTokenService = Mock(UserAuthTokenService)

        when:
        result = service.getTemporaryPassword(mockUser)

        then: "passwordGeneratorService.generatePassword should be called"
        1 * service.passwordGeneratorService.generatePassword() >> temporaryPassword

        then: "the user's passwordExpired property should be set to true"
        mockUser.passwordExpired

        then: "the user's accountLocked property should be set to false"
        mockUser.accountLocked == false

        then: "the user's password should be set to the generated password"
        mockUser.password == 'mock_temp_password'

        then: "userAuthTokenService.invalidateAllSessions should be called with the user"
        1 * service.userAuthTokenService.invalidateAllSessions(mockUser)

        and: "the generated password object should be returned"
        result == temporaryPassword
    }
}