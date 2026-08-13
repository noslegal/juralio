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
import com.juralio.common.ParameterValidatorService
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
class MatterAdminController {
    static allowedMethods = [save: "POST", patch: "PATCH", delete: "DELETE", removeUser: "DELETE", notifyTeamMember: 'POST']

    MatterAdminService matterAdminService
    UserService userService
    SpringSecurityService springSecurityService
    UserRoleService userRoleService
    OrganisationAuthorisationService organisationAuthorisationService
    MatterCostsService matterCostsService
    CostsAuthorisationService costsAuthorisationService
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
            if (request.JSON.containsKey("users")) {
                def users = request.JSON.users
                addedUsers = users.collect({ userId ->
                    if (userId != null) {
                        AppUser user = userService.getUserById(userId)
                        if (user.externalUser != null) {
                            return false
                        } else {
                            return matterAdminService.save(request.JSON.matter as long, userId as long)
                        }
                    }
                })
            } else {
                AppUser user = userService.getUserById(request.JSON.user)
                if (user.externalUser != null) {
                    throw new Exception('cannot add an external user as a matter admin')
                } else {
                    addedUsers = [matterAdminService.save(request.JSON.matter as long, request.JSON.user as long)]
                }
            }
            if(request.JSON.costAccess && costsAuthorisationService.orgCostsSetupForMatterPosition(currentUser, matterService.getMatterOnly(request.JSON.matter as long))){
                addedUsers.forEach {it->
                    long id = it.user.id
                    MatterCosts MC = MatterCosts.findByUser(it.user)
                    if(MC || it.user.externalUser != null){
                        it.user.costsId = MC.id
                        return
                    }else{
                        long matterId = request.JSON.matter as long
                        it.user.costsId =  matterCostsService.save(matterId, id).id
                    }
                }
            }
            respond addedUsers.findAll { it != null && it != false }, [status: HttpStatus.OK, view: '/matterAdmin/_matterAdminList']
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
            matterAdminService.delete(params.matter_id as long, params.id as long)
            respond status: HttpStatus.OK
        }
        catch (AccessDeniedException exception) {
            render status: HttpStatus.FORBIDDEN
        }
        catch (Exception exception) {
            render status: HttpStatus.BAD_REQUEST
        }
    }

    def removeUser() {
        AppUser currentUser = springSecurityService.getCurrentUser()
        boolean isSysadmin = userRoleService.hasSysadminRole(currentUser)
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(currentUser.organisationId)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }
        try {
            def validatedBody = ParameterValidatorService.validate(request.JSON, ['userId', 'matterId'], [])
            matterAdminService.removeUser(validatedBody.matterId as long, validatedBody.userId as long)
            respond status: HttpStatus.OK
        }
        catch (AccessDeniedException exception) {
            render status: HttpStatus.FORBIDDEN
        }
        catch (Exception exception) {
            render status: HttpStatus.BAD_REQUEST
        }
    }

    @Secured("!hasRole('ROLE_SYSADMIN')")
    def notifyTeamMember() {
        matterAdminService.notifyNewTeamMembers(params.matter_id as long, request.JSON.users, request.JSON.message)
        respond [:], status: HttpStatus.OK
    }

}
