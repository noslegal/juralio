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
import com.juralio.task.exception.TaskUserCannotBeBothFollowerAndTeamMemberException
import grails.plugin.springsecurity.SpringSecurityService
import grails.plugin.springsecurity.annotation.Secured
import org.apache.commons.logging.Log
import org.apache.commons.logging.LogFactory
import org.springframework.http.HttpStatus
import org.springframework.security.access.AccessDeniedException

@Secured(['IS_AUTHENTICATED_FULLY'])
class TaskTeamMemberController {
    static allowedMethods = [save: "POST"]

    protected final Log logger = LogFactory.getLog(getClass())

    TaskTeamMemberService taskTeamMemberService
    SpringSecurityService springSecurityService
    UserRoleService userRoleService
    OrganisationAuthorisationService organisationAuthorisationService

    def save() {
        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
        boolean isSysadmin = userRoleService.hasSysadminRole(currentUser)
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(currentUser.organisation.id)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }
        def addedTeamMember

        if(request.JSON.user==null){
            render status: HttpStatus.BAD_REQUEST
        }
        try {
            if (request.JSON.includeTree) {
                if (request.JSON.user?.isPlaceholder==true) {
                    def placeholder = taskTeamMemberService.addToTaskAndAllSubtasksPlaceholder(params.taskId as long, request.JSON.user.id as long, params.project_id as long)
                    addedTeamMember = new AppUser(firstname: placeholder.placeholder.firstName, lastname: placeholder.placeholder.lastName, enabled: placeholder.placeholder.enabled)
                    addedTeamMember.username = placeholder.placeholder.emailAddress != null ? placeholder.placeholder.emailAddress : ''
                    addedTeamMember.id = placeholder.placeholder.id
                    addedTeamMember.isPlaceholder = true
                } else {
                    addedTeamMember = taskTeamMemberService.addToTaskAndAllSubtasks(params.taskId as long, request.JSON.user.id as long, params.project_id as long)
                }

                if (addedTeamMember) {
                    respond addedTeamMember, [status: HttpStatus.OK]
                } else {
                    render status: HttpStatus.OK
                }
            } else {
                if (request.JSON.user?.isPlaceholder==true) {
                    def placeholder = taskTeamMemberService.addPlaceholderTeamMember(params.taskId as long, request.JSON.user.id as long, params.project_id as long)
                    addedTeamMember = new AppUser(firstname: placeholder.placeholder.firstName, lastname: placeholder.placeholder.lastName, enabled: placeholder.placeholder.enabled)
                    addedTeamMember.username = placeholder.placeholder.emailAddress != null ? placeholder.placeholder.emailAddress : ''
                    addedTeamMember.id = placeholder.placeholder.id
                    addedTeamMember.isPlaceholder = true
                } else {
                    addedTeamMember = taskTeamMemberService.addTeamMember(params.taskId as long, request.JSON.user.id as long, params.project_id as long)
                }
                if (addedTeamMember) {
                    respond addedTeamMember, [status: HttpStatus.OK]
                } else {
                    render status: HttpStatus.OK
                }
            }
        } catch (TaskUserCannotBeBothFollowerAndTeamMemberException exception) {
            logger.debug(exception)
            respond exception, [status: HttpStatus.BAD_REQUEST]
        } catch (AccessDeniedException e) {
            render status: HttpStatus.BAD_REQUEST
        }
    }
}