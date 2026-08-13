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

import com.juralio.auth.*
import com.juralio.auth.failure.UserAuthenticationFailureHandler
import com.juralio.auth.listener.BadCredentialsEventListener
import com.juralio.auth.listener.OnSuccessAuthEventListener
import com.juralio.auth.mfa.GoogleAuthService
import com.juralio.auth.oauth.ThirdPartyJWTFilter
import com.juralio.auth.provider.MicrosoftAuthenticationProvider
import com.juralio.auth.provider.OktaAuthenticationProvider
import com.juralio.auth.provider.SamlAuthenticationProvider
import com.juralio.auth.provider.UserAuthenticationProvider
import com.juralio.auth.provider.GoogleAuthenticationProvider
import com.juralio.search.ProjectContentSearchFilter
import com.juralio.util.response.JSONResponseWriter
import com.juralio.util.response.ResponseWriter
import com.warrenstrange.googleauth.GoogleAuthenticator
import groovy.sql.Sql

// Place your Spring DSL code here
beans = {
    userPasswordEncoderListener(UserPasswordEncoderListener)

    groovySql(Sql, ref('dataSource'))

    userDetailsService(AppUserDetailsService) {
        userService = ref('userService')
        grailsApplication = ref('grailsApplication')
    }


    thirdPartyJWTFilter(ThirdPartyJWTFilter) {
        configService = ref('configService')
    }

    googleAuthenticator(GoogleAuthenticator)

    googleAuthService(GoogleAuthService)

    auditRequestResolver(CustomAuditRequestResolver) {
        springSecurityService = ref('springSecurityService')
    }

    sessionEventRecordingLogoutHandler(SessionEventRecordingLogoutHandler) {
        userSessionEventService = ref('userSessionEventService')
        userAuthTokenService = ref('userAuthTokenService')
    }

    userAuthenticationProvider(UserAuthenticationProvider) {
        userDetailsService = ref('userDetailsService')
        userService = ref('userService')
        daoAuthenticationProvider = ref('daoAuthenticationProvider')
        mfaAuthenticationService = ref('mfaAuthenticationService')
        userOrganisationAuthenticationService = ref('userOrganisationAuthenticationService')
        userSessionEventService = ref('userSessionEventService')
        organisationDAOService = ref('organisationDAOService')
        organisationAdminMessageService = ref('organisationAdminMessageService')
    }

    microsoftAuthenticationProvider(MicrosoftAuthenticationProvider) {
        daoAuthenticationProvider = ref('daoAuthenticationProvider')
        configService = ref('configService')
        userDetailsService = ref('userDetailsService')
        userService = ref('userService')
        userOrganisationAuthenticationService = ref('userOrganisationAuthenticationService')
        organisationDAOService = ref('organisationDAOService')
        userSessionEventService = ref('userSessionEventService')
        thirdPartyUserService = ref('thirdPartyUserService')
        instanceSettingsService = ref('instanceSettingsService')
    }

    samlAuthenticationProvider(SamlAuthenticationProvider) {
        daoAuthenticationProvider = ref('daoAuthenticationProvider')
        configService = ref('configService')
        userDetailsService = ref('userDetailsService')
        userService = ref('userService')
        userOrganisationAuthenticationService = ref('userOrganisationAuthenticationService')
        organisationDAOService = ref('organisationDAOService')
        userSessionEventService = ref('userSessionEventService')
        samlSettingsService = ref('samlSettingsService')
        instanceSettingsService = ref('instanceSettingsService')

    }

    oktaAuthenticationProvider(OktaAuthenticationProvider) {
        daoAuthenticationProvider = ref('daoAuthenticationProvider')
        configService = ref('configService')
        userDetailsService = ref('userDetailsService')
        userService = ref('userService')
        userOrganisationAuthenticationService = ref('userOrganisationAuthenticationService')
        organisationDAOService = ref('organisationDAOService')
        userSessionEventService = ref('userSessionEventService')
        instanceSettingsService = ref('instanceSettingsService')

    }

    googleAuthenticationProvider(GoogleAuthenticationProvider) {
        daoAuthenticationProvider = ref('daoAuthenticationProvider')
        configService = ref('configService')
        userDetailsService = ref('userDetailsService')
        userService = ref('userService')
        userOrganisationAuthenticationService = ref('userOrganisationAuthenticationService')
        organisationDAOService = ref('organisationDAOService')
        userSessionEventService = ref('userSessionEventService')
        thirdPartyUserService = ref('thirdPartyUserService')
        instanceSettingsService = ref('instanceSettingsService')
    }

    projectContentSearchFilter(ProjectContentSearchFilter) {
        springSecurityService = ref('springSecurityService')
        errorResponseHelperService = ref('errorResponseHelperService')
        dateUtilService = ref('dateUtilService')
    }

    responseWriter(ResponseWriter)

    jsonResponseWriter(JSONResponseWriter) {
        responseWriter = ref('responseWriter')
    }

    restAuthenticationFailureHandler(UserAuthenticationFailureHandler) {
        jsonResponseWriter = ref('jsonResponseWriter')
        mfaExceptionHandlerService = ref('mfaExceptionHandlerService')
        configService = ref('configService')
    }

    badCredentialsEventListener(BadCredentialsEventListener) {
        userService = ref('userService')
    }

    onSuccessAuthEventListener(OnSuccessAuthEventListener) {
        userService = ref('userService')
    }

    credentialsExtractor(UserJsonPayloadCredentialsExtractor)
}
