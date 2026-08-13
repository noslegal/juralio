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
import com.juralio.auth.BaseAuthorisationService
import com.juralio.auth.UserRoleService
import com.juralio.common.ValidatedParameterMap
import com.juralio.matter.Matter
import com.juralio.matter.MatterAdminService
import com.juralio.matter.MatterService
import com.juralio.organisation.dao.OrganisationDAOService
import grails.gorm.transactions.Transactional
import groovy.transform.CompileStatic

@Transactional
@CompileStatic
class OrganisationAuthorisationService extends BaseAuthorisationService {

    UserRoleService userRoleService
    MatterService matterService
    MatterAdminService matterAdminService
    OrganisationDAOService organisationDAOService


    boolean hasSysAdminAccess() {
        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
        boolean isSysadmin = userRoleService.hasSysadminRole(currentUser)
        return isSysadmin
    }

    boolean organisationIsNotFrozen(long orgId) {
        Organisation org = organisationDAOService.getOrganisation(orgId)
        if (org) {
            return !org.isFrozen
        }
        return true
    }

    boolean hasUpdateAccess(long id, ValidatedParameterMap validatedParameters) {
        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
        boolean isOrgAdminForOrganisation = isOrgAdminForOrg(currentUser, id)
        boolean isSysadmin = userRoleService.hasSysadminRole(currentUser)

        // Only sys admins can enable/disable organisations
        if (isSysadmin) {
            // Stop sys admins from attempting to do org admin actions
            validatedParameters.each({
                if (it.key != "enabled" && it.key != "name" && it.key != "logo" && it.key != 'microsoftSsoEnabled' && it.key != 'oktaSsoEnabled' && it.key != 'googleSsoEnabled' && it.key != 'mfaEnabled' && it.key != 'samlSsoEnabled' && it.key != 'isFrozen' && it.key != 'hasConfiguredBilling' && it.key != 'updateConfirmedCount') {
                    return false
                }
            })
            if (validatedParameters.containsKey("enabled") ||
                    validatedParameters.containsKey("name") ||
                    validatedParameters.containsKey("logo") ||
                    validatedParameters.containsKey("microsoftSsoEnabled") ||
                    validatedParameters.containsKey("oktaSsoEnabled") ||
                    validatedParameters.containsKey("samlSsoEnabled") ||
                    validatedParameters.containsKey("googleSsoEnabled") ||
                    validatedParameters.containsKey("isFrozen") ||
                    validatedParameters.containsKey("mfaEnabled") ||
                    validatedParameters.containsKey("hasConfiguredBilling") ||
                    validatedParameters.containsKey("updateConfirmedCount") ||
                    validatedParameters.containsKey("lapsedLoginMessage") ||
                    validatedParameters.containsKey("trialMessage")
            ) {
                return true
            }
        }

        // Org admins can enable/disable MFA
        if (isOrgAdminForOrganisation) {
            // Stop org admins from attempting to do sys admin actions
            List<String> allowedParams = ["mfaEnabled", 'googleDriveEnabled', 'samlSsoEnabled', 'hasConfiguredBilling','updateConfirmedCount','lapsedLoginMessage', 'trialMessage']
            validatedParameters.each({
                if (!allowedParams.contains(it.key)) {
                    return false
                }
            })
            if (validatedParameters.containsKey("updateConfirmedCount") ||
                    validatedParameters.containsKey("hasConfiguredBilling") ||
                    validatedParameters.containsKey("mfaEnabled") ||
                    validatedParameters.containsKey("googleDriveEnabled") ||
                    validatedParameters.containsKey("microsoftSsoEnabled") ||
                    validatedParameters.containsKey("googleSsoEnabled") ||
                    validatedParameters.containsKey("oktaSsoEnabled") ||
                    validatedParameters.containsKey("samlSsoEnabled") ||
                    validatedParameters.containsKey("lapsedLoginMessage") ||
                    validatedParameters.containsKey("trialMessage")) {
                return true
            }
        }

        return false
    }

    boolean hasLogoRemovalAccess() {
        boolean isSysadmin = userRoleService.hasSysadminRole(springSecurityService.getCurrentUser() as AppUser)
        return isSysadmin
    }

    boolean hasListMembersAccess(long organisationId) {
        return isOrgAdminForOrgOrSysadmin(organisationId) || isMatterAdminAndOfAMatterInOrg(organisationId)
    }

    boolean isMatterAdminAndOfAMatterInOrg(long organisationId) {
        List<Matter> matters = matterAdminService.getAdministrableMatters() as List<Matter>
        Matter result = matters.find({ matter -> matter.getOrganisationId() == organisationId })
        return result != null
    }

    boolean hasAddMemberAccess(long organisationId) {
        return isOrgAdminForOrgOrSysadmin(organisationId)
    }

    boolean hasRemoveMemberAccess(long organisationId) {
        return isOrgAdminForOrgOrSysadmin(organisationId)
    }

    boolean isOrgAdminForOrg(AppUser user, long organisationId) {
        return user.organisation &&
                user.organisation.id == organisationId &&
                userRoleService.hasOrgAdminRole(user)
    }

    boolean isOrgAdminForOrgOrSysadmin(long organisationId) {
        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
        boolean isOrgAdminForOrganisation = isOrgAdminForOrg(currentUser, organisationId)
        boolean isSysadmin = userRoleService.hasSysadminRole(currentUser)

        return isOrgAdminForOrganisation || isSysadmin
    }
}
