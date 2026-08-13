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

// Added by the Spring Security Core plugin:
grails.plugin.springsecurity.userLookup.userDomainClassName = 'com.juralio.auth.AppUser'
grails.plugin.springsecurity.userLookup.authorityJoinClassName = 'com.juralio.auth.UserRole'
grails.plugin.springsecurity.authority.className = 'com.juralio.auth.Role'
grails.plugin.springsecurity.controllerAnnotations.staticRules = [
        [pattern: '/', access: ['permitAll']],
        [pattern: '/error', access: ['permitAll']],
        [pattern: '/index', access: ['permitAll']],
        [pattern: '/shutdown', access: ['permitAll']],
        [pattern: '/assets/**', access: ['permitAll']],
        [pattern: '/**/js/**', access: ['permitAll']],
        [pattern: '/**/css/**', access: ['permitAll']],
        [pattern: '/**/images/**', access: ['permitAll']],
        [pattern: '/**/favicon.ico', access: ['permitAll']]
]

grails.plugin.springsecurity.filterChain.chainMap = [
        //Stateless chain
        [
                pattern: '/api/settings/user/password',
                filters: 'JOINED_FILTERS,-exceptionTranslationFilter,-authenticationProcessingFilter,-securityContextPersistenceFilter,-rememberMeAuthenticationFilter'
        ],
        // Grails 7 / Spring Security 6: restAuthenticationFilter is no longer part of
        // JOINED_FILTERS automatically, so the login URL must be wired explicitly.
        [
                pattern: '/api/login',
                filters: 'restAuthenticationFilter'
        ],
        [
                pattern: '/api/logout',
                filters: 'securityRequestHolderFilter,restAuthenticationFilter,securityContextHolderAwareRequestFilter,restTokenValidationFilter,logoutFilter'
        ],
        [
                pattern: '/api/**',
                filters: 'JOINED_FILTERS,-anonymousAuthenticationFilter,-exceptionTranslationFilter,-authenticationProcessingFilter,-securityContextPersistenceFilter,-rememberMeAuthenticationFilter'
        ],
]

grails.plugin.springsecurity.providerNames = ['userAuthenticationProvider', 'microsoftAuthenticationProvider', 'oktaAuthenticationProvider', 'samlAuthenticationProvider', 'googleAuthenticationProvider']
grails.plugin.springsecurity.useSecurityEventListener = true

grails.plugin.springsecurity.logout.filterProcessesUrl = '/api/logout'
grails.plugin.springsecurity.logout.handlerNames = ['sessionEventRecordingLogoutHandler', 'rememberMeServices', 'securityContextLogoutHandler']
grails.plugin.springsecurity.logout.postOnly = true
grails.plugin.springsecurity.logout.afterLogoutUrl = '/'

grails.plugin.springsecurity.rest.token.storage.gorm.tokenDomainClassName = 'com.juralio.auth.UserAuthToken'
grails.plugin.springsecurity.rest.token.storage.gorm.tokenValuePropertyName = 'tokenValue'
grails.plugin.springsecurity.rest.token.storage.gorm.usernamePropertyName = 'username'

// Added by the Audit-Logging plugin:
grails.plugin.auditLog.auditDomainClassName = 'com.juralio.AuditTrail'
grails.plugin.auditLog.excluded = ['version']

