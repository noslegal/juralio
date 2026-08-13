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

package com.juralio.template

import com.juralio.auth.AppUser
import com.juralio.auth.UserRoleService
import com.juralio.common.ParameterValidatorService
import com.juralio.common.ValidatedParameterMap
import com.juralio.organisation.OrganisationAuthorisationService
import com.juralio.template.exception.MaximumNumberOfLevelATasksExceededException
import com.juralio.template.exception.MaximumNumberOfSubTasksExceededException
import com.juralio.template.exception.MaximumTemplateTasksExceededException
import com.juralio.template.exception.TaskTemplateMaximumLevelsExceededException
import grails.plugin.springsecurity.SpringSecurityService
import grails.plugin.springsecurity.annotation.Secured
import org.springframework.http.HttpStatus
import org.springframework.security.access.AccessDeniedException

import static org.springframework.http.HttpStatus.*

@Secured(['IS_AUTHENTICATED_FULLY'])
class TaskTemplateController {

    static allowedMethods = [show: "GET", index: "GET", delete: "DELETE", patch: "PATCH", save: "POST", updateList: "PATCH"]

    TaskTemplateService taskTemplateService
    ProjectTemplateService projectTemplateService
    SpringSecurityService springSecurityService
    UserRoleService userRoleService
    OrganisationAuthorisationService organisationAuthorisationService

    def index() {
        boolean flatList = params.taskmapFlatTasks && params.taskmapFlatTasks == 'true'
        List<TaskTemplate> taskTemplates = taskTemplateService.getTasks(params.template_id as long, flatList)
        respond taskTemplates, [status: OK, view: '/taskTemplate/_taskTemplateTree']
    }

    def show() {
        try {
            TaskTemplate taskTemplate = taskTemplateService.getTaskTemplate(params.id as long, params.template_id as long)
            respond taskTemplate, [status: OK, view: '/taskTemplate/_taskTemplate']
        } catch (AccessDeniedException e) {
            render status: BAD_REQUEST
        }
    }

    def delete() {
        AppUser appUser = springSecurityService.getCurrentUser()
        boolean isSysadmin = userRoleService.hasSysadminRole(appUser)
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(appUser.organisation.id)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }
        try {
            taskTemplateService.delete(params.id as long, params.template_id as long)
            render status: NO_CONTENT
        } catch (AccessDeniedException e) {
            render status: BAD_REQUEST
        }
    }

    def save() throws MaximumNumberOfSubTasksExceededException,
            MaximumNumberOfLevelATasksExceededException,
            TaskTemplateMaximumLevelsExceededException, MaximumTemplateTasksExceededException {
        AppUser appUser = springSecurityService.getCurrentUser()
        boolean isSysadmin = userRoleService.hasSysadminRole(appUser)
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(appUser.organisation.id)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }
        Long templateId = params.getLong("template_id")
        boolean isMilestone = request.JSON.isMilestone
        boolean isDeliverable = request.JSON.isDeliverable

        Long parentTaskId = request.JSON.parentTaskId
        String name = request.JSON.name

        try {
            TaskTemplate taskTemplate = taskTemplateService.save(templateId, parentTaskId, name, isMilestone, isDeliverable)

            if (taskTemplate.hasErrors()) {
                respond taskTemplate.errors
            } else {
                respond taskTemplate
            }
        } catch (MaximumNumberOfLevelATasksExceededException maximumNumberOfLevelATasksExceededException) {
            def errorResponse = [[message: maximumNumberOfLevelATasksExceededException.getMessage()]]
            respond errorResponse, [status: BAD_REQUEST]
        } catch (MaximumNumberOfSubTasksExceededException maximumNumberOfSubTasksExceededException) {
            def errorResponse = [[message: maximumNumberOfSubTasksExceededException.getMessage()]]
            respond errorResponse, [status: BAD_REQUEST]
        } catch (TaskTemplateMaximumLevelsExceededException taskTemplateMaximumLevelsExceededException) {
            def errorResponse = [[message: taskTemplateMaximumLevelsExceededException.getMessage()]]
            respond errorResponse, [status: BAD_REQUEST]
        } catch (MaximumTemplateTasksExceededException maximumTemplateTasksExceededException) {
            respond(message: maximumTemplateTasksExceededException.getMessage(), status: BAD_REQUEST, error_type: 'TASK_LIMIT')
            return
        }
    }

    def patch() {
        AppUser appUser = springSecurityService.getCurrentUser()
        boolean isSysadmin = userRoleService.hasSysadminRole(appUser)
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(appUser.organisation.id)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }
        TaskTemplate taskTemplate = taskTemplateService.getTaskTemplate(params.id as long, params.template_id as long)
        taskTemplateService.updateTaskTemplate(taskTemplate, request.JSON, params.template_id as long)

        respond taskTemplate, [status: OK]
    }

    def updateList() {
        AppUser appUser = springSecurityService.getCurrentUser()
        boolean isSysadmin = userRoleService.hasSysadminRole(appUser)
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(appUser.organisation.id)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }
        try {
            if (!userRoleService.hasKnowledgeManagerRole(appUser) || isSysadmin) {
                throw new AccessDeniedException('cannot update list')
            }
            ValidatedParameterMap validatedBody = ParameterValidatorService.validate(request.JSON, ['taskOrder'], ['parentTaskId'])
            if (validatedBody.get("parentTaskId")) {
                TaskTemplate taskTemplate = taskTemplateService.updateTaskTemplatesForParent(validatedBody.get("parentTaskId") as long, validatedBody.get("taskOrder"), params.template_id as long)
                respond taskTemplate, [status: OK]
            } else {
                ProjectTemplate projectTemplate = projectTemplateService.updateTaskTemplatesForParent(params.template_id as long, validatedBody.get("taskOrder"))
                respond projectTemplate, [status: OK, view: 'projectTemplate/_projectTemplate']
            }
        }
        catch (AccessDeniedException exception) {
            respond [:], status: HttpStatus.FORBIDDEN
        }
    }
}