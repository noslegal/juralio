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

package com.juralio.costs

import com.juralio.auth.AppUser
import com.juralio.common.ValidatedParameterMap
import com.juralio.costs.dao.OtherCostDAOService
import com.juralio.organisation.Organisation
import com.juralio.organisationgroup.GroupPosition
import com.juralio.organisationgroup.dao.GroupPositionDAOService
import grails.gorm.transactions.Transactional

@Transactional
class OtherCostService {

    OtherCostDAOService otherCostDAOService
    GroupPositionDAOService groupPositionDAOService

    OtherCost getCost(long id) {
        return otherCostDAOService.getOtherCost(id)
    }

    List<OtherCost> organisationOtherCosts(Organisation org){
        return otherCostDAOService.getOtherCostsForOrganisation(org)
    }

    List<OtherCost> organisationPositionOtherCosts(Organisation org,def positionId){
        def position = groupPositionDAOService.getPosition(positionId)
        return otherCostDAOService.getOtherCostsForOrganisationAndPosition(org,position)
    }

    def createOtherCost(ValidatedParameterMap validatedParams, AppUser currentUser) {
        Organisation org = currentUser.organisation
        OtherCost newOtherCost = new OtherCost(name: validatedParams.name)
        newOtherCost.organisation = org
        // Other costs are position-scoped: honour an explicit position, defaulting
        // to Advisor (mirrors generateDefaults and createGrade).
        newOtherCost.groupPosition = validatedParams.position == GroupPosition.findByOrganisationAndName(org, 'Client').id ? GroupPosition.findByOrganisationAndName(org, 'Client') : GroupPosition.findByOrganisationAndName(org, 'Advisor')

        def savedCost = otherCostDAOService.save(newOtherCost)

        return savedCost
    }

    def updateOtherCost(ValidatedParameterMap params, OtherCost cost){
        if(params.name){
            cost.name = params.name
        }
        def savedCost = otherCostDAOService.save(cost)

        return savedCost
    }

    def deleteOtherCost(OtherCost otherCostToDelete){
        //Need some is being used validation but that does not exist yet
        otherCostDAOService.delete(otherCostToDelete)
    }

    def generateDefaults(Organisation org,def validatedBody){
        ArrayList<OtherCost> list = new ArrayList<OtherCost>()
        list.add(new OtherCost(name:"Court fees",organisation: org,groupPosition:validatedBody.position== GroupPosition.findByOrganisationAndName(org, 'Client').id ? GroupPosition.findByOrganisationAndName(org, 'Client') :GroupPosition.findByOrganisationAndName(org, 'Advisor')))
        list.add(new OtherCost(name:"Search fees",organisation: org,groupPosition:validatedBody.position== GroupPosition.findByOrganisationAndName(org, 'Client').id ? GroupPosition.findByOrganisationAndName(org, 'Client') :GroupPosition.findByOrganisationAndName(org, 'Advisor')))
        list.add(new OtherCost(name:"Technology",organisation: org,groupPosition:validatedBody.position== GroupPosition.findByOrganisationAndName(org, 'Client').id ? GroupPosition.findByOrganisationAndName(org, 'Client') :GroupPosition.findByOrganisationAndName(org, 'Advisor')))
        list.add(new OtherCost(name:"Expert fees",organisation: org,groupPosition:validatedBody.position== GroupPosition.findByOrganisationAndName(org, 'Client').id ? GroupPosition.findByOrganisationAndName(org, 'Client') :GroupPosition.findByOrganisationAndName(org, 'Advisor')))

        list.each {it.save()}
    }
}
