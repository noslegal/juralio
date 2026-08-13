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
import com.juralio.task.exception.TaskAlreadyHasUserAsFollowerException
import com.juralio.task.exception.TaskUserCannotBeBothFollowerAndTeamMemberException
import com.juralio.task.follower.TaskFollower
import grails.plugin.springsecurity.SpringSecurityService
import grails.plugin.springsecurity.annotation.Secured
import groovy.transform.CompileStatic
import org.apache.commons.logging.Log
import org.apache.commons.logging.LogFactory
import org.springframework.http.HttpStatus
import org.springframework.security.access.AccessDeniedException

@Secured(['IS_AUTHENTICATED_FULLY'])
@CompileStatic
class TaskFollowerController {
    static allowedMethods = [save: "POST"]

    protected final Log logger = LogFactory.getLog(getClass())

    TaskFollowerService taskFollowerService
    SpringSecurityService springSecurityService
    UserRoleService userRoleService
    OrganisationAuthorisationService organisationAuthorisationService

    def save(long taskId) {
        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
        boolean isSysadmin = userRoleService.hasSysadminRole(currentUser)
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(currentUser.organisation.id)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }
        try {
            TaskFollower result = taskFollowerService.addFollower(taskId, springSecurityService.getCurrentUser() as AppUser, params.project_id as long)
            respond result, [status: HttpStatus.OK]
        } catch (TaskAlreadyHasUserAsFollowerException exception) {
            logger.debug(exception)
            respond exception, [status: HttpStatus.BAD_REQUEST]
        } catch (TaskUserCannotBeBothFollowerAndTeamMemberException exception) {
            logger.debug(exception)
            respond exception, [status: HttpStatus.BAD_REQUEST]
        } catch (AccessDeniedException e) {
            respond status: HttpStatus.BAD_REQUEST
        }
    }
}