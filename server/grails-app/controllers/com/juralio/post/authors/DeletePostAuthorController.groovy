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

package com.juralio.post.authors

import com.juralio.auth.AppUser
import com.juralio.auth.UserRoleService
import com.juralio.organisation.OrganisationAuthorisationService
import com.juralio.post.author.PostAuthorService
import com.juralio.post.exception.SoleAuthorDeletionAttemptException
import grails.plugin.springsecurity.SpringSecurityService
import grails.plugin.springsecurity.annotation.Secured
import org.springframework.http.HttpStatus

@Secured(['IS_AUTHENTICATED_FULLY'])
class DeletePostAuthorController {
    static allowedMethods = [delete: "DELETE"]
    SpringSecurityService springSecurityService
    UserRoleService userRoleService
    OrganisationAuthorisationService organisationAuthorisationService
    PostAuthorService postAuthorService

    def delete(long userId, long taskId, long postId) {
        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
        boolean isSysadmin = userRoleService.hasSysadminRole(currentUser)
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(currentUser.organisation.id)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }
        try {
            if (postAuthorService.removePostAuthor(userId, taskId, postId, params.projectId as long)) {
                render(status: HttpStatus.NO_CONTENT)
            } else {
                render(status: HttpStatus.NOT_FOUND)
            }
        } catch (SoleAuthorDeletionAttemptException e) {
            render status: HttpStatus.FORBIDDEN, text: e.message
        }
    }
}