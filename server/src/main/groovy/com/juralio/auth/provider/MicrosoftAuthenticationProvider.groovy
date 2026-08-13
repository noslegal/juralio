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
import com.juralio.auth.exception.BadSSOCredentialsException
import com.juralio.auth.exception.RoleUnknownException
import com.juralio.auth.exception.SSOUserDoesNotExistException
import com.juralio.auth.token.UserAuthenticationToken
import com.juralio.common.APIErrorCodes
import com.juralio.organisation.Organisation
import com.juralio.organisation.OrganisationService
import com.juralio.organisation.dao.OrganisationDAOService
import grails.gorm.transactions.Transactional
import org.grails.web.json.JSONObject
import org.springframework.security.authentication.AuthenticationProvider
import org.springframework.security.authentication.CredentialsExpiredException
import org.springframework.security.core.Authentication
import org.springframework.security.core.AuthenticationException
import org.springframework.security.core.GrantedAuthority
import org.springframework.security.core.userdetails.UserDetails


@Transactional
class MicrosoftAuthenticationProvider implements AuthenticationProvider {
    def daoAuthenticationProvider, configService, userService, userDetailsService, userOrganisationAuthenticationService, organisationDAOService, userSessionEventService, thirdPartyUserService, instanceSettingsService

    @Override
    Authentication authenticate(Authentication authentication) throws AuthenticationException {
        if (authentication.principal != "microsoft") {
            return null
        }

        if(!instanceSettingsService.getInstanceSettings().microsoftSsoEnabled){
            return null
        }
        String access_code = authentication.credentials

        JSONObject json
        JSONObject userGraph

        try {
            json = thirdPartyUserService.getAuthToken(access_code, false)
            if (json.has('error_codes') && json.get('error_codes').size() > 0) {
                throw new Exception()
            }
        } catch (Exception ignored) {
            throw new BadSSOCredentialsException()
        }

        try {
            userGraph = thirdPartyUserService.getUserGraph(json.get('access_token') as String)
        } catch (Exception e) {
            return null
        }

        String username = userGraph.get('userPrincipalName')
        String firstname = userGraph.get('givenName')
        String lastname = userGraph.get('surname')
        AppUser foundUser = userService.findByUsername(username, [:])
        if (!foundUser) {
            foundUser = userService.findByUsername(username, [lock: true])
        }

        if (!foundUser || !foundUser.isIsThirdPartyUser() || foundUser.thirdPartyProvider != "microsoft") {
            throw new SSOUserDoesNotExistException()
            return null
        }
        if (foundUser.thirdPartyUserId == null) {
            try {
                def userId = json.get('graph').get('id')
                foundUser.setThirdPartyUserId(userId)
            } catch (Exception ignored) {
            }
            foundUser.setFirstname(firstname)
            foundUser.setLastname(lastname)
            foundUser.save(flush: true)
        }
        Organisation userOrg = organisationDAOService.getOrganisation(foundUser.organisationId)
        if (!userOrg.microsoftSsoEnabled) {
            return null
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

    }

    @Override
    boolean supports(Class<?> aClass) {

        return aClass.isAssignableFrom(UserAuthenticationToken.class)
    }
    
}