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

import com.juralio.auth.AppUser
import com.juralio.auth.UserRoleService
import com.juralio.matter.costs.MatterCosts
import com.juralio.matter.exception.CannotAddInactiveUserException
import com.juralio.matter.exception.CannotAddInvalidMatterCostsException
import com.juralio.matter.exception.CannotAddSysAdminAsMatterCosts
import com.juralio.matter.exception.CannotAddUserNotInOrganisationException
import grails.gorm.transactions.Transactional
import grails.plugin.springsecurity.SpringSecurityService
import org.springframework.security.access.AccessDeniedException

@Transactional
class MatterCostsService {
    SpringSecurityService springSecurityService
    UserRoleService userRoleService
    MatterAuthorisationService matterAuthorisationService

    MatterCosts getMatterCosts(Matter matter, AppUser user){
        return MatterCosts.findByMatterAndUser(matter,user)
    }

    MatterCosts save(long matterId, long userId) {
        if (!matterAuthorisationService.hasAddMatterAdminAccess(matterId)) {
            throw new Exception()
        }
        Matter matter = Matter.get(matterId)
        AppUser user = AppUser.get(userId)
        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
        if (userRoleService.hasSysadminRole(user)) {
            throw new CannotAddSysAdminAsMatterCosts()
        }

        if (user && !user.enabled) {
            throw new CannotAddInactiveUserException()
        }

        if(!userRoleService.hasSysadminRole(currentUser)){
            if (!user.organisation || user.organisation.id != matter.organisation.id||user.organisation.id!=currentUser.organisation.id) {
                throw new CannotAddUserNotInOrganisationException()
            }
        }else {
            if (!user.organisation || user.organisation.id != matter.organisation.id) {
                throw new CannotAddUserNotInOrganisationException()
            }
        }


        MatterCosts matterCosts = new MatterCosts(matter: matter, user: user,dateCreated: new Date(),lastUpdated: new Date())
        matterCosts.validate()

        if (!matterCosts.hasErrors()) {
            matterCosts.save(failOnError: true)
            return matterCosts
        } else {
            throw new CannotAddInvalidMatterCostsException()
        }
    }


    def delete(long matterId, long matterCostsId) throws AccessDeniedException {
        if (!matterAuthorisationService.hasAddMatterAdminAccess(matterId)) {
            throw new Exception()
        }
        MatterCosts matterCost = MatterCosts.get(matterCostsId)
        if (matterCost.matter.id != matterId) {
            throw new AccessDeniedException("No access to Matter.")
        }
        Matter matter = matterCost.matter
        matter.removeFromMatterCosts(matterCost)
        matterCost.delete(flush: true)
    }
}
