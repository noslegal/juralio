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
import com.juralio.common.error.ErrorResponseHelperService
import com.juralio.organisation.OrganisationAuthorisationService
import com.juralio.template.TaskTemplate
import com.juralio.template.exception.MaximumTemplateTasksExceededException
import com.juralio.template.task.TaskTemplateCopyService
import grails.plugin.springsecurity.SpringSecurityService
import grails.plugin.springsecurity.annotation.Secured
import org.springframework.http.HttpStatus
import org.springframework.security.access.AccessDeniedException

import static org.springframework.http.HttpStatus.BAD_REQUEST

@Secured(['ROLE_USER'])
class TaskTemplateCopyController {
    static allowedMethods = [copy: "POST"]

    TaskTemplateCopyService taskTemplateCopyService
    ErrorResponseHelperService errorResponseHelperService
    SpringSecurityService springSecurityService
    UserRoleService userRoleService
    OrganisationAuthorisationService organisationAuthorisationService

    def copy() {
        AppUser appUser = springSecurityService.getCurrentUser()
        boolean isSysadmin = userRoleService.hasSysadminRole(appUser)
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(appUser.organisation.id)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }
        try {
            Long templateId = params.getLong("templateId")
            Long taskId = params.getLong("taskId")
            Long targetId = request.JSON.targetTemplateId
            String templateTaskName = request.JSON.name
            String copyType = request.JSON.copyType

            TaskTemplate copiedTask

            if (targetId != null) {
                copiedTask = taskTemplateCopyService.copyTaskTemplateTree(templateId, taskId, targetId, templateTaskName,copyType)
            } else {
                copiedTask = taskTemplateCopyService.copyTaskTemplateTree(templateId, taskId, templateTaskName)
            }
            if (copiedTask != null) {
                respond copiedTask, [status: HttpStatus.CREATED, view: '/taskTemplate/_taskTemplate']
            } else {
                respondWithError(APIErrorCodes.TASK_DESTINATION_INVALID)
            }
        } catch (AccessDeniedException e) {
            render status: HttpStatus.FORBIDDEN
        } catch (MaximumTemplateTasksExceededException maximumTemplateTasksExceededException) {
            respond(message: maximumTemplateTasksExceededException.getMessage(), status: BAD_REQUEST, error_type: 'TASK_LIMIT')
        }
    }

    private def respondWithError(APIErrorCodes errorCode) {
        def errorResponse = errorResponseHelperService.getErrorResponseForDomainClass(TaskTemplate, errorCode.code())
        println errorResponse
        respond errorResponse, [status: BAD_REQUEST]
    }
}
