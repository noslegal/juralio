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

package com.juralio.post.members

import com.juralio.auth.AppUser
import com.juralio.auth.UserRoleService
import com.juralio.organisation.OrganisationAuthorisationService
import com.juralio.post.exception.NoValidUserException
import com.juralio.post.member.PostMemberService
import grails.plugin.springsecurity.SpringSecurityService
import grails.plugin.springsecurity.annotation.Secured
import org.springframework.http.HttpStatus

@Secured(['IS_AUTHENTICATED_FULLY'])
class DeletePostMemberController {
    PostMemberService postMemberService
    SpringSecurityService springSecurityService
    UserRoleService userRoleService
    OrganisationAuthorisationService organisationAuthorisationService
    static allowedMethods = [delete: "DELETE"]

    def delete(long user_id, long post_id, long task_id) {
        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
        boolean isSysadmin = userRoleService.hasSysadminRole(currentUser)
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(currentUser.organisation.id)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }
        try {
            if(request.JSON.user?.isPlaceholder==true){
                if (postMemberService.removePlaceholderPostMember(user_id, task_id, post_id, params.project_id as long)) {
                    render(status: HttpStatus.NO_CONTENT)
                } else {
                    render(status: HttpStatus.NOT_FOUND)
                }
            }else {
                if (postMemberService.removePostMember(user_id, task_id, post_id, params.project_id as long)) {
                    render(status: HttpStatus.NO_CONTENT)
                } else {
                    render(status: HttpStatus.NOT_FOUND)
                }
            }

        }
        catch (NoValidUserException e) {
            println(e)
            render status: HttpStatus.FORBIDDEN, text: e.message
        }
        catch (Exception e) {
            println(e)
            render status: HttpStatus.FORBIDDEN, text: e.message
        }
    }
}