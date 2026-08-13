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

package com.juralio.auth.mfa.registration

import com.juralio.auth.AppUser
import com.juralio.auth.mfa.MfaService
import com.juralio.mfa.GetMfaSeedResponse
import grails.gorm.transactions.Transactional
import org.springframework.security.core.userdetails.UserDetailsService

@Transactional
class MfaRegistrationService {
    MfaService mfaService
    UserDetailsService userDetailsService

    private AppUser getUser(username) {
        //We need to reload the user within this session as the calling code operates outwith the normal
        //hibernate session. Not doing this would mean any updates made here to be lost.
        log.debug("Reloading user ${username}")
        return userDetailsService.userService.findByUsername(username, [:])
    }

    GetMfaSeedResponse beginRegistration(AppUser user) {

        def mfaSeedResponse = mfaService.getMfaSeed(user)

        def reloadedUser = getUser(user.username)
        log.debug("Assosciating Mfa key ${mfaSeedResponse.key} with user ${user.username}")

        reloadedUser.mfaKey = mfaSeedResponse.key

        return mfaSeedResponse
    }

    String completeRegistration(AppUser user, Integer mfaToken) {
        def reloadedUser = getUser(user.username)

        mfaService.verify(reloadedUser.mfaKey, mfaToken)

        log.debug("Verification of Mfa token during registration was successful for ${user.username}")
        log.debug("${user.username} is now fully registered for Mfa")
        reloadedUser.mfaRegistered = true
    }
}