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
import com.juralio.post.Post
import com.juralio.templateResource.TemplateResource
import grails.gorm.transactions.Transactional
import grails.plugin.springsecurity.SpringSecurityService
import groovy.transform.CompileDynamic
import groovy.transform.CompileStatic

@CompileStatic
class ProjectTemplateOverview {
    long id
    String name
    String description
    String referenceNumber

    Date dateCreated
    Date lastUpdated

    boolean isFavourited

    boolean published
    boolean isSystemTemplate
    String providedBy
    long taskCount = -1
    long postCount = -1
    long publishedPostCount = -1
    List posts = []
    boolean isInitialTemplate = false
    List<TemplateResource> resources = []
    String url
    String urlCredit
    List<String> urlTags = []
    String urlCreditName
    String companyImage
    Boolean companyImageBackground
    Date systemTemplateLastUpdated
    Long systemTemplateUpdateCount =0
}

@Transactional
class ProjectTemplateOverviewService {

    SpringSecurityService springSecurityService

    ProjectTemplateOverview constructProjectTemplateOverview(ProjectTemplate template, boolean includePostCount = true, boolean isFavourited) {
        ProjectTemplateOverview overview = new ProjectTemplateOverview()
        if (template.isSystemTemplate) {
            TemplateProviderSource templateProvider = TemplateProviderSource.findByNewTemplate(template)
            if (templateProvider != null) {
                overview.providedBy = templateProvider.name
            }
            overview.systemTemplateLastUpdated = template.systemTemplateLastUpdated
            overview.systemTemplateUpdateCount = template.systemTemplateUpdateCount
        }
        overview.id = template.id as long
        overview.name = template.name
        overview.description = template.description
        overview.referenceNumber = template.referenceNumber
        overview.isSystemTemplate = template.isSystemTemplate
        overview.resources = template.resources
        if (includePostCount) overview.postCount = getPostCount(template)
        if (includePostCount) overview.publishedPostCount = getPublishedPostCount(template)
        overview.taskCount = template.tasks.size()

        overview.dateCreated = template.dateCreated
        overview.lastUpdated = template.lastUpdated

        overview.published = template.published

        overview.isFavourited = isFavourited
        overview.url = template.url
        overview.urlCredit = template.urlCredit
        overview.urlCreditName = template.urlCreditName
        overview.companyImage = template.companyImage
        overview.companyImageBackground = template.companyImageBackground
        overview.urlTags = template.urlTags.collect{it.projectTemplateImageTag}
        return overview
    }

    ProjectTemplateOverview constructProjectTemplateOverviewWithPosts(ProjectTemplate template, boolean includePostCount = true, boolean isFavourited) {
        ProjectTemplateOverview overview = new ProjectTemplateOverview()
        overview.id = template.id as long
        overview.name = template.name
        overview.description = template.description
        overview.referenceNumber = template.referenceNumber
        overview.isSystemTemplate = template.isSystemTemplate
        overview.resources = template.resources


        if (includePostCount) overview.postCount = getPostCount(template)
        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
        currentUser.hydrateRoles()
        List<Post> postList = getPosts(template)
        if (!currentUser.roles.contains("ROLE_KNOWLEDGE_MANAGER")) {
            postList.forEach {
                post ->
                    if (post['finalised'] == true)
                        overview.posts.add(post)
            }
        } else if (template.isSystemTemplate && !currentUser.roles.contains("ROLE_SYSTEM_TEMPLATE_MANAGER")) {
            postList.forEach {
                post ->
                    if (post['finalised'] == true)
                        overview.posts.add(post)
            }
        } else {
            overview.posts = postList.findAll()
        }

        overview.taskCount = template.tasks.size()

        overview.dateCreated = template.dateCreated
        overview.lastUpdated = template.lastUpdated

        overview.published = template.published

        overview.isFavourited = isFavourited
        overview.urlTags = template.urlTags


        return overview
    }

    @CompileDynamic
    private List<Post> getPosts(ProjectTemplate template) {
        List<Post> posts = []

        template.tasks.each { TaskTemplate task ->
            if (!task) {
                null
            } else {
                task.posts ? task.posts.each { post ->
                    Map postDetails = [:]
                    Map creator = [:]
                    creator.firstname = post.creator.firstname
                    creator.lastname = post.creator.lastname

                    postDetails.id = post.id
                    postDetails.creator = creator
                    postDetails.name = post.name
                    postDetails.type = post.type
                    postDetails.dateCreated = post.dateCreated
                    postDetails.lastUpdated = post.lastUpdated
                    postDetails.referenceNumber = post.referenceNumber
                    postDetails.finalised = post.finalised
                    postDetails.taskId = task.id
                    posts.add(postDetails)
                } : null
            }
        }
        return posts
    }

    private long getPostCount(ProjectTemplate template) {
        long postCount = 0

        template.tasks.each { TaskTemplate task ->
            if (task != null) {
                postCount += task.posts ? task.posts.size() : 0
            }
        }
        return postCount
    }

    private long getPublishedPostCount(ProjectTemplate template) {
        long postCount = 0
        template.tasks.each { TaskTemplate task ->
            if (task != null) {
                postCount += task.posts.findAll {it.finalised==true} ? task.posts.findAll {it.finalised==true}.size() : 0
            }
        }
        return postCount
    }
}