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

import com.juralio.common.ValidatedParameterMap
import com.juralio.organisationgroup.dao.GroupPositionDAOService
import com.juralio.organisationgroup.dao.OrganisationGroupDAOService
import com.juralio.organisation.Organisation
import grails.gorm.transactions.Transactional

@Transactional
class OrganisationGroupService {
    OrganisationGroupDAOService organisationGroupDAOService
    GroupPositionDAOService groupPositionDAOService

    List<OrganisationGroup> getAll(){
        return organisationGroupDAOService.getAllGroups()
    }

    OrganisationGroup getGroup(long id) {
        return organisationGroupDAOService.getGroup(id)
    }

    List<OrganisationGroup> getGroupsForOrg(Organisation org) {
        return organisationGroupDAOService.getGroupsForOrganisation(org)
    }

    List<OrganisationGroupDTO> formatList(List<OrganisationGroup> groupList) {
        List<OrganisationGroupDTO> formattedList = []
        groupList.forEach {OrganisationGroup group ->
            int userCount = organisationGroupDAOService.getUsersInGroup(group).size()
            int matterCount = organisationGroupDAOService.getMatterCountForGroup(group)
            formattedList.add(new OrganisationGroupDTO(name: group.name, id: group.id, userCount: userCount, matterCount: matterCount, isInternal: group.isInternal, defaultPosition: new GroupPositionDTO(positionId: group.groupPosition.id,name: group.groupPosition.name), customLogo: group.logo != null && group.logo.length > 0))
        }
        return formattedList
    }

    OrganisationGroup saveGroup(ValidatedParameterMap validatedBody, Organisation org){
        OrganisationGroup newGroup = new OrganisationGroup(validatedBody)
        List<GroupPosition> defaultPositions = groupPositionDAOService.getDefaultPositions(org)
        int positionIndex = validatedBody.positionId != null ? validatedBody.positionId as int : 0
        newGroup.groupPosition = defaultPositions[positionIndex]
        newGroup.organisation = org
        OrganisationGroup savedGroup = organisationGroupDAOService.saveGroup(newGroup)
        return savedGroup
    }

    OrganisationGroup updateGroup(ValidatedParameterMap validatedBody, OrganisationGroup groupToUpdate){
        if(validatedBody.name){
            groupToUpdate.name = validatedBody.name
        }
        if(validatedBody.positionId != null){
            groupToUpdate.groupPosition = groupPositionDAOService.getDefaultPositions(groupToUpdate.organisation)[validatedBody.positionId]
        }
        OrganisationGroup savedGroup = organisationGroupDAOService.saveGroup(groupToUpdate)
        return savedGroup

    }

    OrganisationGroup getInternalGroupForOrg(Organisation org){
        return organisationGroupDAOService.getInternalGroupForOrg(org)
    }

    def saveLogo(long groupId, byte[] logoBytes, String mimeType) {
        OrganisationGroup group = organisationGroupDAOService.getGroup(groupId)
        group.logo = logoBytes
        group.logoMimeType = mimeType
        organisationGroupDAOService.saveGroup(group)
    }

    def removeLogo(long groupId) {
        OrganisationGroup group = organisationGroupDAOService.getGroup(groupId)
        group.logo = null
        group.logoMimeType = null
        organisationGroupDAOService.saveGroup(group)
    }

    def generateDefaults(Organisation defaultOrganisation){
        OrganisationGroup defaultGroup = new OrganisationGroup(name: defaultOrganisation.name, isInternal: true)
        defaultGroup.organisation = defaultOrganisation
        //make the default groups for the org so we can save the group
        GroupPosition defaultClient = new GroupPosition(organisation: defaultOrganisation, name: 'Client', matter: null)
        defaultClient.save()
        GroupPosition defaultAdvisor = new GroupPosition(organisation: defaultOrganisation, name: 'Advisor', matter: null)
        defaultAdvisor.save()
        defaultGroup.groupPosition = defaultClient
        defaultGroup.save()
        return defaultGroup
    }
}
