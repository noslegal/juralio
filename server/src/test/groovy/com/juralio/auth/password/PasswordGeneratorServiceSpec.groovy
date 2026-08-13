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

import grails.testing.services.ServiceUnitTest
import org.apache.commons.lang3.StringUtils
import spock.lang.Specification

class PasswordGeneratorServiceSpec extends Specification implements ServiceUnitTest<PasswordGeneratorService> {

    def "generatePassword"() {
        expect: "Generated password to have at least 1 upper case character"
        hasAtLeast1UpperCaseLetter(temporaryPassword.password)

        and: "Generated password to have at least 1 lower case character"
        hasAtLeast1LowerCaseLetter(temporaryPassword.password)

        and: "Generated password to have at least 1 digit"
        hasAtLeast1Digit(temporaryPassword.password)

        and: "Generated password to have at least 1 special character"
        hasAtLeast1SpecialCharacter(temporaryPassword.password)

        and: "Generated password to have expected length"
        temporaryPassword.password.length() == PasswordGeneratorService.PASSWORD_LENGTH

        where:
        temporaryPassword << [service.generatePassword(), service.generatePassword(), service.generatePassword(),
                              service.generatePassword(), service.generatePassword(), service.generatePassword(),
                              service.generatePassword(), service.generatePassword(), service.generatePassword(),
                              service.generatePassword()]
    }

    def hasAtLeast1UpperCaseLetter(String password) {
        return password.matches(".*[A-Z].*")
    }

    def hasAtLeast1LowerCaseLetter(String password) {
        return password.matches(".*[a-z].*")
    }

    def hasAtLeast1Digit(String password) {
        return password.matches(".*[0-9].*")
    }

    def hasAtLeast1SpecialCharacter(String password) {
        return StringUtils.indexOfAny(password, "!#\$%&()*+,-.:;<=>?[]^_{|}~") > -1
    }
}
