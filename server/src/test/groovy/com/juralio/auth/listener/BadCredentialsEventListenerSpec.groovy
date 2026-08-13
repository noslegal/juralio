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
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.authentication.event.AuthenticationFailureBadCredentialsEvent
import org.springframework.security.core.Authentication
import org.springframework.security.core.AuthenticationException
import org.springframework.security.core.GrantedAuthority
import spock.lang.Specification

class BadCredentialsEventListenerSpec extends Specification {
    private BadCredentialsEventListener listener

    def setup() {
        listener = new BadCredentialsEventListener()
        listener.userService = Mock(UserService)
    }

    void "onApplicationEvent()"() {
        final String MOCK_PRINCIPAL = "MOCK_PRINCIPAL"

        setup:
        Authentication mockAuthentication = new MockAuthentication()
        mockAuthentication.principal = MOCK_PRINCIPAL

        AuthenticationException authenticationException = new BadCredentialsException('')

        AuthenticationFailureBadCredentialsEvent event =
                new AuthenticationFailureBadCredentialsEvent(mockAuthentication, authenticationException)

        when: "the function is called with an AuthenticationFailureBadCredentialsEvent"
        listener.onApplicationEvent(event)

        then: "juralioUserService.handleFailedLogin should be called with the event's principal (i.e. username)"
        1 * listener.userService.handleFailedLogin(MOCK_PRINCIPAL)
    }

    class MockAuthentication implements Authentication {

        Object principal

        Object getPrincipal() { return principal }

        void setPrincipal(Object principal) {
            this.principal = principal
        }

        Collection<? extends GrantedAuthority> getAuthorities() { return null }

        Object getCredentials() { return null }

        Object getDetails() { return null }

        boolean isAuthenticated() { return false }

        void setAuthenticated(boolean b) throws IllegalArgumentException {}

        String getName() { return null }
    }
}