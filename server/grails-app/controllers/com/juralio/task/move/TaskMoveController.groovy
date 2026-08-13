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

package com.juralio.task.move

import com.juralio.auth.AppUser
import com.juralio.auth.UserRoleService
import com.juralio.organisation.OrganisationAuthorisationService
import com.juralio.project.Project
import com.juralio.project.ProjectService
import com.juralio.task.Task
import com.juralio.task.TaskMoveType
import com.juralio.task.TaskService
import com.juralio.task.exception.InvalidDestinationParent
import com.juralio.task.exception.MaximumTasksExceededException
import grails.plugin.springsecurity.SpringSecurityService
import grails.plugin.springsecurity.annotation.Secured
import org.springframework.http.HttpStatus
import org.springframework.security.access.AccessDeniedException

import static org.springframework.http.HttpStatus.BAD_REQUEST
import static org.springframework.http.HttpStatus.OK

@Secured(['IS_AUTHENTICATED_FULLY'])
class TaskMoveController {

    static allowedMethods = [move: "POST"]

    TaskMoveService taskMoveService
    TaskService taskService
    ProjectService projectService
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
        Task taskToMove = taskService.getTaskOnly(params.id as long, params.project_id as long)
        Long destinationProjectId = request.JSON.destinationProjectId ? request.JSON.destinationProjectId as long : params.project_id as long
        Project destinationProject = projectService.getProjectWithLevelA(destinationProjectId as long)
        Project sourceProject = destinationProjectId == params.project_id ? destinationProject : projectService.getProjectWithLevelA(params.project_id as long)
        def maintainTaskConsistency = request.JSON.maintainTaskConsistency || false

        TaskMoveType moveType = TaskMoveType.CROSS_PROJECT_DIFFERENT_PARENT
        if (request.JSON.destinationParentType) {
            moveType = request.JSON.destinationParentType as TaskMoveType
        }

        if (request.JSON.destinationParentType && taskToMove) {
            try {
                def res = taskMoveService.moveTask(taskToMove,
                        moveType,
                        request.JSON.destinationParentId as Long,
                        sourceProject,
                        destinationProject,
                        maintainTaskConsistency)

                if (res in Task) {
                    respond taskToMove, [status: OK, view: '/task/_task']
                } else {
                    respond res, status: HttpStatus.CONFLICT
                }
            } catch (AccessDeniedException | InvalidDestinationParent exception) {
                respond([text: exception.message], status: HttpStatus.BAD_REQUEST)
            } catch (MaximumTasksExceededException maximumTasksExceededException) {
                respond(message: maximumTasksExceededException.getMessage(), status: BAD_REQUEST, error_type: 'TASK_LIMIT')
            }
            catch (Exception exception) {
                def error = exception.message ? exception.message : exception.undeclaredThrowable.message
                respond([text: error], status: HttpStatus.BAD_REQUEST)
            }
        } else {
            respond taskToMove, [status: HttpStatus.BAD_REQUEST]
        }
    }
}