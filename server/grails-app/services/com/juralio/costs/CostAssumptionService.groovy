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
import com.juralio.costs.dao.AssumptionDAOService
import com.juralio.matter.Matter
import com.juralio.matter.MatterAuthorisationService
import com.juralio.matter.MatterService
import com.juralio.matter.costs.CostRatio
import com.juralio.matter.costs.CostTimeEstimate
import com.juralio.project.Project
import com.juralio.task.TaskService
import com.juralio.task.dao.TaskDAOService
import grails.gorm.transactions.Transactional
import org.springframework.security.access.AccessDeniedException

@Transactional
class CostAssumptionService {

    AssumptionDAOService assumptionDAOService
    MatterAuthorisationService matterAuthorisationService
    MatterService matterService
    TaskService taskService
    TaskDAOService taskDAOService

    def getAssumption(long id, long matter_id) {
        if (!matterAuthorisationService.hasCostsAndReadAccess(matter_id)) {
            throw new Exception()
        }
        CostAssumption assumption = assumptionDAOService.getAssumption(id)
        if (assumption && assumption.matter.id != matter_id) {
            throw new AccessDeniedException("No access to Matter.")
        }
        return assumption
    }

    def getAssumptionsForMatter(long matter_id) {
        if (!matterAuthorisationService.hasCostsAndReadAccess(matter_id)) {
            throw new Exception()
        }

        Matter matter = matterService.getMatter(matter_id)
        return assumptionDAOService.getAssumptionsForMatter(matter)
    }

    CostAssumption saveAssumption(ValidatedParameterMap validatedBody, Matter matter, AppUser currentUser) {
        if (!matterAuthorisationService.hasCostsAndUpdateAccess(matter.id)) {
            throw new Exception()
        }
        if (assumptionDAOService.getAssumptionsForTask(taskDAOService.get(validatedBody.taskId)).size() == 10) {
            throw new Exception()
        }
        if (validatedBody.summary && validatedBody.summary.size() > 70) {
            throw new Exception()
        }
        if (validatedBody.assumption.size() > 300) {
            throw new Exception()
        }
        if (validatedBody.status && !AssumptionStatus.getAllValues().contains(validatedBody.status)) {
            throw new Exception()
        }
        CostAssumption assumption = new CostAssumption(validatedBody)
        if (validatedBody.task == null) {
            assumption.task = taskDAOService.get(validatedBody.taskId)
        }

        assumption.position = assumptionDAOService.getAssumptionsForTask(taskDAOService.get(validatedBody.taskId)).size()
        assumption.matter = matter
        assumption.user = currentUser
        def savedAssumption = assumptionDAOService.save(assumption)

        return savedAssumption
    }

    def deleteAssumption(Matter matter, long assumptionId) {
        CostAssumption assumptionToDelete = getAssumption(assumptionId, matter.id)
        if (assumptionToDelete.matter.id != matter.id) {
            throw new AccessDeniedException("No access to Matter.")
        }
        assumptionDAOService.delete(assumptionToDelete)
    }

    CostAssumption updateAssumption(ValidatedParameterMap validatedBody, CostAssumption assumptionToUpdate) {
        if (validatedBody.summary && validatedBody.summary.size() > 70) {
            throw new Exception()
        }
        if (validatedBody.assumption.size() > 300) {
            throw new Exception()
        }
        if(validatedBody.summary == null || validatedBody.summary.size() <=70){
            assumptionToUpdate.summary = validatedBody.summary
        }
        if(validatedBody.assumption){
            assumptionToUpdate.assumption = validatedBody.assumption
        }
        if(validatedBody.position != null){
            assumptionToUpdate.position = validatedBody.position
        }
        if(validatedBody.status){
            if(!AssumptionStatus.getAllValues().contains(validatedBody.status)){
                throw new Exception()
            }
            assumptionToUpdate.status = validatedBody.status
        }
        def savedAssumption = assumptionDAOService.save(assumptionToUpdate)
        return savedAssumption
    }
}
