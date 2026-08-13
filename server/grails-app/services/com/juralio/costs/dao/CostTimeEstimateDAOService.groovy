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

package com.juralio.costs.dao

import com.juralio.costs.Period
import com.juralio.costs.ProjectionPeriod
import com.juralio.matter.Matter
import com.juralio.matter.costs.CostTimeEstimate
import com.juralio.matter.costs.MatterPricing
import com.juralio.task.Task
import grails.gorm.transactions.Transactional

@Transactional
class CostTimeEstimateDAOService {

    CostTimeEstimate getCostTimeEstimate(long id) {
        return CostTimeEstimate.get(id)
    }

    List<CostTimeEstimate> getCostTimeEstimatesForTask(Task task){
        return CostTimeEstimate.findAllByTask(task)
    }

    CostTimeEstimate getCostTimeEstimateForTaskAndPeriod(Task taskId, ProjectionPeriod period){
        return CostTimeEstimate.findByTaskAndProjectionPeriod(taskId,period)
    }

    List<CostTimeEstimate> getCostTimeEstimatesForProjectionPeriod(ProjectionPeriod period){
        return  CostTimeEstimate.findAllByProjectionPeriod(period)
    }

    List<CostTimeEstimate> getCostTimeEstimatesForPricing(MatterPricing matterPricing){
        return  CostTimeEstimate.findAllByMatterPricing(matterPricing)
    }

    CostTimeEstimate save(CostTimeEstimate costTimeEstimate) {
        costTimeEstimate.save(failOnError: true)
        return costTimeEstimate
    }
}
