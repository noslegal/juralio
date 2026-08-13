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

package server

import com.juralio.auth.AppUser
import com.juralio.auth.UserRoleService
import com.juralio.matter.Matter
import com.juralio.matter.MatterService
import com.juralio.organisation.OrganisationAuthorisationService
import com.juralio.project.Project
import com.juralio.project.ProjectService
import com.juralio.project.dao.PrivateWorkstreamMemberDAOService
import grails.plugin.springsecurity.SpringSecurityService
import grails.plugin.springsecurity.annotation.Secured
import org.springframework.http.HttpStatus

@Secured(['IS_AUTHENTICATED_FULLY'])
class PrivateWorkstreamMemberController {

    static allowedMethods = [getAll: "GET", save: "POST", delete: "DELETE"]

    PrivateWorkstreamMemberService privateWorkstreamMemberService
    PrivateWorkstreamMemberDAOService privateWorkstreamMemberDAOService
    MatterService matterService
    SpringSecurityService springSecurityService
    ProjectService projectService
    UserRoleService userRoleService
    OrganisationAuthorisationService organisationAuthorisationService

    def getAll() {
        try {
            AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
            long workstreamId = params.project_id as long
            long matterId = params.matter_id as long

            Project workstream = Project.get(workstreamId)
            Matter matter = Matter.get(matterId)
            if(currentUser.organisationId != matter.organisationId || matter.id != workstream.matterId ){
                throw new Exception()
            }

            List<PrivateWorkstreamMember> privateWorkstreamMembers = privateWorkstreamMemberService.getMembers(matter, workstream)

            respond privateWorkstreamMembers
        } catch (Exception exception) {
            render status: HttpStatus.BAD_REQUEST
        }
    }

    def save() {
        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
        boolean isSysadmin = userRoleService.hasSysadminRole(currentUser)
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(currentUser.organisationId)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }
        try {
            def addedUsers
            List<Object> users = request.JSON.users

            long workstreamId = params.project_id as long
            long matterId = params.matter_id as long
            boolean isMatterAdmin = matterService.isMatterAdmin(matterId, currentUser.id)
            if (!isMatterAdmin) {
                throw new Exception('')
            }

            Project workstream = Project.get(workstreamId)
            Matter matter = matterService.getMatterOnly(matterId)
            if(!isSysadmin){
                if(currentUser.organisation.id != matter.organisation.id || workstream.matterId != matter.id){
                    throw new Exception()
                }
            }

            addedUsers = users.collect({ userId ->
                if (userId != null) {
                    AppUser userToAdd = AppUser.get(userId)
                    privateWorkstreamMemberService.saveMember(matter, workstream, userToAdd)
                }
            })

            respond addedUsers
        } catch (Exception exception) {
            render status: HttpStatus.BAD_REQUEST
        }
    }


    def delete() {
        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
        boolean isSysadmin = userRoleService.hasSysadminRole(currentUser)
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(currentUser.organisationId)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }
        try {
            long workstreamId = params.project_id as long
            long matterId = params.matter_id as long
            boolean isMatterAdmin = matterService.isMatterAdmin(matterId, currentUser.id)
            if (!isMatterAdmin) {
                throw new Exception('')
            }

            Project workstream = Project.get(workstreamId)
            Matter matter = matterService.getMatterOnly(matterId)
            PrivateWorkstreamMember privateWorkstreamMember = privateWorkstreamMemberDAOService.get(params.id as long)
            if (privateWorkstreamMemberService.deleteMember(matter, workstream, privateWorkstreamMember)) {
                respond status: HttpStatus.OK
            }
        } catch (Exception e) {
            render status: HttpStatus.BAD_REQUEST
        }
    }
}
