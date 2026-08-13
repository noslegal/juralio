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

package com.juralio.task.team

import com.juralio.auth.AppUser
import com.juralio.auth.UserRoleService
import com.juralio.organisation.OrganisationAuthorisationService
import grails.plugin.springsecurity.SpringSecurityService
import grails.plugin.springsecurity.annotation.Secured
import org.apache.commons.logging.Log
import org.apache.commons.logging.LogFactory
import org.springframework.http.HttpStatus

@Secured(['IS_AUTHENTICATED_FULLY'])
class DeleteTaskTeamMemberController {
    static allowedMethods = [delete: "DELETE", deleteTree: "DELETE"]

    protected final Log logger = LogFactory.getLog(getClass())

    TaskTeamMemberService taskTeamMemberService
    SpringSecurityService springSecurityService
    UserRoleService userRoleService
    OrganisationAuthorisationService organisationAuthorisationService

    def delete(long taskId, long userId) {
        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
        boolean isSysadmin = userRoleService.hasSysadminRole(currentUser)
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(currentUser.organisation.id)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }
        if (taskTeamMemberService.deleteTeamMember(taskId, userId, params.project_id as long)) {
            render(status: HttpStatus.NO_CONTENT)
        } else {
            render(status: HttpStatus.NOT_FOUND)
        }
    }

    def deleteTree(long taskId,long userId){
        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
        boolean isSysadmin = userRoleService.hasSysadminRole(currentUser)
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(currentUser.organisation.id)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }
        if(request.JSON.user.isPlaceholder){
            if (taskTeamMemberService.deleteTeamMemberAndAllSubtasksPlaceholder(taskId, userId, params.project_id as long)) {
                render(status: HttpStatus.NO_CONTENT)
            } else {
                render(status: HttpStatus.NOT_FOUND)
            }
        }else {
            if (taskTeamMemberService.deleteTeamMemberAndAllSubtasks(taskId, userId, params.project_id as long)) {
                render(status: HttpStatus.NO_CONTENT)
            } else {
                render(status: HttpStatus.NOT_FOUND)
            }
        }

    }
}
