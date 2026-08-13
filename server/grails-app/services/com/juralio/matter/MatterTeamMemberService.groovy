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
import com.juralio.matterevent.MatterEventService
import com.juralio.matterevent.payload.AddedToMatterPayload
import com.juralio.matterevent.payload.RemovedFromMatterPayload
import com.juralio.matter.dao.MatterTeamMemberDAOService
import com.juralio.matter.exception.CannotAddInactiveUserException
import com.juralio.matter.exception.CannotAddUserNotInOrganisationException
import com.juralio.matter.exception.CannotRemoveTeamMemberException
import com.juralio.matter.exception.InvalidRoleForMatterViewerException
import com.juralio.recency.RecencyService
import grails.gorm.transactions.Transactional
import grails.plugin.springsecurity.SpringSecurityService
import grails.validation.ValidationException
import groovy.transform.CompileStatic

@CompileStatic
@Transactional
class MatterTeamMemberService {

    SpringSecurityService springSecurityService
    MatterService matterService
    UserRoleService userRoleService
    MatterEventService matterEventService
    MatterTeamMemberDAOService matterTeamMemberDAOService
    RecencyService recencyService
    MatterAuthorisationService matterAuthorisationService

    MatterTeamMember getMtm(Matter matter,AppUser user){
        return matterTeamMemberDAOService.findByMatterAndUser(matter,user)
    }

    MatterTeamMember saveUser(long matterId, long userId) {
        Matter matter = Matter.get(matterId)
        AppUser user = AppUser.get(userId)
        MatterTeamMember matterTeamMember = new MatterTeamMember(matter: matter, user: user)
        return saveTeamMember(matterTeamMember)
    }

    MatterTeamMember saveTeamMember(MatterTeamMember teamMember) {
        if(!matterAuthorisationService.hasAddMatterTeamMemberAccess(teamMember.matter.id,teamMember.matter.organisation.id)){
            throw new Exception()
        }
        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
        AppUser user = AppUser.get(teamMember.user.id)

        if (!user.enabled) {
            throw new CannotAddInactiveUserException()
        }

        if (!matterService.hasUnrestrictedView(teamMember.matter, currentUser)) {
            throw new CannotRemoveTeamMemberException(
                    "Cannot add team members without being a matter administrator")
        }

        if (userRoleService.hasSysadminRole(teamMember.user)) {
            throw new InvalidRoleForMatterViewerException("Sysadmin user cannot be added as team member")
        }
        if(!userRoleService.hasSysadminRole(currentUser)){
            if (!teamMember.user.organisation || teamMember.user.organisation.id != teamMember.matter.organisation.id||teamMember.user.organisation.id !=currentUser.organisation.id) {
                throw new CannotAddUserNotInOrganisationException()
            }
        }else{
            if (!teamMember.user.organisation || teamMember.user.organisation.id != teamMember.matter.organisation.id) {
                throw new CannotAddUserNotInOrganisationException()
            }
        }
        try {
            teamMember.save(failOnError: true, flush: true)
        } catch (ValidationException e) {
            return matterTeamMemberDAOService.findByMatterAndUser(teamMember.matter, teamMember.user)
        }

        matterEventService.publish(new AddedToMatterPayload(
            matterReference: teamMember.matter.caseId, matterName: teamMember.matter.name,
            affectedMemberId: user.id, affectedMemberUsername: user.username,
            affectedMemberFirstName: user.firstname, affectedMemberLastName: user.lastname,
            adminStatusChanged: false
        ), springSecurityService.getCurrentUser() as AppUser, teamMember.matter)

        return teamMember
    }

    boolean deleteMatterTeamMember(MatterTeamMember teamMember) {
        if (!matterAuthorisationService.hasUpdateAccess(teamMember.matter.id,true)) {
            throw new Exception()
        }
        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
        AppUser user = AppUser.get(teamMember.user.id)
        Matter matter = teamMember.matter

        if (!matterService.hasUnrestrictedView(teamMember.matter, currentUser)) {
            throw new CannotRemoveTeamMemberException(
                    "Cannot remove team members without being a matter administrator")
        }
        recencyService.removeRecencyForUser(user, teamMember.matter.id)
        matterEventService.publish(new RemovedFromMatterPayload(
            matterReference: matter.caseId, matterName: matter.name,
            affectedMemberId: user.id, affectedMemberUsername: user.username,
            affectedMemberFirstName: user.firstname, affectedMemberLastName: user.lastname,
            adminStatusChanged: false
        ), currentUser, matter)
        matter.removeFromTeamMembers(teamMember)
        teamMember.delete(flush: true)

        return true

    }
}
