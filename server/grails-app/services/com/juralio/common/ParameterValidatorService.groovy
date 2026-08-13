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

import groovy.transform.CompileStatic

class ValidatedParameterMap extends java.util.LinkedHashMap {
}

class RequestParameterValidationFailedException extends Exception {
    @Override
    public synchronized Throwable fillInStackTrace() {
        return this;
    }
    RequestParameterValidationFailedException(String errorMessage) {
        super(errorMessage)
    }
}

class MissingRequiredParameterException extends RequestParameterValidationFailedException {
    MissingRequiredParameterException(String parameterName) {
        super("Parameter \"${parameterName}\" is required.")
    }
}

class NoValidParametersException extends RequestParameterValidationFailedException {
    NoValidParametersException() {
        super("Request did not specify any valid parameters.")
    }
}

@CompileStatic
class ParameterValidatorService {
    static ValidatedParameterMap validate(Map rawParams, List<String> requiredParameters, List<String> optionalParameters) {
        ValidatedParameterMap result = new ValidatedParameterMap()
        int validParameterCount = 0

        for (String requiredParam : requiredParameters) {
            if (!rawParams.containsKey(requiredParam)) {
                throw new MissingRequiredParameterException(requiredParam)
            } else {
                result[requiredParam] = rawParams[requiredParam]
                ++validParameterCount
            }
        }
        for (String optionalParam : optionalParameters) {
            if (rawParams.containsKey(optionalParam)) {
                result[optionalParam] = rawParams[optionalParam]
                ++validParameterCount
            }
        }
        if (validParameterCount == 0) {
            throw new NoValidParametersException()
        }
        return result
    }
}


