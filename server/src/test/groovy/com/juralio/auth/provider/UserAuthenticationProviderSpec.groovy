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

package com.juralio.auth.provider

import com.juralio.auth.AppUser
import com.juralio.auth.AppUserDetailsService
import com.juralio.auth.UserService
import com.juralio.auth.mfa.MfaAuthenticationService
import com.juralio.auth.organisation.UserOrganisationAuthenticationService
import com.juralio.auth.token.UserAuthenticationToken
import grails.testing.gorm.DataTest
import org.springframework.security.authentication.dao.DaoAuthenticationProvider
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.userdetails.UserDetails
import spock.lang.Specification

class UserAuthenticationProviderSpec extends Specification implements  DataTest  {

        UserAuthenticationProvider service

        void setup() {
            service = new UserAuthenticationProvider()
            service.daoAuthenticationProvider = Mock(DaoAuthenticationProvider)
            service.userDetailsService = Mock(AppUserDetailsService)
            service.userService = Mock(UserService)
            service.mfaAuthenticationService = Mock(MfaAuthenticationService) //TODO: reinstate mfa
            service.userOrganisationAuthenticationService = Mock(UserOrganisationAuthenticationService)
            mockDomain AppUser
        }

    void "authenticate()"() {
        UserAuthenticationToken authenticationToken, resultingAuthenticationToken
        AppUser mockUser
        def result, fetchedUserDetails

        setup:
        authenticationToken = new UserAuthenticationToken('mockUser', 'mockPassword')
        resultingAuthenticationToken = new UserAuthenticationToken('mockUser', 'mockPassword')
        fetchedUserDetails = new MockUserDetails('mockUserFetched')
        mockUser = new AppUser(mfaEnabled: mfaEnabled, mfaRegistered: mfaRegistered)

        when:
        result = service.authenticate(authenticationToken)

        then:
        1 * service.daoAuthenticationProvider.authenticate(authenticationToken) >> resultingAuthenticationToken

        then:
        1 * service.userDetailsService.loadUserByUsername('mockUser', false) >> fetchedUserDetails

        then:
        1 * service.userService.findByUsername('mockUserFetched', [:]) >> mockUser

        then:
        1 * service.mfaAuthenticationService.authenticate(mockUser, authenticationToken)

        and:
        result == resultingAuthenticationToken

        where:
        mfaEnabled | mfaRegistered
        true       | true
        false      | true
        false      | false
    }
        void "supports()"() {
            def result

            when:
            result = service.supports(input)

            then:
            result == expectedResult

            where:
            expectedResult      | input
            true                | UserAuthenticationToken
            false               | String
        }

        class MockUserDetails implements UserDetails {

            def username
            def id = 1L

            MockUserDetails(username) {
                this.username = username
            }

            @Override
            Collection<? extends GrantedAuthority> getAuthorities() {
                return null
            }

            @Override
            String getPassword() {
                return null
            }

            @Override
            String getUsername() {
                return username
            }

            @Override
            boolean isAccountNonExpired() {
                return false
            }

            @Override
            boolean isAccountNonLocked() {
                return false
            }

            @Override
            boolean isCredentialsNonExpired() {
                return false
            }

            @Override
            boolean isEnabled() {
                return false
            }
        }
    }
