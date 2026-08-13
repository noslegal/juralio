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

package com.juralio.experimental

import grails.gorm.transactions.Transactional

@Transactional
class ExperimentalService {

    def configService

    Boolean isExperimental(String referer) {
        ExperimentalServer server = ExperimentalServer.findByUrl(referer)
        if (server != null) {
            return true
        } else {
            return false
        }
    }


    def getExperimental(String referer) {
        boolean isExperimental = isExperimental(referer)
        if (isExperimental) {
            long id = 2
            String domain = configService.getProperty('domain')
            if (domain && normaliseUrl(referer) == normaliseUrl(domain)) {
                id = 1
            }
            ExperimentalOptions options = ExperimentalOptions.findById(id)
            return options
        }
        return null
    }

    private static String normaliseUrl(String url) {
        url?.replaceAll('/+$', '')
    }
}
