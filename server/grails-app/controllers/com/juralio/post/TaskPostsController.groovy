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

package com.juralio.post

import com.juralio.auth.AppUser
import com.juralio.auth.UserRoleService
import com.juralio.common.APIErrorCodes
import com.juralio.common.ParameterValidatorService
import com.juralio.common.ValidatedParameterMap
import com.juralio.common.error.ErrorResponseHelperService
import com.juralio.organisation.OrganisationAuthorisationService
import com.juralio.post.exception.FinalisedPostEditException
import com.juralio.post.exception.InvalidLinkUrlException
import com.juralio.post.exception.PostContentTooLongException
import com.juralio.task.TaskService
import com.juralio.task.exception.InvalidDestinationParent
import grails.plugin.springsecurity.SpringSecurityService
import grails.plugin.springsecurity.annotation.Secured
import org.springframework.http.HttpStatus
import org.springframework.security.access.AccessDeniedException

import static org.springframework.http.HttpStatus.BAD_REQUEST

@Secured(['IS_AUTHENTICATED_FULLY'])
class TaskPostsController {

    static allowedMethods = [save: "POST", update: "PATCH", index: "GET", show: "GET", delete: "DELETE"]

    TaskPostsService taskPostsService
    TaskService taskService
    ErrorResponseHelperService errorResponseHelperService
    SpringSecurityService springSecurityService
    UserRoleService userRoleService
    OrganisationAuthorisationService organisationAuthorisationService

    def save() {
        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
        boolean isSysadmin = userRoleService.hasSysadminRole(currentUser)
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(currentUser.organisation.id)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }
        ValidatedParameterMap validatedBody = ParameterValidatorService.validate(request.JSON, [], ['name', 'description', 'privatePost', 'type', 'url', 'startTime', 'endTime', 'finalised'])
        try {
            Post post = taskPostsService.createTaskPost(
                    params.task_id as long,
                    params.project_id as long,
                    params.matter_id as long,
                    validatedBody.get("name") as String,
                    validatedBody.get("description") as String,
                    validatedBody.get("privatePost") as boolean,
                    validatedBody.get("type") as String,
                    validatedBody.get("url") as String,
                    validatedBody.get("startTime") as String,
                    validatedBody.get("endTime") as String,
                    validatedBody.get("finalised") as boolean
            )
            respond post, [status: HttpStatus.CREATED]
        }
        catch (FinalisedPostEditException | InvalidLinkUrlException | InvalidDestinationParent e) {
            render status: HttpStatus.BAD_REQUEST
            return
        }
    }

    def index() {
        List<Post> posts
        int limit = params.limit ? params.limit as int : 0
        if (params.previewSummary == 'true') {
            posts = taskPostsService.getPostsPreviewByTaskId(params.task_id as long, params.project_id as long, limit)
            respond posts, [status: HttpStatus.OK, view: '/post/_postPreviewList']
            return
        } else {
            posts = taskPostsService.getPostsByTaskId(params.task_id as long, params.project_id as long)
            respond posts, [status: HttpStatus.OK]
        }
    }

    def show() {
        Post post = taskPostsService.getPost(params.task_id as long, params.post_id as long, params.project_id as long)
        respond post, [status: HttpStatus.OK]
    }

    def update() {
        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
        boolean isSysadmin = userRoleService.hasSysadminRole(currentUser)
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(currentUser.organisation.id)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }
        ValidatedParameterMap validatedBody =
                ParameterValidatorService.validate(request.JSON, [], ['name', 'description', 'url', 'type', 'finalised', 'startTime', 'endTime', 'archive', 'userId', 'privatePost'])
        Post updatedPost
        Boolean parentIsNotRequired = taskService.isMarkedAsNotRequired(params.task_id as long, params.project_id as long)
        if (parentIsNotRequired) {
            render status: HttpStatus.BAD_REQUEST, text: 'Cannot edit notes of not-required tasks'
            return
        } else {
            try {
                if (request.JSON.archive == true) {
                    updatedPost = taskPostsService.archivePost(params.matter_id as long, params.project_id as long, params.task_id as long, params.post_id as long)
                } else {
                    updatedPost = taskPostsService.getPost(params.task_id as long, params.post_id as long, params.project_id as long)
                    taskPostsService.updatePost(updatedPost, validatedBody, params.task_id as long, params.project_id as long)
                }
            }
            catch (FinalisedPostEditException | InvalidLinkUrlException e) {
                render status: HttpStatus.BAD_REQUEST
                return
            }
            catch (PostContentTooLongException e) {
                respondWithError(APIErrorCodes.POST_CONTENT_TOO_LONG)
                return
            }
            catch (AccessDeniedException e) {
                render status: HttpStatus.FORBIDDEN
                return
            }
            respond updatedPost, status: HttpStatus.OK
        }
    }

    private def respondWithError(APIErrorCodes errorCode) {
        def errorResponse = errorResponseHelperService.getErrorResponseForDomainClass(Post, errorCode.code())
        respond errorResponse, [status: BAD_REQUEST]
    }
}