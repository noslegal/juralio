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
import com.juralio.matter.costs.CostTimeEstimate
import com.juralio.matter.costs.MatterPricing
import com.juralio.organisation.OrganisationAuthorisationService
import com.juralio.task.Task
import com.juralio.task.TaskService
import grails.plugin.springsecurity.SpringSecurityService
import grails.plugin.springsecurity.annotation.Secured
import org.springframework.http.HttpStatus
import org.springframework.security.access.AccessDeniedException

@Secured(['IS_AUTHENTICATED_FULLY'])
class CostTimeEstimateController {
    static allowedMethods = [show: "GET", save: "POST", update: "PATCH", bulkUpdate: "PATCH", syncFromTasks: "POST"]

    MatterService matterService
    CostTimeEstimateService costTimeEstimateService
    SpringSecurityService springSecurityService
    UserRoleService userRoleService
    OrganisationAuthorisationService organisationAuthorisationService
    MatterAuthorisationService matterAuthorisationService
    TaskService taskService
    ProjectionPeriodService projectionPeriodService
    CostsAuthorisationService costsAuthorisationService
    MatterPricingService matterPricingService

    @Secured(['IS_AUTHENTICATED_FULLY'])
    def show(long matter_id, long projectionPeriod) {
        AppUser currentUser = springSecurityService.getCurrentUser()
        boolean isSysadmin = userRoleService.hasSysadminRole(currentUser)
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(currentUser.organisationId)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }
        Matter matter = matterService.getMatter(matter_id)
        if (!costsAuthorisationService.orgCostsSetupForMatterPosition(currentUser, matter)){
            throw new Exception('Forbidden from accessing this information')
        }
        if (!matterAuthorisationService.hasCostsAndReadAccess(matter_id)) {
            render status: HttpStatus.FORBIDDEN
            return
        }
        if (!costsAuthorisationService.checkProjectionPeriodMatter(projectionPeriod, matter_id)) {
            render status: HttpStatus.FORBIDDEN
            return
        }
        List<CostTimeEstimate> costTimeEstimateList = costTimeEstimateService.getCostTimeEstimatesForProjectionPeriod(projectionPeriod)
        if (costTimeEstimateList) {
            respond costTimeEstimateList, [Status: HttpStatus.OK, view: '/costTimeEstimate_costTimeEstimateList']
        } else {
            respond [:], status: HttpStatus.BAD_REQUEST
        }
    }

    @Secured(['IS_AUTHENTICATED_FULLY'])
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
        if (!costsAuthorisationService.orgCostsSetupForMatterPosition(currentUser, matter)){
            render status: HttpStatus.FORBIDDEN
            return
        }
        if (!matterAuthorisationService.hasCostsAndUpdateAccess(matterId)) {
            render status: HttpStatus.FORBIDDEN
            return
        }
        try {
            def request = request.JSON
            List<CostTimeEstimate> newCostTimeEstimates = []
            request.forEach { def it ->
                ValidatedParameterMap validatedBody = ParameterValidatorService.validate(it, [], ['hour_value', 'taskId', 'projectionPeriod'])
                if (validatedBody.taskId == null) {
                    respond [:], status: HttpStatus.BAD_REQUEST
                } else if (validatedBody.projectionPeriod == null) {
                    respond [:], status: HttpStatus.BAD_REQUEST
                }
                if (!costsAuthorisationService.checkProjectionPeriodMatter(validatedBody.projectionPeriod as long, matterId)) {
                    throw new AccessDeniedException('Projection period does not belong to this matter')
                }
                ProjectionPeriod projectionPeriod = projectionPeriodService.getProjectionPeriod(validatedBody.projectionPeriod as long)
                CostTimeEstimate newCostTimeEstimate = costTimeEstimateService.createCostTimeEstimate(validatedBody, matter, projectionPeriod)
                newCostTimeEstimates.add(newCostTimeEstimate)
            }
            respond newCostTimeEstimates
        }
        catch (AccessDeniedException exception) {
            render status: HttpStatus.FORBIDDEN
        }
        catch (Exception exception) {
            render status: HttpStatus.BAD_REQUEST
        }
    }

    // Idempotently ensure a CostTimeEstimate exists for every task in the list
    // for the period's pricing. Used when re-finalising a projection in live
    // mode so that tasks newly in scope (by date) get a CTE and therefore appear
    // in the snapshot, without creating duplicate CTEs for tasks that already
    // have one.
    @Secured(['IS_AUTHENTICATED_FULLY'])
    def syncFromTasks(long matterId) {
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
        if (!matterAuthorisationService.hasCostsAndUpdateAccess(matterId)) {
            render status: HttpStatus.FORBIDDEN
            return
        }
        try {
            ValidatedParameterMap validatedBody = ParameterValidatorService.validate(request.JSON, [], ['projectionPeriod', 'taskList'])
            if (validatedBody.projectionPeriod == null) {
                respond [:], status: HttpStatus.BAD_REQUEST
                return
            }
            if (!costsAuthorisationService.checkProjectionPeriodMatter(validatedBody.projectionPeriod as long, matterId)) {
                render status: HttpStatus.FORBIDDEN
                return
            }
            ProjectionPeriod projectionPeriod = projectionPeriodService.getProjectionPeriod(validatedBody.projectionPeriod as long)
            MatterPricing matterPricing = matterPricingService.getMatterPricingByPeriod(projectionPeriod, matter)
            if (matterPricing && validatedBody.taskList) {
                costTimeEstimateService.createOrUpdateCostTimeEstimateFromPricing(validatedBody.taskList, matterPricing, matter)
            }
            respond [:], status: HttpStatus.OK
        }
        catch (AccessDeniedException exception) {
            render status: HttpStatus.FORBIDDEN
        }
        catch (Exception exception) {
            render status: HttpStatus.BAD_REQUEST
        }
    }

    @Secured(['IS_AUTHENTICATED_FULLY'])
    def update(long task_id, long id) {
        AppUser currentUser = springSecurityService.getCurrentUser()
        Task task = taskService.getTask(task_id, request.JSON.projectId as long)
        Matter matter = matterService.getMatter(task.project.matterId)
        boolean isSysadmin = userRoleService.hasSysadminRole(currentUser)
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(currentUser.organisationId)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }
        if (matter.organisation.id != currentUser.organisation.id) {
            throw new Exception('Forbidden from accessing this information')
        }
        if (!costsAuthorisationService.orgCostsSetupForMatterPosition(currentUser, matter)){
            throw new Exception('Forbidden from accessing this information')
        }
        if(!matterAuthorisationService.hasCostsAndUpdateAccess(matter.id)){
            throw new Exception('Forbidden from accessing this information')
        }
        try {
            ValidatedParameterMap validatedBody = ParameterValidatorService.validate(request.JSON, [], ['hour_value'])
            if (validatedBody.hour_value == null) {
                respond [:], status: HttpStatus.BAD_REQUEST
            }
            respond costTimeEstimateService.updateCostTimeEstimate(validatedBody, id, matter.id)
        }
        catch (AccessDeniedException exception) {
            render status: HttpStatus.FORBIDDEN
        }
        catch (Exception exception) {
            render status: HttpStatus.BAD_REQUEST
        }
    }

    @Secured(['IS_AUTHENTICATED_FULLY'])
    def bulkUpdate(long period_id) {
        AppUser currentUser = springSecurityService.getCurrentUser()
        ProjectionPeriod period = projectionPeriodService.getProjectionPeriod(period_id)
        Matter matter = matterService.getMatter(period.matterId)
        boolean isSysadmin = userRoleService.hasSysadminRole(currentUser)
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(currentUser.organisationId)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }
        if (!costsAuthorisationService.orgCostsSetupForMatterPosition(currentUser, matter)){
            throw new Exception('Forbidden from accessing this information')
        }
        if(!matterAuthorisationService.hasCostsAndUpdateAccess(matter.id)){
            throw new Exception('Forbidden from accessing this information')
        }
        if (matter.organisation.id != currentUser.organisation.id) {
            throw new Exception('Forbidden from accessing this information')
        }
        try {
            def request = request.JSON
            List<CostTimeEstimate> costTimeEstimateList = []
            request.forEach { def it ->
                ValidatedParameterMap validatedBody = ParameterValidatorService.validate(it, [], ['taskId', 'hour_value', 'matterPricingId'])
                if (validatedBody.taskId) {
                    Task task = Task.findById(validatedBody.taskId as long)
                    CostTimeEstimate cteToUpdate = costTimeEstimateService.getCostTimeEstimateForTaskAndPeriod(task, period)
                    if (cteToUpdate) {
                        CostTimeEstimate updatedCte = costTimeEstimateService.updateCostTimeEstimate(validatedBody, cteToUpdate.id, matter.id)
                        costTimeEstimateList.add(updatedCte)
                    } else {
                        CostTimeEstimate newCte = costTimeEstimateService.createCostTimeEstimate(validatedBody, matter, period)
                        costTimeEstimateList.add(newCte)
                    }
                }
            }
            if (costTimeEstimateList.size() > 0) {
                respond costTimeEstimateList, status: HttpStatus.OK
            } else {
                respond([], status: HttpStatus.FORBIDDEN)
            }
        }
        catch (AccessDeniedException exception) {
            render status: HttpStatus.FORBIDDEN
        }
        catch (Exception exception) {
            render status: HttpStatus.BAD_REQUEST
        }
    }
}
