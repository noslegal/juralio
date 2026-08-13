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

package com.juralio.auth.oauth

import com.juralio.auth.SamlSettings
import com.juralio.auth.saml.SamlSettingsService
import com.juralio.common.ParameterValidatorService
import com.juralio.common.ValidatedParameterMap
import com.juralio.config.ConfigService
import com.juralio.instance.InstanceSettings
import com.juralio.instance.InstanceSettingsService
import grails.plugin.springsecurity.annotation.Secured
import grails.util.Environment
import groovy.transform.CompileStatic
import org.springframework.http.HttpStatus

import java.nio.charset.StandardCharsets

import static org.springframework.http.HttpStatus.OK

@CompileStatic
class SamlController {
    static allowedMethods = [send: "GET", receive: 'POST', update: 'PATCH', get: 'GET']
    SamlSettingsService samlSettingsService
    ConfigService configService
    InstanceSettingsService instanceSettingsService

    def send() {
        InstanceSettings instanceSettings = instanceSettingsService.getInstanceSettings()
        if (!instanceSettings.samlSsoEnabled) {
            respond [:],status: HttpStatus.NOT_FOUND
            return
        }
        SamlSettings samlSettings = samlSettingsService.getSamlSettings()
        redirect(url: samlSettings.identityProviderSsoUrl)
    }

    def receive() {
        InstanceSettings instanceSettings = instanceSettingsService.getInstanceSettings()
        if (!instanceSettings.samlSsoEnabled) {
            respond [:],status: HttpStatus.NOT_FOUND
            return
        }
        String domain = configService.domain
        String requestUrl = domain
        if (domain) {
            if (requestUrl.charAt(requestUrl.length() - 1) == '/') {
                requestUrl = requestUrl.substring(0, requestUrl.length() - 1)
            }
            if (!requestUrl.startsWith('https://')) {
                requestUrl = 'https://' + requestUrl
            }
        }
        if (Environment.isDevelopmentMode()) {
            redirect(url: "http://localhost:3000/frontend/?saml_access_token=${URLEncoder.encode(params.get('SAMLResponse') as String, StandardCharsets.UTF_8.name())}")

        } else {
            redirect(url: "${requestUrl.toString()}/#/login?saml_access_token=${URLEncoder.encode(params.get('SAMLResponse') as String, StandardCharsets.UTF_8.name())}")
        }
    }


    @Secured("hasRole('ROLE_SYSADMIN')")
    def update() {
        ValidatedParameterMap validatedParameters = ParameterValidatorService.validate(request.JSON as Map, [], ['identityProviderEntityId', 'identityProviderSsoUrl', 'identityProviderCertificate', 'serviceProviderMetaData'])
        try {
            samlSettingsService.updateSamlSettings(validatedParameters)
            respond [:], status: HttpStatus.OK
        } catch (Exception e) {
            respond [:], HttpStatus.BAD_REQUEST
        }

    }

    @Secured("hasRole('ROLE_SYSADMIN') or hasRole('ROLE_ORG_ADMIN')")
    def get() {
        respond samlSettingsService.getSamlSettings(), [status: OK]
    }
}

