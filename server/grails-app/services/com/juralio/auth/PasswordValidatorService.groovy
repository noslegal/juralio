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
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder

class PasswordValidatorService {

    private final int MINIMUM_PASSWORD_LENGTH = 15
    private final int MAXIMUM_PASSWORD_LENGTH = 128
    private final int MINIMUM_CHARACTER_CLASS_COUNT = 4
    private final String NUMBER_REGEX = ".*[0-9].*"
    private final String LOWERCASE_LETTER_REGEX = ".*[a-z].*"
    private final String UPPERCASE_LETTER_REGEX = ".*[A-Z].*"
    private final String SYMBOL_REGEX = ".*[^a-zA-Z0-9].*"

    BCryptPasswordEncoder bCryptPasswordEncoder = new BCryptPasswordEncoder()

    boolean validate(String currentPasswordHash, String password) {
        if (isNewPasswordSameAsCurrentPassword(currentPasswordHash, password)) {
            throw new PasswordCannotMatchCurrentPassword()
        }

        if (!doesPasswordMeetMinimumLength(password)) {
            throw new PasswordDoesNotMeetMinimumLengthRequirement()
        }

        if (!doesPasswordMeetMaximumLength(password)) {
            throw new PasswordDoesNotMeetMaximumLengthRequirement()
        }

        if (!doesPasswordMeetMinimumCharacterClassCount(password)) {
            throw new PasswordDoesNotMeetCharacterClassCountRequirement()
        }

        return true
    }

    private doesPasswordMeetMinimumLength(String password) {
        if (!password) {
            return false
        }

        return password.length() >= MINIMUM_PASSWORD_LENGTH
    }

    private doesPasswordMeetMaximumLength(String password) {
        return password.length() <= MAXIMUM_PASSWORD_LENGTH
    }

    private doesPasswordMeetMinimumCharacterClassCount(String password) {
        int characterClassCount = 0
        String[] characterClasses = [NUMBER_REGEX, LOWERCASE_LETTER_REGEX, UPPERCASE_LETTER_REGEX, SYMBOL_REGEX]

        for (String characterClass : characterClasses) {
            if (password.matches(characterClass)) {
                ++characterClassCount
            }
        }

        return characterClassCount >= MINIMUM_CHARACTER_CLASS_COUNT
    }

    boolean isNewPasswordSameAsCurrentPassword(String currentPasswordHash, String newPassword) {
        String cleanHash = currentPasswordHash.substring(8)
        return bCryptPasswordEncoder.matches(newPassword, cleanHash)
    }
}