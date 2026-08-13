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
import com.juralio.common.ParameterValidatorService
import com.juralio.common.ValidatedParameterMap
import com.juralio.matter.CostsAuthorisationService
import com.juralio.matter.Matter
import com.juralio.matter.MatterAuthorisationService
import com.juralio.matter.MatterService
import com.juralio.matter.costs.CostRatio
import com.juralio.organisation.Organisation
import com.juralio.organisation.OrganisationAuthorisationService
import com.juralio.organisation.dao.OrganisationDAOService
import grails.plugin.springsecurity.SpringSecurityService
import grails.plugin.springsecurity.annotation.Secured
import org.springframework.http.HttpStatus
import org.springframework.security.access.AccessDeniedException

@Secured(['IS_AUTHENTICATED_FULLY'])
class CostRatioController {
    static allowedMethods = [show: "GET", save: "POST", update: "PATCH", batchUpdate: "PATCH", reset: "POST"]

    MatterService matterService
    CostRatioService costRatioService
    SpringSecurityService springSecurityService
    UserRoleService userRoleService
    OrganisationAuthorisationService organisationAuthorisationService
    MatterAuthorisationService matterAuthorisationService
    CostsAuthorisationService costsAuthorisationService
    OrganisationDAOService organisationDAOService


    def show(long matter_id) {
        if (!matterAuthorisationService.hasCostsAndReadAccess(matter_id)) {
            render status: HttpStatus.FORBIDDEN
            return
        }
        List<CostRatio> costRatioList = costRatioService.getCostRatiosForMatter(matter_id)
        if (costRatioList) {
            respond costRatioList, [Status: HttpStatus.OK, view: '/costRatio/_costRatioList']
        } else {
            respond [:], status: HttpStatus.BAD_REQUEST
        }
    }

    def save(long matterId) {
        AppUser currentUser = springSecurityService.getCurrentUser()
        Matter matter = matterService.getMatter(matterId)
        boolean isSysadmin = userRoleService.hasSysadminRole(currentUser)
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(currentUser.organisationId)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }
        if (matter.organisation.id != currentUser.organisation.id) {
            render status: HttpStatus.FORBIDDEN
            return
        }
        if (!costsAuthorisationService.orgCostsSetupForMatterPosition(currentUser, matter)) {
            render status: HttpStatus.FORBIDDEN
            return
        }
        if (!matterAuthorisationService.hasCostsAndUpdateAccess(matter.id)) {
            render status: HttpStatus.FORBIDDEN
            return
        }
        try {
            def request = request.JSON
            List<CostRatio> newCostRatios = []
            request.forEach { def it ->
                ValidatedParameterMap validatedBody = ParameterValidatorService.validate(it, [], ['ratioValue', 'gradeId', 'recoveryRate', 'grade', 'projectionPeriod'])
                if (validatedBody.ratioValue == null) {
                    respond [:], status: HttpStatus.BAD_REQUEST
                } else if (validatedBody.gradeId == null) {
                    respond [:], status: HttpStatus.BAD_REQUEST
                } else if (validatedBody.recoveryRate == null) {
                    respond [:], status: HttpStatus.BAD_REQUEST
                } else if (validatedBody.grade == null) {
                    respond [:], status: HttpStatus.BAD_REQUEST
                } else if (validatedBody.projectionPeriod == null) {
                    respond [:], status: HttpStatus.BAD_REQUEST
                }
                if (!costsAuthorisationService.checkProjectionPeriodMatter(validatedBody.projectionPeriod as long, matterId)) {
                    throw new AccessDeniedException('Projection period does not belong to this matter')
                }
                CostRatio newCostRatio = costRatioService.createCostRatio(validatedBody, matter)
                newCostRatios.add(newCostRatio)
            }
            respond newCostRatios
        }
        catch (AccessDeniedException exception) {
            render status: HttpStatus.FORBIDDEN
        }
        catch (Exception exception) {
            render status: HttpStatus.BAD_REQUEST
        }
    }

    def update(long matter_id, long id) {
        AppUser currentUser = springSecurityService.getCurrentUser()
        Matter matter = matterService.getMatter(matter_id)
        boolean isSysadmin = userRoleService.hasSysadminRole(currentUser)
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(currentUser.organisationId)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }
        if (matter.organisation.id != currentUser.organisation.id) {
            throw new Exception('Forbidden from accessing this information')
        }
        if (!costsAuthorisationService.orgCostsSetupForMatterPosition(currentUser, matter)) {
            throw new Exception('Forbidden from accessing this information')
        }
        if (!matterAuthorisationService.hasCostsAndUpdateAccess(matter.id)) {
            throw new Exception('Forbidden from accessing this information')
        }
        try {
            ValidatedParameterMap validatedBody = ParameterValidatorService.validate(request.JSON, [], ['ratioValue', 'recoveryRate'])
            if (validatedBody.value == null) {
                respond [:], status: HttpStatus.BAD_REQUEST
            } else if (validatedBody.type == null) {
                respond [:], status: HttpStatus.BAD_REQUEST
            }
            respond costRatioService.updateCostRatio(validatedBody, id, matter_id)
        }
        catch (AccessDeniedException exception) {
            render status: HttpStatus.FORBIDDEN
        }
        catch (Exception exception) {
            render status: HttpStatus.BAD_REQUEST
        }
    }

    def batchUpdate(Long matterId) {
        AppUser currentUser = springSecurityService.getCurrentUser()
        Matter matter = matterService.getMatter(matterId)
        boolean isSysadmin = userRoleService.hasSysadminRole(currentUser)
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(currentUser.organisationId)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }
        if (matter.organisation.id != currentUser.organisation.id) {
            throw new Exception('Forbidden from accessing this information')
        }
        if (!costsAuthorisationService.orgCostsSetupForMatterPosition(currentUser, matter)) {
            throw new Exception('Forbidden from accessing this information')
        }
        if (!matterAuthorisationService.hasCostsAndUpdateAccess(matter.id)) {
            throw new Exception('Forbidden from accessing this information')
        }
        def request = request.JSON
        List<CostRatio> updatedRatios = []
        request.forEach { def it ->
            ValidatedParameterMap validatedBody = ParameterValidatorService.validate(it, [], ['ratioValue', 'recoveryRate', 'costRatioId', 'gradeId', 'projectionPeriod', 'cteId', 'workstreamId'])
            if (validatedBody.rate != null && Double.isNaN(validatedBody.rate)) {
                respond [:], status: HttpStatus.BAD_REQUEST
            } else if (validatedBody.ratioValue == null) {
                respond [:], status: HttpStatus.BAD_REQUEST
            } else if (validatedBody.recoveryRate == null) {
                respond [:], status: HttpStatus.BAD_REQUEST
            } else if (!validatedBody.costRatioId && !validatedBody.gradeId) {
                respond [:], status: HttpStatus.BAD_REQUEST
            } else {
                if (validatedBody.cteId || validatedBody.workstreamId) {
                    updatedRatios.add(costRatioService.createOrUpdateCteOrWorkstreamRatio(validatedBody, matter))
                } else if ((!validatedBody.costRatioId && validatedBody.gradeId)) {
                    updatedRatios.add(costRatioService.createCostRatio(validatedBody, matter))
                } else {
                    updatedRatios.add(costRatioService.updateCostRatio(validatedBody, validatedBody.costRatioId, matterId))
                }

            }
        }
        if (updatedRatios.size() > 0) {
            respond updatedRatios
        } else {
            respond [:], status: HttpStatus.BAD_REQUEST
        }
    }

    def reset(Long matterId) {
        AppUser currentUser = springSecurityService.getCurrentUser()
        Matter matter = matterService.getMatter(matterId)
        boolean isSysadmin = userRoleService.hasSysadminRole(currentUser)
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(currentUser.organisationId)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }
        if (matter.organisation.id != currentUser.organisation.id) {
            throw new Exception('Forbidden from accessing this information')
        }
        if (!costsAuthorisationService.orgCostsSetupForMatterPosition(currentUser, matter)) {
            throw new Exception('Forbidden from accessing this information')
        }
        if (!matterAuthorisationService.hasCostsAndUpdateAccess(matter.id)) {
            throw new Exception('Forbidden from accessing this information')
        }
        ValidatedParameterMap validatedBody = ParameterValidatorService.validate(request.JSON, [], ['cteId', 'workstreamId','projectionPeriodId'])
        costRatioService.resetCostRatios(validatedBody)
        respond [:], status: HttpStatus.OK
    }
}
