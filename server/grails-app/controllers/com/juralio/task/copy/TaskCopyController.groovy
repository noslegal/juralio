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

package com.juralio.task.copy

import com.juralio.auth.AppUser
import com.juralio.auth.UserRoleService
import com.juralio.common.APIErrorCodes
import com.juralio.common.error.ErrorResponseHelperService
import com.juralio.organisation.OrganisationAuthorisationService
import com.juralio.task.Task
import com.juralio.task.exception.InvalidDestinationParent
import com.juralio.task.exception.MaximumTasksExceededException
import grails.plugin.springsecurity.SpringSecurityService
import grails.plugin.springsecurity.annotation.Secured
import org.springframework.http.HttpStatus
import org.springframework.security.access.AccessDeniedException

import static org.springframework.http.HttpStatus.BAD_REQUEST

@Secured(['IS_AUTHENTICATED_FULLY'])
class TaskCopyController {

    static allowedMethods = [copy: "POST"]

    TaskCopyService taskCopyService

    ErrorResponseHelperService errorResponseHelperService
    SpringSecurityService springSecurityService
    UserRoleService userRoleService
    OrganisationAuthorisationService organisationAuthorisationService

    def copy() throws MaximumTasksExceededException {
        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
        boolean isSysadmin = userRoleService.hasSysadminRole(currentUser)
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(currentUser.organisation.id)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }
        try {
            Task copiedTask = taskCopyService.copy(params.project_id as long, params.id as long, request.JSON.name)
            if (copiedTask != null) {
                respond copiedTask, [status: HttpStatus.CREATED]
            } else {
                respondWithError(APIErrorCodes.TASK_DESTINATION_INVALID)
            }
        } catch (MaximumTasksExceededException maximumTaskExceededException) {
            respond(message: maximumTaskExceededException.getMessage(), status: BAD_REQUEST, error_type: 'TASK_LIMIT')
        } catch (IllegalArgumentException | AccessDeniedException e) {
            render status: BAD_REQUEST
        } catch (InvalidDestinationParent e) {
            respond([text: e.message], status: BAD_REQUEST)
            return
        }
    }

    private def respondWithError(APIErrorCodes errorCode) {
        def errorResponse = errorResponseHelperService.getErrorResponseForDomainClass(Task, errorCode.code())
        println errorResponse
        respond errorResponse, [status: BAD_REQUEST]
    }
}
