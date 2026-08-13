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

package com.juralio.common

import grails.testing.services.ServiceUnitTest
import spock.lang.Specification

class ParameterValidatorServiceSpec extends Specification implements ServiceUnitTest<ParameterValidatorService>{

    void "test failure cases"() {
        when: "ParameterValidatorService.validate is called, and throws an exception"
        ParameterValidatorService.validate(rawParams, requiredParams, optionalParams)

        then:
        thrown(exceptionToThrow)

        where:
        exceptionToThrow                  | rawParams | requiredParams | optionalParams
        NoValidParametersException        | [:]       | []             | []
        NoValidParametersException        | [:]       | []             | ['a', 'b']
        NoValidParametersException        | [c:'c']   | []             | ['a', 'b']
        MissingRequiredParameterException | [:]       | ['a', 'b']     | []
        MissingRequiredParameterException | [a:'a']   | ['a', 'b']     | []
        MissingRequiredParameterException | [c:'c']   | ['a', 'b']     | []
    }

    void "test success cases"() {
        ValidatedParameterMap result

        when: "ParameterValidatorService.validate is called, and does not throw an exception"
        result = ParameterValidatorService.validate(rawParams, requiredParams, optionalParams)

        then:
        result == resultParams

        where:
        rawParams           | requiredParams | optionalParams | resultParams
        [a:'a']             | ['a']          | []             | [a:'a']
        [a:'a']             | []             | ['a']          | [a:'a']
        [a:null]            | ['a']          | []             | [a:null]
        [a:null]            | []             | ['a']          | [a:null]
        [a:'']              | ['a']          | []             | [a:'']
        [a:'']              | []             | ['a']          | [a:'']
        [a:'a']             | []             | ['a', 'b']     | [a:'a']
        [a:null]            | []             | ['a', 'b']     | [a:null]
        [a:'a',b:'b',c:'c'] | ['a','b']      | ['c']          | [a:'a',b:'b',c:'c']
        [a:'a',b:'b',c:'c'] | ['a']          | ['b','c']      | [a:'a',b:'b',c:'c']
        [a:'a',b:'b',c:'c'] | ['a']          | ['b']          | [a:'a',b:'b']
    }
}
