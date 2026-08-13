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
import com.juralio.linkresource.LinkResource
import com.juralio.linkresource.LinkResourceService
import com.juralio.organisation.Organisation
import com.juralio.post.Post
import com.juralio.template.dao.TaskTemplateDAOService
import com.juralio.template.post.referencenumber.TemplatePostsReferenceNumberService
import com.juralio.templateResource.TemplateResource
import grails.gorm.transactions.Transactional
import grails.plugin.springsecurity.SpringSecurityService

@Transactional
class ProjectTemplateCopyService {

    ProjectTemplateService projectTemplateService
    TaskTemplateService taskTemplateService
    TaskTemplateDAOService taskTemplateDAOService
    SpringSecurityService springSecurityService
    TemplatePostsReferenceNumberService templatePostsReferenceNumberService
    TemplateResourceService templateResourceService

    ProjectTemplate copyProjectTemplate(sourceTemplateId, String name, boolean includePosts) {
        def sourceTemplate = projectTemplateService.getProjectTemplateOnly(sourceTemplateId as long)
        ProjectTemplate targetTemplate = projectTemplateService.createTemplateFromScratch(name)
        targetTemplate.description = sourceTemplate.description
        targetTemplate.url = sourceTemplate.url
        targetTemplate.urlCreditName = sourceTemplate.urlCreditName
        targetTemplate.urlCredit = sourceTemplate.urlCredit
        targetTemplate.save()

        // Perform the content copy.
        copyTemplate(sourceTemplate as ProjectTemplate, targetTemplate, includePosts)

        return targetTemplate
    }

    def copyTemplate(ProjectTemplate sourceTemplate, ProjectTemplate destinationTemplate, boolean includePosts) {

        copyTaskStructure(taskTemplateService.getLevelATasks(sourceTemplate), destinationTemplate, null)

        if (!destinationTemplate.validate()) {
            return destinationTemplate
        }
        destinationTemplate.save()
        if (includePosts) {
            copyTaskPosts(destinationTemplate.tasks)
        }
        copyTemplateResources(sourceTemplate.id, destinationTemplate.id)

        return destinationTemplate

    }

    private void copyTemplateResources(Long existingTemplateId, Long newTemplateId) {
        List<TemplateResource> resources = templateResourceService.getResourcesForTemplate(existingTemplateId)
        resources.each { TemplateResource tr ->
            templateResourceService.copyResource(existingTemplateId, tr.id, newTemplateId)
        }
    }

    def copyTaskStructure(List<TaskTemplate> sourceTasks, ProjectTemplate projectTemplate, TaskTemplate parentTaskTemplate) {
        for (TaskTemplate sourceTask in sourceTasks) {
            TaskTemplate taskTemplate = taskTemplateDAOService.create(sourceTask.name, sourceTask.level, projectTemplate, sourceTask.isMilestone,sourceTask.isDeliverable, sourceTask.noticeboardText,)
            taskTemplate.source_task = sourceTask

            if (parentTaskTemplate) {
                parentTaskTemplate.addToTasks(taskTemplate)
            }

            projectTemplate.addToTasks(taskTemplate)
            taskTemplate.save()
            if (sourceTask.tasks.size() != 0) {
                copyTaskStructure(sourceTask.tasks, projectTemplate, taskTemplate)
            }
        }
    }

    def copyTaskPosts(List<TaskTemplate> newTasks) {
        AppUser currentUser = springSecurityService.getCurrentUser()
        for (TaskTemplate newTask in newTasks) {
            if (newTask.source_task.posts != null) {
                for (Post post in newTask.source_task.posts) {
                    post = Post.findById(post.id)
                    Post newPost = new Post(
                            name: post.name,
                            description: post.description,
                            privatePost: post.privatePost,
                            type: post.type,
                            url: post.url,
                            startTime: post.startTime,
                            endTime: post.endTime,
                            finalised: post.finalised,
                            finalisedBy: currentUser
                    )
                    newPost.creator = currentUser
                    newPost.referenceNumber = templatePostsReferenceNumberService.getNextReferenceNumber(newTask.projectTemplate.id)

                    newTask.addToPosts(newPost)
                    taskTemplateDAOService.save(newTask)
                    newPost.save()
                }
            }
        }
    }

    ProjectTemplate submitProjectTemplate(long sourceTemplateId) {
        ProjectTemplate sourceTemplate = projectTemplateService.getProjectTemplateOnly(sourceTemplateId)
        Organisation org = Organisation.findById(Organisation.findAll().id.sort()[0])
        ProjectTemplate targetTemplate = projectTemplateService.createTemplateInSpecificOrg(sourceTemplate.name + '(submitted)', org)
        targetTemplate.description = sourceTemplate.description
        targetTemplate.save()
        TemplateProviderSource templateSource = new TemplateProviderSource()
        templateSource.newTemplate = targetTemplate
        templateSource.sourceTemplate = sourceTemplate
        templateSource.name = sourceTemplate.organisation.name
        templateSource.save()

        // Perform the content copy.
        copyTemplate(sourceTemplate, targetTemplate, true)

        return targetTemplate
    }
}
