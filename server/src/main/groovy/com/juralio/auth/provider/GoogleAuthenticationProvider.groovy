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

import com.juralio.auth.AppUser;
import com.juralio.auth.exception.BadSSOCredentialsException;
import com.juralio.auth.exception.SSOUserDoesNotExistException;
import com.juralio.auth.token.UserAuthenticationToken;
import com.juralio.organisation.Organisation
import grails.gorm.transactions.Transactional;
import org.grails.web.json.JSONObject;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.GrantedAuthority;
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken
import com.google.api.client.googleapis.auth.oauth2.GoogleIdToken.Payload
import com.google.api.client.googleapis.auth.oauth2.GoogleIdTokenVerifier
import com.google.api.client.http.javanet.NetHttpTransport
import com.google.api.client.json.gson.GsonFactory

@Transactional
class GoogleAuthenticationProvider implements AuthenticationProvider {
    def daoAuthenticationProvider, configService, userService, userDetailsService, userOrganisationAuthenticationService, organisationDAOService, userSessionEventService, thirdPartyUserService,instanceSettingsService

    @Override
    public Authentication authenticate(Authentication authentication) throws AuthenticationException {
        if (authentication.principal != "google" || !authentication.credentials) {
            return null
        }
        if (!instanceSettingsService.getInstanceSettings().googleSsoEnabled) {
            return null
        }

        GoogleIdTokenVerifier verifier = new GoogleIdTokenVerifier.Builder(new NetHttpTransport(), new GsonFactory())
                .setAudience(Collections.singletonList(configService.googleClientId))
                .build()

        GoogleIdToken idToken = verifier.verify(authentication.credentials.toString())

        if (idToken != null) {
            Payload payload = idToken.getPayload()

            String userId = payload.getSubject()
            String username = payload.getEmail()
            String firstname = (String) payload.get("given_name")
            String lastname = (String) payload.get("family_name")

            AppUser foundUser = userService.findByUsername(username, [:])
            if (!foundUser) {
                foundUser = userService.findByUsername(username, [lock: true])
            }

            if (!foundUser || !foundUser.isIsThirdPartyUser() || foundUser.thirdPartyProvider != "google") {
                throw new SSOUserDoesNotExistException()
                return null
            }

            Organisation userOrg = organisationDAOService.getOrganisation(foundUser.organisationId)
            if (!userOrg.googleSsoEnabled) {
                return null
            }

            if (foundUser.thirdPartyUserId == null) {
                try {
                    foundUser.setThirdPartyUserId(userId)
                } catch (Exception ignored) {
                }
                foundUser.setFirstname(firstname)
                foundUser.setLastname(lastname)
                foundUser.save(flush: true)
            }

            userOrganisationAuthenticationService.authenticate(foundUser, authentication.principal)
            Authentication validAuth = new UserAuthenticationToken(username, "thirdPartyUser", new ArrayList<GrantedAuthority>())
            try {
                def authenticationResult = daoAuthenticationProvider.authenticate(validAuth)
                userSessionEventService.recordLoginSuccess(foundUser.id, authentication.details.remoteAddress)

                return authenticationResult
            } catch (Exception ignored) {
                return null
            }
        } else {
            return null
        }
    }

    @Override
    public boolean supports(Class<?> authentication) {
        return authentication.isAssignableFrom(UserAuthenticationToken.class);
    }
}
