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
import com.juralio.matter.Matter
import com.juralio.organisationgroup.dao.GroupPositionDAOService
import grails.gorm.transactions.Transactional
import grails.plugin.springsecurity.SpringSecurityService

@Transactional
class GroupPositionService {

    GroupPositionDAOService groupPositionDAOService
    SpringSecurityService springSecurityService

    def populateGroupsForMatter(Matter matter) {
        List<GroupPosition> allPositions = []

        //get org defaults
        allPositions = groupPositionDAOService.getDefaultPositions(matter.organisation)

        //get Matter specific positions -TODO when matter specific positions are added

        matter.groupPositions = allPositions
    }

    def fetchOrgPositions(){
        AppUser currentUser = springSecurityService.getCurrentUser()
         return  groupPositionDAOService.getDefaultPositions(currentUser.organisation)
    }
}
