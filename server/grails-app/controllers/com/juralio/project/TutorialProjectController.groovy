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

package com.juralio.project

import com.juralio.auth.AppUser
import com.juralio.auth.UserRoleService
import com.juralio.common.APIErrorCodes
import com.juralio.matter.Matter
import com.juralio.organisation.OrganisationAuthorisationService
import com.juralio.task.Task
import com.juralio.task.TaskService
import com.juralio.task.team.TaskTeamMemberService
import com.juralio.templates.exception.TemplateArchivedException
import grails.plugin.springsecurity.SpringSecurityService
import grails.plugin.springsecurity.annotation.Secured
import org.springframework.http.HttpStatus

@Secured(['IS_AUTHENTICATED_FULLY'])
class TutorialProjectController {
    static allowedMethods = [save: "POST"]

    ProjectService projectService
    SpringSecurityService springSecurityService
    TaskTeamMemberService taskTeamMemberService
    TaskService taskService
    UserRoleService userRoleService
    OrganisationAuthorisationService organisationAuthorisationService

    private void assignUserToAllTasks(Project project, Long userId) {
        List<Task> tasks = project.tasks

        tasks.each { t ->
            taskTeamMemberService.addTeamMember(t.id, userId, project.id)
        }
    }

    def save() {
        Project createdProject
        AppUser currentUser = springSecurityService.getCurrentUser()
        boolean isSysadmin = userRoleService.hasSysadminRole(currentUser)
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(currentUser.organisationId)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }
        try {
            String name = request.JSON.name
            Matter personalMatter = Matter.findByCreatorAndIsPersonal(currentUser, true)
            if (!personalMatter) {
                Map<String, String> error = new HashMap<>()
                error.put('error', APIErrorCodes.NO_PERSONAL_MATTER.code())
                respond error, status: HttpStatus.BAD_REQUEST
                return
            }
            List<Project> existingProjects = projectService.getProjectByUserAndName(name)
            if (existingProjects.size() > 0) {
                name = name + ' ' + existingProjects.size()
            }

            createdProject = projectService.saveFromTemplate(personalMatter.id as long,
                    name,
                    params.templateid as long,
                    true, true)
            if (createdProject.levelATasks == null) {
                createdProject.levelATasks = []
            }
            assignUserToAllTasks(createdProject, currentUser.id)
            respond createdProject, [status: HttpStatus.CREATED, view: '/project/_projectWithTaskCounts']
        } catch (TemplateArchivedException exception) {
            respond exception, [status: HttpStatus.METHOD_NOT_ALLOWED]
        }
    }
}