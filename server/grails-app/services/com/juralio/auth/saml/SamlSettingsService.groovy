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

package com.juralio.auth.saml

import com.juralio.auth.SamlSettings
import com.juralio.common.ParameterValidatorService
import com.juralio.common.ValidatedParameterMap
import com.juralio.config.ConfigService
import com.juralio.instance.InstanceSettingsAuthorisationService
import com.juralio.instance.InstanceSettingsService
import com.onelogin.saml2.settings.Saml2Settings
import com.onelogin.saml2.settings.SettingsBuilder
import grails.gorm.transactions.Transactional
import grails.util.Environment
import org.grails.web.json.JSONObject

@Transactional
class SamlSettingsService {
    InstanceSettingsService instanceSettingsService
    ConfigService configService
    InstanceSettingsAuthorisationService instanceSettingsAuthorisationService

    SamlSettings getSamlSettings() {
        return SamlSettings.first()
    }

    private String generateMetaData(SamlSettings samlSettings) {
        def cert = samlSettings.identityProviderCertificate
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
            requestUrl = 'http://localhost:8080'
        }


        def idpEntityId = samlSettings.identityProviderEntityId
        def spEntityId = "${requestUrl}/saml/metadata"
        def spAttributeConsumeServiceEndpoint = "${requestUrl}/saml/redirect"

        Map<String, Object> samlData = new HashMap<>()
        samlData.put("onelogin.saml2.sp.entityid", spEntityId)
        samlData.put("onelogin.saml2.sp.assertion_consumer_service.url", spAttributeConsumeServiceEndpoint)
        samlData.put("onelogin.saml2.security.want_xml_validation", true)
        samlData.put("onelogin.saml2.security.wantAssertionsSigned", false)
        samlData.put("onelogin.saml2.security.wantMessagesSigned", false)
        samlData.put("onelogin.saml2.idp.x509cert", cert)
        samlData.put('onelogin.saml2.idp.entityid', idpEntityId)
        SettingsBuilder builder = new SettingsBuilder()
        Saml2Settings settings = builder.fromValues(samlData).build()
        String metadata = settings.getSPMetadata()
        return metadata
    }

    def updateSamlSettings(validatedParameters) {
        if(!instanceSettingsAuthorisationService.hasUpdateAccess()){
            throw new Exception()
        }
        SamlSettings samlSettings = SamlSettings.first()
        samlSettings.properties = validatedParameters
        samlSettings.serviceProviderMetaData = generateMetaData(samlSettings)
        samlSettings.save()
        if (samlSettings.identityProviderCertificate == null || samlSettings.identityProviderSsoUrl == null || samlSettings.identityProviderEntityId == null) {
            JSONObject json = new JSONObject()
            json.put('samlSsoEnabled', false)
            ValidatedParameterMap vp = ParameterValidatorService.validate(json as Map, [], ['samlSsoEnabled'])
            instanceSettingsService.updateInstanceSettings(vp)
        }

    }
}
