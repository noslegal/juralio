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
import com.juralio.matter.costs.MatterCosts
import com.juralio.organisationgroup.OrganisationGroup
import com.juralio.organisationgroup.OrganisationGroupDTO
import com.juralio.project.Project
import com.juralio.project.ProjectService
import com.juralio.task.Task
import com.juralio.task.status.TaskStatus
import com.juralio.task.team.TaskTeamMember
import grails.gorm.transactions.Transactional
import grails.plugin.springsecurity.SpringSecurityService
import groovy.transform.CompileDynamic
import groovy.transform.CompileStatic

@CompileStatic
@Transactional
class MatterTeamService {
    MatterService matterService
    SpringSecurityService springSecurityService
    ProjectService projectService
    PlaceholdersService placeholdersService
    CostsAuthorisationService costsAuthorisationService
    MatterAuthorisationService matterAuthorisationService


    @CompileDynamic
    List<MatterTeamDTO> getMatterTeam(long matterId, boolean includeTaskCount = false, boolean includePlaceholders = false) {
        if (!matterAuthorisationService.hasReadAccess(matterId)) {
            throw new Exception()
        }
        Matter matter = matterService.getMatterOnly(matterId)
        List<MatterTeamDTO> matterTeam = []
        List<Object> team = (matter.matterAdmins + matter.teamMembers + matter.matterViewers)
                .unique { a, b -> a.user.id <=> b.user.id }
                .sort { a, b ->
                    !fullNamed(a.user) ? !fullNamed(b.user) ? 0 : 1 : !fullNamed(b.user) ? -1 :
                            a.user.lastname.toLowerCase() <=> b.user.lastname.toLowerCase() ?:
                                    b.user.firstname.toLowerCase() <=> b.user.firstname.toLowerCase() ?:
                                            a.user.username <=> b.user.username
                }

        Map taskCount = [:]
        if (includeTaskCount) {
            try {
                List<Project> projects = projectService.getProjectsByMatterId(matterId, true, false, false)
                projects.each { Project p ->
                    Project project = projectService.getProjectOnly(p.id)
                    project.tasks.each {
                        Task task ->
                            task.teamMembers.each {
                                TaskTeamMember ttm ->
                                    if (ttm.user.enabled) {
                                        long userId = ttm.user.id
                                        if (!taskCount.containsKey(userId)) {
                                            taskCount.put(userId, 0)
                                        }
                                        if (task.status == TaskStatus.IN_PROGRESS.value()) {
                                            taskCount.put(userId, taskCount.get(userId) + 1)
                                        }
                                    }
                            }
                    }
                }
            } catch (Exception ignored) {
            }
        }
        team.each { teamMember ->
            MatterTeamDTO mappedMember = new MatterTeamDTO(user: teamMember.user)
            OrganisationGroupDTO orgGroup = new OrganisationGroupDTO(
                name: teamMember.user.organisationGroup?.name,
                id: teamMember.user.organisationGroup?.id ?: 0,
                customLogo: teamMember.user.organisationGroup?.logo != null,
                organisationId: teamMember.user.organisationGroup?.organisation?.id ?: 0
            )
            mappedMember.organisationGroup = orgGroup
            matterTeam.add(mappedMember)

            matter.matterAdmins.each { MatterAdmin admin ->
                if (admin.user.id == teamMember.user.id) {
                    mappedMember.matterAdminId = admin.id
                }
            }

            matter.teamMembers.each { MatterTeamMember member ->
                if (member.user.id == teamMember.user.id) {
                    mappedMember.teamMemberId = member.id
                    mappedMember.dateAdded = member.dateCreated
                }
            }

            matter.matterViewers.each {
                MatterViewer viewer ->
                    if (viewer.user.id == teamMember.user.id) {
                        mappedMember.matterViewerId = viewer.id
                        mappedMember.dateAdded = viewer.dateCreated
                    }
            }

            if(costsAuthorisationService.orgCostsSetupForMatterPosition(teamMember.user, matter)){
                matter.matterCosts.each { MatterCosts mC -> if(mC.user.id ==teamMember.user.id){
                    mappedMember.costsId = mC.id
                }}
            }

            if (matterService.isTeamMember(matter.id, teamMember.user.id)) {
                mappedMember.user.isActiveOnMatter = true
            } else if (matterService.isViewer(matter.id, teamMember.user.id)) {
                mappedMember.user.isViewerOnMatter = true
                mappedMember.user.isActiveOnMatter = true
            }

            if (includeTaskCount) {
                Long tc = taskCount.get(teamMember.user.id)
                if (tc) {
                    mappedMember.taskCount = tc
                }
            }
        }

        List<MatterTeamDTO> sortedAdminMemberInactive = matterTeam.findAll { it.matterAdminId > 0 && it.user.enabled } +
                matterTeam.findAll { it.matterAdminId == 0 && it.user.enabled } +
                matterTeam.findAll { !it.user.enabled }
        sortedAdminMemberInactive.removeAll({})
        if (includePlaceholders) {
            List<Placeholders> placeholders = placeholdersService.getAllPlaceholdersForMatter(matterId)
            placeholders.each { Placeholders placeholder ->
                {
                    if(placeholder.enabled){
                        MatterTeamDTO mtdto = new MatterTeamDTO(isPlaceholder: true)
                        AppUser fakeUser = new AppUser(firstname: placeholder.firstName, lastname: placeholder.lastName, enabled: placeholder.enabled)
                        fakeUser.username = placeholder.emailAddress!=null ? placeholder.emailAddress :''
                        fakeUser.id =  placeholder.id
                        fakeUser.isPlaceholder = true
                        fakeUser.enabled = placeholder.enabled
                        mtdto.user = fakeUser
                        mtdto.taskCount = placeholdersService.getPlaceholderUsageMatter(placeholder.matterId, placeholder.id,  true).size()
                        sortedAdminMemberInactive.add(mtdto)
                    }
                }
            }
        }
        return sortedAdminMemberInactive
    }

    List<AppUser> getMatterTeamMembers(long matterId) {
        Matter matter = matterService.getMatterOnly(matterId)
        if (!matter.teamMembers) {
            return new ArrayList<AppUser>()
        }
        return matter.teamMembers as List<AppUser>
    }

    List<AppUser> getMatterTeamMembersExcludingSelf(Matter matter) {
        if (!matterAuthorisationService.hasReadAccess(matter.id)) {
            throw new Exception()
        }
        List<AppUser> result = new ArrayList<AppUser>()
        if (!matter.teamMembers) {
            return result
        }
        long currentUserId = springSecurityService.getCurrentUserId() as long
        List<MatterTeamMember> mtms = matter.teamMembers.findAll { MatterTeamMember it -> it.id != currentUserId } as List<MatterTeamMember>

        for (MatterTeamMember mtm in mtms) {
            result.add(mtm.user)
        }
        return result
    }

    private boolean fullNamed(AppUser user) { user.firstname && user.lastname }
}
