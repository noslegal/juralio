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

package com.juralio.post

import com.juralio.instance.InstanceSettings
import com.juralio.instance.InstanceSettingsService
import grails.testing.services.ServiceUnitTest
import spock.lang.Specification
import spock.lang.Unroll

class PostHelperServiceSpec extends Specification implements ServiceUnitTest<PostHelperService> {

    void setup() {
        service.instanceSettingsService = Mock(InstanceSettingsService) {
            getInstanceSettings() >> new InstanceSettings(enableUrlValidation: true)
        }
    }

    @Unroll
    void "isValidPostLinkURL"() {
        expect:
        service.isValidPostLinkURL(url) == expectedResult

        where:
        url                                                                                                      | expectedResult
        'test'                                                                                                   | false
        'www.google.com'                                                                                         | true
        '5656://yo.com'                                                                                          | false
        'ftp://yo.com'                                                                                           | false
        'http:/juralio.com'                                                                                      | false
        'http:juralio.com'                                                                                       | true
        'juralio.com'                                                                                            | true
        'test://juralio.com'                                                                                     | false
        'http://juralio.com'                                                                                     | true
        'https://juralio'                                                                                        | false
        'https://juralio.com'                                                                                    | true
        'iwl://juralio.com'                                                                                      | false
        'iwl:dms=test&lib=Active&num=1111&ver=1&latest=1'                                                        | false
        'https://www.bailii.org/cgi-bin/format.cgi?doc=/ie/cases/IECA/2018/CA26.html&query=(title:(+donoghue+))' | true
        null                                                                                                     | true
        ''                                                                                                       | true
    }
}