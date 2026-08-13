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

package com.juralio.search

import com.juralio.auth.AppUser
import com.juralio.matter.Matter
import com.juralio.matter.MatterAuthorisationService
import com.juralio.matter.MatterRecency
import com.juralio.matter.MatterStatus
import com.juralio.matter.dao.MatterDAOService
import com.juralio.post.Post
import com.juralio.post.TaskPostsAuthorisationService
import com.juralio.project.Project
import com.juralio.project.ProjectAuthorisationService
import com.juralio.project.ProjectRecency
import com.juralio.project.dao.ProjectDAOService
import com.juralio.project.dao.TaskCountsDAOService
import com.juralio.recency.dao.RecencyDAOService
import com.juralio.task.Task
import com.juralio.task.TaskAuthorisationService
import com.juralio.task.TaskRecency
import com.juralio.task.dao.TaskDAOService
import com.juralio.template.*
import grails.gorm.transactions.Transactional
import grails.plugin.springsecurity.SpringSecurityService
import org.hibernate.Hibernate

@Transactional
class AdvancedSearchService {
    SpringSecurityService springSecurityService
    MatterAuthorisationService matterAuthorisationService
    ProjectAuthorisationService projectAuthorisationService
    TaskAuthorisationService taskAuthorisationService
    TaskTemplateAuthorisationService taskTemplateAuthorisationService
    TaskPostsAuthorisationService taskPostsAuthorisationService
    TaskDAOService taskDAOService
    TaskCountsDAOService taskCountsDAOService
    RecencyDAOService recencyDAOService
    ProjectDAOService projectDAOService
    MatterDAOService matterDAOService

    private boolean isMatch(String value, String query) {
        if (!value) {
            return null
        }
        return value.toLowerCase().contains(query.toLowerCase())
    }

    private def convertResults(List<Matter> matters, List<Project> workstreams, List<Task> tasks, List<Post> posts, List<ProjectTemplate> templates, List<TaskTemplate> templateTasks, List<Post> templatePosts) {
        def results = new ArrayList()
        matters.each {
            results.push([
                    type                      : 'matter',
                    name                      : it.name,
                    id                        : it.id,
                    description               : it.description,
                    clientName                : it.clientName,
                    userDefinedReferenceNumber: it.userDefinedReferenceNumber,
                    isSWM                     : it.projects.size() == 1,
                    active                    : it.matterStatus == MatterStatus.ACTIVE.value(),
                    taskCounts                : it.projects.size() == 1 ? taskCountsDAOService.getTaskCounts(it.projects[0].id, true) : null,
            ])
        }
        workstreams.each {
            results.push([
                    type                            : 'workstream',
                    name                            : it.name,
                    id                              : it.id,
                    matterId                        : it.matterId,
                    description                     : it.description,
                    taskCounts                      : taskCountsDAOService.getTaskCounts(it.id, true),
                    matterName                      : it.matter.name,
                    clientName                      : it.matter.clientName,
                    matterUserDefinedReferenceNumber: it.matter.userDefinedReferenceNumber,
            ])
        }
        tasks.each {
            results.push([
                    type          : 'task',
                    name          : it.name,
                    id            : it.id,
                    workstreamId  : it.project.id,
                    isSWM         : it.project.matter.projects.size() == 1,
                    level         : it.level,
                    matterName    : it.project.matter.name,
                    workstreamName: it.project.name,
                    matterId      : it.project.matterId,
                    description   : it.description,
                    isMilestone   : it.isMilestone,
                    isDeliverable : it.isDeliverable,
                    status        : it.status,
                    lastEdited    : it.lastUpdated,
                    dateToDisplay : it.status == 'not-started'
                            ? it.plannedStartDate
                            : it.status == 'in-progress'
                            ? it.plannedEndDate
                            : it.actualEndDate
            ])
        }
        posts.each {
            results.push([
                    type          : 'post',
                    name          : it.name,
                    id            : it.id,
                    postType      : it.type,
                    description   : it.description,
                    url           : it.url,
                    taskId        : it.task.id,
                    taskName      : it.task.name,
                    workstreamId  : it.task.projectId,
                    workstreamName: it.task.project.name,
                    matterId      : it.task.project.matterId,
                    isSWM         : it.task.project.matter.projects.size() == 1,
                    matterName    : it.task.project.matter.name,
                    status        : it.finalised,
                    postDate      : it.lastUpdated,
                    meetingDate   : it.startTime ? it.startTime : it.dateCreated
            ])
        }
        templates.each {
            results.push([
                    type       : 'template',
                    name       : it.name,
                    id         : it.id,
                    published  : it.published,
                    description: it.description,
                    lastEdited : it.lastUpdated,
            ])
        }
        templateTasks.each {
            results.push([
                    type         : 'templateTask',
                    name         : it.name,
                    id           : it.id,
                    level        : it.level,
                    description  : it.noticeboardText,
                    templateId   : it.projectTemplate.id,
                    templateName : it.projectTemplate.name,
                    isMilestone  : it.isMilestone,
                    isDeliverable: it.isDeliverable,
            ])
        }

        templatePosts.each {
            results.push([
                    type            : 'templatePost',
                    name            : it.name,
                    id              : it.id,
                    templateTaskId  : it.taskTemplate.id,
                    templateId      : it.taskTemplate.projectTemplateId,
                    templateTaskName: it.taskTemplate.name,
                    templateName    : it.taskTemplate.projectTemplate.name,
                    postType        : it.type,
                    postDate        : it.lastUpdated,
                    description     : it.description,
                    url             : it.url,

            ])
        }
        return results
//sortConvertedResults(results, matters.size() > 1, workstreams.size() > 1, tasks.size() > 1, templates.size() > 1 || templateTasks.size() > 1 || templatePosts.size() > 1)
    }


    private static boolean canSearchGivenContext(String contextType, String objectType) {
        if (contextType == null) {
            return true
        }
        if (contextType == 'matter') {
            return ['matter', 'workstream', 'task', 'post'].contains(objectType)
        }
        if (contextType ==
                'workstream') {
            return ['workstream', 'task', 'post'].contains(objectType)
        }
        if (contextType == 'task') {
            return ['task', 'post'].contains(objectType)
        }
        if (contextType == 'post') {
            return ['post'].contains(objectType)
        }
        if (contextType == 'template') {
            return ['template', 'templateTask', 'templateTaskPost'].contains(objectType)

        }
        if (contextType == 'templateTask') {
            return ['templateTask', 'templateTaskPost'].contains(objectType)
        }
        if (contextType == 'templateTaskPost') {
            return ['templateTaskPost'].contains(objectType)
        }
        return false
    }

    private static boolean isCorrectContextObject(Long contextId, Long currentObjectId) {
        if (!contextId) {
            return true
        }
        return currentObjectId == contextId
    }


    private def defaultOptions = [
            includeMatters          : true,
            includeWorkstreams      : true,
            includeTasks            : true,
            includePosts            : true,
            includeTemplates        : true,
            includeTemplateTasks    : true,
            includeTemplateTaskPosts: true,
            context                 : null,
            contextType             : null
    ]

    def performSearch(String query, def options = defaultOptions) {
        if (query == null) {
            return new ArrayList<>()
        }
        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
        List<Matter> matters = []
        if (options.includeMatters && canSearchGivenContext(options.contextType as String, 'matter')) {
            matters = matterDAOService.getMattersForUser(query).findAll { Matter m -> m.matterStatus == MatterStatus.ACTIVE.value() && m.organisation.id == currentUser.organisation.id }
            if (matters.size() > 1) {
                List<MatterRecency> matterRecency = recencyDAOService.getMatterRecenciesByUser(currentUser).sort { it.lastVisit.getTime() }
                matters.sort { a, b ->
                    Long aId = a.id
                    Long bId = b.id
                    if (aId && bId && aId != bId) {
                        if (aId && bId) {
                            Long aRecency = matterRecency.findIndexOf { it -> it.matterId == aId }
                            Long bRecency = matterRecency.findIndexOf { it -> it.matterId == bId }
                            return aRecency <=> bRecency
                        }
                        if (aId) {
                            return -1
                        }
                        if (bId) {
                            return 1
                        }
                    }
                    return 0
                }
            }
        }
        List<Project> workstreams = []
        if (options.includeWorkstreams && canSearchGivenContext(options.contextType as String, 'workstream')) {
            workstreams = projectDAOService.getProjectForUser(query, options.contextType as String, options.context as Long).findAll { Project p -> p.active && p.matter.organisation.id == currentUser.organisation.id }
            if (workstreams.size() > 1) {
                List<ProjectRecency> projectRecencies = recencyDAOService.getProjectRecenciesByUser(currentUser).sort { it.lastVisit.getTime() }
                workstreams.sort { a, b ->
                    Long aId = a.id
                    Long bId = b.id
                    if (aId && bId && aId != bId) {
                        if (aId && bId) {
                            Long aRecency = projectRecencies.findIndexOf { it -> it.projectId == aId }
                            Long bRecency = projectRecencies.findIndexOf { it -> it.projectId == bId }
                            return aRecency <=> bRecency
                        }
                        if (aId) {
                            return -1
                        }
                        if (bId) {
                            return 1
                        }
                    }
                    return 0
                }
            }
        }

        List<Task> tasks = []

        if (options.includeTasks && canSearchGivenContext(options.contextType as String, 'task')) {
            tasks = taskDAOService.getTasksForUser(query, options.contextType as String, options.context as Long).findAll { Task t -> t.project.matter.organisation.id == currentUser.organisation.id }
            tasks = tasks.findAll { t -> t.project.matter.organisation.id == currentUser.organisation.id }
            if (tasks.size() > 1) {
                List<TaskRecency> taskRecencies = recencyDAOService.getTaskRecencyRecordsForUser(currentUser).sort { it.lastVisit.getTime() }
                tasks.sort { a, b ->
                    Long aId = a.id
                    Long bId = b.id
                    if (aId && bId && aId != bId) {
                        if (aId && bId) {
                            Long aRecency = taskRecencies.findIndexOf { it -> it.taskId == aId }
                            Long bRecency = taskRecencies.findIndexOf { it -> it.taskId == bId }
                            return aRecency <=> bRecency
                        }
                        if (aId) {
                            return -1
                        }
                        if (bId) {
                            return 1
                        }
                    }
                    return 0
                }
            }
        }

        List<Post> posts = []
        if (options.includePosts && canSearchGivenContext(options.contextType as String, 'post')) {
            posts = taskDAOService.getTasksForUser('', options.contextType as String, options.context as Long).findAll { t -> t.project.matter.organisation.id == currentUser.organisation.id }.collect { Task t ->
                t.posts.each { Post p -> p.task = t }
                return t.posts
            }.flatten().findAll { Post post ->
                (options.contextType == null ||
                        options.contextType ==
                        'matter' && isCorrectContextObject(options.context as Long, post.task.project.matterId) ||
                        options.contextType ==
                        'workstream' && isCorrectContextObject(options.context as Long, post.task.project.id) ||
                        options.contextType ==
                        'task' && isCorrectContextObject(options.context as Long, post.task.id) ||
                        options.contextType ==
                        'post' && isCorrectContextObject(options.context as Long, post.id)
                ) && taskAuthorisationService.hasReadAccess(post.task.id) &&
                        isMatch(post.url, query) || isMatch(post.name, query) /**|| isMatch(post.description, query)*/
            } as List<Post>
        }

        List<ProjectTemplate> templates = []
        if (options.includeTemplates && canSearchGivenContext(options.contextType as String, 'template')) {

            templates = ProjectTemplate.findAll().findAll { ProjectTemplate template ->
                (options.contextType == null || isCorrectContextObject(options.context as Long, template.id)) &&
                        template.organisationId == currentUser.organisationId && (
                        isMatch(template.name, query)
                        // || isMatch(template.description, query)
                )
            }
            if (templates.size() > 1) {
                List<ProjectTemplateRecency> templateRecency = recencyDAOService.getProjectTemplateRecenciesByUser(currentUser)
                templates.sort { a, b ->
                    Long aId = a.id
                    Long bId = b.id
                    if (aId && bId && aId != bId) {
                        if (aId && bId) {
                            Long aRecency = templateRecency.findIndexOf { it -> it.projectTemplateId == aId }
                            Long bRecency = templateRecency.findIndexOf { it -> it.projectTemplateId == bId }
                            return aRecency <=> bRecency
                        }
                        if (aId) {
                            return -1
                        }
                        if (bId) {
                            return 1
                        }
                    }
                    return 0
                }
            }
        }

        List<TaskTemplate> templateTasks = []
        if (options.includeTemplateTasks && canSearchGivenContext(options.contextType as String, 'templateTask')) {
            templateTasks = TaskTemplate.findAll().findAll { TaskTemplate task ->
                (
                        options.contextType == null || options.contextType ==
                                'template' && isCorrectContextObject(options.context as Long, task.projectTemplate.id) ||
                                options.contextType ==
                                'templateTask' && isCorrectContextObject(options.context as Long, task.id)
                ) &&
                        taskTemplateAuthorisationService.hasReadAccess(task.id, task.projectTemplate.id) && (
                        isMatch(task.name, query) ||
                                isMatch(task.noticeboardText, query)
                )
            }
        }


        List<Post> templatePosts = []
        if (options.includeTemplateTaskPosts && canSearchGivenContext(options.contextType as String, 'templateTaskPost')) {
            templatePosts = TaskTemplate.findAll().collect { TaskTemplate t ->
                t.posts.each { Post p -> p.taskTemplate = t }
                return t.posts
            }.flatten().collect { Hibernate.unproxy(it) }.findAll { Post post ->
                (options.contextType == null ||
                        options.contextType ==
                        'template' && isCorrectContextObject(options.context as Long, post.taskTemplate.projectTemplateId) ||
                        options.contextType ==
                        'templateTask' && isCorrectContextObject(options.context as Long, post.taskTemplate.id) ||
                        options.contextType ==
                        'templatePost' && isCorrectContextObject(options.context as Long, post.id)
                ) && taskTemplateAuthorisationService.hasReadAccess(post.taskTemplate.id, post.taskTemplate.projectTemplateId) &&
                        isMatch(post.url, query) || isMatch(post.name, query) /**|| isMatch(post.description, query)*/
            } as List<Post>
        }


        return convertResults(matters, workstreams, tasks, posts, templates, templateTasks, templatePosts)
    }

}
