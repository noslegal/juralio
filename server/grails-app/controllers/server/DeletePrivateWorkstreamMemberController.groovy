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

package server

import com.juralio.auth.AppUser
import com.juralio.auth.UserRoleService
import com.juralio.auth.UserService
import com.juralio.matter.Matter
import com.juralio.matter.MatterService
import com.juralio.organisation.OrganisationAuthorisationService
import grails.plugin.springsecurity.SpringSecurityService
import grails.plugin.springsecurity.annotation.Secured
import org.springframework.http.HttpStatus

@Secured(['IS_AUTHENTICATED_FULLY'])
class DeletePrivateWorkstreamMemberController {

    static allowedMethods = [deleteFromAllWorkstreams: "DELETE"]

    PrivateWorkstreamMemberService privateWorkstreamMemberService
    MatterService matterService
    SpringSecurityService springSecurityService
    UserService userService
    UserRoleService userRoleService
    OrganisationAuthorisationService organisationAuthorisationService


    def deleteFromAllWorkstreams() {
        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
        boolean isSysadmin = userRoleService.hasSysadminRole(currentUser)
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(currentUser.organisationId)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }
        try {
            long userId = params.id as long
            long matterId = params.matter_id as long
            AppUser userToDelete = userService.getUserById(userId)
            boolean isMatterAdmin = matterService.isMatterAdmin(matterId, currentUser.id)
            Matter matter = matterService.getMatterOnly(matterId)
            if (!isMatterAdmin) {
                throw new Exception('')
            }

            if (privateWorkstreamMemberService.removeUserFromAllTeams(userToDelete, matter)) {
                respond status: HttpStatus.OK
            }
        } catch (Exception e) {
            render status: HttpStatus.BAD_REQUEST
        }
    }
}
