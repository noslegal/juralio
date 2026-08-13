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

package com.juralio.organisationgroup

import com.juralio.auth.AppUser
import com.juralio.auth.UserRoleService
import com.juralio.common.ParameterValidatorService
import com.juralio.common.ValidatedParameterMap
import com.juralio.matter.MatterAuthorisationService
import com.juralio.organisation.Organisation
import com.juralio.organisation.OrganisationAuthorisationService
import com.juralio.organisation.dao.OrganisationDAOService
import grails.plugin.springsecurity.SpringSecurityService
import grails.plugin.springsecurity.annotation.Secured
import grails.rest.*
import grails.converters.*
import org.springframework.http.HttpStatus

@Secured('IS_AUTHENTICATED_FULLY')
class MatterGroupPositionController {
    SpringSecurityService springSecurityService
    OrganisationAuthorisationService organisationAuthorisationService
    UserRoleService userRoleService
    MatterAuthorisationService matterAuthorisationService
    MatterGroupPositionService matterGroupPositionService

    static allowedMethods = [update: "PATCH", list:"GET",delete:'DELETE']

    def list(){

    }

    @Secured(['IS_AUTHENTICATED_FULLY'])
    def update(long matter_id){
        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
        boolean isSysadmin = userRoleService.hasSysadminRole(currentUser)

        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(currentUser.organisation.id)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }

        if(!matterAuthorisationService.hasReadAccessAndIsMatterAdmin(matter_id)){
            respond([text: 'No access'], status: HttpStatus.FORBIDDEN)
            return
        }
        ValidatedParameterMap validatedBody = ParameterValidatorService.validate(request.JSON, [], ['groupId', 'positionId'])
        if (!validatedBody.groupId) {
            respond [:], status: HttpStatus.BAD_REQUEST
        } else if (!validatedBody.positionId) {
            respond [:], status: HttpStatus.BAD_REQUEST
        } else {
            matterGroupPositionService.updateGroupPositionInMatter(matter_id, validatedBody)
            respond Status: HttpStatus.OK
        }
    }

    @Secured(['IS_AUTHENTICATED_FULLY'])
    def delete(long matter_id,long groupId){
        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
        boolean isSysadmin = userRoleService.hasSysadminRole(currentUser)

        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(currentUser.organisation.id)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }
        if(!matterAuthorisationService.hasReadAccessAndIsMatterAdmin(matter_id)){
            respond([text: 'No access'], status: HttpStatus.FORBIDDEN)
            return
        }
        matterGroupPositionService.deleteGroupFromMatter(matter_id, groupId)
        respond Status: HttpStatus.OK
    }
}
