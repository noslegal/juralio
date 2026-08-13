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

import org.passay.CharacterData
import org.passay.CharacterRule
import org.passay.EnglishCharacterData
import org.passay.PasswordGenerator

class PasswordGeneratorService {

    public static final int PASSWORD_LENGTH = 15

    TemporaryPassword generatePassword() {
        PasswordGenerator gen = new PasswordGenerator()
        CharacterRule lowerCaseRule = new CharacterRule(EnglishCharacterData.LowerCase, 1)
        CharacterRule upperCaseRule = new CharacterRule(EnglishCharacterData.UpperCase, 1)
        CharacterRule digitRule = new CharacterRule(EnglishCharacterData.Digit, 1)
        CharacterRule splCharRule = new CharacterRule(new SpecialCharacterRule(), 1)

        String password = gen.generatePassword(PASSWORD_LENGTH, splCharRule, lowerCaseRule,
                upperCaseRule, digitRule)
        return new TemporaryPassword(password)
    }

    class SpecialCharacterRule implements CharacterData {
        @Override
        String getErrorCode() {
            return "ERR_SPACE"
        }

        @Override
        String getCharacters() {
            return "!#\$%&()*+,-.:;<=>?[]^_{|}~"
        }
    }
}
