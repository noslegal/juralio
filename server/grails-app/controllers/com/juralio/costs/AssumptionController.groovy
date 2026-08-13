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
import com.juralio.organisation.OrganisationAuthorisationService
import grails.plugin.springsecurity.SpringSecurityService
import grails.plugin.springsecurity.annotation.Secured
import grails.rest.*
import grails.converters.*
import org.springframework.http.HttpStatus
import org.springframework.security.access.AccessDeniedException

@Secured('IS_AUTHENTICATED_FULLY')
class AssumptionController {
    static allowedMethods = [show: "GET", index: "GET", update: "PATCH", save: "POST", bulkSave: "POST", bulkUpdate: "PATCH", delete: 'DELETE']

    SpringSecurityService springSecurityService
    UserRoleService userRoleService
    OrganisationAuthorisationService organisationAuthorisationService
    MatterAuthorisationService matterAuthorisationService
    CostsAuthorisationService costsAuthorisationService
    CostAssumptionService costAssumptionService
    MatterService matterService
	
    def index(long matter_id, long assumption_id) {
        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
        boolean isSysadmin = userRoleService.hasSysadminRole(currentUser)
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(currentUser.organisation.id)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }
        Matter matter = matterService.getMatter(matter_id)
        if (costsAuthorisationService.orgCostsSetupForMatterPosition(currentUser, matter) && matterAuthorisationService.hasCostsAccess(matter_id)) {
            CostAssumption assumption = costAssumptionService.getAssumption(assumption_id, matter_id)
            if (assumption) {
                respond assumption, [Status: HttpStatus.OK]
            } else {
                respond [:], status: HttpStatus.BAD_REQUEST
            }
        } else {
            respond [:], status: HttpStatus.FORBIDDEN
        }
    }

    def show(long matter_id) {
        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
        boolean isSysadmin = userRoleService.hasSysadminRole(currentUser)
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(currentUser.organisation.id)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }
        Matter matter = matterService.getMatter(matter_id)
        if (costsAuthorisationService.orgCostsSetupForMatterPosition(currentUser, matter) && matterAuthorisationService.hasCostsAccess(matter_id)) {
            List<CostAssumption> assumptions = costAssumptionService.getAssumptionsForMatter(matter_id)
            respond assumptions ?: [], [status: HttpStatus.OK]
        } else {
            respond [:], status: HttpStatus.FORBIDDEN
        }
    }

    def save(long matter_id) {
        AppUser currentUser = springSecurityService.getCurrentUser()
        Matter matter = matterService.getMatter(matter_id)
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
            ValidatedParameterMap validatedBody = ParameterValidatorService.validate(request.JSON, [], ['assumption', 'summary', 'taskId', 'status'])
                if (validatedBody.taskId == null) {
                    respond [:], status: HttpStatus.BAD_REQUEST
                    return
                } else if (validatedBody.assumption == null) {
                    respond [:], status: HttpStatus.BAD_REQUEST
                    return
                }

            CostAssumption newAssumption = costAssumptionService.saveAssumption(validatedBody, matter, currentUser)

            respond newAssumption
        }
        catch (AccessDeniedException exception) {
            render status: HttpStatus.FORBIDDEN
        }
        catch (Exception exception) {
            render status: HttpStatus.BAD_REQUEST
        }
    }
    def bulkSave(long  matter_id){
        AppUser currentUser = springSecurityService.getCurrentUser()
        Matter matter = matterService.getMatter(matter_id)
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
        def body = request.JSON
        if (!(body instanceof List) || body.isEmpty()) {
            respond [:], status: HttpStatus.BAD_REQUEST
            return
        }
        if (body.any { it.taskId == null || it.assumption == null }) {
            respond [:], status: HttpStatus.BAD_REQUEST
            return
        }
        try {
            List<CostAssumption> newAssumptions = []
            body.forEach { def it ->
                ValidatedParameterMap validatedBody = ParameterValidatorService.validate(it, [], ['assumption', 'summary', 'taskId', 'status'])
                newAssumptions.add(costAssumptionService.saveAssumption(validatedBody, matter, currentUser))
            }
            respond newAssumptions
        }
        catch (AccessDeniedException exception) {
            render status: HttpStatus.FORBIDDEN
        }
        catch (Exception exception) {
            render status: HttpStatus.BAD_REQUEST
        }
    }

    def bulkUpdate(long matter_id) {
        AppUser currentUser = springSecurityService.getCurrentUser()
        Matter matter = matterService.getMatter(matter_id)
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
        def body = request.JSON
        if (!(body instanceof List) || body.isEmpty()) {
            render status: HttpStatus.BAD_REQUEST
            return
        }
        if (body.any { !it.assumptionId || (!it.assumption && !it.summary) }) {
            render status: HttpStatus.BAD_REQUEST
            return
        }
        try {
            List<CostAssumption> updatedAssumptions = []
            body.forEach { def it ->
                ValidatedParameterMap validatedBody = ParameterValidatorService.validate(it, [], ['assumption', 'summary', 'assumptionId', 'position', 'status'])
                CostAssumption assumptionToUpdate = costAssumptionService.getAssumption(validatedBody.assumptionId, matter_id)
                if (assumptionToUpdate) {
                    updatedAssumptions.add(costAssumptionService.updateAssumption(validatedBody, assumptionToUpdate))
                }
            }
            if (updatedAssumptions.size() > 0) {
                respond updatedAssumptions
            } else {
                respond [:], status: HttpStatus.BAD_REQUEST
            }
        }
        catch (AccessDeniedException exception) {
            render status: HttpStatus.FORBIDDEN
        }
        catch (Exception exception) {
            render status: HttpStatus.BAD_REQUEST
        }
    }

    def update(long matter_id, long assumption_id) {
        AppUser currentUser = springSecurityService.getCurrentUser()
        Matter matter = matterService.getMatter(matter_id)
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
        try{
            CostAssumption assumptionToUpdate = costAssumptionService.getAssumption(assumption_id, matter_id)
            ValidatedParameterMap validatedBody = ParameterValidatorService.validate(request.JSON, [], ['assumption', 'summary', 'status'])
            if(!validatedBody.assumption && !validatedBody.summary){
                render status: HttpStatus.BAD_REQUEST
            }else{
                CostAssumption updatedAssumption = costAssumptionService.updateAssumption(validatedBody, assumptionToUpdate)
                respond updatedAssumption
            }

        }
        catch (AccessDeniedException exception) {
            render status: HttpStatus.FORBIDDEN
        }
        catch (Exception exception) {
            render status: HttpStatus.BAD_REQUEST
        }

    }

    def delete(long matter_id, long assumption_id){
        AppUser currentUser = springSecurityService.getCurrentUser()
        Matter matter = matterService.getMatter(matter_id)
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
            costAssumptionService.deleteAssumption(matter, assumption_id)
            respond status: HttpStatus.OK
        }

        catch (AccessDeniedException exception) {
            render status: HttpStatus.FORBIDDEN
        }
        catch (Exception exception) {
            render status: HttpStatus.BAD_REQUEST
        }
    }
}
