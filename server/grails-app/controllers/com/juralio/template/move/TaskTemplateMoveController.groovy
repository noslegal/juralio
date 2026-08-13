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

package com.juralio.template.copy

import com.juralio.auth.AppUser
import com.juralio.auth.UserRoleService
import com.juralio.common.APIErrorCodes
import com.juralio.common.ParameterValidatorService
import com.juralio.common.error.ErrorResponseHelperService
import com.juralio.organisation.OrganisationAuthorisationService
import com.juralio.task.TaskMoveType
import com.juralio.template.TaskTemplate
import com.juralio.template.task.TaskTemplateMoveService
import grails.plugin.springsecurity.SpringSecurityService
import grails.plugin.springsecurity.annotation.Secured
import org.springframework.http.HttpStatus
import org.springframework.security.access.AccessDeniedException

import static org.springframework.http.HttpStatus.BAD_REQUEST
import static org.springframework.http.HttpStatus.OK

@Secured(['ROLE_USER'])
class TaskTemplateMoveController {
    static allowedMethods = [move: "POST"]

    TaskTemplateMoveService taskTemplateMoveService
    ErrorResponseHelperService errorResponseHelperService
    SpringSecurityService springSecurityService
    UserRoleService userRoleService
    OrganisationAuthorisationService organisationAuthorisationService

    def move() {
        AppUser appUser = springSecurityService.getCurrentUser()
        boolean isSysadmin = userRoleService.hasSysadminRole(appUser)
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(appUser.organisation.id)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }
        def validatedBody = ParameterValidatorService.validate(request.JSON, ['destinationParentType', 'destinationParentId'], [])
        if (request.JSON.get('destinationParentId') as Long == params.taskId as long) {
            render status: HttpStatus.FORBIDDEN, text: 'Cannot move task to child of itself'
            return
        }
        try {
            def movedTask = taskTemplateMoveService.moveTask(params.taskId as long,
                    validatedBody.destinationParentType as TaskMoveType,
                    validatedBody.destinationParentId as long,
                    params.templateId as long)

            if (movedTask) {
                respond movedTask, [status: OK]
                return
            }

            respondWithError(APIErrorCodes.TASK_DESTINATION_INVALID)
        } catch (AccessDeniedException exception) {
            render status: HttpStatus.FORBIDDEN, text: exception.message
        } catch (Exception exception) {
            def error = exception.message ? exception.message : exception.undeclaredThrowable.message
            render status: HttpStatus.BAD_REQUEST, message: error
        }

    }

    private def respondWithError(APIErrorCodes errorCode) {
        def errorResponse = errorResponseHelperService.getErrorResponseForDomainClass(TaskTemplate, errorCode.code())
        respond errorResponse, [status: BAD_REQUEST]
    }
}
