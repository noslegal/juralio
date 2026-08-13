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

package com.juralio.auth.organisation

import com.juralio.auth.AppUser
import com.juralio.auth.UserRoleService
import com.juralio.auth.exception.UserHasNoOrganisationException
import com.juralio.auth.exception.UsersOrganisationDoesNotAcceptAuthenticationProviderException
import com.juralio.auth.exception.UsersOrganisationIsDisabledException
import com.juralio.organisation.Organisation
import grails.gorm.transactions.Transactional

@Transactional
class UserOrganisationAuthenticationService {
    UserRoleService userRoleService

    def authenticate(AppUser authenticatedUser, String provider = "none") {
        if (!authenticatedUser.organisationId) {
            boolean isSysadmin = userRoleService.hasSysadminRole(authenticatedUser)

            if (!isSysadmin) {
                throw new UserHasNoOrganisationException()
            }
        } else {
            Organisation organisation = Organisation.get(authenticatedUser.organisationId)
            if (!organisation.isEnabled()) {
                throw new UsersOrganisationIsDisabledException()
            }
            if (authenticatedUser.thirdPartyProvider == "microsoft" && !organisation.isMicrosoftSsoEnabled()) {
                throw new UsersOrganisationDoesNotAcceptAuthenticationProviderException()
            }
            if (authenticatedUser.thirdPartyProvider == "okta" && !organisation.isOktaSsoEnabled()) {
                throw new UsersOrganisationDoesNotAcceptAuthenticationProviderException()
            }
            if (authenticatedUser.thirdPartyProvider == "saml" && !organisation.isSamlSsoEnabled()) {
                throw new UsersOrganisationDoesNotAcceptAuthenticationProviderException()
            }
            if (authenticatedUser.thirdPartyProvider == "google" && !organisation.isGoogleSsoEnabled()) {
                throw new UsersOrganisationDoesNotAcceptAuthenticationProviderException()
            }
        }
    }
}
