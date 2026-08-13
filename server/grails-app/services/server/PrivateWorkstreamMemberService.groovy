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
import com.juralio.matter.*
import com.juralio.matter.exception.CannotRemoveTeamMemberException
import com.juralio.project.Project
import com.juralio.project.ProjectAuthorisationService
import com.juralio.project.ProjectService
import com.juralio.project.dao.PrivateWorkstreamMemberDAOService
import com.juralio.project.exception.*
import grails.gorm.transactions.Transactional
import grails.plugin.springsecurity.SpringSecurityService
import grails.validation.ValidationException

@Transactional
class PrivateWorkstreamMemberService {

    SpringSecurityService springSecurityService
    MatterService matterService
    UserRoleService userRoleService
    ProjectService projectService
    ProjectAuthorisationService projectAuthorisationService
    PrivateWorkstreamMemberDAOService privateWorkstreamMemberDAOService


    List<PrivateWorkstreamMember> getMembers(Matter matter, Project workstream) {
        if(!projectAuthorisationService.hasPrivateWorkstreamMemberAccess(matter,workstream)){
            throw new Exception()
        }
        List<PrivateWorkstreamMember> privateWorkstreamMembers = privateWorkstreamMemberDAOService.findAllByWorkstream(workstream)
        privateWorkstreamMembers = privateWorkstreamMembers.collect({ privateWorkstreamMember ->
            MatterAdmin matterAdmin = MatterAdmin.findByMatterAndUser(matter, privateWorkstreamMember.user)
            MatterTeamMember matterEditor = MatterTeamMember.findByMatterAndUser(matter, privateWorkstreamMember.user)
            MatterViewer matterViewer = MatterViewer.findByMatterAndUser(matter, privateWorkstreamMember.user)
            if (matterAdmin) privateWorkstreamMember.matterAdmin = matterAdmin ? matterAdmin.id : 0
            if (matterEditor) privateWorkstreamMember.matterTeamMember = matterEditor ? matterEditor.id : 0
            if (matterViewer) privateWorkstreamMember.matterViewer = matterViewer ? matterViewer.id : 0
            return privateWorkstreamMember
        })
        return privateWorkstreamMembers
    }

    PrivateWorkstreamMember saveMember(Matter matter, Project workstream, AppUser userToAdd) {
        if(!projectAuthorisationService.hasAddPrivateWorkstreamMemberAccess(matter,workstream,userToAdd)){
            throw new Exception()
        }
        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
        if (!userToAdd.enabled) {
            throw new CannotAddInactiveUserException()
        }

        if (!matterService.hasUnrestrictedView(matter, currentUser)) {
            throw new CannotAddMemberException(
                    "Cannot add team members without being a matter administrator")
        }

        if (userRoleService.hasSysadminRole(userToAdd)) {
            throw new InvalidUserException("Sysadmin user cannot be added as team member")
        }

        if (!userToAdd.organisation || userToAdd.organisation.id != matter.organisation.id) {
            throw new CannotAddUserNotInOrganisationException("User not in organisation")
        }
        PrivateWorkstreamMember privateWorkstreamMember = new PrivateWorkstreamMember(user: userToAdd, workstream: workstream)
        // Check if user already exists for workstream
        if (privateWorkstreamMemberDAOService.findByWorkstreamAndUserId(workstream, userToAdd) != null) {
            throw new PrivateWorkstreamMemberException("User already exists")
        }
        try {
            privateWorkstreamMember.save(failOnError: true, flush: true)
        } catch (ValidationException e) {
            throw new PrivateWorkstreamMemberException("Failed to save private workstream member")
        }

        return privateWorkstreamMember
    }

    Boolean deleteMember(Matter matter, Project workstream, PrivateWorkstreamMember privateWorkstreamMemberToRemove) {
        if(!projectAuthorisationService.hasRemovePrivateWorkstreamMemberAccess(matter)){
            throw new Exception()
        }
        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
        if (!matterService.hasUnrestrictedView(matter, currentUser)) {
            throw new CannotRemoveTeamMemberException(
                    "Cannot remove team members without being a matter administrator")
        }
        if(privateWorkstreamMemberToRemove.workstreamId != workstream.id || privateWorkstreamMemberToRemove.workstream.matterId != matter.id){
            throw new CannotRemoveTeamMemberException(
                    "Cannot remove team members from bad access tree")
        }

        //set to zero to stop cascade
        privateWorkstreamMemberToRemove.matterTeamMember = 0
        workstream.privateWorkstreamTeam.remove(privateWorkstreamMemberToRemove)
        workstream.save()
        privateWorkstreamMemberToRemove.delete()
        return true
    }

    def removeUserFromAllTeams(AppUser userToRemove, Matter matter) {
        if(!projectAuthorisationService.hasRemovePrivateWorkstreamMemberAccess(matter)){
            throw new Exception()
        }
        List<Project> workstreams = projectService.getProjectsByMatterId(matter.id, false, false)
        workstreams.each { Project workstream ->
            PrivateWorkstreamMember privateWorkstreamMemberToRemove = privateWorkstreamMemberDAOService.findByWorkstreamAndUserId(workstream, userToRemove)
            if (privateWorkstreamMemberToRemove) {
                deleteMember(matter, workstream, privateWorkstreamMemberToRemove)
            }
        }
    }
}
