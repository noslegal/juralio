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

package com.juralio.util

import com.juralio.util.response.ResponseWriter
import org.springframework.mock.web.MockHttpServletResponse
import spock.lang.Specification

class ResponseWriterSpec extends Specification {

    ResponseWriter responseWriter

    void setup() {
        responseWriter = new ResponseWriter()
    }

    void "writeResponse() - when passed a null response body"() {
        when: "the function is called with a null response body"
        responseWriter.writeResponse(null, new MockHttpServletResponse())

        then:
        thrown(IllegalArgumentException)
    }

    void "writeResponse() - when passed a null response object"() {
        when: "then function is called with a null response object"
        responseWriter.writeResponse('some response', null)

        then:
        thrown(IllegalArgumentException)
    }

    void "writeResponse() - when passed valid parameters"() {
        MockHttpServletResponse mockHttpServletResponse = new MockHttpServletResponseWithLeftShift()
        final def RESPONSE_TEXT = 'some response text'

        when: "then function is called with a null response object"
        responseWriter.writeResponse(RESPONSE_TEXT, mockHttpServletResponse)

        then: "the content type of the response should be set to 'application/json'"
        mockHttpServletResponse.contentType == 'application/json;charset=UTF-8'

        and: "the character encoding of the response should be set to 'UTF-8'"
        mockHttpServletResponse.characterEncoding == 'UTF-8'

        and: "the response should have a header of 'Cache-Control' with value 'no-store'"
        mockHttpServletResponse.getHeader('Cache-Control') == 'no-store'

        and: "the response should have a header of 'Pragma' with value 'no-cache'"
        mockHttpServletResponse.getHeader('Pragma') == 'no-cache'

        and: 'the expected response text should have been written'
        mockHttpServletResponse.responseText == RESPONSE_TEXT
    }

    class MockHttpServletResponseWithLeftShift extends MockHttpServletResponse {

        String responseText

        def leftShift(responseText) {
            this.responseText = responseText
        }
    }
}