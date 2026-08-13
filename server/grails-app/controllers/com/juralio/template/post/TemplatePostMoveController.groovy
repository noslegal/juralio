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
import com.juralio.template.post.TemplatePostMoveService
import grails.plugin.springsecurity.SpringSecurityService
import grails.plugin.springsecurity.annotation.Secured
import groovy.transform.CompileStatic
import org.springframework.http.HttpStatus

@CompileStatic
@Secured(['IS_AUTHENTICATED_FULLY'])
class TemplatePostMoveController {

    static allowedMethods = [move: "POST"]

    TemplatePostMoveService templatePostMoveService
    SpringSecurityService springSecurityService
    UserRoleService userRoleService
    OrganisationAuthorisationService organisationAuthorisationService

    def move(long templateId, long templateTaskId, long templatePostId) {
        AppUser appUser = springSecurityService.getCurrentUser() as AppUser
        boolean isSysadmin = userRoleService.hasSysadminRole(appUser)
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(appUser.organisation.id)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }
        ValidatedParameterMap validatedBody = ParameterValidatorService.validate(request.JSON as Map, ['newTaskId'], [])
        long destinationTaskId = validatedBody.get("newTaskId") as long

        try {
            Post postToMove = templatePostMoveService.movePost(templateId, templateTaskId, destinationTaskId, templatePostId)
            respond postToMove, [status: HttpStatus.OK]
        } catch (Exception exception) {
            render status: HttpStatus.BAD_REQUEST
        }
    }
}