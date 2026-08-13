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

package com.juralio.auth

import com.juralio.auth.exception.*
import com.juralio.auth.password.UserPasswordChangeRequest
import com.juralio.common.APIErrorCodes
import com.juralio.common.ParameterValidatorService
import com.juralio.common.error.ErrorResponseHelperService
import com.juralio.matter.MatterAdminService
import com.juralio.organisation.OrganisationService
import grails.plugin.springsecurity.SpringSecurityService
import grails.plugin.springsecurity.annotation.Secured
import grails.validation.ValidationException
import org.apache.commons.logging.Log
import org.apache.commons.logging.LogFactory
import org.springframework.http.HttpStatus

import static org.springframework.http.HttpStatus.OK

@Secured(['IS_AUTHENTICATED_FULLY'])
class AuthenticatedUserController {
    static allowedMethods = [show: "GET", updateSelf: 'PATCH', userChangeOwnPassword: 'POST']

    SpringSecurityService springSecurityService
    UserService userService
    UserSessionEventService userSessionEventService
    ErrorResponseHelperService errorResponseHelperService
    protected final Log logger = LogFactory.getLog(getClass())
    MatterAdminService matterAdminService
    OrganisationService organisationService


    def show() {
        AppUser user = springSecurityService.getCurrentUser() as AppUser
        user.sessionTimeout = request.session.getMaxInactiveInterval()
        List<UserSessionEvent> loginEvents = UserSessionEvent.findAllByUserAndEventType(user, UserSessionEventType.LOGIN_SUCCESS.value(), [max: 2])
        user.isFirstLogin = loginEvents.size() <= 1
        if (user.organisation) {
            user.needsToConfigureBilling = !user.organisation.hasConfiguredBilling
            user.isEarlyAccessOrg = organisationService.checkIfEarlyAccessOrg(user.organisation)
        }
        user.hydrateRoles()
        if (matterAdminService.isMatterAdmin()) {
            user.roles.push(Roles.MATTER_ADMIN.code())
        }
        respond user, [status: OK, view: '/appUser/_loginAppUser']
    }

    def updateSelf() {
        AppUser appUser = springSecurityService.getCurrentUser() as AppUser
        appUser.hydrateRoles()
        def optionalParams = ['firstname', 'lastname', 'username', 'password', 'avatarColorIndex', 'avatarImageIndex']
        try {
            def validatedBody = ParameterValidatorService.validate(request.JSON as Map, [], optionalParams)

            boolean logEmailChange = false
            String previousEmail = ''
            if (validatedBody.get('username') && appUser.username != validatedBody.getProperty('username')) {
                if (appUser.isThirdPartyUser) {
                    throw new UserException("Error")
                }
                PasswordValidatorService validatorService = new PasswordValidatorService()
                if (!validatedBody.get('password') || !validatorService.isNewPasswordSameAsCurrentPassword(appUser.password, validatedBody.getProperty('password'))) {
                    render status: APIErrorCodes.PASSWORD_DOES_NOT_MATCH.code(), text: ''
                    return
                }
                AppUser user = AppUser.findByUsername(validatedBody.getProperty('username'))
                if (user && user.id != appUser.id) {
                    render status: APIErrorCodes.USERNAME_ALREADY_IN_USE.code(), text: ''
                    return
                }
                logEmailChange = true
                previousEmail = appUser.username
            }

            AppUser updatedUser = userService.update(appUser.id, validatedBody)
            updatedUser.hydrateRoles()

            if (logEmailChange) {
                userService.emailUsernameChange(updatedUser, previousEmail, updatedUser.username, true)
                userSessionEventService.recordSessionExpiry(updatedUser.id)
            }

            respond updatedUser, [status: OK, view: '/appUser/_appUserAdminView']
        } catch (InvalidRoleRequestException ignored) {
            respond [:], status: HttpStatus.BAD_REQUEST
        } catch (CannotDisableOwnAccountException ignored) {
            respond [:], status: HttpStatus.BAD_REQUEST
        } catch (UserException exception) {
            render(status: 400, message: exception.getMessage())
        } catch (ValidationException exception) {
            render(status: 400, message: "Invalid input, please try again.")
        }

    }

    def userChangeOwnPassword(UserPasswordChangeRequest changeRequest) {
        try {
            userService.changePassword(changeRequest, true)
            respond [:], status: OK
        } catch (Exception exception) {
            respondToException(exception, changeRequest.username)
        }
    }

    private def respondToException(Exception exception, String username) {
        logger.debug(exception)

        if (exception instanceof UserDoesNotExistException) {
           return response.setStatus(HttpStatus.FORBIDDEN.value())
        } else if (exception instanceof UserLockedException) {
            return respondWithError(APIErrorCodes.USER_LOCKED)
        } else if (exception instanceof NewPasswordsDoNotMatchException) {
            return respondWithError(APIErrorCodes.NEW_PASSWORDS_DO_NOT_MATCH)
        } else if (exception instanceof PasswordCannotMatchCurrentPassword) {
            return respondWithError(APIErrorCodes.NEW_PASSWORD_MATCHES_OLD_PASSWORD)
        } else if (exception instanceof PasswordsDoNotMeetComplexityRulesException) {
            return respondWithError(APIErrorCodes.PASSWORD_COMPLEXITY_NOT_MET)
        } else if (exception instanceof UserPasswordChangeException) {
           return response.setStatus(HttpStatus.UNAUTHORIZED.value())
        }

        if (exception instanceof OldPasswordNotValidException) {
            respond [:], status: HttpStatus.UNAUTHORIZED
            return
        }

        throw new IllegalArgumentException("Unrecognised Exception type ${exception.toString()}")
    }

    private def respondWithError(APIErrorCodes errorCode) {
        def errorResponse = errorResponseHelperService.getErrorResponseForDomainClass(
                UserPasswordChangeRequest, errorCode.code())

        respond errorResponse, status: HttpStatus.BAD_REQUEST
    }
}
