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

package com.juralio.microservices

import com.juralio.auth.AppUser
import com.juralio.config.ConfigService
import grails.plugin.springsecurity.SpringSecurityService
import grails.plugin.springsecurity.annotation.Secured
import org.springframework.http.HttpStatus

class FaviconController {
    static allowedMethods = [index: "GET"]
    ConfigService configService
    SpringSecurityService springSecurityService

    private static Boolean sanitiseFallbackUrl(String fallback_svg) {
        List<String> validFallbacks = [
                'web_link.svg'
                , 'document_link.svg'
                , 'google_doc_link.svg'
                , 'google_sheet_link.svg'
                , 'google_drive_link.svg'
                , 'miro_link.svg'
                , 'visio-icon.svg'
                , 'onedrive-icon.svg'
                , 'onenote-icon.svg']

        return validFallbacks.indexOf(fallback_svg) != -1
    }


    def index() {
        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
        if (!currentUser) {
            respond [:], status: HttpStatus.BAD_REQUEST
        }

        String faviconUrl = configService.getProperty('faviconService')
        String domain = configService.getProperty('domain')
        String sanitised_url = params.getProperty('url')
        String fallback_svg = params.getProperty('fallback')
        String url = "${faviconUrl}/icon?url=${sanitised_url}&size=0..64..200&fallback_icon_url=${domain}/${fallback_svg}"
        if (!sanitiseFallbackUrl(params.getProperty('fallback') as String)) {
            url = "${faviconUrl}/icon?url=${sanitised_url}&size=0..64..200"
        }
        redirect(url: url)
    }
}
