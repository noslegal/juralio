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
import com.juralio.common.ParameterValidatorService
import com.juralio.common.ValidatedParameterMap
import com.juralio.matter.Matter
import com.juralio.matter.MatterAuthorisationService
import com.juralio.matter.MatterService
import com.juralio.matter.MatterStatus
import com.juralio.organisation.OrganisationAuthorisationService
import com.juralio.project.admin.ProjectAdminService
import com.juralio.project.dao.PrivateWorkstreamMemberDAOService
import com.juralio.recency.RecencyService
import com.juralio.task.Creation_type
import com.juralio.task.Task
import com.juralio.task.TaskService
import com.juralio.task.blockers.TaskBlockerService
import com.juralio.task.status.TaskStatus
import com.juralio.task.team.TaskTeamMember
import com.juralio.template.TaskTemplate
import com.juralio.templates.exception.TemplateArchivedException
import grails.plugin.springsecurity.SpringSecurityService
import grails.plugin.springsecurity.annotation.Secured
import grails.web.servlet.mvc.GrailsParameterMap
import org.springframework.http.HttpStatus

@Secured(['IS_AUTHENTICATED_FULLY'])
class ProjectController {
    static allowedMethods = [save: "POST", listRecentProjectsForUser: "GET", listForMatter: "GET", show: "GET", preview: 'GET', getStructure: 'GET', getOverview: 'GET']

    ProjectAdminService projectAdminService
    ProjectService projectService
    RecencyService recencyService
    ProjectOverviewService projectOverviewService
    ProjectWithPostsService projectWithPostsService
    SpringSecurityService springSecurityService
    PrivateWorkstreamMemberDAOService privateWorkstreamMemberDAOService
    UserRoleService userRoleService
    OrganisationAuthorisationService organisationAuthorisationService
    TaskBlockerService taskBlockerService
    MatterService matterService
    TaskService taskService
    MatterAuthorisationService matterAuthorisationService

    private static Boolean validateBooleanParams(GrailsParameterMap params, List<String> itemsToCheck) {
        List<String> booleanOptions = ['true', 'false']
        return !itemsToCheck.collect {
            String item
            if (params.getProperty('item')) {
                return booleanOptions.contains(params.get('item'))
            }
            return true
        }.contains(false)


    }

    def listForMatter(long id) {
        if (!validateBooleanParams(params, ['id', 'excludeClosed', 'limitToMTMs', 'levelATasksOnly', 'allTasks', 'includePosts', 'adminList'])) {
            respond [:], status: HttpStatus.BAD_REQUEST
            return
        }
        if (!matterAuthorisationService.hasReadAccess(id)) {
            respond [:], status: HttpStatus.FORBIDDEN
            return
        }

        Matter matter = matterService.getMatterOnly(params.id as long)
        if (matter && matter.matterStatus == MatterStatus.PENDING_DELETION.value()) {
            respond [:], status: HttpStatus.NOT_FOUND
            return
        }

        if (params.orgList == 'true') {
            List<Project> projectList = projectService.getOrgProjectsByMatterId(params.id as long)
            if (shouldFilterOutNotRequiredTasks()) {
                projectList = projectList.collect { Project p ->
                    filterOutNotRequiredTasks(p)
                    return p
                }
            }
            respond projectList, [status: HttpStatus.OK, view: '/project/_projectList']
        } else {
            List<Project> projectList = projectService
                    .getProjectsByMatterId(params.id as long,
                            params.excludeClosed == "true",
                            params.limitToMTMs == "true",
                            params.levelATasksOnly == "true",
                            params.allTasks == 'true',
                            params.includePosts == 'true',
                            params.adminList == 'true'
                    )
            if (shouldFilterOutNotRequiredTasks()) {
                projectList = projectList.collect { Project p ->
                    filterOutNotRequiredTasks(p)
                    return p
                }
            }
            if (params.adminList == 'true') {
                respond projectList, [status: HttpStatus.OK, view: '/project/_projectAdmin']
            } else if (params.overviewOnly == 'true') {
                projectList.findAll { Project p -> p.active }.each { Project project ->
                    project.postCount = projectWithPostsService.getUsersWorkstreamPostCount(project)
                    project.peopleCount = project.getTasks().collect { it.teamMembers }.flatten().findAll { it.user != null && it.user.enabled }.unique { TaskTeamMember a, TaskTeamMember b -> a.userId <=> b.userId }.size()
                }
                respond projectList, [status: HttpStatus.OK, view: '/project/_projectListOverview']
            } else {
                projectList.findAll { Project p -> p.active }.each { Project project ->
                    project.postCount = projectWithPostsService.getUsersWorkstreamPostCount(project)
                }
                respond projectList, [status: HttpStatus.OK, view: '/project/_projectList']
            }
        }
    }

    private boolean shouldFilterOutNotRequiredTasks() {
        AppUser currentUser = springSecurityService.getCurrentUser()
        return currentUser.externalUserId != null
    }

    private static void filterOutNotRequiredTasks(Project project) {
        if (project) {
            project.tasks = project.tasks.findAll { it.status != TaskStatus.NOT_REQUIRED.value() }
        }

    }


    def show(Boolean includeFullHierarchy, Boolean overview, Boolean includeTaskTeam, Boolean includePosts) {

        Project project = projectService.getProject(params.id as long)

        if (!project || params.matter_id as long != project.matter.id as long) {
            respond [:], status: HttpStatus.NOT_FOUND
            return
        }
        if (shouldFilterOutNotRequiredTasks()) {
            filterOutNotRequiredTasks(project)
        }
        if (project.isPrivate) {
            project.privateWorkstreamTeam = privateWorkstreamMemberDAOService.findAllByWorkstream(project)
        }
        recencyService.updateProjectRecency(project)
        recencyService.updateMatterRecency(project.matter)
        if (!project.active) {
            Project p = new Project()
            p.active = project.active
            respond p, [status: HttpStatus.OK, view: '/project/_project']
        } else if (includeTaskTeam && includePosts) {
            project.tasks.each { task -> taskBlockerService.sortBlockersForTaskmap(task) }
            project.tasks.each { task -> task.blockers = taskBlockerService.generateBlockedDataObject(task) }
            def posts = projectWithPostsService.createProjectWithPosts(project)
            if (project.tasks.size() > 0 && project.tasks.findAll { Task task -> task.listIdx == 0 && task.level != 1 as short }.size() > 1) {
                taskService.fixTaskListOrderingForOldWorkstream(project.tasks)
            }
            project.tasks.each { Task task ->
                task.posts = posts.posts.findAll { post -> post.taskId == task.id }
            }
            project.postCount = posts.posts.size()
            respond project, [status: HttpStatus.OK, view: '/project/_projectTreeWithPostsAndTaskTeams']
        } else if (includeTaskTeam) {
            respond project, [status: HttpStatus.OK, view: '/project/_projectTreeWithTaskTeams']
        } else if (includeFullHierarchy) {
            project.postCount = projectWithPostsService.getUsersWorkstreamPostCount(project)
            respond project, [status: HttpStatus.OK, view: '/project/_projectTree']
        } else if (includePosts) {
            respond projectWithPostsService.createProjectWithPosts(project), [status: HttpStatus.OK]
        } else if (overview) {
            respond projectOverviewService.constructProjectOverview(project), [status: HttpStatus.OK, view: '/project/_projectOverview']
        } else {
            respond project, [status: HttpStatus.OK, view: '/project/_project']
        }

    }

    def preview() {
        Project project = projectService.getProjectWithLevelA(params.id as long)
        List<ProjectService.Preview> results = projectService.generatePreview(project)
        respond results
    }

    def getStructure() {
        Project project = projectService.getProjectStructure(params.id as long)
        respond project, [status: HttpStatus.OK, view: '/project/_projectStructure']
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
            if (projectService.hasReachedWorkstreamLimit(params.id as long)) {
                respond([text: 'Already at max workstreams'], status: HttpStatus.BAD_REQUEST)
                return
            }
            boolean isPrivate = request.JSON.isPrivate ? request.JSON.isPrivate : false
            boolean includeResources = request.JSON.includeResources ? request.JSON.includeResources : false
            if (params.templateid) {
                createdProject = projectService.saveFromTemplate(
                        params.id as long,
                        request.JSON.name,
                        params.templateid,
                        request.JSON.includePosts,
                        request.JSON.includeDescriptions,
                        includeResources
                )
                if (createdProject.levelATasks == null) {
                    createdProject.levelATasks = []
                }
                createdProject.tasks = []
                if (isPrivate == true) {
                    createdProject = updatePrivateProject(createdProject)
                }
                respond createdProject, [status: HttpStatus.CREATED, view: '/project/_projectWithTaskCounts']
            } else if (params.templateTaskId) {
                TaskTemplate t = TaskTemplate.get(params.templateTaskId)
                createdProject = projectService.saveFromTemplateTask(
                        params.id as long,
                        request.JSON.name,
                        params.templateTaskId as long,
                        request.JSON.includePosts,
                        t.projectTemplate.id,
                        request.JSON.includeDescriptions,
                )
                if (isPrivate == true) {
                    createdProject = updatePrivateProject(createdProject)
                }
                respond createdProject, [status: HttpStatus.CREATED, view: '/project/_projectWithTaskCounts']
            } else {
                Project projectToSave
                AppUser user = springSecurityService.getCurrentUser()
                if (request.JSON.active == null) {
                    projectToSave = new Project(name: request.JSON.name, active: true, creator: user, creation_type: Creation_type.FROM_BLANK.value(), template: null, isPrivate: isPrivate)
                } else {
                    projectToSave = new Project(name: request.JSON.name, active: request.JSON.active as boolean, creator: user.id, isPrivate: isPrivate)
                    if (!(request.JSON.active as boolean)) {
                        projectToSave.closer = projectToSave.creator
                        projectToSave.closedDate = projectToSave.creationDate
                    }
                }

                createdProject = projectService.save(params.id as long, projectToSave)
                respond createdProject, [status: HttpStatus.CREATED, view: '/project/_project']
            }
        } catch (TemplateArchivedException exception) {
            respond exception, [status: HttpStatus.METHOD_NOT_ALLOWED]
        }
    }

    def updatePrivateProject(Project project) {
        List<String> permittedParameters = ['isPrivate']
        ValidatedParameterMap params = ParameterValidatorService.validate(['isPrivate': true], [], permittedParameters)
        return projectAdminService.updateProject(project, params)
    }

    def listRecentProjectsForUser() {
        respond recencyService.getRecentProjectsForUser(params.count)
    }


    def getOverview() {
        Project workstream = projectService.getProject(params.id as long)

        WorkstreamOverview overview = projectOverviewService.getworkstreamOverview(workstream)
        respond overview, [status: HttpStatus.OK, view: '/project/_workstreamOverview']
    }
}

