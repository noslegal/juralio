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

package com.juralio.task.followers

import com.juralio.auth.AppUser
import com.juralio.auth.UserRoleService
import com.juralio.organisation.OrganisationAuthorisationService
import grails.plugin.springsecurity.SpringSecurityService
import grails.plugin.springsecurity.annotation.Secured
import groovy.transform.CompileStatic
import org.springframework.http.HttpStatus
import org.springframework.security.access.AccessDeniedException

@Secured(['IS_AUTHENTICATED_FULLY'])
@CompileStatic
class DeleteTaskFollowerController {
    static allowedMethods = [delete: "DELETE"]

    TaskFollowerService taskFollowerService
    SpringSecurityService springSecurityService
    UserRoleService userRoleService
    OrganisationAuthorisationService organisationAuthorisationService

    def delete(long taskId, long userId) {
        AppUser user = springSecurityService.getCurrentUser() as AppUser
        boolean isSysadmin = userRoleService.hasSysadminRole(user)
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(user.organisation.id)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }
        if (user.getId() != userId) {
            render status: HttpStatus.FORBIDDEN
        }

        try {
            taskFollowerService.removeFollower(taskId, user, params.project_id as long)

            respond([:], status: HttpStatus.NO_CONTENT)
        } catch (AccessDeniedException e) {
            render status: HttpStatus.BAD_REQUEST
        }
    }
}