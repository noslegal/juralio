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

package com.juralio.organisationgroup.dao

import com.juralio.auth.AppUser
import com.juralio.matter.MatterStatus
import com.juralio.organisationgroup.MatterGroupPosition
import com.juralio.organisationgroup.OrganisationGroup
import com.juralio.organisation.Organisation
import grails.gorm.transactions.Transactional

@Transactional
class OrganisationGroupDAOService {

    List<OrganisationGroup> getAllGroups(){
        return OrganisationGroup.list()
    }

    OrganisationGroup getGroup(long id) {
        return OrganisationGroup.findById(id)
    }

    OrganisationGroup getInternalGroupForOrg(Organisation org){
        return OrganisationGroup.findByOrganisationAndIsInternal(org, true)
    }

    List<OrganisationGroup> getGroupsForOrganisation(Organisation org){
        return OrganisationGroup.findAllByOrganisation(org)
    }

    List<AppUser> getUsersInGroup(OrganisationGroup group){
        return  AppUser.findAllByEnabledAndOrganisationGroup(true, group)
    }

    int getMatterCountForGroup(OrganisationGroup group){
        List<MatterGroupPosition> allUsesInMatter = []
        allUsesInMatter = MatterGroupPosition.findAllByOrganisationGroup(group)
        List<MatterGroupPosition> allOpenUsesInMatter = allUsesInMatter.findAll{it.matter.matterStatus != MatterStatus.INACTIVE.value()}
        return allOpenUsesInMatter.size()
    }

    OrganisationGroup saveGroup(OrganisationGroup newGroup){
        OrganisationGroup savedGroup =  newGroup.save(failOnError: 'true')
        return savedGroup
    }

    def deleteGroup(OrganisationGroup group){
        group.delete()
    }
}
