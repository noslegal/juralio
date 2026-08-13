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
import com.juralio.linkresource.LinkResource
import com.juralio.linkresource.LinkResourceService
import com.juralio.organisationgroup.GroupPosition
import com.juralio.organisationgroup.GroupPositionDTO
import com.juralio.organisationgroup.GroupPositionService
import com.juralio.organisationgroup.MatterGroupPositionDTO
import com.juralio.organisationgroup.MatterGroupPositionService
import com.juralio.project.Project
import com.juralio.project.ProjectOverviewService
import com.juralio.project.WorkstreamOverviewForMatter
import grails.gorm.transactions.Transactional
import grails.plugin.springsecurity.SpringSecurityService

@Transactional
class MatterOverviewService {
    MatterService matterService
    ProjectOverviewService projectOverviewService
    MatterActivityService matterActivityService
    LinkResourceService linkResourceService
    SpringSecurityService springSecurityService
    MatterAuthorisationService matterAuthorisationService
    MatterGroupPositionService matterGroupPositionService
    GroupPositionService groupPositionService

    private List<WorkstreamOverviewForMatter> getWorkstreamOverviews(Matter matter) {
        List<WorkstreamOverviewForMatter> overviews = []
        matter.projects.each { Project workstream ->
            overviews.push(projectOverviewService.getWorkstreamOverviewForMatter(workstream, matter.projects.findAll { it.active }.size() == 1))

        } as List<WorkstreamOverviewForMatter>
        return overviews
    }


    MatterOverview getMatterOverview(Long matterId) {
        if (!matterAuthorisationService.hasReadAccess(matterId)) {
            throw new Exception()
        }
        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
        Matter matter = matterService.getMatter(matterId)
        matterActivityService.populateActivities(matter)
        matterGroupPositionService.populateMatterGroupPositions(matter)
        groupPositionService.populateGroupsForMatter(matter)
        List<WorkstreamOverviewForMatter> workstreamOverviews = getWorkstreamOverviews(matter)
        MatterOverview overview = new MatterOverview(id: matterId, name: matter.name, clientName: matter.clientName, userDefinedReferenceNumber: matter.userDefinedReferenceNumber, description: matter.description)
        overview.workstreams = workstreamOverviews
        overview.teamMembers = matter.teamMembers as List
        overview.admins = matter.matterAdmins as List
        overview.viewers = matter.matterViewers as List
        overview.activities = matter.activities
        overview.positionsOfGroups = matter.positionsOfGroups
        List<GroupPositionDTO> dtoList = []
        matter.groupPositions.forEach {
            GroupPositionDTO dto = new GroupPositionDTO(positionId: it.id, name: it.name)
            dtoList.add(dto)
        }
        overview.positionsForMatter = dtoList
        overview.postCount = matter.projects.findAll { it.active && it.isPrivate ? it.privateWorkstreamTeam.find { pw -> pw.user == currentUser } : true }.collect { projectOverviewService.getPostCount(it) }.sum()

        if(matterService.isMatterEditor(matterId, currentUser.id) || matterService.isViewer(matterId, currentUser.id)){
            List<LinkResource> resources = linkResourceService.getLinkResourcesForMatter(matter.id).findAll { !it.workstreamId }
            overview.resourceCount = resources.size()
            overview.resources = resources.stream().limit(3).collect()
        }
        return overview
    }
}


class MatterOverview {
    Long id
    String name
    String clientName
    String userDefinedReferenceNumber
    String description
    List<WorkstreamOverviewForMatter> workstreams
    List<MatterTeamMember> teamMembers
    List<MatterAdmin> admins
    List<MatterViewer> viewers
    List<String> activities = []
    List<MatterGroupPositionDTO> positionsOfGroups = []
    List<GroupPositionDTO> positionsForMatter = []

    Long postCount = 0
    Long resourceCount = 0
    List<LinkResource> resources
}