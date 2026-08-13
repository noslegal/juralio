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
class MicrosoftController {
    static allowedMethods = [index: "GET"]
    ConfigService configService
    InstanceSettingsService instanceSettingsService


    def index() {
        InstanceSettings instanceSettings = instanceSettingsService.getInstanceSettings()
        if (!instanceSettings.microsoftSsoEnabled) {
            respond [:],status: HttpStatus.NOT_FOUND
            return
        }
        String client = configService.microsoftClientId
        String redirectUrl = URLEncoder.encode(configService.microsoftRedirectUrl, StandardCharsets.UTF_8 as String)
        redirect(url: "https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=" + client + "&response_type=code&redirect_uri=" + redirectUrl + "&response_mode=query&scope=openid%20email%20profile%20User.read")
    }
}
