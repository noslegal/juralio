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

package com.juralio.auth

import com.juralio.auth.exception.NewPasswordsDoNotMatchException
import com.juralio.auth.exception.OldPasswordNotValidException
import com.juralio.auth.exception.PasswordCannotMatchCurrentPassword
import com.juralio.auth.exception.PasswordDoesNotMeetCharacterClassCountRequirement
import com.juralio.auth.exception.PasswordDoesNotMeetMaximumLengthRequirement
import com.juralio.auth.exception.PasswordDoesNotMeetMinimumLengthRequirement
import com.juralio.auth.exception.UserDoesNotExistException
import com.juralio.auth.password.UserPasswordChangeController
import com.juralio.auth.password.UserPasswordChangeRequest
import com.juralio.common.error.ErrorResponseHelperService
import com.juralio.common.APIErrorCodes
import grails.testing.web.controllers.ControllerUnitTest
import org.springframework.http.HttpStatus
import spock.lang.Specification

class UserPasswordChangeControllerSpec extends Specification implements ControllerUnitTest<UserPasswordChangeController> {

    void setup() {
        request.method = 'POST'
    }

    void "userChangeOwnPassword()"() {
        UserPasswordChangeRequest mockUserPasswordChangeRequest

        setup:
        mockUserPasswordChangeRequest = Mock(UserPasswordChangeRequest)
        controller.userService = Mock(UserService)

        when: "the controller method is called"
        controller.userChangeOwnPassword(mockUserPasswordChangeRequest)

        then: "juralioUserService.changePassword should be executed, passing the PasswordChangeRequest"
        1 * controller.userService.changePassword(mockUserPasswordChangeRequest)

        and: "the function should respond with a HttpStatus.OK"
        response.status == HttpStatus.OK.value()
    }

    void "userChangeOwnPassword() - juralioUserService.changePassword throws a recognised exception"() {
        UserPasswordChangeRequest mockUserPasswordChangeRequest

        setup:
        mockUserPasswordChangeRequest = new UserPasswordChangeRequest()
        mockUserPasswordChangeRequest.username = 'mock_username'

        controller.userService = Mock(UserService)
        controller.errorResponseHelperService = Mock(ErrorResponseHelperService)

        when: "the controller method is called"
        controller.userChangeOwnPassword(mockUserPasswordChangeRequest)

        then: "juralioUserService.changePassword is executed, and throws an exception"
        1 * controller.userService.changePassword(mockUserPasswordChangeRequest) >> {
            throw exceptionToThrow
        }

        then: "errorResponseHelperService.getErrorResponseForDomainClass should be called"
        expectedHelperCalls * controller.errorResponseHelperService.getErrorResponseForDomainClass(
                UserPasswordChangeRequest,
                expectedErrorCode.code()
        )

        and: "the function should respond with the expected Status"
        response.status == expectedStatus

        where:
        exceptionToThrow                                        | expectedErrorCode                                 | expectedStatus                          | expectedHelperCalls
        new OldPasswordNotValidException()                      | APIErrorCodes.OLD_PASSWORD_INCORRECT              | HttpStatus.UNAUTHORIZED.value()         | 0
        new NewPasswordsDoNotMatchException()                   | APIErrorCodes.NEW_PASSWORDS_DO_NOT_MATCH          | HttpStatus.BAD_REQUEST.value() | 1
        new PasswordCannotMatchCurrentPassword()                | APIErrorCodes.NEW_PASSWORD_MATCHES_OLD_PASSWORD   | HttpStatus.BAD_REQUEST.value() | 1
        new PasswordDoesNotMeetMinimumLengthRequirement()       | APIErrorCodes.PASSWORD_COMPLEXITY_NOT_MET         | HttpStatus.BAD_REQUEST.value() | 1
        new PasswordDoesNotMeetMaximumLengthRequirement()       | APIErrorCodes.PASSWORD_COMPLEXITY_NOT_MET         | HttpStatus.BAD_REQUEST.value() | 1
        new PasswordDoesNotMeetCharacterClassCountRequirement() | APIErrorCodes.PASSWORD_COMPLEXITY_NOT_MET         | HttpStatus.BAD_REQUEST.value() | 1
    }

    void "userChangeOwnPassword() - juralioUserService.changePassword throws UserDoesNotExistException"() {
        UserPasswordChangeRequest mockUserPasswordChangeRequest

        setup:
        mockUserPasswordChangeRequest = Mock(UserPasswordChangeRequest)
        controller.userService = Mock(UserService)

        when: "the controller method is called"
        controller.userChangeOwnPassword(mockUserPasswordChangeRequest)

        then: "juralioUserService.changePassword is executed, and throws an exception"
        1 * controller.userService.changePassword(mockUserPasswordChangeRequest) >> {
            throw new UserDoesNotExistException()
        }

        then: "should respond HTTPStatus.FORBIDDEN"
        response.status == HttpStatus.FORBIDDEN.value()
    }
}
