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
import com.juralio.linkresource.LinkResource
import com.juralio.matter.Matter
import com.juralio.matter.MatterService
import com.juralio.project.dao.PrivateWorkstreamMemberDAOService
import com.juralio.project.dao.ProjectDAOService
import com.juralio.project.dao.TaskCountsDAOService
import com.juralio.project.exception.ProjectNotFoundException
import com.juralio.project.referencenumber.ProjectContentReferenceNumberService
import com.juralio.task.Creation_type
import com.juralio.task.Task
import com.juralio.task.TaskLevelChangeService
import com.juralio.task.TaskSortService
import com.juralio.task.dao.TaskDAOService
import com.juralio.task.status.TaskStatus
import com.juralio.template.*
import grails.gorm.transactions.Transactional
import grails.plugin.springsecurity.SpringSecurityService

@Transactional
class ProjectService {

    final String DELETED_MIRROR_POSTFIX = "_deletedmirror"

    MatterService matterService
    ProjectDAOService projectDAOService
    ProjectTemplateService projectTemplateService
    TaskTemplateService taskTemplateService
    TaskDAOService taskDAOService
    ProjectContentReferenceNumberService projectContentReferenceNumberService
    TaskLevelChangeService taskLevelChangeService
    SpringSecurityService springSecurityService
    TaskCountsDAOService taskCountsDAOService
    PrivateWorkstreamMemberDAOService privateWorkstreamMemberDAOService
    TemplateResourceService templateResourceService
    ProjectAuthorisationService projectAuthorisationService
    TaskSortService taskSortService

    void populateProjectsForCollection(List<Matter> matters) {
        matters.each {
            matter -> matter.projects = getProjectsByMatterId(matter.id, true, false, false, true, true)
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

    Project getProjectOnly(long projectId) {
        if(!projectAuthorisationService.hasReadAccess(projectId)){
            throw new Exception()
        }
        Project project = projectDAOService.get(projectId as long)
        return project
    }

    Project getProjectWithLevelA(long projectId) {
        if(!projectAuthorisationService.hasReadAccess(projectId)){
            throw new Exception()
        }
        Project project = projectDAOService.get(projectId as long)
        if (shouldFilterOutNotRequiredTasks()) {
            filterOutNotRequiredTasks(project)
        }
        if (project) {
            project.levelATasks = taskDAOService.findAllByProjectAndLevel(project, 1 as short)
        }
        return project
    }

    Project getProject(long projectId) {
        if(!projectAuthorisationService.hasReadAccess(projectId)){
            throw new Exception()
        }
        Project project = projectDAOService.get(projectId as long)
        if (shouldFilterOutNotRequiredTasks()) {
            filterOutNotRequiredTasks(project)
        }
        if (project) {
            project.levelATasks = taskDAOService.findAllByProjectAndLevel(project, 1 as short)
        }
        if (project && project.id) {
            project.taskCounts = taskCountsDAOService.getTaskCounts(project.id, shouldFilterOutNotRequiredTasks())
        }
        return project
    }

    Project save(long matterId, Project project) {
        if(!projectAuthorisationService.hasCreateAccess(matterId)){
            throw new Exception()
        }
        project.matter = matterService.getMatterOnly(matterId)
        if (!project.validate()) {
            return project
        }

        Project savedProject = projectDAOService.save(project)
        projectContentReferenceNumberService.getProjectReferenceNumber(matterId, savedProject.id as long)
        project.deletedMirror = createDeletedMirror(project)
        return project
    }

    Project saveFromTemplate(matterId, projectName, def templateId, boolean includePosts, boolean includeDescriptions = false, boolean includeResources = false) {
        if(!projectAuthorisationService.hasCreateAccess(matterId)){
            throw new Exception()
        }
        def template = projectTemplateService.getProjectTemplateOnly(templateId as Long)

        if (template.archived) {
            throw new IllegalArgumentException('Invalid template.')
        }
        AppUser user = springSecurityService.getCurrentUser()
        Project project = save(matterId, new Project(name: projectName, creator: user, template: templateId, creation_type: Creation_type.FROM_TEMPLATE.value(), isPrivate: false))
        if (project.hasErrors()) {
            return project
        }

        if (includeResources) {
            def resources = templateResourceService.getResourcesForTemplate(templateId as Long)
            Matter matter = matterService.getMatterOnly(matterId)
            Long numOfWorkstreams = matter.projects.size()

            resources.each { it ->
                LinkResource matterResource = new LinkResource()
                matterResource.name = it.name
                matterResource.url = it.url
                matterResource.image = it.image
                matterResource.matterId = matterId
                matterResource.creator = user
                matterResource.workstreamId = numOfWorkstreams > 1 ? project.id : null
                matterResource.save()
            }
        }
        List<TaskTemplate> taskTemplates = taskTemplateService.getTasks(templateId as Long)
        taskTemplateService.generateTasksFromTaskTemplates(taskTemplates, project,false, null, TaskStatus.NOT_STARTED, includePosts, templateId as Long, includeDescriptions)

        return project
    }

    Project saveFromTemplateTask(long matterId, String projectName, long templateTaskId, boolean includePosts, long templateId, boolean includeDescriptions = false) {
        if(!projectAuthorisationService.hasCreateAccess(matterId)){
            throw new Exception()
        }
        TaskTemplate taskTemplate = taskTemplateService.getTaskTemplateOnly(templateTaskId, templateId)
        if (taskTemplate.projectTemplate.archived) {
            throw new IllegalArgumentException('Invalid template.')
        }
        AppUser user = springSecurityService.getCurrentUser()
        Project project = save(matterId, new Project(name: projectName, creator: user, template: templateId, template_task: templateTaskId, creation_type: Creation_type.FROM_TEMPLATE.value(), isPrivate: false))
        if (project.hasErrors()) {
            return project
        }
        long originalLevel = taskTemplate.level
        taskLevelChangeService.updateLevel(taskTemplate, TaskTemplate.NUMBER_TOP_LEVEL_TASK)
        taskTemplateService.generateTasksFromTaskTemplates([taskTemplate], project,false, null, TaskStatus.NOT_STARTED, includePosts, templateId, includeDescriptions)
        taskLevelChangeService.updateLevel(taskTemplate, originalLevel)
        return project
    }

    private Project createDeletedMirror(Project project) {
        AppUser user = springSecurityService.getCurrentUser()
        Project mirror = new Project(
                name: project.id + DELETED_MIRROR_POSTFIX,
                matter: project.matter.deletedMirror,
                creationDate: project.creationDate,
                creator: user
        )
        return projectDAOService.save(mirror)
    }


    List<Project> getProjectsByMatterId(long matterId, boolean excludeClosed, boolean limitToMTMs, boolean levelATasksOnly = false, boolean allTasks = false, boolean includePosts = false, includePrivate = false) {
       if(!projectAuthorisationService.hasListReadAccess(matterId, limitToMTMs)){
           throw new Exception()
       }
        return projectDAOService.getProjectsByMatterId(matterId, excludeClosed, levelATasksOnly, allTasks, includePosts, includePrivate)
    }

    List<Project> getOrgProjectsByMatterId(long matterId) {
        if(!projectAuthorisationService.orgProjectAccess(matterId)){
            throw new Exception()
        }
        return projectDAOService.getProjectsByMatterId(matterId, false, false)
    }

    Project lockProject(long projectId) {
        def project = projectDAOService.lock(projectId)
        if (project == null) {
            throw new ProjectNotFoundException("project with ID ${projectId} could not be found")
        }
        return project
    }

    List<Project> getProjectsByUser(boolean includeClosed = false) {
        List<Matter> mattersForUser = matterService.getMattersForTeamMember()
        if (includeClosed) {
            return projectDAOService.findAllByMatterInListIncludeClosed(mattersForUser)
        } else {
            return projectDAOService.findAllByMatterInList(mattersForUser)
        }
    }

    List<Project> getProjectByUserAndName(String name) {
        List<Matter> mattersForUser = matterService.getMattersForTeamMember()
        return projectDAOService.findAllByMatterInListAndName(mattersForUser, name)

    }

    Project getDeletedMirror(long projectId) {
        if(!projectAuthorisationService.hasUnarchiveAccess(projectId)){
            throw new Exception()
        }
        Project project = projectDAOService.get(projectId as long)
        return project.getDeletedMirror()
    }

    Project getProjectByDeletedMirror(Project deletedMirror) {
        return projectDAOService.findByDeletedMirror(deletedMirror)
    }


    class Preview {
        int height
        int depth
        List<Preview> children
    }

    def _gen(Task t, int depth) {
        if (t.tasks.size() == 0) {
            return new Preview(height: 1, children: [], depth: depth)
        } else {
            def children = t.tasks.collect { c -> _gen(c, depth + 1) }
            def height = children.sum { c -> c.height }

            return new Preview(height: height, children: children, depth: children[0].depth)
        }
    }

    List<Preview> generatePreview(Project project) {

        List<Preview> results = []
        def levelATasks = project.levelATasks
        levelATasks.each { Task t ->
            results.push(_gen(t, 1))
        }
        return results
    }

    Boolean canAccessPrivateWorkstream(Project workstream) {
        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
        if (workstream.isPrivate) {
            return privateWorkstreamMemberDAOService.findByWorkstreamAndUserId(workstream, currentUser) != null
        }
        return true
    }

    Project getProjectStructure(Long projectId){
        Project project = getProjectWithLevelA(projectId)
        project.height = project.tasks?project.tasks.findAll{Task t -> t.tasks.size() == 0}.size():0
        project.depth = project.tasks?project.tasks.collect{Task t -> t.level}.max():0
        return project
    }

    def hasReachedWorkstreamLimit(Long matterId){
        Matter matter = matterService.getMatter(matterId)
        return matter.projects.size() > 15
    }
}