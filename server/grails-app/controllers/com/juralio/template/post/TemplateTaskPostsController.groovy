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
import com.juralio.auth.UserRoleService
import com.juralio.common.ParameterValidatorService
import com.juralio.common.ValidatedParameterMap
import com.juralio.organisation.OrganisationAuthorisationService
import com.juralio.post.Post
import com.juralio.post.exception.InvalidLinkUrlException
import grails.gorm.transactions.Transactional
import grails.plugin.springsecurity.SpringSecurityService
import grails.plugin.springsecurity.annotation.Secured
import org.springframework.http.HttpStatus
import org.springframework.security.access.AccessDeniedException

import static org.springframework.http.HttpStatus.OK

@Secured(['ROLE_USER'])
class TemplateTaskPostsController {

    static allowedMethods = [show: "GET", index: "GET", save: "POST", update: "PATCH", delete: "DELETE"]

    TemplateTaskPostsService templateTaskPostsService
    SpringSecurityService springSecurityService
    UserRoleService userRoleService
    OrganisationAuthorisationService organisationAuthorisationService

    def save(long templateId, long templateTaskId) {
        AppUser appUser = springSecurityService.getCurrentUser()
        boolean isSysadmin = userRoleService.hasSysadminRole(appUser)
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(appUser.organisation.id)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }
        try {
            Post post = templateTaskPostsService.createTemplateTaskPost(
                    templateId,
                    templateTaskId,
                    request.JSON.name,
                    request.JSON.description,
                    false,
                    request.JSON.type,
                    request.JSON.url,
                    request.JSON.startTime,
                    request.JSON.endTime
            )
            respond post, [status: HttpStatus.CREATED]
        }
        catch (InvalidLinkUrlException e) {
            render status: HttpStatus.BAD_REQUEST
        }
    }

    @Transactional
    def index(long templateTaskId) {
        List<Post> posts = templateTaskPostsService.getPostsByTemplateTaskId(templateTaskId, params.templateId as long)
        respond posts, [status: HttpStatus.OK]
    }

    def show(long templateTaskId, long templatePostId) {
        try {
            Post post = templateTaskPostsService.getTemplatePost(templateTaskId, templatePostId, params.templateId as long)
            respond post, [status: HttpStatus.OK]
        } catch (AccessDeniedException e) {
            render status: HttpStatus.BAD_REQUEST
            return
        }
    }

    def update(long templateTaskId, long templatePostId) {
        AppUser appUser = springSecurityService.getCurrentUser()
        boolean isSysadmin = userRoleService.hasSysadminRole(appUser)
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(appUser.organisation.id)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }
        Post updatedPost = templateTaskPostsService.getTemplatePost(templateTaskId, templatePostId, params.templateId as long)
        ValidatedParameterMap validatedBody = ParameterValidatorService.validate(request.JSON, [], ['name', 'description', 'url', 'type', 'finalised', 'startTime', 'endTime'])
        try {
            updatedPost = templateTaskPostsService.updatePost(updatedPost, validatedBody, templateTaskId, params.templateId as long)
        }
        catch (InvalidLinkUrlException e) {
            render status: HttpStatus.BAD_REQUEST
            return
        }

        respond updatedPost, [status: HttpStatus.OK]
    }

    def delete(long templateTaskId, long templatePostId) {
        AppUser appUser = springSecurityService.getCurrentUser()
        boolean isSysadmin = userRoleService.hasSysadminRole(appUser)
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(appUser.organisation.id)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }
        try {
            templateTaskPostsService.deletePost(templateTaskId, templatePostId, params.templateId as long)
            render status: HttpStatus.OK
        } catch (AccessDeniedException e) {
            render status: HttpStatus.FORBIDDEN
        }
    }
}