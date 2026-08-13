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

package com.juralio.config

import grails.config.Config
import grails.core.support.GrailsConfigurationAware
import groovy.transform.CompileStatic

@CompileStatic
class ConfigService implements GrailsConfigurationAware {

    int lockDurationMinutes
    int maxLoginAttempts
    int tokenExpiryMinutes
    boolean rateLimitEnabled
    int rateLimitRequestsPerWindow
    int rateLimitWindowSeconds
    String rateLimitAlertEmail
    int rateLimitAlertCooldownSeconds
    String microsoftClientId
    String microsoftTenantId
    String microsoftRedirectUrl
    String microsoftSecret

    String googleClientId

    String oktaClientId
    String oktaRedirectUrl
    String oktaAuthUrl
    String oktaAPIKey
    String oktaOptionalUsernameAppendage

    String faviconService
    String magicLinkPassphrase

    String domain

    String errorReportingUrl
    String errorReportingApiKeySecretName
    String errorReportingAlertEmail

    String unsplashKey

    // Shared secret guarding the machine-to-machine template import endpoint.
    // Left null when unconfigured; the endpoint refuses all requests in that case.
    String templateImportAccessKey

    Long fullSeats
    Long limitedSeats

    @Override
    void setConfiguration(Config config) {
        lockDurationMinutes = config.getProperty('juralio.lockDurationMinutes', Integer, 5)
        maxLoginAttempts = config.getProperty('juralio.maxLoginAttempts', Integer, 5)
        tokenExpiryMinutes = config.getProperty('juralio.tokenExpiryMinutes', Integer, 15)
        rateLimitEnabled = config.getProperty('rateLimit.enabled', Boolean, true)
        rateLimitRequestsPerWindow = config.getProperty('rateLimit.requestsPerWindow', Integer, 200)
        rateLimitWindowSeconds = config.getProperty('rateLimit.windowSeconds', Integer, 60)
        rateLimitAlertEmail = config.getProperty('rateLimit.alertEmail', String, 'developers@example.com')
        rateLimitAlertCooldownSeconds = config.getProperty('rateLimit.alertCooldownSeconds', Integer, 300)
        // All of the following are optional environment-driven values. When the
        // backing env var is unset, Grails leaves the raw config value as the literal
        // placeholder text (e.g. "${DOMAIN}") rather than null — so every value read
        // here is funnelled through resolvedOrNull() to turn "unset" into a real null.
        // Skipping this makes any `if (configService.x)` check pass on an unconfigured
        // instance; for a secret used as a crypto key that is a security hole, not just
        // a nuisance.
        microsoftClientId = resolvedOrNull(config.getProperty('oauth.microsoft.clientId', String))
        microsoftTenantId = resolvedOrNull(config.getProperty('oauth.microsoft.tenantId', String))
        microsoftRedirectUrl = resolvedOrNull(config.getProperty('oauth.microsoft.redirectUrl', String))
        microsoftSecret = resolvedOrNull(config.getProperty('oauth.microsoft.clientSecret', String))

        googleClientId = resolvedOrNull(config.getProperty('oauth.google.clientId',String))

        oktaClientId = resolvedOrNull(config.getProperty('oauth.okta.clientId', String))
        oktaRedirectUrl = resolvedOrNull(config.getProperty('oauth.okta.redirectUrl', String))
        oktaAuthUrl = resolvedOrNull(config.getProperty('oauth.okta.oktaAuthUrl', String))
        oktaAPIKey = resolvedOrNull(config.getProperty('oauth.okta.oktaAPIKey', String))
        oktaOptionalUsernameAppendage = resolvedOrNull(config.getProperty('oauth.okta.oktaOptionalUsernameAppendage', String))

        faviconService = resolvedOrNull(config.getProperty('faviconService', String))
        domain = resolvedOrNull(config.getProperty('domain', String))
        magicLinkPassphrase = resolvedOrNull(config.getProperty('juralio.magicLinkPassphrase', String))

        // Unhandled-error reporting is opt-in: with no url configured the server
        // makes no outbound call. See docs/ENVIRONMENT-VARIABLES.md.
        errorReportingUrl = resolvedOrNull(config.getProperty('errorReporting.url', String))
        errorReportingApiKeySecretName = resolvedOrNull(config.getProperty('errorReporting.apiKeySecretName', String))
        errorReportingAlertEmail = resolvedOrNull(config.getProperty('errorReporting.alertEmail', String))

        unsplashKey = resolvedOrNull(config.getProperty('unsplash.key',String))

        templateImportAccessKey = resolvedOrNull(config.getProperty('template.importAccessKey', String))

        fullSeats = config.getProperty('seats.full',Long)
        limitedSeats = config.getProperty('seats.limited',Long)
    }

    /**
     * When an environment variable behind a `${VAR}` placeholder in application.yml is not
     * set, Grails leaves the config value as the literal text `${VAR}` rather than null.
     * For a secret that is disastrous: the placeholder itself becomes a shared secret that
     * anyone who has read application.yml can guess. Treat unresolved placeholders, and
     * blanks, as "not configured" so callers can fail closed.
     */
    private static String resolvedOrNull(String value) {
        if (!value) {
            return null
        }
        String trimmed = value.trim()
        if (trimmed.startsWith('${') && trimmed.endsWith('}')) {
            return null
        }
        trimmed ?: null
    }
}
