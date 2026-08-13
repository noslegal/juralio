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
import com.juralio.auth.Role
import com.juralio.auth.UserRole
import com.juralio.auth.exception.MfaRegistrationRequiredAuthenticationException
import com.juralio.auth.mfa.registration.MfaRegistrationService
import com.juralio.auth.token.UserAuthenticationToken
import com.juralio.organisation.Organisation
import com.juralio.organisation.dao.OrganisationDAOService
import grails.testing.gorm.DataTest
import grails.testing.services.ServiceUnitTest
import spock.lang.Specification

class MfaAuthenticationServiceSpec extends Specification implements ServiceUnitTest<MfaAuthenticationService>, DataTest {

    def setup() {
        service.mfaRegistrationService = Mock(MfaRegistrationService)
        service.mfaService = Mock(MfaService)
        service.organisationDAOService = Mock(OrganisationDAOService)
        mockDomain(AppUser)
        mockDomain(Organisation)
    }

    void "authenticate()"() {
        AppUser mockUser
        UserAuthenticationToken mockToken
        Organisation mockOrganisation

        setup:
        mockOrganisation = new Organisation(name: 'mock', mfaEnabled: true)
        mockOrganisation.save()
        mockUser = new AppUser(mfaEnabled: true)
        mockUser.mfaKey = '123456'
        mockUser.organisation = mockOrganisation

        mockToken = new UserAuthenticationToken('username', 'password', true, 654321)

        when:
        service.authenticate(mockUser, mockToken)

        then:
        1 * service.organisationDAOService.getOrganisation(mockOrganisation.id) >> mockOrganisation

        and:
        1 * service.mfaRegistrationService.completeRegistration(mockUser, mockToken.mfaToken)
    }

    void "authenticate() - exception thrown"() {
        AppUser mockUser
        Organisation mockOrganisation
        UserAuthenticationToken mockToken
        def thrownException

        setup:
        mockOrganisation = new Organisation(name: 'mock', mfaEnabled: true)
        mockOrganisation.save()
        mockUser = new AppUser(mfaEnabled: true)
        mockUser.mfaKey = mfaKey
        mockUser.organisation = mockOrganisation

        mockToken = new UserAuthenticationToken('username', 'password', mfaTokenPresent, 123456)

        when:
        service.authenticate(mockUser, mockToken)

        then:
        1 * service.organisationDAOService.getOrganisation(mockOrganisation.id) >> mockOrganisation

        then:
        thrownException = thrown(MfaRegistrationRequiredAuthenticationException)

        then:
        thrownException.user == mockUser

        where:
        mfaTokenPresent | mfaKey
        false           | '123456'
        false           | null
        true            | null
        true            | ''
    }

    void "authenticate() - where mfa is disabled or user is already registered"() {
        AppUser mockUser
        Organisation mockOrganisation
        UserAuthenticationToken mockToken

        setup:
        mockOrganisation = new Organisation(name: 'mock', mfaEnabled: true)
        mockOrganisation.save()
        mockUser = new AppUser(mfaEnabled: mfaEnabled)
        mockUser.mfaRegistered = mfaRegistered
        mockUser.mfaKey = '123456'
        mockUser.organisation = mockOrganisation


        mockToken = new UserAuthenticationToken('username', 'password', true, 123456)

        when:
        service.authenticate(mockUser, mockToken)

        then:
        1 * service.organisationDAOService.getOrganisation(mockOrganisation.id) >> mockOrganisation

        then:
        0 * service.mfaRegistrationService.completeRegistration(mockUser, mockToken.mfaToken)

        then:
        notThrown(MfaRegistrationRequiredAuthenticationException)

        where:
        mfaEnabled | mfaRegistered
        false      | false
        true       | true
    }

    void "authenticate() - where user is fully registered for mfa"() {
        AppUser mockUser
        Organisation mockOrganisation
        UserAuthenticationToken mockToken

        setup:
        mockOrganisation = new Organisation(name: 'mock', mfaEnabled: true)
        mockOrganisation.save()
        mockUser = new AppUser(mfaEnabled: true)
        mockUser.mfaRegistered = true
        mockUser.mfaKey = 'some_key'
        mockUser.organisation = mockOrganisation

        mockToken = new UserAuthenticationToken('username', 'password', true, 123456)

        when:
        service.authenticate(mockUser, mockToken)

        then:
        1 * service.organisationDAOService.getOrganisation(mockOrganisation.id) >> mockOrganisation

        then:
        0 * service.mfaRegistrationService.completeRegistration(_, _)

        then:
        1 * service.mfaService.verify('some_key', 123456)
    }
}