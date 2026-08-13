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

package com.juralio.task.labels

import com.juralio.auth.AppUser
import com.juralio.auth.UserRoleService
import com.juralio.label.Label
import com.juralio.organisation.OrganisationAuthorisationService
import com.juralio.task.Task
import com.juralio.task.TaskService
import com.juralio.task.label.TaskLabel
import grails.plugin.springsecurity.SpringSecurityService
import grails.plugin.springsecurity.annotation.Secured
import org.springframework.http.HttpStatus

@Secured(['IS_AUTHENTICATED_FULLY'])
class TaskLabelController {
    static allowedMethods = [
            getTaskLabels : "GET",
            addLabelToTask: "POST",
            updateTaskLabel:"PATCH",
            deleteLabelFromTask:"DELETE"
    ]

    TaskService taskService
    TaskLabelsService taskLabelsService
    UserRoleService userRoleService
    OrganisationAuthorisationService organisationAuthorisationService
    SpringSecurityService springSecurityService

    def getTaskLabels(Long project_id, Long task_id) {
        Task task = taskService.getTaskOnly(task_id, project_id)
        List<Label> labels = task.labels as List<Label>
        respond labels
    }

    def addLabelToTask(Long matter_id, Long project_id, Long task_id) {
        AppUser appUser = springSecurityService.getCurrentUser()
        boolean isSysadmin = userRoleService.hasSysadminRole(appUser)
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(appUser.organisation.id)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }
        Long labelId = request.JSON.labelId as Long
        String modifier = request.JSON.modifier as String
        TaskLabel taskLabel = taskLabelsService.addLabelToTask(project_id, task_id, labelId, modifier)
        respond taskLabel
    }

    def updateTaskLabel(Long project_id, Long task_id, Long label_id) {
        AppUser appUser = springSecurityService.getCurrentUser()
        boolean isSysadmin = userRoleService.hasSysadminRole(appUser)
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(appUser.organisation.id)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }
        String modifier = request.JSON.modifier as String
        TaskLabel taskLabel = taskLabelsService.updateTaskLabel(project_id, task_id, label_id, modifier)
        respond taskLabel
    }

    def deleteLabelFromTask(Long project_id, Long task_id, Long label_id) {
        AppUser appUser = springSecurityService.getCurrentUser()
        boolean isSysadmin = userRoleService.hasSysadminRole(appUser)
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(appUser.organisation.id)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }
        taskLabelsService.deleteLabelFromTask(project_id, task_id, label_id)
        render status: HttpStatus.OK
    }
}