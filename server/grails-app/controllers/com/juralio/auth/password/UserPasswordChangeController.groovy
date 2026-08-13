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
import com.juralio.auth.exception.*
import com.juralio.common.APIErrorCodes
import grails.plugin.springsecurity.annotation.Secured
import org.apache.commons.logging.Log
import org.apache.commons.logging.LogFactory
import org.springframework.http.HttpStatus

class UserPasswordChangeController {

    static allowedMethods = [userChangeOwnPassword: "POST"]

    protected final Log logger = LogFactory.getLog(getClass())

    def userService
    def errorResponseHelperService

    @Secured('IS_AUTHENTICATED_ANONYMOUSLY')
    def userChangeOwnPassword(UserPasswordChangeRequest changeRequest) {
        try {
            userService.changePassword(changeRequest)
            respond [:], status: HttpStatus.OK
        } catch (Exception exception) {
            respondToException(exception, changeRequest.username)
        }
    }

    private def respondToException(Exception exception, String username) {
        logger.debug(exception)

        if (exception instanceof UserDoesNotExistException) {
           return response.setStatus(HttpStatus.FORBIDDEN.value())
        } else if (exception instanceof UserLockedException) {
            return respondWithError(APIErrorCodes.USER_LOCKED)
        } else if (exception instanceof NewPasswordsDoNotMatchException) {
            return respondWithError(APIErrorCodes.NEW_PASSWORDS_DO_NOT_MATCH)
        } else if (exception instanceof PasswordCannotMatchCurrentPassword) {
            return respondWithError(APIErrorCodes.NEW_PASSWORD_MATCHES_OLD_PASSWORD)
        } else if (exception instanceof PasswordsDoNotMeetComplexityRulesException) {
            return respondWithError(APIErrorCodes.PASSWORD_COMPLEXITY_NOT_MET)
        }

        if (username && exception instanceof OldPasswordNotValidException) {
            AppUser user = userService.findByUsername(username, [lock: true])
            userService.handleFailedAuthentication(user)

            render status: HttpStatus.UNAUTHORIZED
            return
        }

        throw new IllegalArgumentException("Unrecognised Exception type ${exception.toString()}")
    }

    private def respondWithError(APIErrorCodes errorCode) {
        def errorResponse = errorResponseHelperService.getErrorResponseForDomainClass(
                UserPasswordChangeRequest, errorCode.code())

        respond errorResponse, status: HttpStatus.BAD_REQUEST
    }
}