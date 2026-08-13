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

import com.juralio.auth.dao.UserDAOService
import com.juralio.auth.exception.UserDoesNotExistException
import com.juralio.organisation.OrganisationAuthorisationService
import grails.gorm.transactions.Transactional
import groovy.transform.CompileStatic

@Transactional
@CompileStatic
class UserAuthorisationService extends BaseAuthorisationService {

    UserRoleService userRoleService
    UserDAOService userDAOService
    OrganisationAuthorisationService organisationAuthorisationService
    UserService userService

    boolean hasCreateUserAccess() {
        AppUser currentUser = getUser()
        return userRoleService.hasSysadminRole(currentUser) || userRoleService.hasOrgAdminRole(currentUser)
    }

    boolean hasMutateUserAccess(long userId) {
        AppUser currentUser = getUser()
        AppUser targetUser = userService.getUserById(userId)
        if (!currentUser) {
            throw new UserDoesNotExistException()
        }
        boolean isCurrentUser = currentUser == targetUser
        boolean isSysadmin = userRoleService.hasSysadminRole(currentUser)
        boolean isOrgAdminForOrg = targetUser && targetUser.organisation &&
                organisationAuthorisationService.isOrgAdminForOrg(currentUser, targetUser.organisation.id)

        return isSysadmin || isOrgAdminForOrg || isCurrentUser
    }
}
