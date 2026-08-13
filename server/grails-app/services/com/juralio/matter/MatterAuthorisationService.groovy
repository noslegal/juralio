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

import com.juralio.auth.*
import com.juralio.matter.dao.MatterDAOService
import com.juralio.organisation.OrganisationAuthorisationService
import groovy.transform.CompileStatic

@CompileStatic
class MatterAuthorisationService extends BaseAuthorisationService
        implements ReadAuthorisation, UpdateAuthorisation {

    MatterService matterService
    MatterDAOService matterDAOService
    UserRoleService userRoleService
    OrganisationAuthorisationService organisationAuthorisationService

    boolean isOrgAdmin() {
        userRoleService.hasOrgAdminRole(getUser())
    }

    @Override
    boolean hasReadAccess(Long entityId) {
        Matter matter = matterDAOService.get(entityId)
        if (matter && matter.getMatterStatus() == MatterStatus.CLOSED.value()) {
            return hasReadAccessToClosedMatter(entityId)
        }
        return hasReadAccessToActiveMatter(entityId)
    }

    boolean hasReadAccessAndIsMatterAdmin(Long entityId) {
        boolean isMatterAdmin = matterService.isMatterAdmin(entityId, getUserId())
        if (!isMatterAdmin) {
            return false
        } else {
            return hasReadAccess(entityId)
        }
    }

    private boolean hasReadAccessToClosedMatter(long entityId) {
        boolean isMatterAdmin = matterService.isMatterAdmin(entityId, getUserId())
        boolean isOrgAdmin = matterService.isOrgAdmin(entityId, getUser())

        return (isMatterAdmin || isOrgAdmin)
    }

    private boolean hasReadAccessToActiveMatter(long entityId) {
        long userId = getUserId()

        Matter matter = matterDAOService.get(entityId)
        if (matter && matter.isPersonal && userRoleService.hasSysadminRole(getUser())) {
            return true
        }

        if (!matter || matter.organisation.id != getUserOrganisationId()) {
            return false
        }

        boolean isMirrorMatter = matterService.isMirrorMatter(entityId)
        if (!isMirrorMatter &&
                (matterService.isTeamMember(entityId, userId) || matterService.isViewer(entityId, userId))) return true

        return (matterService.isMatterAdmin(entityId, userId)
                ||
                matterService.isMatterCreator(entityId, userId)
                ||
                matterService.isOrgAdmin(entityId, getUser())) && !isMirrorMatter
    }

    @Override
    boolean hasUpdateAccess(Long entityId, boolean matterActivation = false, boolean matterDeletion=false) {
        AppUser user = getUser()
        boolean isMirrorMatter = matterService.isMirrorMatter(entityId)
        return !isMirrorMatter &&
                ((matterActivation ||matterDeletion) && matterService.isOrgAdmin(entityId, user)
                        ||
                        matterService.isMatterAdmin(entityId, user.id)
                        ||
                        matterService.isMatterCreator(entityId, user.id))
    }

    boolean hasAddMatterTeamMemberAccess(long matterId, long matterOrgId) {
        AppUser currentUser = getUser()
        boolean isSysAdminAddingPersonalMatter = userRoleService.hasSysadminRole(currentUser) && matterService.isPersonalMatter(matterId as Long)
        if (isSysAdminAddingPersonalMatter) {
            return true
        }
        boolean isOrgAdmin = organisationAuthorisationService.isOrgAdminForOrg(currentUser, matterOrgId)
        return  matterService.isMatterAdmin(matterId,currentUser.id)  || isOrgAdmin ||hasUpdateAccess(matterId)
    }


    boolean hasAddMatterPartyMemberAccess(long matterId, long matterOrgId, AppUser userToAdd) {
        AppUser currentUser = getUser()
        boolean isOrgAdmin = organisationAuthorisationService.isOrgAdminForOrg(currentUser, matterOrgId)
        boolean isMatterAdmin = matterService.isMatterAdmin(matterId, currentUser.id)
        boolean memberInSameOrg = userToAdd.organisation.id == matterOrgId
        return hasUpdateAccess(matterId) && memberInSameOrg || isOrgAdmin && isMatterAdmin && memberInSameOrg
    }

    boolean hasAddMatterAdminAccess(Long entityId, boolean matterActivation = false) {
        AppUser currentUser = getUser()
        boolean isSysAdminAddingPersonalMatter = userRoleService.hasSysadminRole(currentUser) && matterService.isPersonalMatter(entityId as Long)
        if (isSysAdminAddingPersonalMatter) {
            return true
        }
        boolean isOrgAdmin = !userRoleService.hasSysadminRole(currentUser) && organisationAuthorisationService.isOrgAdminForOrg(currentUser, currentUser.organisation.id)
        return isOrgAdmin || hasUpdateAccess(entityId)
    }

    boolean hasRemoveMatterAdminAccess(Long matterAdminId) {
        AppUser currentUser = getUser()

        boolean isOrgAdmin = !userRoleService.hasSysadminRole(currentUser) && organisationAuthorisationService.isOrgAdminForOrg(currentUser, currentUser.organisation.id)
        return isOrgAdmin || hasDeleteAccess(matterAdminId)
    }

    boolean hasDeleteAccess(Long matterAdminId) {
        // A matter admin may be removed by a matter admin or the matter creator,
        // but never on a mirror matter.
        Long entityId = MatterAdmin.get(matterAdminId).matter.id
        boolean isMatterAdmin = matterService.isMatterAdmin(entityId, getUserId())
        boolean isMatterCreator = matterService.isMatterCreator(entityId, getUserId())
        boolean isMirrorMatter = matterService.isMirrorMatter(entityId)
        return (isMatterAdmin || isMatterCreator) && !isMirrorMatter
    }

    boolean isOrgAdminForSameOrgAsMatter(Long matterId) {
        AppUser user = getUser()
        Matter matter = matterService.getMatterOnly(matterId)

        return matter && user.organisation &&
                user.organisation.id == matter.organisationId &&
                userRoleService.hasOrgAdminRole(user)
    }

    boolean hasAdminAccess(long entityId) {
        return matterService.isMatterAdmin(entityId, getUserId())
    }

    boolean hasTeamMemberAccess(long entityId) {
        return matterService.isTeamMember(entityId, getUserId())
    }

    boolean hasViewerAccess(long entityId) {
        return matterService.isViewer(entityId, getUserId())
    }
    boolean hasCostsAccess(long entityId) {
        return matterService.isCosts(entityId, getUserId())
    }

    boolean hasCostsAndUpdateAccess(long entityId){
        return hasCostsAccess(entityId) && hasAdminAccess(entityId)
    }

    boolean hasCostsAndReadAccess(long entityId){
        return hasCostsAccess(entityId) && hasReadAccess(entityId)
    }
}
