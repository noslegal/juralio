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

package com.juralio.user

import com.juralio.auth.*
import com.juralio.auth.exception.*
import com.juralio.common.APIErrorCodes
import com.juralio.common.ParameterValidatorService
import com.juralio.instance.InstanceSettingsService
import com.juralio.matter.MatterAdmin
import com.juralio.organisation.OrganisationAuthorisationService
import com.juralio.organisation.OrganisationUserConfirmationService
import com.juralio.organisation.exception.OrganisationException
import com.juralio.organisation.exception.UserNotInOrganisationException
import grails.plugin.springsecurity.SpringSecurityService
import grails.plugin.springsecurity.annotation.Secured
import grails.validation.ValidationException
import org.grails.web.json.JSONObject
import org.hibernate.Hibernate
import org.springframework.http.HttpStatus

@Secured('IS_AUTHENTICATED_FULLY')
class UserController {

    static allowedMethods = [index: "GET", update: "PATCH", updateSelf: "PATCH", show: "GET", bulkSave: 'POST', save: 'POST', getActivityLog: 'GET', delete: 'DELETE']

    UserService userService
    UserRoleService userRoleService
    UserSessionEventService userSessionEventService
    SpringSecurityService springSecurityService
    OrganisationAuthorisationService organisationAuthorisationService
    OrganisationUserConfirmationService organisationUserConfirmationService
    InstanceSettingsService instanceSettingsService

    @Secured("hasRole('ROLE_SYSADMIN')")
    def index() {
        List<AppUser> userList = userService.getAllUsers()
        userList*.hydrateRoles()
        if (instanceSettingsService.instanceSettings.enableUserConfirmation) {
            userList.each { getConfirmationDate(it) }
        }
        userList.each {
            if (!userService.hasUserLoggedInBefore(it)) {
                it.hasNeverSignedIn = true
            }
        }
        respond userList, [status: HttpStatus.OK, view: '/appUser/_appUserAdminViewList']
    }

    @Secured("hasRole('ROLE_SYSADMIN')")
    def getConfirmationDate(AppUser user) {
        return userService.getConfirmationDates(user)
    }

    @Secured("hasRole('ROLE_SYSADMIN')")
    def getActivityLog(long id) {
        AppUser user = userService.getUserById(id)
        def activityLog = userService.getActivityLog(user)
        respond activityLog, status: HttpStatus.OK
    }

    @Secured("hasRole('ROLE_SYSADMIN')")
    def show(long id) {
        AppUser user = userService.getUserById(id)

        user.hydrateRoles()

        respond user, [status: HttpStatus.OK, view: '/appUser/_appUserAdminView']
    }

    @Secured("hasRole('ROLE_SYSADMIN') or hasRole('ROLE_ORG_ADMIN')")
    def update(long id) {
        AppUser appUser = springSecurityService.getCurrentUser()
        appUser.hydrateRoles()
        def optionalParams = ['firstname', 'lastname', 'username', 'roles', 'enabled', 'isThirdPartyUser', 'thirdPartyProvider', 'isExternal', 'thirdPartyUserId', 'mfaEnabled', 'forceUpdate', 'confirmationStatus', 'group']
        try {
            if (id == appUser.id && request.JSON.containsKey('enabled') && request.JSON.getAt('enabled') == false)
                throw new CannotDisableOwnAccountException()

            AppUser userToUpdate = AppUser.findById(id)
            userToUpdate.hydrateRoles()
            if (userToUpdate.roles.contains('ROLE_SYSADMIN')) {
                optionalParams.remove('mfaEnabled')
            }

            if (userToUpdate.organisation != appUser.organisation && !appUser.roles.contains('ROLE_SYSADMIN')) {
                throw new OrganisationException("Error")
            }

            def validatedBody = ParameterValidatorService.validate(request.JSON as Map, [], optionalParams)

            if (validatedBody.getProperty('isThirdPartyUser') != null) {
                validatedBody.setProperty('password', 'thirdPartyUser')
            }


            boolean logEmailChange = false
            String previousEmail = ''
            if (validatedBody.get('username') && userToUpdate.username != validatedBody.getProperty('username')) {
                if (id == appUser.id) {
                    throw new UserException("Error")
                }
                if (userToUpdate.isThirdPartyUser && validatedBody.getProperty('isThirdPartyUser') == null) {
                    throw new UserException("Error")
                }
                AppUser user = AppUser.findByUsername(validatedBody.getProperty('username'))
                if (user && user.id != id) {
                    render status: APIErrorCodes.USERNAME_ALREADY_IN_USE.code(), text: ''
                    return
                }

                logEmailChange = true
                previousEmail = userToUpdate.username
            }

            // NOTE: converting an existing user to a third-party (SSO) user does not currently
            // clear their local password, so the old password may remain valid after conversion.
            // NOTE: converting a third-party user back to a regular (password) user is not yet handled.

            AppUser updatedUser = userService.update(id, validatedBody)
            if (validatedBody.getProperty('confirmationStatus') == "confirmed") {
                organisationUserConfirmationService.setConfirmedStatus(id)
            }
            if (validatedBody.get('thirdPartyProvider')) {
                //convert to third party
                userService.emailAuthChange(updatedUser, false)
            } else if (validatedBody.get('isThirdPartyUser') == false) {
                //convert to Juralio
            } else if (logEmailChange) {
                userService.emailUsernameChange(updatedUser, previousEmail, updatedUser.username, false)
                userSessionEventService.recordSessionExpiry(updatedUser.id)
            }
            updatedUser.hydrateRoles()
            respond updatedUser, [status: HttpStatus.OK, view: '/appUser/_appUserAdminView']
        } catch (InvalidRoleRequestException exception) {
            respond [:], status: HttpStatus.BAD_REQUEST
        } catch (CannotDisableOwnAccountException exception) {
            respond [:], status: HttpStatus.BAD_REQUEST
        } catch (UserException exception) {
            render(status: 400, message: exception.getMessage())
        } catch (OrganisationException exception) {
            render(status: 400, message: exception.getMessage())
        } catch (ValidationException exception) {
            render(status: 400, message: "Invalid input, please try again.")
        } catch (OnlyOrganisationOwner exception) {
            render(status: 400, message: 'Cannot remove only organisation owner')
        } catch (OrganisationOwnerMustBeAdmin exception) {
            render(status: 400, message: 'Cannot remove only org owner as org admin')
        } catch (MaxNumberOfOrganisationOwnersReached exception) {
            render(status: 400, message: 'Maximum number of org owners already reached')
        } catch (ExternalUserRolesNotForced exception) {
            AppUser userToBeUpdated = userService.getUserById(id)
            List<String> roles = userToBeUpdated.getAuthorities().collect(it -> Hibernate.unproxy(it).authority).findAll { it != Roles.USER.code() } as List<String>
            Integer matterCount = MatterAdmin.findAllByUser(userToBeUpdated).size()
            JSONObject counts = new JSONObject()
            counts.put('roles', roles)
            counts.put('mattersCount', matterCount)
            render status: APIErrorCodes.EXTERNAL_USER_NO_FORCE_ROLE_CHANGE.code(), text: counts.toString()
        } catch (ActivateLapsedUserException exception) {
            render(status: APIErrorCodes.ACTIVATE_LAPSED_USER.code(), message: 'Activating a lapsed user will affect the confirmed user count.')
        }

    }

    @Secured("hasRole('ROLE_SYSADMIN') or hasRole('ROLE_ORG_ADMIN')")
    def bulkSave() {

        AppUser appUser = springSecurityService.getCurrentUser()
        boolean isSysadmin = userRoleService.hasSysadminRole(appUser)
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(appUser.organisation.id)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }
        def optionalParams = ['enabled', 'isExternal', 'firstname', 'lastname']

        if (isSysadmin) {
            optionalParams.push('organisation')
        }
        boolean outOfContext = isSysadmin && !request.JSON['organisation']
        if (outOfContext) {
            optionalParams.push('group')
        }
        def requiredParams = request.JSON['isThirdPartyUser'] ?
                ['roles', 'isThirdPartyUser', 'thirdPartyProvider'] : ['roles']
        if (!outOfContext) {
            requiredParams.add('group')
        }
        def validatedBody = ParameterValidatorService.validate(request.JSON, requiredParams, optionalParams)

        List<String> roles = (validatedBody.roles ? validatedBody.roles : [])
        if (roles.contains(Roles.SYSADMIN.code())) {
            respond [:], status: HttpStatus.BAD_REQUEST
            return
        }
        if (!roles.contains(Roles.USER.code())) {
            roles << Roles.USER.code()
        }
        validatedBody.remove('roles')

        if (userService.isUserExternal(validatedBody)) {
            roles = [Roles.USER.code()]
        }
        List<String> usernames = request.JSON.usernames as List<String>
        List<JSONObject> errors = []
        List<JSONObject> createdUsers = []
        usernames.forEach { String username ->
            try {
                if(userService.isUserExternal(validatedBody)  && instanceSettingsService.limitedAvailableSeats()<1){
                    respond [:], status: HttpStatus.BAD_REQUEST
                    return
                }else if(!userService.isUserExternal(validatedBody) && instanceSettingsService.fullAvailableSeats()<1){
                    respond [:], status: HttpStatus.BAD_REQUEST
                    return
                }
                def bodyWithUsername = validatedBody
                bodyWithUsername.setProperty('username', username)
                AppUser createdUser = userService.createUserWithRoles(bodyWithUsername, roles as String[])

                if (createdUser.hasErrors()) {
                    def error = createdUser.getErrors().getFieldError()
                    JSONObject errorObj = new JSONObject()
                    //errorObj.put('field', error.field)
                    //errorObj.put('codes', error.codes)
                    errorObj.put('username', createdUser.username)
                    errors.add(errorObj)
                } else {
                    createdUser.hydrateRoles()
                    if (!isSysadmin) {
                        createdUser.organisation = appUser.organisation
                    }
                    JSONObject userBlob = new JSONObject()
                    userBlob.put('id', createdUser.id)
                    userBlob.put('username', createdUser.username)
                    userBlob.put('firstname', createdUser.firstname)
                    userBlob.put('lastname', createdUser.lastname)
                    userBlob.put('enabled', createdUser.enabled)
                    userBlob.put('mfaEnabled', createdUser.mfaEnabled)
                    userBlob.put('avatarColorIndex', createdUser.avatarColorIndex)
                    userBlob.put('avatarImageIndex', createdUser.avatarImageIndex)
                    userBlob.put('roles', createdUser.roles)
                    userBlob.put('isActiveOnMatter', createdUser.isActiveOnMatter)
                    userBlob.put('temporaryPassword', createdUser.temporaryPassword)
                    userBlob.put('isThirdPartyUser', createdUser.isThirdPartyUser)
                    userBlob.put('thirdPartyProvider', createdUser.thirdPartyProvider)
                    userBlob.put('confirmationStatus', createdUser.confirmationStatus)
                    userBlob.put('trialStartDate', createdUser.trialStartDate)
                    userBlob.put('isExternal', createdUser.externalUser != null)
                    userBlob.put('organisation', createdUser.organisation ? [id: createdUser.organisation.id.toString(), name: createdUser.organisation.name] : null)
                    createdUsers.add(userBlob)
                }
            } catch (InvalidRoleRequestException exception) {
                respond [:], status: HttpStatus.BAD_REQUEST
            } catch (MaxNumberOfOrganisationOwnersReached exception) {
                respond [:], status: HttpStatus.BAD_REQUEST
            }
        }
        Map results = [errors: errors, createdUsers: createdUsers]
        respond results, status: HttpStatus.OK

    }


    @Secured("hasRole('ROLE_SYSADMIN') or hasRole('ROLE_ORG_ADMIN')")
    def save() {
        AppUser appUser = springSecurityService.getCurrentUser()
        boolean isSysadmin = userRoleService.hasSysadminRole(appUser)

        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(appUser.organisation.id)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }
        def optionalParams = ['firstname', 'lastname', 'enabled', 'isExternal', 'group']

        if (isSysadmin) {
            optionalParams.push('organisation')
        }

        def validatedBody
        if (request.JSON['isThirdPartyUser']) {
            validatedBody = ParameterValidatorService.validate(request.JSON as Map,
                    ['username', 'roles', 'isThirdPartyUser', 'thirdPartyProvider'], optionalParams)
        } else {
            validatedBody = ParameterValidatorService.validate(request.JSON as Map,
                    ['username', 'roles'], optionalParams)
        }

        def roles = (validatedBody.roles ? validatedBody.roles : [])
        if (!roles.contains(Roles.USER.code())) {
            roles << Roles.USER.code()
        }
        if ((roles.contains(Roles.SYSADMIN.code()) || roles.contains(Roles.MATTER_CREATOR.code()) || roles.contains(Roles.ORG_OWNER.code()) || roles.contains(Roles.TEMPLATE_PROVIDER.code()) || roles.contains(Roles.ORG_ADMIN.code()) || roles.contains(Roles.KNOWLEDGE_MANAGER.code())) && validatedBody.isExternal) {
            respond [:], status: HttpStatus.BAD_REQUEST
            return
        }
        validatedBody.remove('roles')

        if (userService.isUserExternal(validatedBody)) {
            roles = [Roles.USER.code()]
        }

        if(userService.isUserExternal(validatedBody)  && instanceSettingsService.limitedAvailableSeats()<1){
            respond [:], status: HttpStatus.BAD_REQUEST
            return
        }else if(!userService.isUserExternal(validatedBody) && instanceSettingsService.fullAvailableSeats()<1){
            respond [:], status: HttpStatus.BAD_REQUEST
            return
        }

        if (roles.contains(Roles.SYSADMIN.code())) {
            if (validatedBody.get('organisation') as String != null) {
                respond [:], status: HttpStatus.BAD_REQUEST
                return
            }
            roles = [Roles.USER.code(), Roles.SYSADMIN.code()]
        }

        try {
            AppUser createdUser = userService.createUserWithRoles(validatedBody, roles as String[])

            if (createdUser.hasErrors()) {
                // Must pass the body first: `respond status: X` binds the lone Map as the
                // *value*, so the status is ignored and the client gets 200 with a
                // {"status":"BAD_REQUEST"} body — a failure that reads as success.
                respond [:], status: HttpStatus.BAD_REQUEST
            } else {
                createdUser.hydrateRoles()
                respond createdUser, [status: HttpStatus.CREATED, view: '/appUser/_appUserAdminView']
            }
        } catch (InvalidRoleRequestException exception) {
            respond [:], status: HttpStatus.BAD_REQUEST
        } catch (MaxNumberOfOrganisationOwnersReached exception) {
            respond [:], status: HttpStatus.BAD_REQUEST
        }
    }

    @Secured("hasRole('ROLE_SYSADMIN') or hasRole('ROLE_ORG_ADMIN')")
    def delete(long id) {
        try {
            userService.deleteUser(id)
            respond [:], status: HttpStatus.OK
            return
        } catch (UserDoesNotExistException exception) {
            respond [:], status: HttpStatus.BAD_REQUEST
        } catch (UserException exception) {
            respond [:], status: HttpStatus.BAD_REQUEST
        } catch (UserNotInOrganisationException exception) {
            respond [:], status: HttpStatus.BAD_REQUEST
        } catch (InsufficientRolePermissionsException exception) {
            respond [:], status: HttpStatus.BAD_REQUEST
        } catch (OnlyOrganisationOwner exception) {
            respond [:], status: HttpStatus.BAD_REQUEST
        }
    }
}