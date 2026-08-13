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

package com.juralio.auth.listener

import com.juralio.auth.UserService
import grails.plugin.springsecurity.rest.RestTokenCreationEvent
import grails.plugin.springsecurity.rest.token.AccessToken
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.userdetails.UserDetails
import spock.lang.Specification

class OnSuccessAuthEventListenerSpec extends Specification {
    private OnSuccessAuthEventListener listener

    def setup() {
        listener = new OnSuccessAuthEventListener()
        listener.userService = Mock(UserService)
    }

    void "onApplicationEvent()"() {
        setup:
        AccessToken mockAccessToken = new AccessToken('1234', '456')
        UserDetails mockUserDetails = new MockUserDetails('mock_username')

        mockAccessToken.principal = mockUserDetails

        RestTokenCreationEvent event =
                new RestTokenCreationEvent(mockAccessToken)

        when: "the function is called with an RestTokenCreationEvent"
        listener.onApplicationEvent(event)

        then: "userService.resetLoginAttempts should be called with the event's principal (i.e. username)"
        1 * listener.userService.resetLoginAttempts('mock_username')
    }

    class MockUserDetails implements UserDetails {
        def username

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

