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
import com.juralio.post.exception.DuplicateAuthorException
import grails.plugin.springsecurity.SpringSecurityService
import grails.plugin.springsecurity.annotation.Secured
import groovy.transform.CompileStatic
import org.springframework.http.HttpStatus

@Secured(['ROLE_USER'])
@CompileStatic
class PostAuthorController {
    PostAuthorService postAuthorService
    SpringSecurityService springSecurityService
    UserRoleService userRoleService
    OrganisationAuthorisationService organisationAuthorisationService
    static allowedMethods = [save: "POST"]

    def save(SaveAuthor payload, long task_id, long post_id) {
        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
        boolean isSysadmin = userRoleService.hasSysadminRole(currentUser)
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(currentUser.organisation.id)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }
        try {
            PostAuthor postAuthor = postAuthorService.addPostAuthor(payload.userId, task_id, post_id, params.project_id as long)
            respond postAuthor.user, status: HttpStatus.OK
        } catch (DuplicateAuthorException exception) {
            log.debug(exception.message)
            respond exception.message, [status: HttpStatus.BAD_REQUEST]
        }
    }
}

@CompileStatic
class SaveAuthor {
    long userId
}