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
import com.juralio.auth.exception.MfaTokenInvalidException
import com.juralio.auth.exception.MfaTokenRequiredException
import com.juralio.mfa.GetMfaSeedResponse
import grails.gorm.transactions.Transactional

@Transactional
class MfaService {
    def googleAuthService

    GetMfaSeedResponse getMfaSeed(AppUser user) {
        log.debug("Generating mfaToken and qrUrl")
        googleAuthService.generateMfaSeedResponse(user)
    }

    def verify(String mfaKey, Integer mfaToken) {
        if (!mfaToken) {
            log.debug("mfaToken has not been given")
            throw new MfaTokenRequiredException()
        }

        log.debug("Attempting to verify mfaKey with mfaToken")

        boolean isCodeValid = googleAuthService.verifyToken(mfaKey, mfaToken)
        if (!isCodeValid) {
            log.debug('mfaToken failed verification')
            throw new MfaTokenInvalidException()
        }
        log.debug('mfaToken successful verification')
    }

}
