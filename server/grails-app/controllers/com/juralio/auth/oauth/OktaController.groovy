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

import com.juralio.config.ConfigService
import com.juralio.instance.InstanceSettings
import com.juralio.instance.InstanceSettingsService
import groovy.transform.CompileStatic
import org.springframework.http.HttpStatus

import java.nio.charset.StandardCharsets

@CompileStatic
class OktaController {
    static allowedMethods = [index: "GET"]
    ConfigService configService
    InstanceSettingsService instanceSettingsService

    def index() {
        InstanceSettings instanceSettings = instanceSettingsService.getInstanceSettings()
        if (!instanceSettings.oktaSsoEnabled) {
            respond [:],status: HttpStatus.NOT_FOUND
            return
        }
        String oktaAuthUrl = configService.oktaAuthUrl
        String client = configService.oktaClientId
        String redirectUrl = URLEncoder.encode(configService.oktaRedirectUrl, StandardCharsets.UTF_8 as String)
        String scopes = URLEncoder.encode("openid profile email")
        String state = UUID.randomUUID().toString()

        redirect(url: "${oktaAuthUrl}oauth2/v1/authorize?client_id=$client&response_type=token&scope=$scopes&redirect_uri=$redirectUrl&state=$state&nonce=foo")
    }
}
