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

package com.juralio.task.archive

import com.juralio.auth.AppUser
import com.juralio.auth.UserRoleService
import com.juralio.organisation.OrganisationAuthorisationService
import com.juralio.task.Task
import com.juralio.task.TaskService
import com.juralio.task.exception.MaximumTasksExceededException
import com.juralio.task.exception.TaskCannotBeUnarchivedException
import grails.plugin.springsecurity.SpringSecurityService
import grails.plugin.springsecurity.annotation.Secured
import org.springframework.http.HttpStatus
import org.springframework.security.access.AccessDeniedException

import static org.springframework.http.HttpStatus.BAD_REQUEST

@Secured(['IS_AUTHENTICATED_FULLY'])
class TaskArchiveController {

    static allowedMethods = [index: "GET", archive: "POST", unarchive: "POST"]

    TaskArchiveService taskArchiveService
    SpringSecurityService springSecurityService
    UserRoleService userRoleService
    OrganisationAuthorisationService organisationAuthorisationService
    TaskService taskService

    def index() {
        try {
            List<Task> tasks = taskArchiveService.listArchivedTasks(params.matter_id as long)
            respond tasks, [status: HttpStatus.OK, view: '/task/_archivedTaskList']
        } catch (AccessDeniedException e) {
            render status: HttpStatus.BAD_REQUEST
        }
    }

    def archive() {
        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
        boolean isSysadmin = userRoleService.hasSysadminRole(currentUser)
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(currentUser.organisation.id)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }
        try {
            taskArchiveService.archive(params.project_id as long, params.id as long)
            render status: HttpStatus.OK
        } catch (TaskCannotBeUnarchivedException exception) {
            render status: HttpStatus.BAD_REQUEST, text: exception.message
        } catch (AccessDeniedException exception) {
            render status: HttpStatus.FORBIDDEN, text: exception.message
        } catch (Exception exception) {
            def error = exception.message ? exception.message : exception.undeclaredThrowable.message
            render status: HttpStatus.BAD_REQUEST, text: error
        }
    }

    def unarchive() {
        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
        boolean isSysadmin = userRoleService.hasSysadminRole(currentUser)
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(currentUser.organisation.id)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }
        try {
            def res = taskArchiveService.unarchive(
                    params.id as long,
                    params.project_id as long,
                    request.JSON.destinationProjectId ? request.JSON.destinationProjectId : TaskArchiveService.UNSET as long,
                    request.JSON.destinationParentId != null ? request.JSON.destinationParentId : TaskArchiveService.UNSET as long,
                    request.JSON.maintainTaskConsistency != null ? request.JSON.maintainTaskConsistency : false as boolean)

            if (res != null) {
                respond res, status: HttpStatus.CONFLICT
            } else {
                respond [:], status: HttpStatus.OK
            }
        } catch (TaskCannotBeUnarchivedException exception) {
            respond([text: exception.message], status: HttpStatus.BAD_REQUEST)
        }
        catch (AccessDeniedException exception) {
            respond([text: exception.message], status: HttpStatus.FORBIDDEN)
        }
        catch (MaximumTasksExceededException maximumTasksExceededException) {
            respond(message: maximumTaskExceededException.getMessage(), status: BAD_REQUEST, error_type: 'TASK_LIMIT')
        }
        catch (Exception exception) {
            def error = exception.message ? exception.message : exception.undeclaredThrowable.message
            respond([text: error], status: HttpStatus.BAD_REQUEST)
        }
    }
}