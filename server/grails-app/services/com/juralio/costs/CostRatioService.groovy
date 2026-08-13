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
import com.juralio.costs.dao.CostRatioDAOService
import com.juralio.matter.Matter
import com.juralio.matter.MatterAuthorisationService
import com.juralio.matter.MatterService
import com.juralio.matter.costs.CostRatio
import com.juralio.matter.costs.CostTimeEstimate
import com.juralio.project.Project
import com.juralio.project.ProjectService
import grails.gorm.transactions.Transactional

@Transactional
class CostRatioService {

    MatterService matterService
    CostRatioDAOService costRatioDAOService
    ProjectionPeriodService projectionPeriodService
    GradeService gradeService
    MatterAuthorisationService matterAuthorisationService
    CostTimeEstimateService costTimeEstimateService
    ProjectService projectService

    private CostRatio getCostRatio(long costRatioId) {
        CostRatio costRatio = costRatioDAOService.getCostRatio(costRatioId)
        return costRatio
    }

    List<CostRatio> getCostRatiosForMatter(long matter_id) {
        if (!matterAuthorisationService.hasCostsAndReadAccess(matter_id)) {
            throw new Exception()
        }
        Matter matter = matterService.getMatter(matter_id)
        def costRatios = costRatioDAOService.getCostRatioForMatter(matter)
        return costRatios
    }

    List<CostRatio> getCostRatiosForPeriod(long projectionPeriodId,long matter_id) {
        if (!matterAuthorisationService.hasCostsAndReadAccess(matter_id)) {
            throw new Exception()
        }
        ProjectionPeriod projectionPeriod = projectionPeriodService.getProjectionPeriod(projectionPeriodId)
        def costRatios = costRatioDAOService.getCostRatioForPeriod(projectionPeriod)
        return costRatios
    }

    def createCostRatio(ValidatedParameterMap validatedBody, Matter matter) {
        if (!matterAuthorisationService.hasCostsAndUpdateAccess(matter.id)) {
            throw new Exception()
        }
        CostRatio costRatio = new CostRatio(validatedBody)
        if(validatedBody.grade == null){
            costRatio.grade = gradeService.getGrade(validatedBody.gradeId)
        }
        if(validatedBody.cteId){
            costRatio.costTimeEstimate = CostTimeEstimate.findById(validatedBody.cteId)
        }
        if(validatedBody.workstreamId){
            costRatio.project = Project.findById(validatedBody.workstreamId)
        }
        costRatio.matter = matter
        costRatio.projectionPeriod = projectionPeriodService.getProjectionPeriod(validatedBody.projectionPeriod as long)
        def savedCostRatio = costRatioDAOService.save(costRatio)
        return savedCostRatio
    }

    def updateCostRatio(ValidatedParameterMap validatedBody, long costRatioToUpdateId,long matter_id){
        if (!matterAuthorisationService.hasCostsAndUpdateAccess(matter_id)) {
            throw new Exception()
        }
        CostRatio costRatioToUpdate = getCostRatio(costRatioToUpdateId)
        if(validatedBody.ratioValue>=0){
            costRatioToUpdate.ratioValue = validatedBody.ratioValue
        }
        if(validatedBody.recoveryRate>=0){
            costRatioToUpdate.recoveryRate = validatedBody.recoveryRate
        }
        CostRatio savedCostRatio = costRatioDAOService.save(costRatioToUpdate)
        return savedCostRatio
    }

    def createOrUpdateCteOrWorkstreamRatio(ValidatedParameterMap validatedBody,Matter matter){
        ProjectionPeriod projectionPeriod = projectionPeriodService.getProjectionPeriod(validatedBody.projectionPeriod)
        CostRatio ratioToCreateOrUpdate
        if(validatedBody.cteId){
            CostTimeEstimate cte = costTimeEstimateService.getCostTimeEstimate(validatedBody.cteId)
            Grade grade =  gradeService.getGrade(validatedBody.gradeId)
            CostRatio existingCR = CostRatio.findByProjectionPeriodAndCostTimeEstimateAndGrade(projectionPeriod,cte,grade)
            if(existingCR){
                ratioToCreateOrUpdate =     updateCostRatio(validatedBody, validatedBody.costRatioId,matter.id)
            }else{
                ratioToCreateOrUpdate=  createCostRatio(validatedBody, matter)
        }
        } else if(validatedBody.workstreamId){
            Project workstream = projectService.getProject(validatedBody.workstreamId)
            Grade grade =  gradeService.getGrade(validatedBody.gradeId)
            CostRatio existingCR = CostRatio.findByProjectionPeriodAndProjectAndGrade(projectionPeriod,workstream,grade)
            if(existingCR){
                ratioToCreateOrUpdate =     updateCostRatio(validatedBody, validatedBody.costRatioId,matter.id)
            }else{
                ratioToCreateOrUpdate=  createCostRatio(validatedBody, matter)
            }
        }
        return ratioToCreateOrUpdate
    }

    def resetCostRatios(ValidatedParameterMap validatedBody){
        ProjectionPeriod projectionPeriod = projectionPeriodService.getProjectionPeriod(validatedBody.projectionPeriodId)
        if(validatedBody.cteId){
            CostTimeEstimate cte = costTimeEstimateService.getCostTimeEstimate(validatedBody.cteId)
           List< CostRatio> existingCRs = CostRatio.findAllByProjectionPeriodAndCostTimeEstimate(projectionPeriod,cte)
            if(existingCRs){
                existingCRs.forEach {CostRatio cr ->cr.delete()}
            }
        } else if(validatedBody.workstreamId){
            Project workstream = projectService.getProject(validatedBody.workstreamId)
            List< CostRatio> existingCRs= CostRatio.findAllByProjectionPeriodAndProject(projectionPeriod,workstream)
            if(existingCRs){
                existingCRs.forEach {CostRatio cr ->cr.delete()}
            }
        }
    }
}
