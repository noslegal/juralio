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
import com.juralio.costs.dao.RateTypeDAOService
import com.juralio.organisation.Organisation
import com.juralio.organisationgroup.GroupPosition
import com.juralio.organisationgroup.dao.GroupPositionDAOService
import grails.gorm.transactions.Transactional

@Transactional
class RateTypeService {
    RateTypeDAOService rateTypeDAOService
    RateService rateService
    GroupPositionDAOService groupPositionDAOService

    RateType getRateType(long id){
        return rateTypeDAOService.getRateType(id)
    }

    RateType getStandardRateType(Organisation org, GroupPosition position){
        return rateTypeDAOService.getStandardRateType(org, position)
    }

    RateType getBreakEvenRateType(Organisation org, GroupPosition position){
        return rateTypeDAOService.getBreakEvenRateType(org, position)
    }

    RateType getAgreedClientRateType(Organisation org, GroupPosition position){
        return rateTypeDAOService.getAgreedClientRateType(org, position)
    }

    RateType getAgreedMatterRateType(Organisation org){
        return rateTypeDAOService.getAgreedMatterRateType(org)
    }

    List<RateType> organisationRateTypes(Organisation org){
        return rateTypeDAOService.getRateTypesForOrg(org)
    }

    List<RateType> organisationPositionRateTypes(Organisation org,def positionId){
        def position = groupPositionDAOService.getPosition(positionId)
        return rateTypeDAOService.getRateTypesForOrgAndPosition(org,position)
    }

    def createRateType(ValidatedParameterMap validatedParams, AppUser currentUser) {
        RateType newType = new RateType(name: validatedParams.name)
        newType.organisation = currentUser.organisation
        newType.groupPosition = groupPositionDAOService.getPosition(validatedParams.position)
        // A custom rate type carries none of the standard system flags.
        newType.isStandard = false
        newType.isBreakeven = false
        newType.isPremium = false
        newType.isAgreedClient = false
        newType.isAgreedMatter = false

        def savedType = rateTypeDAOService.save(newType)

        return savedType
    }

    def updateRateType(ValidatedParameterMap params, RateType type){
        if(params.name){
            type.name = params.name
        }
        def savedType = rateTypeDAOService.save(type)

        return savedType
    }

    def deleteRateType(RateType rateTypeToDelete){
        List<Rate> rateList = rateService.organisationRates(rateTypeToDelete.organisation.id)
        if(rateList.findAll(x->x.rateType ==rateTypeToDelete).size()>0){
            throw new Exception()
        }
        rateTypeDAOService.delete(rateTypeToDelete)
    }

    def generateDefaults(Organisation org,def validatedBody){
        ArrayList<RateType> list = new ArrayList<RateType>()
        if(validatedBody.position==GroupPosition.findByOrganisationAndName(org, 'Client').id){
            list.add(new RateType(name:"Target",organisation: org,isStandard: true,isPremium: false,isAgreedMatter: false,isAgreedClient: false,isBreakeven: false,groupPosition: GroupPosition.findByOrganisationAndName(org, 'Client')))
            list.add(new RateType(name:"Agreed - Client",organisation: org,isAgreedClient: true,isPremium: false,isAgreedMatter: false,isStandard: false,isBreakeven: false,groupPosition: GroupPosition.findByOrganisationAndName(org, 'Client')))
            list.add(new RateType(name:"Agreed - Matter",organisation: org,isAgreedMatter: true,isPremium: false,isStandard: false,isAgreedClient: false,isBreakeven: false,groupPosition: GroupPosition.findByOrganisationAndName(org, 'Client')))
        }
       else {
            list.add(new RateType(name:"Break-even",organisation: org,isBreakeven: true,isPremium: false,isAgreedMatter: false,isAgreedClient: false,isStandard: false,groupPosition: GroupPosition.findByOrganisationAndName(org, 'Advisor')))
            list.add(new RateType(name:"Standard",organisation: org,isStandard: true,isPremium: false,isAgreedMatter: false,isAgreedClient: false,isBreakeven: false,groupPosition: GroupPosition.findByOrganisationAndName(org, 'Advisor')))
            list.add(new RateType(name:"Premium",organisation: org,isPremium: true,isStandard: false,isAgreedMatter: false,isAgreedClient: false,isBreakeven: false,groupPosition: GroupPosition.findByOrganisationAndName(org, 'Advisor')))
            list.add(new RateType(name:"Agreed - Client",organisation: org,isAgreedClient: true,isPremium: false,isAgreedMatter: false,isStandard: false,isBreakeven: false,groupPosition: GroupPosition.findByOrganisationAndName(org, 'Advisor')))
            list.add(new RateType(name:"Agreed - Matter",organisation: org,isAgreedMatter: true,isPremium: false,isStandard: false,isAgreedClient: false,isBreakeven: false,groupPosition: GroupPosition.findByOrganisationAndName(org, 'Advisor')))
        }

        list.each {it.save()}
    }
}
