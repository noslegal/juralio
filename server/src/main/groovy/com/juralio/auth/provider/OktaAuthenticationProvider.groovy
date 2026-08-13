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

package com.juralio.auth.provider

import com.juralio.auth.AppUser
import com.juralio.auth.JWT
import com.juralio.auth.token.UserAuthenticationToken
import com.juralio.common.APIErrorCodes
import com.juralio.organisation.Organisation
import com.okta.jwt.AccessTokenVerifier
import com.okta.jwt.Jwt
import com.okta.jwt.JwtVerifiers
import org.grails.web.json.JSONObject
import org.springframework.security.authentication.AuthenticationProvider
import org.springframework.security.core.Authentication
import org.springframework.security.core.AuthenticationException
import org.springframework.security.core.GrantedAuthority

import java.time.Duration

class OktaAuthenticationProvider implements AuthenticationProvider {
    def daoAuthenticationProvider, configService, userService, userDetailsService, userOrganisationAuthenticationService, organisationDAOService, userSessionEventService, instanceSettingsService

    private static String decode(String encodedString) {
        return new String(Base64.getUrlDecoder().decode(encodedString));
    }

    @Override
    Authentication authenticate(Authentication authentication) throws AuthenticationException {
        if (authentication.principal != "okta") {
            return null
        }
        if (!instanceSettingsService.getInstanceSettings().oktaSsoEnabled) {
            return null
        }
        String access_code = authentication.credentials

        String[] parts = access_code.split('\\.')

        JSONObject payload = new JSONObject(decode(parts[1]));

        String email = payload.get('sub')
        AppUser foundUser = userService.findByUsername(email, [:])
        if (!foundUser) {
            email = "${email}${configService.oktaOptionalUsernameAppendage}"
            foundUser = userService.findByUsername(email, [lock: true])
        }

        if (!foundUser || !foundUser.isIsThirdPartyUser() || foundUser.thirdPartyProvider != "okta") {
            return null
        }
        Organisation userOrg = organisationDAOService.getOrganisation(foundUser.organisationId)
        if (!userOrg.oktaSsoEnabled) {
            return null
        }
        userOrganisationAuthenticationService.authenticate(foundUser, authentication.principal)
        Authentication validAuth = new UserAuthenticationToken(email, "thirdPartyUser", new ArrayList<GrantedAuthority>())
        try {
            def authenticationResult = daoAuthenticationProvider.authenticate(validAuth)
            userSessionEventService.recordLoginSuccess(foundUser.id, authentication.details.remoteAddress)

            return authenticationResult
        } catch (Exception ignored) {
            return null
        }
    }

    @Override
    boolean supports(Class<?> aClass) {

        return aClass.isAssignableFrom(UserAuthenticationToken.class)
    }
}