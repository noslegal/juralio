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
import com.juralio.common.NoValidParametersException
import com.juralio.common.ParameterValidatorService
import com.juralio.common.ValidatedParameterMap
import com.juralio.instance.InstanceSettingsService
import com.juralio.matter.CostsAuthorisationService
import com.juralio.organisationgroup.OrganisationGroupService
import com.juralio.organisationgroup.dao.MatterGroupPositionDAOService
import grails.plugin.springsecurity.annotation.Secured
import org.springframework.http.HttpStatus
import org.springframework.security.access.AccessDeniedException

@Secured('IS_AUTHENTICATED_FULLY')
class OrganisationController {
    static lazyInit = false
    static allowedMethods = [showCurrentUserOrganisation: "GET", update: "PATCH", save: "POST", index: "GET", delete: 'DELETE', restore: 'POST']

    def springSecurityService
    OrganisationService organisationService
    def sysAdminOrganisationService
    UserRoleService userRoleService
    OrganisationAuthorisationService organisationAuthorisationService
    OrganisationDeletionService organisationDeletionService
    InstanceSettingsService instanceSettingsService
    CostsAuthorisationService costsAuthorisationService
    OrganisationGroupService organisationGroupService
    MatterGroupPositionDAOService matterGroupPositionDAOService

    @Secured("!hasRole('ROLE_SYSADMIN')")
    def showCurrentUserOrganisation() {
        AppUser user = springSecurityService.getCurrentUser()
        if(instanceSettingsService.getInstanceSettings().enableUserConfirmation) {
            if (userRoleService.hasOrgAdminRole(user) || userRoleService.hasOrgOwnerRole(user)) {
                user.organisation.seatCount = organisationService.getCurrentSeatCount(user.organisation, false)
            }
        }
        if(costsAuthorisationService.organisationCostsEnabledAdvisor(user.organisation)){
            user.organisation.hasFinishedCostFlowAdvisor = true
        }
        if(costsAuthorisationService.organisationCostsEnabledClient(user.organisation)){
            user.organisation.hasFinishedCostFlowClient = true
        }
        respond user.organisation, [status: HttpStatus.OK, view: '/organisation/_organisationIdAndName']
    }

    @Secured("hasRole('ROLE_SYSADMIN')")
    def delete(long id) {
        Organisation org = organisationService.getOrganisationDAOService().getOrganisation(id)
        if(!org){
            respond [:], status: HttpStatus.BAD_REQUEST
            return
        }
        Boolean markedForDeletion = organisationDeletionService.delete(org)
        if (markedForDeletion) {
            respond [:], status: HttpStatus.OK
        } else {
            respond [:], status: HttpStatus.BAD_REQUEST
        }
    }

    @Secured("hasRole('ROLE_SYSADMIN')")
    def restore(long id) {

        Organisation org = organisationService.getOrganisationDAOService().getOrganisation(id)
        try {
            organisationDeletionService.restore(org)
            respond [:], status: HttpStatus.OK
        } catch (Exception e) {
            respond [:], status: HttpStatus.BAD_REQUEST
        }
    }

    @Secured("hasRole('ROLE_ORG_ADMIN')  or hasRole('ROLE_SYSADMIN')")
    def update(long id) {
        try {
            AppUser user = springSecurityService.getCurrentUser()
            boolean isSysadmin = userRoleService.hasSysadminRole(user)
            if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(id)) {
                respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
                return
            }
            ValidatedParameterMap validatedParameters = request.JSON.keySet().contains("enabled") ?
                    ParameterValidatorService.validate(request.JSON, [], ['enabled']) :
                    ParameterValidatorService.validate(request.JSON, [], isSysadmin ? ['name', 'mfaEnabled', 'microsoftSsoEnabled', 'oktaSsoEnabled', 'googleSsoEnabled', 'samlSsoEnabled', 'isFrozen', 'hasConfiguredBilling','costsEnabled'] : ['mfaEnabled', 'googleDriveEnabled', 'microsoftSsoEnabled', 'oktaSsoEnabled', 'googleSsoEnabled', 'samlSsoEnabled'])

            Organisation organisation = organisationService.update(id, validatedParameters)

            if (organisation.hasErrors()) {
                render status: HttpStatus.UNPROCESSABLE_ENTITY
            } else {
                populateOrgAdmins(organisation)
                respond organisation, [status: HttpStatus.OK]
            }
        } catch (NoValidParametersException exception) {
            render status: HttpStatus.BAD_REQUEST, text: exception.message
        } catch (AccessDeniedException exception) {
            respond([text: exception.message], status: HttpStatus.FORBIDDEN)
        } catch (Exception exception) {
            def error = exception.message ? exception.message : exception.undeclaredThrowable.message
            render status: HttpStatus.UNPROCESSABLE_ENTITY, text: error
        }
    }

    @Secured("hasRole('ROLE_SYSADMIN')")
    def index() {
        respond sysAdminOrganisationService.listOrganisationSummaries(), [status: HttpStatus.OK]
    }

    @Secured("hasRole('ROLE_SYSADMIN')")
    def save() {
        ValidatedParameterMap parameters = ParameterValidatorService.validate(request.JSON, ['name', 'mfaEnabled'], ['sso'])
        Organisation organisation = sysAdminOrganisationService.save(parameters.name, parameters.mfaEnabled, parameters.sso ? parameters.sso : null)

        if (organisation.hasErrors()) {
            render status: HttpStatus.BAD_REQUEST
        } else {
            organisation.internalGroup = organisationGroupService.getInternalGroupForOrg(organisation)
            respond organisation, [status: HttpStatus.CREATED, view: '/organisation/_organisation']
        }
    }

    @Secured("hasRole('ROLE_SYSADMIN')")
    def show(long id) {
        Organisation organisation = sysAdminOrganisationService.get(id)
        populateOrgAdmins(organisation)
        if(instanceSettingsService.getInstanceSettings().enableUserConfirmation) {
            organisation.seatCount = organisationService.getCurrentSeatCount(organisation, false)
        }
        respond organisation,[status: HttpStatus.OK, view: '/organisation/_organisation']
    }

    private def populateOrgAdmins(Organisation organisation) {
        organisation.orgAdmins = organisation.users.findAll { user -> userRoleService.hasOrgAdminRole(user) }.toList()
        organisation.orgAdmins*.hydrateRoles()
    }
}

