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

package com.juralio.auth.failure

import com.juralio.auth.exception.MfaAuthenticationException
import com.juralio.auth.exception.MfaRegistrationRequiredAuthenticationException
import com.juralio.auth.failure.response.ExpiredAuthenticationResponse
import com.juralio.auth.failure.response.LockedAuthenticationResponse
import com.juralio.auth.mfa.MfaExceptionHandlerService
import com.juralio.config.ConfigService
import com.juralio.util.response.JSONResponseWriter
import grails.testing.gorm.DataTest
import org.springframework.security.authentication.CredentialsExpiredException
import org.springframework.security.authentication.LockedException
import org.springframework.security.core.AuthenticationException
import spock.lang.Specification

import jakarta.servlet.http.HttpServletResponse

class UserAuthenticationFailureHandlerSpec extends Specification implements DataTest {

    UserAuthenticationFailureHandler authenticationFailureHandler

    void setup() {
        authenticationFailureHandler = new UserAuthenticationFailureHandler()
        authenticationFailureHandler.configService = Mock(ConfigService)
        authenticationFailureHandler.mfaExceptionHandlerService = Mock(MfaExceptionHandlerService)
        authenticationFailureHandler.jsonResponseWriter = Mock(JSONResponseWriter)
    }

    def "onAuthenticationFailure() - exception is LockedException"() {
        setup:
        HttpServletResponse mockResponse = Mock(HttpServletResponse)

        when:
        authenticationFailureHandler.onAuthenticationFailure(null, mockResponse, new LockedException(''))

        then:
        1 * mockResponse.setStatus(HttpServletResponse.SC_UNAUTHORIZED)

        and: "should retrieve account lock duration from configService"
        1 * authenticationFailureHandler.configService.lockDurationMinutes >> 10

        and: "should call the jsonResponseWriter with a locked response with duration set"
        1 * authenticationFailureHandler.jsonResponseWriter.writeObjectAsJSON(
                { LockedAuthenticationResponse response -> response.lockDuration == 10 }, mockResponse)
    }

    def "onAuthenticationFailure() - exception is ExpiredException"() {
        setup:
        HttpServletResponse mockResponse = Mock(HttpServletResponse)

        when:
        authenticationFailureHandler.onAuthenticationFailure(null, mockResponse, new CredentialsExpiredException(''))

        then:
        1 * mockResponse.setStatus(HttpServletResponse.SC_UNAUTHORIZED)

        and: "should call the jsonResponseWriter with an expired response"
        1 * authenticationFailureHandler.jsonResponseWriter.writeObjectAsJSON(_ as ExpiredAuthenticationResponse, mockResponse)
    }

    def "onAuthenticationFailure() - exception is MfaAuthenticationException"() {
        MfaRegistrationRequiredAuthenticationException exception

        setup:
        exception = new MfaRegistrationRequiredAuthenticationException()
        HttpServletResponse mockResponse = Mock(HttpServletResponse)

        when:
        authenticationFailureHandler.onAuthenticationFailure(null, mockResponse, exception)

        then:
        1 * mockResponse.setStatus(HttpServletResponse.SC_UNAUTHORIZED)

        and: "should call the mfaExceptionHandlerService with an mfa exception and response"
        1 * authenticationFailureHandler.mfaExceptionHandlerService.handleException(exception, mockResponse)
    }

    def "onAuthenticationFailure() - exception is not supported"() {
        setup:
        HttpServletResponse mockResponse = Mock(HttpServletResponse)

        when:
        authenticationFailureHandler.onAuthenticationFailure(null, mockResponse, new MockAuthenticationException('', null))

        then:
        1 * mockResponse.setStatus(HttpServletResponse.SC_UNAUTHORIZED)

        and: "should NOT call the mfaExceptionHandlerService"
        0 * authenticationFailureHandler.mfaExceptionHandlerService.handleException(_ as MfaAuthenticationException,
                _ as HttpServletResponse)

        and: "should NOT call the jsonResponseWriter"
        0 * authenticationFailureHandler.jsonResponseWriter.writeObjectAsJSON(_, _ as HttpServletResponse)
    }

    class MockAuthenticationException extends AuthenticationException {
        MockAuthenticationException(String msg, Throwable t) {
            super(msg, t)
        }
    }
}