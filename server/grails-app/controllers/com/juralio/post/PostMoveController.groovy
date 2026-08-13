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
import com.juralio.common.ParameterValidatorService
import com.juralio.common.ValidatedParameterMap
import com.juralio.organisation.OrganisationAuthorisationService
import com.juralio.post.dao.TaskPostsDAOService
import com.juralio.project.Project
import com.juralio.task.Task
import com.juralio.task.TaskService
import com.juralio.task.status.TaskStatus
import grails.plugin.springsecurity.SpringSecurityService
import grails.plugin.springsecurity.annotation.Secured
import org.springframework.http.HttpStatus

@Secured(['IS_AUTHENTICATED_FULLY'])
class PostMoveController {

    static allowedMethods = [move: "POST"]

    TaskService taskService
    TaskPostsDAOService taskPostsDAOService
    PostMoveService postMoveService
    TaskPostsAuthorisationService taskPostsAuthorisationService
    SpringSecurityService springSecurityService
    UserRoleService userRoleService
    OrganisationAuthorisationService organisationAuthorisationService

    def move() {
        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
        boolean isSysadmin = userRoleService.hasSysadminRole(currentUser)
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(currentUser.organisation.id)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }
        long postId = params.post_id as long
        long taskId = params.task_id as long
        long projectId = params.project_id as long

        ValidatedParameterMap validatedBody = ParameterValidatorService.validate(request.JSON, ['newTaskId'], [])
        long destinationTaskId = validatedBody.get("newTaskId")


        if (!taskPostsAuthorisationService.isValidTaskParent(taskId, postId)) {
            render status: HttpStatus.FORBIDDEN
            return
        }

        Post postToMove = taskPostsDAOService.getPost(postId)
        Task oldTask = taskService.getTaskOnly(taskId, projectId)
        Task foundTask = Task.get(destinationTaskId)
        Task newTask = taskService.getTaskOnly(destinationTaskId, foundTask.projectId)

        if (foundTask.status == TaskStatus.NOT_REQUIRED.value()) {
            render status: HttpStatus.BAD_REQUEST
            return
        }
        if(foundTask.project.postCount> Project.MAXIMUM_POSTS){
            render status: HttpStatus.BAD_REQUEST
        }

        if (postToMove) {
            postMoveService.movePost(postToMove, oldTask, newTask)
            respond postToMove, [status: HttpStatus.OK]
        } else {
            render status: HttpStatus.BAD_REQUEST
        }
    }
}