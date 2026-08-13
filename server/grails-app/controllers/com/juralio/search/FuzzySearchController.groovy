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

package com.juralio.search

import com.juralio.aws.SESService
import com.juralio.config.ConfigService
import org.springframework.beans.factory.annotation.Autowired
import grails.plugin.springsecurity.annotation.Secured
import org.springframework.http.HttpStatus

@Secured(['IS_AUTHENTICATED_FULLY'])
class FuzzySearchController {
    static allowedMethods = [performSearch: "GET"]
    FuzzySearchService fuzzySearchService
    @Autowired
    SESService sesService
    ConfigService configService

    @Secured("!hasRole('ROLE_SYSADMIN')")
    def performSearch() {
        String searchTerm = params.searchTerm as String
        Boolean mattersOnly = params.mattersOnly as Boolean
        List<Long> results = []
        try {
            results = fuzzySearchService.search(searchTerm, mattersOnly)
        } catch (Exception ignored) {
            String domain = configService.getProperty('domain')
            if (domain == '${DOMAIN}') {
                return
            }
            String subject = "Fuzzy Search Controller Exception hit"
            String body =  ignored.toString()
            sesService.sendEmail("developers@example.com", subject, body)
        }
        respond results, status: HttpStatus.OK
    }
}
