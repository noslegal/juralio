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

package com.juralio.matter

import com.juralio.auth.AppUser
import com.juralio.auth.UserRoleService
import com.juralio.common.ParameterValidatorService
import com.juralio.common.UserDecoratorService
import com.juralio.common.ValidatedParameterMap
import com.juralio.project.ProjectAuthorisationService
import com.juralio.task.Task
import com.juralio.task.team.TaskTeamMember
import grails.plugin.springsecurity.SpringSecurityService
import grails.plugin.springsecurity.annotation.Secured
import org.springframework.http.HttpStatus

@Secured(['IS_AUTHENTICATED_FULLY'])
class PlaceholdersController {
    static allowedMethods = [index: "GET", save: "POST", show: "GET", patch: "PATCH", getTasks: 'GET']

    SpringSecurityService springSecurityService
    MatterService matterService
    PlaceholdersService placeholdersService
    UserRoleService userRoleService
    ProjectAuthorisationService projectAuthorisationService
    MatterAuthorisationService matterAuthorisationService
    UserDecoratorService userDecoratorService


    def index(long matter_id, long id) {
        Placeholders placeholder = placeholdersService.getPlaceholder(id, matter_id)
        if (placeholder) {
            List<Task> assignedTasks = placeholdersService.getPlaceholderUsageMatter(matter_id, id)
            placeholder.taskCount = assignedTasks.size()
            respond placeholder, [Status: HttpStatus.OK, view: '/placeholders/_placeholderWithTasks']
        } else {
            respond [:], status: HttpStatus.BAD_REQUEST
        }
    }

    def show(long matter_id) {
        List<Placeholders> placeholdersForMatter = placeholdersService.getAllPlaceholdersForMatter(matter_id)
        if (placeholdersForMatter.size() >= 0) {
            respond placeholdersForMatter, [Status: HttpStatus.OK, view: '/placeholders/_placeholderWithTasksList']
        } else {
            respond [:], status: HttpStatus.BAD_REQUEST
        }

    }

    def getTasks(long matter_id, long id) {
        Placeholders placeholder = placeholdersService.getPlaceholder(id, matter_id)
        if (placeholder) {
            List<Task> assignedTasks = placeholdersService.getPlaceholderUsageMatter(matter_id, id)
            respond assignedTasks, Status: HttpStatus.OK
        } else {
            respond [:], status: HttpStatus.BAD_REQUEST
        }
    }

    def save(long matter_id) {
        AppUser currentUser = springSecurityService.getCurrentUser()

        if (projectAuthorisationService.hasUpdateAccess(matter_id)) {
            ValidatedParameterMap validatedBody = ParameterValidatorService.validate(request.JSON, [], ['firstName', 'lastName', 'emailAddress', 'taskId', 'postId'])
            if (!validatedBody.firstName) {
                respond [:], status: HttpStatus.BAD_REQUEST
            } else if (!validatedBody.lastName) {
                respond [:], status: HttpStatus.BAD_REQUEST
            } else if (!matter_id) {
                respond [:], status: HttpStatus.BAD_REQUEST
            } else {
                Matter parentMatter = matterService.getMatter(matter_id)
                if (!parentMatter) {
                    respond [:], status: HttpStatus.BAD_REQUEST
                }
                if (validatedBody.postId) {
                    respond placeholdersService.createPlaceholder(validatedBody, currentUser, parentMatter)
                } else if (validatedBody.taskId) {
                    TaskTeamMember placeholder = placeholdersService.createPlaceholder(validatedBody, currentUser, parentMatter)
                    def addedTeamMember = new AppUser(firstname: placeholder.placeholder.firstName, lastname: placeholder.placeholder.lastName, enabled: placeholder.placeholder.enabled)
                    addedTeamMember.username = placeholder.placeholder.emailAddress != null ? placeholder.placeholder.emailAddress : ''
                    addedTeamMember.id = placeholder.placeholder.id
                    addedTeamMember.isPlaceholder = true
                    respond addedTeamMember, [status: HttpStatus.OK]
                } else {
                    respond placeholdersService.createPlaceholder(validatedBody, currentUser, parentMatter)
                }

            }
        } else {
            respond [:], status: HttpStatus.FORBIDDEN
        }


    }

    def patch(long id, long matter_id) {
        if (projectAuthorisationService.isMatterAdmin(matter_id)) {
            Placeholders placeholderToUpdate = placeholdersService.getPlaceholder(id, matter_id)
            if (placeholderToUpdate) {
                ValidatedParameterMap validatedBody = ParameterValidatorService.validate(request.JSON, [], ['firstName', 'lastName', 'emailAddress'])
                if (validatedBody.firstName == '' || validatedBody.firstName.length() > 30) {
                    respond [:], status: HttpStatus.BAD_REQUEST
                } else if (validatedBody.lastName == '' || validatedBody.lastName.length() > 30) {
                    respond [:], status: HttpStatus.BAD_REQUEST
                }
                respond placeholdersService.updatePlaceholder(placeholderToUpdate, validatedBody)
            } else {
                respond [:], status: HttpStatus.BAD_REQUEST
            }
        } else {
            respond [:], status: HttpStatus.FORBIDDEN
        }
    }

    def merge(long matter_id){
        if(matterAuthorisationService.hasUpdateAccess(matter_id)) {
            try {
                ValidatedParameterMap validatedBody = ParameterValidatorService.validate(request.JSON as Map, ['masterPlaceholderId', 'minorPlaceholderId'], [])
                Long masterPlaceholderId = request.JSON.masterPlaceholderId as Long
                Long minorPlaceholderId = request.JSON.minorPlaceholderId as Long
                placeholdersService.merge(masterPlaceholderId, minorPlaceholderId)
                respond [:], status: HttpStatus.OK 
            } catch (Exception e) {
                respond [:], status: HttpStatus.BAD_REQUEST
            }
        } else{
            respond [:], status: HttpStatus.FORBIDDEN
        }
    }


    def disable(long id, long matter_id) {
        if (projectAuthorisationService.isMatterAdmin(matter_id)) {
            Placeholders placeholderToUpdate = placeholdersService.getPlaceholder(id, matter_id)
            if (placeholderToUpdate) {
                respond placeholdersService.disablePlaceholder(placeholderToUpdate)
            } else {
                respond [:], status: HttpStatus.BAD_REQUEST
            }
        } else {
            respond [:], status: HttpStatus.FORBIDDEN
        }
    }
}
