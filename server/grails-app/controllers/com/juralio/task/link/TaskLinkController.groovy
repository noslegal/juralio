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

package com.juralio.task.link

import com.juralio.auth.AppUser
import com.juralio.auth.UserRoleService
import com.juralio.common.ParameterValidatorService
import com.juralio.common.ValidatedParameterMap
import com.juralio.organisation.OrganisationAuthorisationService
import com.juralio.project.Project
import com.juralio.project.ProjectService
import com.juralio.task.Task
import com.juralio.task.TaskService
import com.juralio.task.move.TaskLinkService
import grails.plugin.springsecurity.SpringSecurityService
import grails.plugin.springsecurity.annotation.Secured
import groovy.transform.CompileStatic
import org.springframework.http.HttpStatus

@Secured(['IS_AUTHENTICATED_FULLY'])
@CompileStatic
class TaskLinkController {
    static allowedMethods = [save: "POST", saveAll: 'POST', saveList: "POST"]
    TaskLinkService taskLinkService
    TaskService taskService
    ProjectService projectService
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
        Long taskId = params.id as long
        Long projectId = params.project_id as long
        Boolean isLinked = request.JSON['linkedWithSiblings'] as Boolean
        if (isLinked) {
            taskLinkService.link(taskId, projectId)
        } else {
            taskLinkService.unlink(taskId, projectId)
        }
        Task task = taskService.getTask(taskId, projectId)
        task.datesLinkedToSiblings = isLinked
        respond task, [status: HttpStatus.OK]
    }

    def saveList() {
        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
        boolean isSysadmin = userRoleService.hasSysadminRole(currentUser)
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(currentUser.organisation.id)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }
        Long projectId = params.id as long
        ValidatedParameterMap validatedBody = ParameterValidatorService.validate(request.JSON as Map, ['tasks'], ['isLinked'])
        List<Long> taskIds = validatedBody.get('tasks') as List<Long>
        List<Boolean> taskIsLinked = validatedBody.get('isLinked') as List<Boolean>
        if (taskIsLinked && taskIsLinked.size() != taskIds.size()) {
            respond [:], [status: HttpStatus.OK]
            return
        }
        Project project = projectService.getProjectOnly(projectId as long)
        if (params.matter_id as long != project.matter.id as long) {
            respond [:], status: HttpStatus.NOT_FOUND
            return
        }
        taskLinkService.linkListOfTasks(taskIds, projectId, taskIsLinked)
        respond [:], [status: HttpStatus.OK]
    }

    def saveAll() {
        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
        boolean isSysadmin = userRoleService.hasSysadminRole(currentUser)
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(currentUser.organisation.id)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }
        Long taskId = params.id as long
        Long projectId = params.project_id as long
        Boolean isLinked = request.JSON['linkedWithSiblings'] as Boolean
        if (isLinked) {
            taskLinkService.linkAllSiblings(taskId, projectId)
        } else {
            taskLinkService.unlinkAllSiblings(taskId, projectId)
        }
        Task task = taskService.getTask(taskId, projectId)
        task.datesLinkedToSiblings = isLinked
        respond task, [status: HttpStatus.OK]
    }
}
