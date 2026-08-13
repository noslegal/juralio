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
import com.juralio.common.ValidatedParameterMap
import com.juralio.organisation.Organisation
import com.juralio.post.Post
import com.juralio.project.Project
import com.juralio.project.ProjectService
import com.juralio.project.exception.ProjectNotFoundException
import com.juralio.recency.RecencyService
import com.juralio.task.Task
import com.juralio.task.TaskService
import com.juralio.task.TaskSortService
import com.juralio.template.dao.ProjectTemplateDAOService
import com.juralio.template.dao.ProjectTemplateFavouriteDAOService
import com.juralio.template.dao.ProjectTemplateImageTagDAOService
import com.juralio.template.dao.TaskTemplateDAOService
import com.juralio.template.exception.TemplateNotFoundException
import com.juralio.template.post.referencenumber.TemplatePostsReferenceNumberService
import com.juralio.template.referencenumber.ProjectTemplateReferenceNumberService
import com.juralio.template.referencenumber.TaskTemplateReferenceNumberService
import grails.gorm.transactions.Transactional
import grails.plugin.springsecurity.SpringSecurityService
import org.springframework.security.access.AccessDeniedException

@Transactional
class ProjectTemplateService {

    ProjectTemplateDAOService projectTemplateDAOService
    ProjectTemplateFavouriteDAOService projectTemplateFavouriteDAOService
    TemplateTreeHelperService templateTreeHelperService
    TaskTemplateDAOService taskTemplateDAOService
    TaskService taskService
    ProjectService projectService
    ProjectTemplateReferenceNumberService projectTemplateReferenceNumberService
    TaskTemplateReferenceNumberService taskTemplateReferenceNumberService
    TaskSortService taskSortService
    TemplatePostsReferenceNumberService templatePostsReferenceNumberService
    ProjectTemplateOverviewService projectTemplateOverviewService
    RecencyService recencyService
    ProjectTemplateFavouriteService projectTemplateFavouriteService
    UserRoleService userRoleService
    SpringSecurityService springSecurityService
    TemplateResourceService templateResourceService
    ProjectTemplateImageTagDAOService projectTemplateImageTagDAOService
    ProjectTemplateAuthorisationService projectTemplateAuthorisationService

    List<ProjectTemplateOverview> getList(Long limit) {
        if (!projectTemplateAuthorisationService.isNotExternalUser()) {
            throw new Exception()
        }
        AppUser currentUser = springSecurityService.getCurrentUser()

        Boolean filterOutDrafts = true
        if (userRoleService.hasKnowledgeManagerRole(currentUser) || userRoleService.hasSystemTemplateManagerRole(currentUser)) {
            filterOutDrafts = false
        }

        List<ProjectTemplate> templatesOrderedByCreationDate = projectTemplateDAOService.getTemplates(filterOutDrafts)

        List<ProjectTemplate> templatesOrderedByRecency = recencyService.getRecentProjectTemplatesForUser()
        List<ProjectTemplate> templatesOrderedByRecencyThenCreationDate = templatesOrderedByRecency + (templatesOrderedByCreationDate - templatesOrderedByRecency)

        List<ProjectTemplateFavourite> favouriteTemplates = projectTemplateFavouriteDAOService.getFavouriteTemplates()

        if (filterOutDrafts) {
            templatesOrderedByRecencyThenCreationDate = templatesOrderedByRecencyThenCreationDate.findAll {
                ProjectTemplate template -> template.published
            }
        }

        //push favourites to the top of the queue
        List<ProjectTemplate> favourites = templatesOrderedByRecencyThenCreationDate.findAll { pt -> favouriteTemplates.collect { it.projectTemplateId }.contains(pt.id) }
        templatesOrderedByRecencyThenCreationDate = templatesOrderedByRecencyThenCreationDate.findAll { !favourites.contains(it) }
        templatesOrderedByRecencyThenCreationDate = favourites + templatesOrderedByRecencyThenCreationDate

        if (limit && (limit as long) < templatesOrderedByRecencyThenCreationDate.size()) {
            templatesOrderedByRecencyThenCreationDate = templatesOrderedByRecencyThenCreationDate[0..(limit as int) - 1]
        }
        templatesOrderedByRecencyThenCreationDate.each{
            if(it.url) {
                it.urlTags = getTags(it.id)
            }
        }
        return templatesOrderedByRecencyThenCreationDate.collect() {
            ProjectTemplate template -> projectTemplateOverviewService.constructProjectTemplateOverview(template, true, projectTemplateFavouriteService.isFavourited(favouriteTemplates, template.id))
        }
    }

    ProjectTemplate getProjectStructure(Long id){
        ProjectTemplate template = getProjectTemplate(id)
        template.height = template.tasks?template.tasks.findAll{ TaskTemplate t -> t.tasks.size() == 0}.size():0
        template.depth = template.tasks?template.tasks.collect{TaskTemplate t -> t.level}.max():0
        return template
    }

    ProjectTemplate getProjectTemplate(long projectTemplateId) {
        if (!projectTemplateAuthorisationService.hasReadAccess(projectTemplateId)) {
            throw new Exception()
        }
        if(!projectTemplateAuthorisationService.hasReadAccess(projectTemplateId)){
            throw new Exception()
        }
        ProjectTemplate projectTemplate = projectTemplateDAOService.get(projectTemplateId)

        if (projectTemplate) {
            projectTemplate.resources = templateResourceService.getResourcesForTemplate(projectTemplate.id)
            projectTemplate.levelATasks = []
            projectTemplate.tasks.forEach({ TaskTemplate task ->
                if (task.level == 1) {
                    projectTemplate.levelATasks.add(task)
                }
            })
        }

        return projectTemplate
    }

    ProjectTemplate getProjectTemplateOnly(long projectTemplateId) {
        if (!projectTemplateAuthorisationService.hasReadAccess(projectTemplateId)) {
            throw new Exception()
        }
        if(!projectTemplateAuthorisationService.hasReadAccess(projectTemplateId)){
            throw new Exception()
        }
        ProjectTemplate projectTemplate = projectTemplateDAOService.get(projectTemplateId)
        return projectTemplate
    }

    ProjectTemplate delete(long templateId) throws TemplateNotFoundException {
        if (!projectTemplateAuthorisationService.hasWriteAccess(templateId)) {
            throw new Exception()
        }
        ProjectTemplate template = getProjectTemplateOnly(templateId)
        if (!template) {
            throw new TemplateNotFoundException()
        }
        // This is a soft delete.
        projectTemplateDAOService.delete(template)
    }

    ProjectTemplate updateProjectTemplate(long templateId, ValidatedParameterMap properties) throws TemplateNotFoundException,AccessDeniedException {
        if (!projectTemplateAuthorisationService.hasWriteAccess(templateId)) {
            throw new AccessDeniedException('')
        }
        ProjectTemplate template = getProjectTemplate(templateId)
        if (!template) {
            throw new TemplateNotFoundException()
        }

        if (properties.published == true) {
            finaliseAllTemplatePosts(template)
        }

        template.properties = properties
        template.save(flush: true, failOnError: true)

        return template
    }

    private void finaliseAllTemplatePosts(ProjectTemplate template) {
        AppUser currentUser = springSecurityService.getCurrentUser()
        List<TaskTemplate> allTasks = template.getTasks()
        allTasks.each { TaskTemplate task ->
            if (task.posts != null) {
                task.posts.each { Post post ->
                    post = Post.findById(post.id)
                    post.finalised = true
                    post.finalisedBy = currentUser
                    post.save()
                }
            }
        }
    }

     def findAllTemplatePosts(ProjectTemplate template) {
         def postCount= 0
         List<TaskTemplate> allTasks = template.getTasks()
         allTasks.each { TaskTemplate task ->
            if (task.posts != null) {
                postCount =  task.posts.size() + postCount
            }
        }
         return postCount
    }

    def findAllPublishedTemplatePosts(ProjectTemplate template) {
        def postCount= 0
        List<TaskTemplate> allTasks = template.getTasks()
        allTasks.each { TaskTemplate task ->
            if (task.posts != null) {
                postCount += task.posts.findAll {it.finalised==true} ? task.posts.findAll {it.finalised==true}.size() : 0
            }
        }
        return postCount
    }

    private void checkTasksValidForReorder(ProjectTemplate template, def tasks) throws AccessDeniedException {
        List<TaskTemplate> templateTasks = template.levelATasks
        for (task in tasks) {
            TaskTemplate targetTask = TaskTemplate.get(task.id)
            if (targetTask.level != 1 || !(targetTask in templateTasks)) {
                throw new AccessDeniedException("Unexpected task id")
            }
        }
    }

    ProjectTemplate updateTaskTemplatesForParent(def parentId, def taskOrder) throws AccessDeniedException {
        ProjectTemplate template = getProjectTemplate(parentId)
        checkTasksValidForReorder(template, taskOrder)
        templateTreeHelperService.updateTaskTemplatesForParent(template, taskOrder)
        template.save(flush: true, failOnError: true)
        return template
    }

    ProjectTemplate createTemplateFromScratch(String templateName) throws AccessDeniedException {
        if(!projectTemplateAuthorisationService.hasCreateAccess()){
            throw new Exception()
        }
        ProjectTemplate projectTemplate = projectTemplateDAOService.create(templateName)
        if (projectTemplate.organisation) {
            projectTemplate.referenceNumber = projectTemplateReferenceNumberService.getNextReferenceNumber(projectTemplate.organisation.id)
        } else {
            projectTemplate.isSystemTemplate = true
        }

        if (!projectTemplate.validate()) {
            return projectTemplate
        }

        projectTemplate.save()
        taskTemplateReferenceNumberService.createSequence(projectTemplate.id)
        templatePostsReferenceNumberService.generateTemplatePostsSequence(projectTemplate.id as long)

        return projectTemplate
    }

    void updateProjectImageTags(Long templateId, def tags){
        projectTemplateImageTagDAOService.deleteAllFromTemplate(templateId)
        projectTemplateImageTagDAOService.addTagsToTemplate(templateId,tags)
    }

    List<ProjectTemplateImageTag> getTags(Long templateId){
        return projectTemplateImageTagDAOService.getTagsFromTemplate(templateId)
    }

    ProjectTemplate createTemplateInSpecificOrg(String templateName, Organisation org) throws AccessDeniedException {
        if (!projectTemplateAuthorisationService.hasCreateAccess()) {
            throw new Exception()
        }
        ProjectTemplate projectTemplate = new ProjectTemplate(name: templateName)
        projectTemplate.organisation = org
        projectTemplate.referenceNumber = projectTemplateReferenceNumberService.getNextReferenceNumber(projectTemplate.organisation.id)


        if (!projectTemplate.validate()) {
            return projectTemplate
        }

        projectTemplate.save()
        taskTemplateReferenceNumberService.createSequence(projectTemplate.id)
        templatePostsReferenceNumberService.generateTemplatePostsSequence(projectTemplate.id as long)

        return projectTemplate
    }

    ProjectTemplate createTemplateFromProject(long projectId, String templateName) throws AccessDeniedException {
        if (!projectTemplateAuthorisationService.hasCreateAccess()) {
            throw new Exception()
        }
        Project sourceProject = projectService.getProjectOnly(projectId)

        if (!sourceProject) {
            throw new ProjectNotFoundException()
        }
        ProjectTemplate projectTemplate = createTemplateFromScratch(templateName)
        copyTaskStructure(taskService.getLevelATasks(sourceProject), projectTemplate, null)

        if (!projectTemplate.validate()) {
            return projectTemplate
        }
        return projectTemplate.save()
    }

    def copyTaskStructure(List<Task> sourceTasks, ProjectTemplate projectTemplate, TaskTemplate parentTaskTemplate) {
        List<Task> sortedSourceTasks = taskSortService.sortByStatusDescending(sourceTasks)

        for (Task sourceTask in sortedSourceTasks) {
            TaskTemplate taskTemplate = taskTemplateDAOService.create(sourceTask.name, sourceTask.level, projectTemplate, sourceTask.isMilestone,sourceTask.isDeliverable)
            copyTaskStructure(sourceTask.tasks, projectTemplate, taskTemplate)

            if (parentTaskTemplate) {
                parentTaskTemplate.addToTasks(taskTemplate)
            }
            projectTemplate.addToTasks(taskTemplate)
        }
    }

    class Preview {
        int height
        int depth
        List<Preview> children
    }

    def _gen(TaskTemplate t, int depth) {
        if (t.tasks.size() == 0) {
            return new Preview(height: 1, children: [], depth: depth)
        } else {
            def children = t.tasks.collect { c -> _gen(c, depth + 1) }
            def height = children.sum { c -> c.height }

            return new Preview(height: height, children: children, depth: children[0].depth)
        }
    }

    def generatePreview(ProjectTemplate project) {
        def results = []
        def levelATasks = project.levelATasks
        levelATasks.each { TaskTemplate t ->
            results.add(_gen(t, 1))
        }
        return results
    }
}
