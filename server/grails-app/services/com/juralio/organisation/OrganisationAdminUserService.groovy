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

import com.juralio.auth.*
import com.juralio.auth.dao.UserSessionEventDAOService
import com.juralio.auth.dto.AppUserDTO
import com.juralio.auth.exception.MaxNumberOfOrganisationOwnersReached
import com.juralio.auth.exception.OnlyOrganisationOwner
import com.juralio.auth.exception.UserDoesNotExistException
import com.juralio.auth.password.TemporaryPasswordService
import com.juralio.organisation.dao.OrganisationDAOService
import com.juralio.organisation.exception.UserAlreadyHasOrganisationException
import com.juralio.organisation.exception.UserNotInOrganisationException
import com.juralio.organisationgroup.OrganisationGroup
import com.juralio.organisationgroup.dao.OrganisationGroupDAOService
import grails.gorm.transactions.Transactional
import grails.plugin.springsecurity.SpringSecurityService

@Transactional
class OrganisationAdminUserService {

    OrganisationDAOService organisationDAOService
    UserSessionEventDAOService userSessionEventDAOService
    UserService userService
    UserAuthTokenService userAuthTokenService
    TemporaryPasswordService temporaryPasswordService
    SpringSecurityService springSecurityService
    UserRoleService userRoleService
    RoleService roleService
    OrganisationAuthorisationService organisationAuthorisationService
    OrganisationGroupDAOService organisationGroupDAOService

    List<AppUser> getUsersFromOrg(long organisationId) {
        if(!organisationAuthorisationService.hasListMembersAccess(organisationId)){
            throw new Exception()
        }
        Organisation organisation = organisationDAOService.getOrganisation(organisationId)
        return organisationDAOService.getUsersFromOrg(organisation)
    }

    List<AppUserDTO> getUsersWithLoginDatesFromOrg(long organisationId) {
        if(!organisationAuthorisationService.hasListMembersAccess(organisationId)){
            throw new Exception()
        }
        Organisation organisation = organisationDAOService.getOrganisation(organisationId)
        List<AppUser> users = organisationDAOService.getUsersFromOrg(organisation)
        List<AppUserDTO> usersWithLastLogin = new ArrayList<AppUserDTO>()

        users.each { user ->
            AppUserDTO userDTO = new AppUserDTO(user)
            List<UserSessionEvent> events = userSessionEventDAOService.getUserLatestLoginDetails(user)
            events.removeAll([null])

            if (events.size() > 0) {
                events.sort { it.time }
                userDTO.mostRecentActivityTime = events.reverse()[0]?.time
            }

            if (events.size() == 0) {
                userDTO.user.hasNeverSignedIn = true
            }

            userDTO.onlineNow = UserAuthToken.findAllByUsername(user.username).size() > 0

            usersWithLastLogin.add(userDTO)
        }
        return usersWithLastLogin
    }

    def addUserToOrganisation(Organisation organisation, AppUser user, boolean changeGroups = false) throws MaxNumberOfOrganisationOwnersReached {
        if(!organisationAuthorisationService.hasAddMemberAccess(organisation.id)){
            throw new Exception()
        }
        if (user.organisation && user.organisation.id != organisation.id) {
            throw new UserAlreadyHasOrganisationException()
        }
        organisation.addToUsers(user)

        organisationDAOService.save(organisation)
        if (user.enabled) {
            user = userService.updateAppUserRolesWhenAddingToAnOrganisation(user, organisation)
        }
        user.hydrateRoles()
        user.mfaEnabled = !!user.organisation?.mfaEnabled
        user.mfaRegistered = false
        user.mfaKey = null

        // Every member of an organisation must belong to a group. Force the internal group when
        // changeGroups is requested, and otherwise default any user that joined without a group
        // (e.g. a create request that did not specify one) so we never persist a group-less member.
        if (changeGroups || !user.organisationGroup) {
            OrganisationGroup newGroup = organisationGroupDAOService.getInternalGroupForOrg(organisation)
            if (newGroup) {
                user.organisationGroup = newGroup
            }
        }
        return user
    }

    def addUserToOrganisation(long organisationId, AppUser user, boolean changeGroups = false) throws MaxNumberOfOrganisationOwnersReached {
        if(!organisationAuthorisationService.hasAddMemberAccess(organisationId)){
            throw new Exception()
        }
        Organisation organisation = organisationDAOService.getOrganisation(organisationId)
        return addUserToOrganisation(organisation, user, changeGroups)
    }

    def addUserToOrganisation(long organisationId, String username, boolean changeGroups = false) throws MaxNumberOfOrganisationOwnersReached {
        if(!organisationAuthorisationService.hasAddMemberAccess(organisationId)){
            throw new Exception()
        }
        AppUser user = userService.findByUsername(username, [lock: true])
        if (!user) {
            throw new UserDoesNotExistException()
        }
        return addUserToOrganisation(organisationId, user, changeGroups)
    }

    def removeUserFromOrganisation(long organisationId, String username) throws OnlyOrganisationOwner {
        if(!organisationAuthorisationService.hasRemoveMemberAccess(organisationId)){
            throw new Exception()
        }
        Organisation organisation = organisationDAOService.getOrganisation(organisationId)
        AppUser user = userService.findByUsername(username, [lock: true])

        if (!user) {
            throw new UserDoesNotExistException()
        }

        if (user.organisation?.id != organisationId) {
            throw new UserNotInOrganisationException()
        }
        if (userRoleService.hasOrgOwnerRole(user)) {
            List<AppUser> orgOwners = user.organisation.users.findAll { userRoleService.hasOrgOwnerRole(it) } as List<AppUser>
            if (orgOwners.size() < 2) {
                throw new OnlyOrganisationOwner()
            } else {
                userRoleService.removeRoleFromUser(user, roleService.getRoleByAuthority(Roles.ORG_OWNER.code()))
            }
        }

        organisation.removeFromUsers(user)

        organisationDAOService.save(organisation)
        user.hydrateRoles()
        userAuthTokenService.invalidateAllSessions(user)
        return user
    }

    def removeUserForDeletionFromOrganisation(AppUser user) throws OnlyOrganisationOwner {
        if(!organisationAuthorisationService.hasRemoveMemberAccess(user.organisationId)){
            throw new Exception()
        }
        Organisation organisation = organisationDAOService.getOrganisation(user.organisationId)
        if (userRoleService.hasOrgOwnerRole(user)) {
            List<AppUser> orgOwners = user.organisation.users.findAll { userRoleService.hasOrgOwnerRole(it) } as List<AppUser>
            if (orgOwners.size() < 2) {
                throw new OnlyOrganisationOwner()
            } else {
                userRoleService.removeRoleFromUser(user, roleService.getRoleByAuthority(Roles.ORG_OWNER.code()))
            }
        }
        organisation.removeFromUsers(user)
        organisationDAOService.save(organisation)

        user.hydrateRoles()
        return user
    }

    def resendUserInvite(AppUser user, organisationId) {
        if(!organisationAuthorisationService.hasAddMemberAccess(organisationId)){
            throw new Exception()
        }
        if (!user) {
            throw new UserDoesNotExistException()
        }
        if (user.organisation?.id != organisationId) {
            throw new UserNotInOrganisationException()
        }
        if(!user.isThirdPartyUser) {
            user.temporaryPassword = temporaryPasswordService.getTemporaryPassword(user)
        }
        userService.emailNewUserWelcome(user)
    }

    List<AppUser> getActiveUsersFromOrg(long organisationId) {
        if(!organisationAuthorisationService.hasListMembersAccess(organisationId)){
            throw new Exception()
        }
        Organisation organisation = organisationDAOService.getOrganisation(organisationId)
        return organisationDAOService.getActiveUsersFromOrg(organisation)
    }
}
