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

import com.juralio.matter.costs.CostRatio
import com.juralio.matter.costs.CostTimeEstimate
import com.juralio.task.Task
import com.juralio.task.status.TaskStatus
import grails.gorm.transactions.Transactional

@Transactional
class CostsService {
    CostTimeEstimateService costTimeEstimateService

    def removeTaskFromCosts(Task task) {
        List<CostTimeEstimate> cteList = costTimeEstimateService.getCostTimeEstimatesForTask(task)
        if (cteList.size() > 0) {
            cteList.forEach { cte -> cte.delete() }
        }
    }

    def isValidRemoveFromProjectionPeriods(Task task) {
        //need to check ctes for users without cost role
        List<CostTimeEstimate> cteList = CostTimeEstimate.findAllByTask(task)
        if (cteList.size() > 0) {
            cteList.forEach { cte ->
                {
                    if (task.status == TaskStatus.NOT_STARTED.value() && ((task.plannedStartDate && task.plannedStartDate > cte.projectionPeriod.endDate) || (task.plannedEndDate && task.plannedEndDate < cte.projectionPeriod.startDate))) {
                        CostRatio.findAllByProjectionPeriodAndCostTimeEstimate(cte.projectionPeriod,cte).forEach {it.delete()}
                        cte.delete()
                    } else if (task.status == TaskStatus.IN_PROGRESS.value() && (task.actualStartDate > cte.projectionPeriod.endDate || (task.plannedEndDate && task.plannedEndDate < cte.projectionPeriod.startDate))) {
                        CostRatio.findAllByProjectionPeriodAndCostTimeEstimate(cte.projectionPeriod,cte).forEach {it.delete()}
                        cte.delete()
                    } else if (task.status == TaskStatus.DONE.value() && (task.actualStartDate > cte.projectionPeriod.endDate || task.actualEndDate < cte.projectionPeriod.startDate)) {
                        CostRatio.findAllByProjectionPeriodAndCostTimeEstimate(cte.projectionPeriod,cte).forEach {it.delete()}
                        cte.delete()
                    }
                }
            }
        }
    }

    def isValidRemoveFromProjectionPeriods(ProjectionPeriod projectionPeriod) {
        List<CostTimeEstimate> cteList = costTimeEstimateService.getCostTimeEstimatesForProjectionPeriod(projectionPeriod.id)
        if (cteList.size() > 0) {
            cteList.forEach { cte ->
                {
                    if (cte.task.status == TaskStatus.NOT_STARTED.value() && ((cte.task.plannedStartDate && cte.task.plannedStartDate > cte.projectionPeriod.endDate) || (cte.task.plannedEndDate && cte.task.plannedEndDate < cte.projectionPeriod.startDate))) {
                        CostRatio.findAllByProjectionPeriodAndCostTimeEstimate(cte.projectionPeriod,cte).forEach {it.delete()}
                        cte.delete()
                    } else if (cte.task.status == TaskStatus.IN_PROGRESS.value() && (cte.task.actualStartDate > cte.projectionPeriod.endDate || (cte.task.plannedEndDate && cte.task.plannedEndDate < cte.projectionPeriod.startDate))) {
                        CostRatio.findAllByProjectionPeriodAndCostTimeEstimate(cte.projectionPeriod,cte).forEach {it.delete()}
                        cte.delete()
                    } else if (cte.task.status == TaskStatus.DONE.value() && (cte.task.actualStartDate > cte.projectionPeriod.endDate || cte.task.actualEndDate < cte.projectionPeriod.startDate)) {
                        CostRatio.findAllByProjectionPeriodAndCostTimeEstimate(cte.projectionPeriod,cte).forEach {it.delete()}
                        cte.delete()
                    }
                }
            }
        }
    }

}
