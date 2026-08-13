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

import com.juralio.auth.exception.MfaAuthenticationException
import com.juralio.auth.exception.MfaRegistrationRequiredAuthenticationException
import com.juralio.auth.exception.MfaTokenInvalidException
import com.juralio.auth.exception.MfaTokenRequiredException
import com.juralio.auth.failure.response.MfaRegistrationRequiredResponse
import com.juralio.auth.failure.response.MfaTokenInvalidResponse
import com.juralio.auth.failure.response.MfaTokenRequiredResponse
import com.juralio.auth.mfa.registration.MfaRegistrationService
import com.juralio.util.response.JSONResponseWriter
import grails.gorm.transactions.Transactional

import jakarta.servlet.http.HttpServletResponse

@Transactional
class MfaExceptionHandlerService {

    JSONResponseWriter jsonResponseWriter
    MfaRegistrationService mfaRegistrationService

    def handleException(MfaAuthenticationException exception, HttpServletResponse response) {
        if (exception instanceof MfaRegistrationRequiredAuthenticationException) {
            def registrationException = exception as MfaRegistrationRequiredAuthenticationException
            log.debug("MFA Registration is required for user ${registrationException.user.username}")
            def seedResponse = mfaRegistrationService.beginRegistration(registrationException.user)

            def mfaRegistrationRequiredResponse = new MfaRegistrationRequiredResponse(seedResponse.key, seedResponse.qrUrl)
            jsonResponseWriter.writeObjectAsJSON(mfaRegistrationRequiredResponse, response)
        } else if (exception instanceof MfaTokenRequiredException) {
            log.debug("MFA token is required")
            def mfaTokenRequiredResponse = new MfaTokenRequiredResponse()
            jsonResponseWriter.writeObjectAsJSON(mfaTokenRequiredResponse, response)
        } else if (exception instanceof MfaTokenInvalidException) {
            log.debug("MFA token is invalid")
            def mfaTokenInvalidResponse = new MfaTokenInvalidResponse()
            jsonResponseWriter.writeObjectAsJSON(mfaTokenInvalidResponse, response)
        }
    }
}