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

import com.juralio.auth.exception.BadSSOCredentialsException
import com.juralio.auth.exception.CannotLoginLapsedAccountException
import com.juralio.auth.exception.MfaAuthenticationException
import com.juralio.auth.exception.SSOUserDoesNotExistException
import com.juralio.auth.exception.UserHasNoOrganisationException
import com.juralio.auth.failure.response.BadSSOCredentialsResponse
import com.juralio.auth.failure.response.CannotLoginLapsedUserResponse
import com.juralio.auth.failure.response.ExpiredAuthenticationResponse
import com.juralio.auth.failure.response.LockedAuthenticationResponse
import com.juralio.auth.failure.response.NoOrganisationResponse
import com.juralio.auth.failure.response.SSOUserDoesNotExistResponse
import com.juralio.auth.mfa.MfaExceptionHandlerService
import com.juralio.config.ConfigService
import grails.plugin.springsecurity.rest.RestAuthenticationFailureHandler
import org.slf4j.Logger
import org.slf4j.LoggerFactory
import org.springframework.security.authentication.CredentialsExpiredException
import org.springframework.security.authentication.LockedException
import org.springframework.security.core.AuthenticationException

import jakarta.servlet.ServletException
import jakarta.servlet.http.HttpServletRequest
import jakarta.servlet.http.HttpServletResponse

class UserAuthenticationFailureHandler extends RestAuthenticationFailureHandler {
    private final Logger log = LoggerFactory.getLogger(getClass())

    MfaExceptionHandlerService mfaExceptionHandlerService
    ConfigService configService
    def jsonResponseWriter

    @Override
    void onAuthenticationFailure(HttpServletRequest request, HttpServletResponse response,
                                 AuthenticationException exception) throws IOException, ServletException {
        statusCode = HttpServletResponse.SC_UNAUTHORIZED

        if (exception instanceof LockedException) {
            log.debug("Authentication failed as user is locked.")
            jsonResponseWriter.writeObjectAsJSON(new LockedAuthenticationResponse(configService.lockDurationMinutes), response)
        } else if (exception instanceof CredentialsExpiredException) {
            log.debug("Authentication failed as credentials have expired")
            jsonResponseWriter.writeObjectAsJSON(new ExpiredAuthenticationResponse(), response)
        } else if (exception instanceof UserHasNoOrganisationException) {
            log.debug("Authentication failed as user has no organisation")
            jsonResponseWriter.writeObjectAsJSON(new NoOrganisationResponse(), response)
        } else if (exception instanceof MfaAuthenticationException) {
            log.debug("Authentication failed due to an MFA exception")
            mfaExceptionHandlerService.handleException(exception, response)
        } else if (exception instanceof  BadSSOCredentialsException){
            log.debug("Authentication failed as user has bad SSO credentials")
            jsonResponseWriter.writeObjectAsJSON(new BadSSOCredentialsResponse() , response)
        } else if(exception instanceof  SSOUserDoesNotExistException){
            log.debug("Authentication failed as user does not exist")
            jsonResponseWriter.writeObjectAsJSON(new SSOUserDoesNotExistResponse(), response)
        } else if(exception instanceof CannotLoginLapsedAccountException){
            log.debug("Cannot log in a lapsed user")
            jsonResponseWriter.writeObjectAsJSON(["customMsg":exception.getMessage(), "reason":AuthenticationFailureReason.USER_LAPSED.toString()], response)
        }

        super.onAuthenticationFailure(request, response, exception)
    }
}
