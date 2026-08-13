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

package com.juralio.post.archive

import com.juralio.auth.AppUser
import com.juralio.auth.UserRoleService
import com.juralio.common.MissingRequiredParameterException
import com.juralio.common.ParameterValidatorService
import com.juralio.organisation.OrganisationAuthorisationService
import com.juralio.post.exception.PostNotArchivedException
import com.juralio.post.exception.PostRestoreDestinationException
import grails.plugin.springsecurity.SpringSecurityService
import grails.plugin.springsecurity.annotation.Secured
import org.springframework.http.HttpStatus

@Secured(['IS_AUTHENTICATED_FULLY'])
class PostArchiveController {
    static allowedMethods = [index: "GET"]

    TaskPostsArchiveService taskPostsArchiveService
    SpringSecurityService springSecurityService
    UserRoleService userRoleService
    OrganisationAuthorisationService organisationAuthorisationService

    def index() {
        if (params.archived == "true") {
            respond taskPostsArchiveService.getArchivedPosts(params.matter_id as long), [status: HttpStatus.OK]
        } else {
            respond [:], status: HttpStatus.BAD_REQUEST
        }
    }

    def restore() {
        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
        boolean isSysadmin = userRoleService.hasSysadminRole(currentUser)
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(currentUser.organisation.id)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }
        try {
            def destinationMap = ParameterValidatorService.validate(request.JSON, ['matterId', 'projectId', 'taskId', 'type'], [])
            respond taskPostsArchiveService.restorePost(params.matterId as long, params.postId as long, destinationMap), status: HttpStatus.OK
        }
        catch (PostNotArchivedException exception) {
            respond [:], status: HttpStatus.NOT_ACCEPTABLE
        }
        catch (MissingRequiredParameterException exception) {
            respond [:], status: HttpStatus.BAD_REQUEST
        }
        catch (PostRestoreDestinationException exception) {
            respond [:], status: HttpStatus.BAD_REQUEST
        } catch (Exception ignored) {
            respond [:], status: HttpStatus.FORBIDDEN
        }
    }
}
