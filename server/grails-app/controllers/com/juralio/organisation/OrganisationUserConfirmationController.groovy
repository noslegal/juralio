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

package com.juralio.organisation

import com.juralio.auth.AppUser
import com.juralio.auth.UserRoleService
import com.juralio.auth.UserService
import com.juralio.instance.InstanceSettings
import com.juralio.instance.InstanceSettingsService
import grails.plugin.springsecurity.SpringSecurityService
import grails.plugin.springsecurity.annotation.Secured
import org.springframework.http.HttpStatus

@Secured(['IS_AUTHENTICATED_FULLY'])
class OrganisationUserConfirmationController {
    static allowedMethods = [index: "GET", setConfirmedStatus: "POST"]

    UserRoleService userRoleService
    SpringSecurityService springSecurityService
    OrganisationAuthorisationService organisationAuthorisationService
    UserService userService
    OrganisationUserConfirmationService organisationUserConfirmationService
    InstanceSettingsService instanceSettingsService


    def index(long orgId, long userId) {
        if(!organisationAuthorisationService.hasListMembersAccess(orgId)){
            throw new Exception()
        }
        AppUser appUser = springSecurityService.getCurrentUser()
        AppUser targetUser = userService.getUserById(userId)
        InstanceSettings instanceSettings = instanceSettingsService.getInstanceSettings()

        if (instanceSettings.getEnableUserConfirmation()) {
            if (userRoleService.hasSysadminRole(appUser) || userRoleService.hasOrgAdminRole(appUser)) {
                if (targetUser.organisationId == orgId) {
                    String confirmationStatus = organisationUserConfirmationService.getConfirmedStatus(userId)
                    respond([confirmationStatus: confirmationStatus], status: HttpStatus.OK)
                    return
                } else {
                    respond([text: 'User not in organisation'], status: HttpStatus.BAD_REQUEST)
                    return
                }
            } else {
                respond([text: 'You do not have the required roles for this function'], status: HttpStatus.FORBIDDEN)
                return
            }
        } else {
            respond([text: 'User Confirmation is not enabled'], status: HttpStatus.FORBIDDEN)
            return
        }
    }

    @Secured("hasRole('ROLE_ORG_ADMIN') or hasRole('ROLE_SYSADMIN')")
    def setConfirmedStatus(long orgId, long userId) {
        AppUser appUser = springSecurityService.getCurrentUser()
        AppUser targetUser = userService.getUserById(userId)
        InstanceSettings instanceSettings = instanceSettingsService.getInstanceSettings()

        if (instanceSettings.getEnableUserConfirmation()) {
            if (userRoleService.hasSysadminRole(appUser) || userRoleService.hasOrgAdminRole(appUser)) {
                if (targetUser.organisationId == orgId) {
                    organisationUserConfirmationService.setConfirmedStatus(userId)
                    respond([:], status: HttpStatus.OK)
                    return
                } else {
                    respond([text: 'User not in organisation'], status: HttpStatus.BAD_REQUEST)
                    return
                }
            } else {
                respond([text: 'You do not have the required roles for this function'], status: HttpStatus.FORBIDDEN)
                return
            }
        } else {
            respond([text: 'User Confirmation is not enabled'], status: HttpStatus.FORBIDDEN)
            return
        }
    }
}

