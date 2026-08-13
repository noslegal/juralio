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

package com.juralio.emailwhitelist

import com.juralio.common.ParameterValidatorService
import grails.plugin.springsecurity.annotation.Secured
import grails.validation.ValidationException
import com.juralio.emailwhitelist.EmailWhitelistService
import org.springframework.http.HttpStatus
import static org.springframework.http.HttpStatus.NOT_FOUND
import static org.springframework.http.HttpStatus.NO_CONTENT
import static org.springframework.http.HttpStatus.OK
import grails.gorm.transactions.Transactional

class EmailWhitelistController {

    EmailWhitelistService emailWhitelistService

    static responseFormats = ['json']
    static allowedMethods = [index: "GET", show: "GET", save: "POST", delete: "DELETE"]

    def index() {
        respond emailWhitelistService.list(params), model:[emailWhitelistCount: emailWhitelistService.count()]
    }

    def show(Long id) {
        respond emailWhitelistService.get(id)
    }

    @Transactional
    @Secured("hasRole('ROLE_SYSADMIN')")
    def save() {
        try {
            request.JSON.getAt('emails')
        } catch(MissingPropertyException) {
            respond [:], status: HttpStatus.BAD_REQUEST
            return
        }

        List<String> newEmails = request.JSON.getAt('emails')
        List<EmailWhitelist> savedEmails = []
            newEmails.each {
                try {
                    EmailWhitelist item = new EmailWhitelist(whitelisted_email: it)
                    emailWhitelistService.save(item)
                    savedEmails.add(item)
                } catch (ValidationException e) {
                    respond [:], status: HttpStatus.BAD_REQUEST
                    return
                }
            }
        respond savedEmails, [status: OK, view:"show"]
    }

    @Transactional
    @Secured("hasRole('ROLE_SYSADMIN')")
    def delete(Long id) {
        if (id == null || emailWhitelistService.delete(id) == null) {
            render status: NOT_FOUND
            return
        }

        render status: NO_CONTENT
    }
}
