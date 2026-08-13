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

import com.juralio.common.ValidatedParameterMap
import com.juralio.costs.dao.CostTimeEstimateDAOService
import com.juralio.matter.Matter
import com.juralio.matter.MatterAuthorisationService
import com.juralio.matter.costs.CostTimeEstimate
import com.juralio.matter.costs.MatterPricing
import com.juralio.task.Task
import com.juralio.task.TaskService
import com.juralio.task.dao.TaskDAOService
import grails.gorm.transactions.Transactional

@Transactional
class CostTimeEstimateService {

    TaskDAOService taskDAOService
    CostTimeEstimateDAOService costTimeEstimateDAOService
    ProjectionPeriodService projectionPeriodService
    MatterAuthorisationService matterAuthorisationService
    MatterPricingService matterPricingService
    TaskService taskService

    CostTimeEstimate getCostTimeEstimate(long costTimeEstimateId) {
        CostTimeEstimate costTimeEstimate = costTimeEstimateDAOService.getCostTimeEstimate(costTimeEstimateId)
        return costTimeEstimate
    }

    CostTimeEstimate getCostTimeEstimateForTaskAndPeriod(Task task, ProjectionPeriod period) {
        CostTimeEstimate costTimeEstimate = costTimeEstimateDAOService.getCostTimeEstimateForTaskAndPeriod(task, period)
        return costTimeEstimate
    }

    List<CostTimeEstimate> getCostTimeEstimatesForProjectionPeriod(long projectionPeriodId) {
        ProjectionPeriod projectionPeriod = projectionPeriodService.getProjectionPeriod(projectionPeriodId)
        if (!matterAuthorisationService.hasCostsAndReadAccess(projectionPeriod.matterId)) {
            throw new Exception()
        }
        List<CostTimeEstimate> costTimeEstimates = costTimeEstimateDAOService.getCostTimeEstimatesForProjectionPeriod(projectionPeriod)
        return costTimeEstimates
    }

    List<CostTimeEstimate> getCostTimeEstimatesForTask(Task task) {
        if (!matterAuthorisationService.hasCostsAndReadAccess(task.project.matterId)) {
            throw new Exception()
        }
        List<CostTimeEstimate> costTimeEstimates = costTimeEstimateDAOService.getCostTimeEstimatesForTask(task)
        return costTimeEstimates
    }

    List<CostTimeEstimate> getCostTimeEstimatesForPricing(long matterPricingId) {
        MatterPricing matterPricing = matterPricingService.getPrice(matterPricingId)
        if (!matterAuthorisationService.hasCostsAndReadAccess(matterPricing.matter.id)) {
            throw new Exception()
        }
        List<CostTimeEstimate> costTimeEstimates = costTimeEstimateDAOService.getCostTimeEstimatesForPricing(matterPricing)
        return costTimeEstimates
    }

    def createCostTimeEstimate(ValidatedParameterMap validatedBody, Matter matter, ProjectionPeriod period) {
        if (!matterAuthorisationService.hasCostsAndUpdateAccess(matter.id)) {
            throw new Exception()
        }
        CostTimeEstimate costTimeEstimate = new CostTimeEstimate(validatedBody)
        costTimeEstimate.task = taskDAOService.get(validatedBody.taskId as long)
        costTimeEstimate.hourValue = validatedBody.hour_value ? validatedBody.hour_value : 0
        if(validatedBody.matterPricingId){
            costTimeEstimate.matterPricing = matterPricingService.getPrice(validatedBody.matterPricingId as long)
        }
        if(validatedBody.projectionPeriod){
            costTimeEstimate.projectionPeriod = projectionPeriodService.getProjectionPeriod(validatedBody.projectionPeriod as long)
        }else{
            costTimeEstimate.projectionPeriod = period
        }
        def savedCostTimeEstimate = costTimeEstimateDAOService.save(costTimeEstimate)
        return savedCostTimeEstimate
    }

    def createOrUpdateCostTimeEstimateFromPricing(def taskList, MatterPricing matterPricing, Matter matter) {
        if (!matterAuthorisationService.hasCostsAndUpdateAccess(matter.id)) {
            throw new Exception()
        }
        taskList.forEach { x ->
            Task task = Task.findById(x.id as long)
            if (!task) {
                throw new Exception()
            }
            CostTimeEstimate cte = getCostTimeEstimateForTaskAndPeriod(task, matterPricing.projectionPeriod)
            if (cte) {
                cte.matterPricing = matterPricing
                cte.save()
            } else {
                CostTimeEstimate costTimeEstimate = new CostTimeEstimate(hourValue: 0, task: task, projectionPeriod: matterPricing.projectionPeriod, matterPricing: matterPricing)
                //costTimeEstimate.task = taskDAOService.get(validatedBody.taskId as long)
                //costTimeEstimate.projectionPeriod = projectionPeriodService.getProjectionPeriod(validatedBody.projectionPeriod as long)
                def savedCostTimeEstimate = costTimeEstimateDAOService.save(costTimeEstimate)
                return savedCostTimeEstimate
            }
        }
    }

    def updateCostTimeEstimate(ValidatedParameterMap validatedBody, long costTimeEstimateToUpdateId, long matter_id) {
        if (!matterAuthorisationService.hasCostsAndUpdateAccess(matter_id)) {
            throw new Exception()
        }
        CostTimeEstimate costTimeEstimateToUpdate = getCostTimeEstimate(costTimeEstimateToUpdateId)
        if (validatedBody.hour_value >= 0) {
            costTimeEstimateToUpdate.hourValue = validatedBody.hour_value
        }
        if(validatedBody.matterPricingId > 0){
            costTimeEstimateToUpdate.matterPricing = matterPricingService.getPrice(validatedBody.matterPricingId as long)
        }
        CostTimeEstimate savedCostTimeEstimate = costTimeEstimateDAOService.save(costTimeEstimateToUpdate)
        return savedCostTimeEstimate
    }
}
