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
import com.juralio.auth.UserService
import com.juralio.costs.OtherCost
import com.juralio.matter.Matter
import com.juralio.matter.MatterService
import com.juralio.matter.costs.MatterCosts
import com.juralio.organisation.OrganisationAuthorisationService
import grails.gorm.transactions.Transactional
import grails.plugin.springsecurity.SpringSecurityService
import grails.plugin.springsecurity.annotation.Secured
import org.springframework.http.HttpStatus
import org.springframework.security.access.AccessDeniedException

@Transactional
@Secured(['IS_AUTHENTICATED_FULLY'])
class MatterCostsController {
    static allowedMethods = [save: "POST", delete: "DELETE"]

    SpringSecurityService springSecurityService
    UserRoleService userRoleService
    OrganisationAuthorisationService organisationAuthorisationService
    MatterCostsService matterCostsService
    CostsAuthorisationService costsAuthorisationService
    UserService userService
    MatterService matterService

    def save() {
        AppUser currentUser = springSecurityService.getCurrentUser()
        boolean isSysadmin = userRoleService.hasSysadminRole(currentUser)
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(currentUser.organisationId)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }
        try {
            def addedUsers
            AppUser user = userService.getUserById(request.JSON.id)
                if (costsAuthorisationService.orgCostsSetupForMatterPosition(currentUser, matterService.getMatterOnly(request.JSON.matter as long))) {
                    addedUsers = [matterCostsService.save(request.JSON.matter as long, request.JSON.id as long)]
                } else {
                    throw new Exception()
                }
            respond addedUsers, [status: HttpStatus.OK, view: '/matterCosts/_matterCostsList']
        }
        catch (AccessDeniedException exception) {
            render status: HttpStatus.FORBIDDEN
        }
        catch (Exception exception) {
            render status: HttpStatus.BAD_REQUEST
        }
    }

    def delete() {
        AppUser currentUser = springSecurityService.getCurrentUser()
        boolean isSysadmin = userRoleService.hasSysadminRole(currentUser)
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(currentUser.organisationId)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }
        try {
            if (costsAuthorisationService.orgCostsSetupForMatterPosition(currentUser, matterService.getMatterOnly(params.matter_id as long))) {
                matterCostsService.delete(params.matter_id as long, params.id as long)
                respond status: HttpStatus.OK
            } else {
                throw new Exception()
            }
        }
        catch (AccessDeniedException exception) {
            render status: HttpStatus.FORBIDDEN
        }
        catch (Exception exception) {
            render status: HttpStatus.BAD_REQUEST
        }
    }
}
