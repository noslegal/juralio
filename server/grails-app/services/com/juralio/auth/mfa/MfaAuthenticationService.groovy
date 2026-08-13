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
import com.juralio.auth.exception.MfaRegistrationRequiredAuthenticationException
import com.juralio.auth.token.UserAuthenticationToken
import grails.gorm.transactions.Transactional

@Transactional
class MfaAuthenticationService {
    def mfaRegistrationService
    def mfaService
    def organisationDAOService

    boolean isMFARequired(AppUser user) {
        boolean mfaAtUserLevel = user.mfaEnabled
        boolean mfaAtOrgLevel = user.organisationId ? organisationDAOService.getOrganisation(user.organisationId).mfaEnabled : user.mfaEnabled

        return mfaAtUserLevel && mfaAtOrgLevel
    }

    def authenticate(AppUser authenticatedUser, UserAuthenticationToken authenticationToken) {
        if (!isMFARequired(authenticatedUser)) {
            return
        }

        if (!authenticatedUser.mfaRegistered) {
            if (authenticatedUser.mfaKey && authenticationToken.isMfaTokenPresent) {
                log.debug("attempt to validate and complete registration ${authenticationToken.mfaToken}")
                mfaRegistrationService.completeRegistration(authenticatedUser, authenticationToken.mfaToken)
            } else {
                log.debug("unregistered Mfa for user ${authenticatedUser.username}")
                throw new MfaRegistrationRequiredAuthenticationException(authenticatedUser)
            }
        } else {
            log.debug("user ${authenticatedUser.username} is already registered for Mfa - attempting to verify")
            mfaService.verify(authenticatedUser.mfaKey, authenticationToken.mfaToken)
        }
    }
}
