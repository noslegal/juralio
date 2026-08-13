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

package com.juralio.template.post

import com.juralio.auth.AppUser
import com.juralio.common.ValidatedParameterMap
import com.juralio.post.Post
import com.juralio.post.PostHelperService
import com.juralio.post.dao.TemplateTaskPostsDAOService
import com.juralio.post.exception.InvalidLinkUrlException
import com.juralio.template.TaskTemplate
import com.juralio.template.TaskTemplateAuthorisationService
import com.juralio.template.TaskTemplateService
import grails.gorm.transactions.Transactional
import grails.plugin.springsecurity.SpringSecurityService

@Transactional
class TemplateTaskPostsService {

    TaskTemplateService taskTemplateService
    SpringSecurityService springSecurityService
    TemplateTaskPostsDAOService templateTaskPostsDAOService
    PostHelperService postHelperService
    TaskTemplateAuthorisationService taskTemplateAuthorisationService

    Post createTemplateTaskPost(long templateId, long templateTaskId, String name, String description, boolean privatePost, String type, String url, String startTime, String endTime) throws InvalidLinkUrlException {
        if (!taskTemplateAuthorisationService.hasWriteAccess(templateTaskId,templateId)) {
            throw new Exception()
        }
        if (!postHelperService.isValidPostLinkURL(url)) {
            throw new InvalidLinkUrlException()
        }

        TaskTemplate templateTask = taskTemplateService.getTaskTemplateOnly(templateTaskId, templateId)
        AppUser currentUser = springSecurityService.getCurrentUser()

        return templateTaskPostsDAOService.createTemplateTaskPost(templateTask, name, description, currentUser, privatePost, type, url, templateId, startTime, endTime)
    }


    List<Post> getPostsByTemplateTaskId(long templateTaskId, long templateId) {
        if (!taskTemplateAuthorisationService.hasReadAccess(templateTaskId,templateId)) {
            throw new Exception()
        }
        TaskTemplate templateTask = taskTemplateService.getTaskTemplateOnly(templateTaskId, templateId)
        AppUser currentUser = springSecurityService.getCurrentUser()
        currentUser.hydrateRoles()
        if (!currentUser.roles.contains("ROLE_KNOWLEDGE_MANAGER") || (templateTask.projectTemplate.isSystemTemplate && !currentUser.roles.contains("ROLE_SYSTEM_TEMPLATE_MANAGER"))) {
            return templateTask.posts.findAll { it.finalised }.toArray()
        }
        return templateTask.posts.findAll().toArray()
    }

    Post getTemplatePost(long templateTaskId, long templatePostId, long templateId) {
        if (!taskTemplateAuthorisationService.hasReadAccess(templateTaskId,templatePostId,templateId)) {
            throw new Exception()
        }
        return templateTaskPostsDAOService.getPost(templatePostId)
    }

    Post updatePost(Post updatedPost, ValidatedParameterMap properties, long templateTaskId, long templateId) throws InvalidLinkUrlException {
        if (!taskTemplateAuthorisationService.hasWriteAccess(templateTaskId,updatedPost.id,templateId)) {
            throw new Exception()
        }
        if (!postHelperService.isValidPostLinkURL(properties['url'])) {
            throw new InvalidLinkUrlException()
        }
        updatedPost.properties = properties
        return updatedPost
    }

    def deletePost(long templateTaskId, long postId, long templateId) {
        if (!taskTemplateAuthorisationService.hasWriteAccess(templateTaskId,postId,templateId)) {
            throw new Exception()
        }
        TaskTemplate templateTask = taskTemplateService.getTaskTemplateOnly(templateTaskId, templateId)
        Post post = templateTaskPostsDAOService.getPost(postId)
        templateTask.posts.remove(post)
        post.delete()
    }
}
