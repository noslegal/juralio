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
import com.juralio.auth.Roles
import com.juralio.auth.UserRoleService
import com.juralio.auth.UserService
import com.juralio.auth.dto.AppUserDTO
import com.juralio.auth.exception.MaxNumberOfOrganisationOwnersReached
import com.juralio.auth.exception.OnlyOrganisationOwner
import com.juralio.auth.exception.UserDoesNotExistException
import com.juralio.common.APIErrorCodes
import com.juralio.common.ParameterValidatorService
import com.juralio.common.error.ErrorResponseHelperService
import com.juralio.instance.InstanceSettingsService
import com.juralio.matter.Matter
import com.juralio.matter.MatterService
import com.juralio.organisation.exception.UserAlreadyHasOrganisationException
import com.juralio.organisation.exception.UserNotInOrganisationException
import grails.plugin.springsecurity.SpringSecurityService
import grails.plugin.springsecurity.annotation.Secured
import org.apache.commons.logging.Log
import org.apache.commons.logging.LogFactory
import org.springframework.http.HttpStatus

@Secured(['IS_AUTHENTICATED_FULLY'])
class OrganisationUserController {

    static allowedMethods = [save: "POST", index: "GET", delete: "DELETE"]

    OrganisationAdminUserService organisationAdminUserService
    ErrorResponseHelperService errorResponseHelperService
    UserRoleService userRoleService
    UserService userService
    SpringSecurityService springSecurityService
    OrganisationAuthorisationService organisationAuthorisationService
    MatterService matterService
    InstanceSettingsService instanceSettingsService

    protected final Log logger = LogFactory.getLog(getClass())

    private boolean isAMatterAdmin(List<Matter> matters, AppUser user){
        for (Matter matter in matters){
            if(matterService.isMatterAdmin(matter.id,user.id,true)){
                return true
            }
        }
        return false
    }

    def index(long id) {
        AppUser appUser = springSecurityService.getCurrentUser()
        if (userRoleService.hasSysadminRole(appUser)) {
            List<AppUserDTO> users = organisationAdminUserService.getUsersWithLoginDatesFromOrg(id)
            users.each { user -> user.user.hydrateRoles() }
            if(instanceSettingsService.instanceSettings.enableUserConfirmation) {
                users.each { userService.getConfirmationDates(it.user) }
            }
            respond users, [status: HttpStatus.OK, view: '/appUser/_appUserOrgAdminViewList']
            return
        } else if (userRoleService.hasOrgAdminRole(appUser)) {
            List<AppUserDTO> users = organisationAdminUserService.getUsersWithLoginDatesFromOrg(id)
            users.each { user -> user.user.hydrateRoles() }
            if(instanceSettingsService.instanceSettings.enableUserConfirmation) {
                users.each { userService.getConfirmationDates(it.user) }
            }
            respond users, [status: HttpStatus.OK, view: '/appUser/_appUserOrgAdminViewList']
            return
        } else if(isAMatterAdmin(matterService.getMattersForUser(-1), appUser)){
            List<AppUser> users = organisationAdminUserService.getUsersFromOrg(id)
            respond users, [status: HttpStatus.OK, view: '/appUser/_appUserAdminViewList']
            return
        } else{
            if(!organisationAuthorisationService.hasListMembersAccess(id)){
                render status: HttpStatus.FORBIDDEN
                return
            } else {
                respond [:], [status: HttpStatus.OK] //we're not giving you any information here
                return
            }
        }
    }

    @Secured("hasRole('ROLE_ORG_ADMIN') or hasRole('ROLE_SYSADMIN')")
    def save(long id) {
        AppUser user = springSecurityService.getCurrentUser()
        boolean isSysadmin = userRoleService.hasSysadminRole(user)
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(id)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }
        def validatedBody = ParameterValidatorService.validate(request.JSON, ['username'], [])
        if (validatedBody.hasProperty('roles') && validatedBody.roles.contains(Roles.MATTER_CREATOR.code()) && validatedBody.hasProperty('isExternal') && validatedBody.getProperty('isExternal') == true) {
            respond [:], status: HttpStatus.BAD_REQUEST
        }

        try {
            respond organisationAdminUserService.addUserToOrganisation(id, validatedBody.username, true), [status: HttpStatus.CREATED, view: '/appUser/_appUserAdminView']
        } catch (UserDoesNotExistException exception) {
            respond [:], status: HttpStatus.NOT_FOUND
        } catch (UserAlreadyHasOrganisationException exception) {
            respondWithError(APIErrorCodes.USER_ALREADY_HAS_ORGANISATION)
        } catch (UserNotInOrganisationException exception) {
            respond [:], status: HttpStatus.BAD_REQUEST
        } catch (MaxNumberOfOrganisationOwnersReached exception) {
            respond [:], status: HttpStatus.BAD_REQUEST
        }
    }

    @Secured("hasRole('ROLE_ORG_ADMIN') or hasRole('ROLE_SYSADMIN')")
    def delete(long id) {
        AppUser user = springSecurityService.getCurrentUser()
        boolean isSysadmin = userRoleService.hasSysadminRole(user)
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(id)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }
        def validatedBody = ParameterValidatorService.validate(request.JSON, ['username'], [])
        try {
            respond organisationAdminUserService.removeUserFromOrganisation(id, validatedBody.username), [status: HttpStatus.OK, view: '/appUser/_appUserAdminView']
        } catch (UserDoesNotExistException exception) {
            respond [:], status: HttpStatus.NOT_FOUND
        } catch (UserNotInOrganisationException exception) {
            respond [:], status: HttpStatus.BAD_REQUEST
        } catch (OnlyOrganisationOwner exception) {
            respond [:], status: HttpStatus.BAD_REQUEST
        }
    }

    private def respondWithError(APIErrorCodes errorCode) {
        def errorResponse = errorResponseHelperService.getErrorResponseForDomainClass(Organisation, errorCode.code())
        respond(errorResponse, [status: HttpStatus.BAD_REQUEST])
    }
}
