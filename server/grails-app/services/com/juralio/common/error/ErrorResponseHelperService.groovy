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

package com.juralio.common.error

import grails.gorm.transactions.Transactional
import org.springframework.validation.AbstractBindingResult
import org.springframework.validation.Errors
import org.springframework.validation.ObjectError

@Transactional
class ErrorResponseHelperService {

    def getErrorResponseForDomainClass(Class domainClass, String message) {
        Errors errors = new CustomErrors(domainClass.toString())
        ObjectError error = new ObjectError(domainClass.toString(), message)

        errors.addError(error)
        return errors
    }
}

class CustomErrors extends AbstractBindingResult {

    CustomErrors(String objectName) {
        super(objectName)
    }

    @Override
    Object getTarget() {
        return null
    }

    @Override
    protected Object getActualFieldValue(String field) {
        return null
    }
}
