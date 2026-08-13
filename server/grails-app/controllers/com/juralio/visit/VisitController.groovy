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

package com.juralio.visit

import com.juralio.auth.AppUser
import com.juralio.auth.UserService
import grails.plugin.springsecurity.SpringSecurityService
import grails.plugin.springsecurity.annotation.Secured
import groovy.transform.CompileStatic
import org.springframework.http.HttpStatus

@Secured(['IS_AUTHENTICATED_ANONYMOUSLY'])
@CompileStatic
class VisitController {
    static allowedMethods = [visit: "POST", getVisit: 'GET']
    SpringSecurityService springSecurityService
    VisitService visitService
    UserService userService

    def visit() {
        String urlPartial = request.JSON['urlPartial']
        if (!['/', '/logout', '/home'].contains(urlPartial)) {
            AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
            visitService.visit(currentUser, urlPartial)
        }
        respond [:], status: HttpStatus.OK //make this an ok
    }

    def getVisit(long userId) {
        AppUser currentUser = userService.getUserById(userId)
        Visit v = visitService.getVisit(currentUser)
        if (v != null) {
            respond v, [status: HttpStatus.OK, view: '/visit/_visit']
        } else {
            respond [:], status: HttpStatus.OK
        }
    }
}
