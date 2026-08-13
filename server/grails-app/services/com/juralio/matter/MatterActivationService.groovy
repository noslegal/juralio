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
import com.juralio.recency.dao.RecencyDAOService
import grails.plugin.springsecurity.SpringSecurityService
import groovy.transform.CompileStatic

@CompileStatic
class MatterActivationService {
    SpringSecurityService springSecurityService
    UserRoleService userRoleService
    MatterAdminService matterAdminService
    MatterTeamMemberService matterTeamMemberService
    RecencyDAOService recencyDAOService
    MatterCostsService matterCostsService
    CostsAuthorisationService costsAuthorisationService

    void activateForCurrentUser(Matter matter) {
        AppUser user = springSecurityService.getCurrentUser() as AppUser

        if (userRoleService.hasMatterCreatorRole(user) && matter.creator.id == user.id) {
            MatterAdmin matterAdmin = matterAdminService.save(matter.id, user.id)
            activateMatter(matter)
            Set<MatterAdmin> admins = new HashSet()
            admins.add(matterAdmin)
            matter.matterAdmins = admins
            MatterTeamMember matterTeamMember = new MatterTeamMember(matter: matter, user: user)
            matterTeamMemberService.saveTeamMember(matterTeamMember)
            if (costsAuthorisationService.orgCostsSetupForMatterPosition(user, matter)) {
                MatterCosts matterCosts = matterCostsService.save(matter.id, user.id)
            }
        }
    }

    void activateForNewUser(Matter matter, AppUser user) {
        MatterAdmin matterAdmin = matterAdminService.save(matter.id, user.id)
        activateMatter(matter)
        Set<MatterAdmin> admins = new HashSet()
        admins.add(matterAdmin)
        matter.matterAdmins = admins
        MatterTeamMember matterTeamMember = new MatterTeamMember(matter: matter, user: user)
        matterTeamMemberService.saveTeamMember(matterTeamMember)

    }

    void activateMatter(Matter matter) {
        matter.matterStatus = MatterStatus.ACTIVE.value()
    }

    void markMatterForDeletion(Matter matter) {
        matter.matterStatus = MatterStatus.PENDING_DELETION.value()
        matter.projects.each {
            if (it.active) {
                it.active = false
                it.isPendingDeletion = true
            }
        }
        closeMatter(matter)
    }

    void activateProjects(Matter matter) {
        if (!matter.projects) {
            return
        }
        matter.projects.each {
            if (it.isPendingDeletion) {
                it.active = true
                it.isPendingDeletion = false
            }
        }
    }

    void closeMatter(Matter matter) {
        recencyDAOService.clearAllMatterRecency(matter)
    }
}
