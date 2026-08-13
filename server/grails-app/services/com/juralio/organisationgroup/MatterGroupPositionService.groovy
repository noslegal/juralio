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

package com.juralio.organisationgroup

import com.juralio.auth.AppUser
import com.juralio.auth.UserService
import com.juralio.matter.Matter
import com.juralio.matter.MatterAdminService
import com.juralio.matter.MatterCostsService
import com.juralio.matter.MatterDeletionService
import com.juralio.matter.MatterService
import com.juralio.matter.MatterTeamDTO
import com.juralio.matter.MatterTeamMember
import com.juralio.matter.MatterTeamMemberService
import com.juralio.matter.MatterTeamService
import com.juralio.matter.MatterViewerService
import com.juralio.matter.dao.MatterTeamMemberDAOService
import com.juralio.organisationgroup.dao.MatterGroupPositionDAOService
import com.juralio.organisationgroup.dao.OrganisationGroupDAOService
import grails.gorm.transactions.Transactional
import grails.plugin.springsecurity.SpringSecurityService

@Transactional
class MatterGroupPositionService {
    MatterGroupPositionDAOService matterGroupPositionDAOService
    OrganisationGroupDAOService organisationGroupDAOService
    MatterService matterService
    UserService userService
    MatterTeamService matterTeamService
    MatterAdminService matterAdminService
    MatterTeamMemberService matterTeamMemberService
    MatterCostsService matterCostsService
    MatterViewerService matterViewerService
    MatterTeamMemberDAOService matterTeamMemberDAOService
    MatterDeletionService matterDeletionService
    SpringSecurityService springSecurityService

    def populateMatterGroupPositions(Matter matter) {

        List<MatterGroupPosition> matterGroupPositionList = matterGroupPositionDAOService.getMatterGroupPositions(matter)
        List<MatterGroupPositionDTO>  dtoList = []
        matterGroupPositionList.forEach {

            MatterGroupPositionDTO formattedDTO = new MatterGroupPositionDTO( group: organisationGroupDAOService.getGroup(it.organisationGroupId), position:  GroupPosition.findById(it.groupPosition.id))
            dtoList.add(formattedDTO)
        }
        matter.positionsOfGroups = dtoList
    }

    // Intentional 2-position swap: changing one group's position flips every group in the matter to
    // "the other" position (only correct while orgs have exactly two positions - Advisor/Client; this
    // needs reworking to support more than two). The validated groupId/positionId are therefore not used
    // here. The matter's cost data is then wiped on purpose: rate tables/periods/rates are position-
    // scoped, so a position swap invalidates them and they must be re-entered under the new arrangement.
    def updateGroupPositionInMatter(matter_id, validatedBody){
        AppUser currentUser = springSecurityService.getCurrentUser()
        Matter matter = matterService.getMatter(matter_id)
        List<MatterGroupPosition> matterGroups = MatterGroupPosition.findAllByMatter(matter)
        List<GroupPosition> positions = GroupPosition.findAllByOrganisation(currentUser.organisation)
        matterGroups.each {MatterGroupPosition it ->{
            it.groupPosition = positions.find(x->x.id!=it.groupPosition.id)
            it.save()
        }}
        Map<Long, String> deletedItems = new HashMap<>()
        matterDeletionService.deleteCostsData(matter,deletedItems)
    }

    MatterGroupPosition create(long user_id, Matter matter){
        AppUser currentUser = springSecurityService.getCurrentUser()
        AppUser addedUser = userService.getUserById(user_id)
        List<GroupPosition> positions = GroupPosition.findAllByOrganisation(currentUser.organisation)
        GroupPosition position = positions.find(x->x.id!=MatterGroupPosition.findByMatter(matter).groupPosition.id)
        MatterGroupPosition mGP = new MatterGroupPosition(matter: matter, organisationGroup: addedUser.organisationGroup, groupPosition: position)
        mGP.save()
        return mGP
    }

    Boolean isUsersGroupPresentInMatter(long user_id, Matter matter){
        AppUser addedUser = userService.getUserById(user_id)
        MatterGroupPosition matterGroupPosition = matterGroupPositionDAOService.getMatterGroupPosition(matter, addedUser.organisationGroup)
        if(matterGroupPosition){
            return true
        }else{
            return false
        }
    }

    void deleteGroupFromMatter(long matterId,long groupId){
        Matter matter = matterService.getMatter(matterId)
        OrganisationGroup group = organisationGroupDAOService.getGroup(groupId)
        matterGroupPositionDAOService.delete(matter,group)
        List<MatterTeamDTO> team = matterTeamService.getMatterTeam(matterId)
        team = team.findAll(x->x.organisationGroup.id ==groupId)
        if(team.size()>0){
            team.forEach {
                if(it.matterAdminId){
                    matterAdminService.delete(matterId,it.matterAdminId)
                }
                if(it.matterViewerId){
                    matterViewerService.deleteMatterViewer(it.matterViewerId,matterId)
                }
                if(it.costsId){
                    matterCostsService.delete(matterId,it.costsId)
                }
                if(it.teamMemberId){
                    MatterTeamMember mtm = matterTeamMemberDAOService.get(it.teamMemberId as long)
                    matterTeamMemberService.deleteMatterTeamMember(mtm)
                }
            }
        }
    }
}
