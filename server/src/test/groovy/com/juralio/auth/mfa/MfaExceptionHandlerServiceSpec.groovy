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
import com.juralio.auth.exception.MfaAuthenticationException
import com.juralio.auth.exception.MfaRegistrationRequiredAuthenticationException
import com.juralio.auth.exception.MfaTokenInvalidException
import com.juralio.auth.exception.MfaTokenRequiredException
import com.juralio.auth.failure.response.MfaRegistrationRequiredResponse
import com.juralio.auth.failure.response.MfaTokenInvalidResponse
import com.juralio.auth.failure.response.MfaTokenRequiredResponse
import com.juralio.auth.mfa.registration.MfaRegistrationService
import com.juralio.mfa.GetMfaSeedResponse
import com.juralio.util.response.JSONResponseWriter
import grails.testing.gorm.DataTest
import grails.testing.services.ServiceUnitTest
import spock.lang.Specification

import jakarta.servlet.http.HttpServletResponse

class MfaExceptionHandlerServiceSpec extends Specification implements ServiceUnitTest<MfaExceptionHandlerService>, DataTest {

    def setup() {
        service.jsonResponseWriter = Mock(JSONResponseWriter)
        service.mfaRegistrationService = Mock(MfaRegistrationService)
    }

    void "handleException() - when passed an MfaRegistrationRequiredAuthenticationException"() {

        HttpServletResponse mockResponse
        GetMfaSeedResponse beginRegistrationResponse
        AppUser user
        MfaRegistrationRequiredAuthenticationException exception

        setup:
        beginRegistrationResponse = new GetMfaSeedResponse('some_key', 'some_qr')

        mockResponse = Mock(HttpServletResponse)

        user = new AppUser()
        exception = new MfaRegistrationRequiredAuthenticationException(user)

        when:
        service.handleException(exception, mockResponse)

        then: "beginRegistration should be called with the user from the exception"
        1 * service.mfaRegistrationService.beginRegistration(user) >> beginRegistrationResponse

        then: "the mfa response should be written including the qrUrl"
        1 * service.jsonResponseWriter.writeObjectAsJSON(
                { MfaRegistrationRequiredResponse response ->
                    response.qrUrl == 'some_qr' && response.key == 'some_key'
                },
                mockResponse)
    }

    void "handleException() - when passed an MfaTokenRequiredException"() {
        HttpServletResponse mockResponse
        MfaTokenRequiredException exception

        setup:
        mockResponse = Mock(HttpServletResponse)
        exception = new MfaTokenRequiredException()

        when:
        service.handleException(exception, mockResponse)

        then: "the mfa response should be written"
        1 * service.jsonResponseWriter.writeObjectAsJSON({ new MfaTokenRequiredResponse() }, mockResponse)
    }

    void "handleException() - when passed an MfaTokenInvalidException"() {
        HttpServletResponse mockResponse
        MfaTokenInvalidException exception

        setup:
        mockResponse = Mock(HttpServletResponse)
        exception = new MfaTokenInvalidException()

        when:
        service.handleException(exception, mockResponse)

        then: "the mfa response should be written"
        1 * service.jsonResponseWriter.writeObjectAsJSON({ new MfaTokenInvalidResponse() }, mockResponse)
    }

    void "handleException() - when passed an unsupported exception"() {

        HttpServletResponse mockResponse

        setup:
        mockResponse = Mock(HttpServletResponse)

        when:
        service.handleException(new MockMfaException(''), mockResponse)

        then: "beginRegistration should NOT be called"
        0 * service.mfaRegistrationService.beginRegistration(_ as AppUser)

        then: "the mfa response should NOT be written"
        0 * service.jsonResponseWriter.writeObjectAsJSON(_, _)
    }

    class MockMfaException extends MfaAuthenticationException {
        MockMfaException(String message) {
            super(message)
        }
    }
}