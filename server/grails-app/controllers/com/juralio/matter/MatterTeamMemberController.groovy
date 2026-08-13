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
import com.juralio.matter.dao.MatterTeamMemberDAOService
import com.juralio.organisation.OrganisationAuthorisationService
import com.juralio.organisationgroup.MatterGroupPositionService
import grails.plugin.springsecurity.SpringSecurityService
import grails.plugin.springsecurity.annotation.Secured
import org.springframework.http.HttpStatus
import server.PrivateWorkstreamMemberService

@Secured(['IS_AUTHENTICATED_FULLY'])
class MatterTeamMemberController {
    static allowedMethods = [save: "POST", delete: "DELETE"]

    MatterTeamMemberDAOService matterTeamMemberDAOService
    MatterTeamMemberService matterTeamMemberService
    PrivateWorkstreamMemberService privateWorkstreamMemberService
    SpringSecurityService springSecurityService
    UserRoleService userRoleService
    OrganisationAuthorisationService organisationAuthorisationService
    MatterCostsService matterCostsService
    CostsAuthorisationService costsAuthorisationService
    MatterService matterService
    MatterGroupPositionService matterGroupPositionService

    def save() {
        AppUser currentUser = springSecurityService.getCurrentUser()
        boolean isSysadmin = userRoleService.hasSysadminRole(currentUser)
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(currentUser.organisationId)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }
        if (isSysadmin) {
            respond([text: 'Unauthorized'], status: HttpStatus.UNAUTHORIZED)
            return
        }
        try {
            List<AppUser> addedUsers
            if (request.JSON.containsKey("users")) {
                List<Object> users = request.JSON.users
                addedUsers = users.collect({ userId ->
                    if (userId != null) {
                        if(!matterGroupPositionService.isUsersGroupPresentInMatter(userId as long, matterService.getMatterOnly(request.JSON.matter as long))){
                            matterGroupPositionService.create(userId as long, matterService.getMatterOnly(request.JSON.matter as long))
                        }
                        matterTeamMemberService.saveUser(request.JSON.matter as long, userId as long)
                    }
                })
            } else {
                addedUsers = [matterTeamMemberService.saveUser(request.JSON.matter as long, request.JSON.user as long)]
            }

            if (request.JSON.costAccess && costsAuthorisationService.orgCostsSetupForMatterPosition(currentUser, matterService.getMatterOnly(request.JSON.matter as long))) {
                addedUsers.forEach { it ->
                    long id = it.user.id
                    MatterCosts MC = MatterCosts.findByUserAndMatter(it.user,matterService.getMatterOnly(request.JSON.matter as long))
                    if (MC) {
                        it.user.costsId = MC.id
                        return
                    } else {
                        long matterId = request.JSON.matter as long
                        it.user.costsId = matterCostsService.save(matterId, id).id
                    }
                }
            }
            addedUsers.forEach { user -> user.user.isActiveOnMatter = true }
            respond addedUsers, [status: HttpStatus.OK, view: '/matterTeamMember/_matterTeamMemberList']
        } catch (Exception exception) {
            render status: HttpStatus.BAD_REQUEST
        }
    }

    def delete() {
        AppUser currentUser = springSecurityService.getCurrentUser()
        boolean isSysadmin = userRoleService.hasSysadminRole(currentUser)
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(currentUser.organisationId)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }
        try {
                MatterTeamMember teamMember = matterTeamMemberDAOService.get(params.id as long)
                privateWorkstreamMemberService.removeUserFromAllTeams(teamMember.user, teamMember.matter)
                matterTeamMemberService.deleteMatterTeamMember(teamMember)
                respond status: HttpStatus.NO_CONTENT
        } catch (Exception e) {
            render status: HttpStatus.BAD_REQUEST
        }
    }
}
