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

package com.juralio.auth.exception

class UserPasswordChangeException extends RuntimeException {
    UserPasswordChangeException(message) {
        super(message)
    }
}

class UserLockedException extends UserPasswordChangeException {
    UserLockedException() {
        super("User is currently locked.")
    }
}

class OldPasswordNotValidException extends UserPasswordChangeException {

    OldPasswordNotValidException() {
        super("The old password is not correct.")
    }
}

class NewPasswordsDoNotMatchException extends UserPasswordChangeException {
    NewPasswordsDoNotMatchException() {
        super("The new passwords do not match.")
    }
}

class PasswordsDoNotMeetComplexityRulesException extends UserPasswordChangeException {
    PasswordsDoNotMeetComplexityRulesException(message) {
        super(message)
    }
}

class PasswordDoesNotMeetMinimumLengthRequirement extends PasswordsDoNotMeetComplexityRulesException {
    PasswordDoesNotMeetMinimumLengthRequirement() {
        super("Password does not meet the mimimum length requirement")
    }
}

class PasswordDoesNotMeetMaximumLengthRequirement extends PasswordsDoNotMeetComplexityRulesException {
    PasswordDoesNotMeetMaximumLengthRequirement() {
        super("Password does not meet the maximum length requirement")
    }
}

class PasswordDoesNotMeetCharacterClassCountRequirement extends PasswordsDoNotMeetComplexityRulesException {
    PasswordDoesNotMeetCharacterClassCountRequirement() {
        super("Password does not meet the minimum character class count requirement")
    }
}

class PasswordCannotMatchCurrentPassword extends PasswordsDoNotMeetComplexityRulesException {
    PasswordCannotMatchCurrentPassword() {
        super("Password cannot match the currently in use password")
    }
}

class CannotResetPasswordMoreThanOnceInMinute extends UserPasswordChangeException {
    CannotResetPasswordMoreThanOnceInMinute() {
        super("Password cannot be reset more than once in a minute")
    }
}
