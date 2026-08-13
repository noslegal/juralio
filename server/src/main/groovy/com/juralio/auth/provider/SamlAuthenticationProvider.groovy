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
import com.juralio.auth.SamlSettings

import com.juralio.auth.token.UserAuthenticationToken
import com.juralio.organisation.Organisation
import com.onelogin.saml2.authn.SamlResponse
import com.onelogin.saml2.settings.Saml2Settings
import com.onelogin.saml2.settings.SettingsBuilder
import grails.util.Environment
import org.springframework.security.authentication.AuthenticationProvider
import org.springframework.security.authentication.BadCredentialsException
import org.springframework.security.core.Authentication
import org.springframework.security.core.AuthenticationException
import org.springframework.security.core.GrantedAuthority
import java.nio.charset.StandardCharsets


class SamlAuthenticationProvider implements AuthenticationProvider {
    def  daoAuthenticationProvider, configService, userDetailsService, userService, userOrganisationAuthenticationService, organisationDAOService, userSessionEventService,  samlSettingsService,instanceSettingsService



    @Override
    Authentication authenticate(Authentication authentication) throws AuthenticationException {
        String domain = configService.domain

        if (authentication.principal != "saml") {
            return null
        }

        if (!instanceSettingsService.getInstanceSettings().samlSsoEnabled) {
            return null
        }

        SamlSettings samlSettings = samlSettingsService.getSamlSettings()
        def cert = samlSettings.identityProviderCertificate

        String requestUrl = domain
        if(domain) {
            if (requestUrl.charAt(requestUrl.length() - 1) == '/') {
                requestUrl = requestUrl.substring(0, requestUrl.length() - 1)
            }
            if (!requestUrl.startsWith('https://')) {
                requestUrl = 'https://' + requestUrl
            }
        }

        if(Environment.isDevelopmentMode()){
            requestUrl = 'http://localhost:8080'
        }

        def idpEntityId = samlSettings.identityProviderEntityId
        def spEntityId ="${requestUrl}/saml/metadata".toString()
        def spAttributeConsumeServiceEndpoint = "${requestUrl}/saml/redirect".toString()
        def targetUrl = "${requestUrl}/saml/redirect".toString()
        String samlResponse = java.net.URLDecoder.decode(authentication.credentials as String, StandardCharsets.UTF_8.name())

        Map<String, Object> samlData = new HashMap<>()
        samlData.put("onelogin.saml2.sp.entityid",spEntityId);
        samlData.put("onelogin.saml2.sp.assertion_consumer_service.url",spAttributeConsumeServiceEndpoint);
        samlData.put("onelogin.saml2.security.want_xml_validation",true);
        samlData.put("onelogin.saml2.security.wantAssertionsSigned",false);
        samlData.put("onelogin.saml2.security.wantMessagesSigned",false);
        samlData.put("onelogin.saml2.idp.x509cert", cert);
        samlData.put('onelogin.saml2.idp.entityid',idpEntityId)

        SettingsBuilder builder = new SettingsBuilder();
        Saml2Settings settings = builder.fromValues(samlData).build();
        try {
            SamlResponse parsedResponse = new SamlResponse(settings, targetUrl, samlResponse.replaceAll(' ', '+'))
            Boolean isValid = parsedResponse.isValid()
            if (isValid) {
                def email = parsedResponse.getNameId()
                AppUser foundUser = userService.findByUsername(email, [:])

                if (!foundUser || !foundUser.isIsThirdPartyUser() || foundUser.thirdPartyProvider != "saml") {
                    return null
                }
                Organisation userOrg = organisationDAOService.getOrganisation(foundUser.organisationId)
                if (!userOrg.samlSsoEnabled) {
                    return null
                }
                userOrganisationAuthenticationService.authenticate(foundUser, authentication.principal)

                Authentication validAuth = new UserAuthenticationToken(email, "thirdPartyUser", new ArrayList<GrantedAuthority>())
                try {
                    def authenticationResult = daoAuthenticationProvider.authenticate(validAuth)
                    return authenticationResult
                } catch (Exception ignored) {
                    return null
                }
            } else {
                return null
            }
        }catch(Exception e){
            throw new BadCredentialsException(e.getMessage())
        }



    }

    @Override
    boolean supports(Class<?> aClass) {
        return aClass.isAssignableFrom(UserAuthenticationToken.class)
    }
}