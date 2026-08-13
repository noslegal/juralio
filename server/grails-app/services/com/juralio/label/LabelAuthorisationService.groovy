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

package com.juralio.label

import com.juralio.auth.*
import com.juralio.label.dao.LabelDAOService
import com.juralio.matter.Matter
import com.juralio.matter.MatterService
import com.juralio.matter.dao.MatterDAOService
import com.juralio.organisation.Organisation
import com.juralio.organisation.OrganisationService
import com.juralio.organisation.exception.UserNotInOrganisationException
import groovy.transform.CompileStatic

@CompileStatic
class LabelAuthorisationService extends BaseAuthorisationService
        implements ReadAuthorisation, UpdateAuthorisation {

    LabelDAOService labelDAOService
    MatterDAOService matterDAOService
    UserRoleService userRoleService
    MatterService matterService
    UserService userService

    boolean hasMergeAccess(long matterId) {
        return matterService.isMatterAdmin(matterId, getUserId())

    }


    boolean hasListReadAccess(Long organisationId = null, Long matterId = null) {
        if (organisationId != null) {
            return isValidOrganisation(organisationId)
        }
        if (matterId != null) {
            return isValidMatter(matterId)
        }
    }

    boolean hasOrganisationCreateAccess(Long organisationId) {
        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
        return isOrgAdminForOrg(currentUser, organisationId)
    }

    boolean hasMatterCreateAccess(Long matterId) {
        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
        return matterService.isTeamMember(matterId, currentUser.id) || matterService.isMatterAdmin(matterId, currentUser.id)
    }

    @Override
    boolean hasUpdateAccess(Long entityId) {
        Label label = labelDAOService.findLabel(entityId)
        if(label.matterId) {
            AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
            if(!matterService.isMatterAdmin(label.matter.id, currentUser.id, false)){
                return false
            }
        }
//        if(label.organisationId) {
//            AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
//            if(!userRoleService.hasOrgAdminRole(currentUser) && currentUser.organisationId == label.organisationId){
//                return false
//            }
//        }
        return hasReadAccess(entityId)
    }

    @Override
    boolean hasReadAccess(Long entityId) {
        Label label = labelDAOService.findLabel(entityId)
        if (label.organisation != null) {
            if (!isValidOrganisation(label.organisation.id)) {
                return false
            }
        }
        if (label.matterId != null) {
            if (!isValidMatter(label.matter.id)) {
                return false
            }
        }

        return true
    }

    private boolean isValidOrganisation(Long organisationId) throws UserNotInOrganisationException {
        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
        Long userOrg = userService.getUserById(currentUser.id).organisationId as Long
        if (userOrg != organisationId) {
            return false
        }
        return true
    }

    private boolean isValidMatter(Long matterId) {
        List<Long> matters = matterDAOService.getMattersForUser().collect { Matter it -> it.id }
        if (!matters.contains(matterId)) {
            return false
        }
        return true
    }

    private boolean isSysAdmin() {
        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
        currentUser.hydrateRoles()
        return currentUser.roles.contains(Roles.SYSADMIN.code())
    }

    private boolean isOrgAdminForOrg(AppUser user, long organisationId) {
        return user.organisation &&
                user.organisation.id == organisationId &&
                userRoleService.hasOrgAdminRole(user)
    }
}
