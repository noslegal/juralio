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


import groovy.json.JsonOutput
import groovy.transform.CompileStatic

import static org.springframework.http.HttpStatus.OK

@CompileStatic
class ExperimentalController {
    static allowedMethods = [index: 'GET']

    ExperimentalService experimentalService

    def index() {
        String referer = request.getHeader('referer')
        if (referer == null) {
            respond JsonOutput.toJson([:]), [status: OK]
            return
        }

        def url = new URL(referer)
        def referrer = url.protocol + '://' + url.authority + '/'
        def options = experimentalService.getExperimental(referrer)
        if (options != null) {
            respond options, [status: OK]
        } else {
            respond JsonOutput.toJson([:]), [status: OK]
        }
    }
}
