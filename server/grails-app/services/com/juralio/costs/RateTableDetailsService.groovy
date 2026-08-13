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
import com.juralio.auth.UserRoleService
import com.juralio.common.ValidatedParameterMap
import com.juralio.costs.dao.RateTableDetailsDAOService
import com.juralio.matter.Matter
import com.juralio.matter.MatterAuthorisationService
import com.juralio.matter.MatterService
import com.juralio.matter.costs.CostRatio
import com.juralio.organisation.Organisation
import com.juralio.organisation.dao.OrganisationDAOService
import com.juralio.organisationgroup.GroupPosition
import com.juralio.organisationgroup.dao.GroupPositionDAOService
import grails.gorm.transactions.Transactional
import grails.plugin.springsecurity.SpringSecurityService

@Transactional
class RateTableDetailsService {

    RateTableDetailsDAOService rateTableDetailsDAOService
    MatterAuthorisationService matterAuthorisationService
    OrganisationDAOService organisationDAOService
    MatterService matterService
    SpringSecurityService springSecurityService
    UserRoleService userRoleService
    CostRatioService costRatioService
    ProjectionPeriodService projectionPeriodService
    GroupPositionDAOService groupPositionDAOService


    RateTableDetails getRateTableDetails(long id) {
        RateTableDetails rateTableDetails = rateTableDetailsDAOService.getRateTableDetails(id)
        return rateTableDetails
    }

    List<RateTableDetails> organisationRateTableDetails(long orgId) {
        Organisation org = organisationDAOService.getOrganisation(orgId)
        if (org) {
            List<RateTableDetails> rateTableDetails = rateTableDetailsDAOService.getRateTableDetailsForOrganisation(org)
            return rateTableDetails
        } else {
            return null
        }
    }

    List<RateTableDetails> organisationPositionRateTableDetails(long orgId,def positionId) {
        def position = groupPositionDAOService.getPosition(positionId)
        Organisation org = organisationDAOService.getOrganisation(orgId)
        if (org) {
            List<RateTableDetails> rateTableDetails = rateTableDetailsDAOService.getRateTableDetailsForOrganisationAndPosition(org,position)
            return rateTableDetails
        } else {
            return null
        }
    }

    RateTableDetails getMatterRateTableDetails(Matter matter) {
        RateTableDetails rtd = rateTableDetailsDAOService.getRateTableDetailsForMatter(matter)
        return rtd
    }

    def createRateTableDetails(ValidatedParameterMap params, AppUser currentUser) {
        RateTableDetails newRateTableDetails = new RateTableDetails(params)
        newRateTableDetails.organisation = currentUser.organisation
        if (params.rateTableDetails) {
            newRateTableDetails.rateTableDetails = getRateTableDetails(params.rateTableDetails)
        }
        GroupPosition groupPosition = GroupPosition.findById(params.position)
        boolean advisorPosition = groupPosition?.name == 'Advisor'
        if ((advisorPosition && params.work_type == '') || params.work_type.size() > 50) {
            throw new Exception()
        }
        if ((advisorPosition && params.location == '') || params.location.size() > 50) {
            throw new Exception()
        }
        if (params.client == true && (params.client_name == '' || params.client_name.size() > 50)) {
            throw new Exception()
        }
        if (params.matter) {
            newRateTableDetails.matter = matterService.getMatter(params.matter as long)
        }
        newRateTableDetails.groupPosition = groupPosition
        newRateTableDetails.is_retired = false
        RateTableDetails savedRateTableDetail = rateTableDetailsDAOService.save(newRateTableDetails)
        if (savedRateTableDetail.client && savedRateTableDetail.rateTableDetails) {
            savedRateTableDetail.templateWorkType = savedRateTableDetail.rateTableDetails.work_type
            savedRateTableDetail.templateLocation = savedRateTableDetail.rateTableDetails.location
        }
        return savedRateTableDetail
    }

    def updateRateTableDetails(ValidatedParameterMap params, RateTableDetails rateToUpdate) {
        if (params.currency) {
            if (params.currency != '' && params.currency.size() <= 50) {
                rateToUpdate.currency = params.currency
            } else {
                throw new Exception()
            }
        }
        if (params.location) {
            if (params.location != '' && params.location.size() <= 50) {
                rateToUpdate.location = params.location
            } else {
                throw new Exception()
            }
        }
        if (params.work_type) {
            if (params.work_type != '' && params.work_type.size() <= 50) {
                rateToUpdate.work_type = params.work_type
            } else {
                throw new Exception()
            }
        }
        if (params.client_name) {
            if (rateToUpdate.client == false) {
                throw new Exception()
            }
            if (rateToUpdate.client == true && (params.client_name == '' || params.client_name.size() > 50)) {
                throw new Exception()
            }
            rateToUpdate.client_name = params.client_name
        }
        if (params.is_retired == true || params.is_retired == false) {
            //only retire used org tables
            if (RateTableDetails.findAllByRateTableDetails(rateToUpdate).size() < 1 && (!rateToUpdate.client && rateToUpdate.is_retired==true)) {
                throw new Exception()
            }
            //only unretire client tables if the org table is not retired
            if(params.is_retired ==false && rateToUpdate.client==true && rateToUpdate.rateTableDetails.is_retired==true){
                throw new Exception()
            }
            if(rateToUpdate.client==false && params.is_retired==true){
               List<RateTableDetails> clientLinkedRTDs =  RateTableDetails.findAllByRateTableDetails(rateToUpdate)
                clientLinkedRTDs.forEach {RateTableDetails rtd -> rtd.is_retired = true}
            }
            rateToUpdate.is_retired = params.is_retired
        }
        if(params.rateTableDetails){
            rateToUpdate.rateTableDetails = getRateTableDetails(params.rateTableDetails)
        }
        RateTableDetails savedRate = rateTableDetailsDAOService.save(rateToUpdate)

        return savedRate
    }

    def publishRateTable(RateTableDetails rtd) {
        rtd.draft = false
        rtd.save()
    }

    List<RateTableDetails> getAllFromTemplateRTD(RateTableDetails templateRTD) {
        return rateTableDetailsDAOService.getAllUsingAsTemplate(templateRTD)
    }

    def deleteRTD(RateTableDetails rtdToDelete) {
        AppUser currentUser = springSecurityService.getCurrentUser()
        if (rtdToDelete.matterId) {
            if (!matterAuthorisationService.hasCostsAndUpdateAccess(rtdToDelete.matterId)) {
                throw new Exception('Forbidden from accessing this information')
            } else {
                //need to delete cost ratios and hours
                //outOfScopeDetails belongs to the ProjectionPeriod, not the RTD, so it
                //deliberately survives RTD deletion (e.g. the costs wizard recreates the RTD)
                List<CostRatio> costRatios = costRatioService.getCostRatiosForMatter(rtdToDelete.matterId)
                costRatios.forEach {it.delete()}
                List<ProjectionPeriod> projectionPeriods = projectionPeriodService.getProjectionPeriodsByMatter(rtdToDelete.matterId)
                projectionPeriods.forEach {ProjectionPeriod pp-> {
                    List<CostRatio>cRs = costRatioService.getCostRatiosForPeriod(pp.id,rtdToDelete.matterId)
                    cRs.forEach {it.delete()}
                }}
                rateTableDetailsDAOService.delete(rtdToDelete)
            }
        } else {
            if (userRoleService.hasOrgAdminRole(currentUser)) {
                rateTableDetailsDAOService.delete(rtdToDelete)
            } else {
                throw new Exception('Forbidden from accessing this information')
            }
        }

    }
}
