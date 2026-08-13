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
import com.juralio.auth.exception.UserDoesNotExistException
import com.juralio.organisation.dao.OrganisationDAOService
import com.juralio.organisation.exception.OrganisationDoesNotExistException
import grails.gorm.transactions.Transactional

@Transactional
class SysAdminOrganisationAdminService {

    UserService userService
    OrganisationDAOService organisationDAOService
    RoleService roleService
    UserRoleService userRoleService

    AppUser addOrgAdmin(long organisationId, String username) {
        AppUser user = getUser(username)
        Organisation organisation = getOrganisation(organisationId)
        Role orgAdminRole = getOrgAdminRole()

        ensureUserAndOrgExist(user, organisation)

        organisation.addToUsers(user)
        userRoleService.assignRoleToUser(user, orgAdminRole)
        organisationDAOService.save(organisation)

        return user
    }

    AppUser removeOrgAdmin(long organisationId, String username) {
        AppUser user = getUser(username)
        Organisation organisation = getOrganisation(organisationId)
        Role orgAdminRole = getOrgAdminRole()

        ensureUserAndOrgExist(user, organisation)

        userRoleService.removeRoleFromUser(user, orgAdminRole)
        organisationDAOService.save(organisation)

        return user
    }

    private AppUser getUser(String username) {
        return userService.findByUsername(username, [:])
    }

    private Organisation getOrganisation(long organisationId) {
        return organisationDAOService.getOrganisation(organisationId)
    }

    private Role getOrgAdminRole() {
        return roleService.getRoleByAuthority(Roles.ORG_ADMIN.code())
    }

    private void ensureUserAndOrgExist(AppUser user, Organisation organisation) {
        if (user == null) {
            throw new UserDoesNotExistException()
        } else if (organisation == null) {
            throw new OrganisationDoesNotExistException()
        }
    }
}