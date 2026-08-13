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

import com.juralio.auth.exception.PasswordCannotMatchCurrentPassword
import com.juralio.auth.exception.PasswordDoesNotMeetCharacterClassCountRequirement
import com.juralio.auth.exception.PasswordDoesNotMeetMaximumLengthRequirement
import com.juralio.auth.exception.PasswordDoesNotMeetMinimumLengthRequirement
import grails.testing.services.ServiceUnitTest
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import spock.lang.Specification

class PasswordValidatorServiceSpec extends Specification implements ServiceUnitTest<PasswordValidatorService> {

    void "validate - requirements not met"() {
        setup:
        service.bCryptPasswordEncoder = Mock(BCryptPasswordEncoder)

        when: "Calling the validate method on the service"
        service.validate('{bcrypt}current_password_hash', newPassword)

        then: 'isPasswordValid should be called on the passwordEncoder'
        1 * service.bCryptPasswordEncoder.matches(newPassword, 'current_password_hash') >> isPasswordValidResponse

        then: "An exception should be thrown"
        thrown expectedException

        where:
        newPassword                       | expectedException                                 | isPasswordValidResponse
        null                              | PasswordDoesNotMeetMinimumLengthRequirement       | false
        ""                                | PasswordDoesNotMeetMinimumLengthRequirement       | false
        "Pass1"                           | PasswordDoesNotMeetMinimumLengthRequirement       | false
        "0123456789abcdef_".multiply(8)   | PasswordDoesNotMeetMaximumLengthRequirement       | false
        "passwordpassword"                | PasswordDoesNotMeetCharacterClassCountRequirement | false
        "PASSWORDPASSWORD"                | PasswordDoesNotMeetCharacterClassCountRequirement | false
        "!£%^&*()!£%^&*()"                | PasswordDoesNotMeetCharacterClassCountRequirement | false
        "0123456701234567"                | PasswordDoesNotMeetCharacterClassCountRequirement | false
        "!£%^&*()012345"                  | PasswordCannotMatchCurrentPassword                | true
    }
}
