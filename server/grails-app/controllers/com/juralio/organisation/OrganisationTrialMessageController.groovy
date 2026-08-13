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
import com.juralio.common.ParameterValidatorService
import com.juralio.common.ValidatedParameterMap
import com.juralio.instance.InstanceSettings
import com.juralio.instance.InstanceSettingsService
import com.juralio.organisation.dao.OrganisationDAOService
import com.juralio.organisation.exception.CustomMessageTooLongException
import com.juralio.post.exception.PostContentTooLongException
import grails.plugin.springsecurity.SpringSecurityService
import grails.plugin.springsecurity.annotation.Secured
import grails.rest.*
import grails.converters.*
import org.springframework.http.HttpStatus

@Secured(['IS_AUTHENTICATED_FULLY'])
class OrganisationTrialMessageController {
	static allowedMethods = [index: 'GET', save: 'POST', update: 'PATCH']
    InstanceSettingsService instanceSettingsService
    OrganisationDAOService organisationDAOService
    UserRoleService userRoleService
    SpringSecurityService springSecurityService
    ParameterValidatorService parameterValidatorService
    OrganisationAdminMessageService organisationAdminMessageService
	
    def index(long orgId) {
        InstanceSettings instanceSettings = instanceSettingsService.getInstanceSettings()
        AppUser appUser = springSecurityService.getCurrentUser()
        Organisation userOrg = organisationDAOService.getOrganisation(orgId)

        if (instanceSettings.getEnableUserConfirmation()) {
            if (appUser.organisationId == orgId || userRoleService.hasSysadminRole(appUser)){
                String trialMessage = organisationAdminMessageService.getTrialCardMessage(userOrg)
                respond([trialMessage: userOrg.trialMessage], status: HttpStatus.OK)
            }else{
                respond([text: 'User not in organisation'], status: HttpStatus.BAD_REQUEST)
                return
            }

        } else {
            respond([text: 'User Confirmation is not enabled'], status: HttpStatus.FORBIDDEN)
            return
        }
    }

    @Secured("hasRole('ROLE_ORG_ADMIN') or hasRole('ROLE_SYSADMIN')")
    def save(long orgId){
        InstanceSettings instanceSettings = instanceSettingsService.getInstanceSettings()
        AppUser appUser = springSecurityService.getCurrentUser()
        Organisation userOrg = organisationDAOService.getOrganisation(orgId)


        if (instanceSettings.getEnableUserConfirmation()) {
            if(userRoleService.hasSysadminRole(appUser) || userRoleService.hasOrgAdminRole(appUser)) {
                ValidatedParameterMap validatedParams = parameterValidatorService.validate(request.JSON, [], ['trialMessage'])
                String message = validatedParams.get("trialMessage") as String
                if(userRoleService.hasSysadminRole(appUser)){
                    organisationAdminMessageService.updateTrialCardMessage(message, userOrg)
                    respond([:], status: HttpStatus.CREATED)
                    return
                }
                if (appUser.organisationId == orgId) {
                    organisationAdminMessageService.updateTrialCardMessage(message, userOrg)
                    respond([:], status: HttpStatus.CREATED)
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
    def update(long orgId){
        InstanceSettings instanceSettings = instanceSettingsService.getInstanceSettings()
        AppUser appUser = springSecurityService.getCurrentUser()
        Organisation targetOrg = organisationDAOService.getOrganisation(orgId)

        if (instanceSettings.getEnableUserConfirmation()) {
            if(userRoleService.hasSysadminRole(appUser) || userRoleService.hasOrgAdminRole(appUser)) {
                ValidatedParameterMap validatedParams = parameterValidatorService.validate(request.JSON, [], ['trialMessage'])
                String message = validatedParams.get("trialMessage") as String

                if(userRoleService.hasSysadminRole(appUser)){
                    try{
                        organisationAdminMessageService.updateTrialCardMessage(message, targetOrg)
                    } catch (CustomMessageTooLongException e) {
                        respond([text: 'Message must not be longer than 20 characters'], status: HttpStatus.BAD_REQUEST)
                        return
                    }
                    respond([:], status: HttpStatus.OK)
                } else if (appUser.organisationId == orgId) {
                    try{
                        organisationAdminMessageService.updateTrialCardMessage(message, targetOrg)
                    } catch (CustomMessageTooLongException e) {
                        respond([text: 'Message must not be longer than 20 characters'], status: HttpStatus.BAD_REQUEST)
                        return
                    }
                    respond([:], status: HttpStatus.OK)
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
