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
import com.juralio.costs.dao.ProjectionPeriodDAOService
import com.juralio.matter.Matter
import com.juralio.matter.MatterAuthorisationService
import com.juralio.matter.MatterService
import com.juralio.matter.costs.CostRatio
import com.juralio.matter.costs.CostTimeEstimate
import com.juralio.matter.costs.MatterPricing
import com.juralio.matter.costs.OutOfScopeDetails
import com.juralio.organisationgroup.dao.MatterGroupPositionDAOService
import com.juralio.task.Task
import com.juralio.task.status.TaskStatus
import grails.gorm.transactions.Transactional
import grails.plugin.springsecurity.SpringSecurityService

@Transactional
class ProjectionPeriodService {

    ProjectionPeriodDAOService projectionPeriodDAOService
    MatterService matterService
    MatterPricingService matterPricingService
    CostTimeEstimateService costTimeEstimateService
    CostSnapshotService costSnapshotService
    CostRatioService costRatioService
    CostsService costsService
    MatterAuthorisationService matterAuthorisationService
    RateTableDetailsService rateTableDetailsService
    PeriodService periodService
    OutOfScopeDetailsService outOfScopeDetailsService
    SpringSecurityService springSecurityService
    MatterGroupPositionDAOService matterGroupPositionDAOService

    def getProjectionPeriod(long id) {
        return projectionPeriodDAOService.getProjectionPeriod(id)
    }

    def getProjectionPeriodsByMatter(long matterId) {
        if (!matterAuthorisationService.hasCostsAndReadAccess(matterId)) {
            throw new Exception()
        }
        Matter matter = matterService.getMatter(matterId as long)
        return projectionPeriodDAOService.getProjectionPeriodsByMatter(matter)
    }

    def saveProjectionPeriod(ValidatedParameterMap params, long matterId) {
        if (!matterAuthorisationService.hasCostsAndUpdateAccess(matterId)) {
            throw new Exception()
        }
        Matter matter = matterService.getMatter(params.matterId as long)
        ProjectionPeriod period = new ProjectionPeriod(params)
        period.matter = matter
        return projectionPeriodDAOService.save(period)
    }

    def updateProjectionPeriod(def params, long matterId, ProjectionPeriod projectionPeriod) {
        if (!matterAuthorisationService.hasCostsAndUpdateAccess(matterId)) {
            throw new Exception()
        }
        projectionPeriod.properties = params
        costsService.isValidRemoveFromProjectionPeriods(projectionPeriod)
        return projectionPeriodDAOService.save(projectionPeriod)
    }

    def getProjectionStageData(long projectionPeriodId, Matter matter, long matterId) {
        if (!matterAuthorisationService.hasCostsAndReadAccess(matter.id)) {
            throw new Exception()
        }
        ProjectionPeriod period = getProjectionPeriod(projectionPeriodId)
        ProjectionStage stage = new ProjectionStage(stage: 1)

        List<MatterPricing> matterPricing = matterPricingService.getAllMatterPricingByPeriod(period, matter)
        //will need to expand to list pricing
        CostSnapshot snapshot = costSnapshotService.getCostSnapshotForPeriod(period)

        if (snapshot) {
            stage.isFinalised = true
            stage.snapshot = snapshot.snapshot
            stage.isRetired = snapshot.is_retired
            stage.snapshotId = snapshot.id
            stage.editMode = snapshot.edit_mode
            stage.snapshot_date = snapshot.snapshot_date
        } else {
            stage.isFinalised = false
            stage.snapshot = ''
            stage.isRetired = false
            stage.snapshotId = 0
            stage.editMode = false
        }
        stage.period = new ProjectionPeriodDTO(id: period.id, startDate: period.startDate, endDate: period.endDate)
        RateTableDetails matterRTD = rateTableDetailsService.getMatterRateTableDetails(matter)
        ArrayList<PeriodDTO> periodsForTable = new ArrayList<PeriodDTO>()
        periodService.getPeriodsForTable(matterRTD).sort { it.id }.forEach { periodsForTable.add(new PeriodDTO(startDate: it.startDate, endDate: it.endDate, periodId: it.id)) }
        RTDDTO rtddto = new RTDDTO(is_retired: matterRTD.is_retired,id: matterRTD.id, work_type: matterRTD.work_type, location: matterRTD.location, currency: matterRTD.currency, initalPeriod: matterRTD.initalPeriod, draft: matterRTD.draft, client: matterRTD?.rateTableDetails?.client, client_name: matterRTD.client_name, templateLocation: matterRTD.templateLocation, templateWorkType: matterRTD.templateWorkType, matter: matterRTD.matter ? true : false, isBeingUsed: false)
        RateTableDetailsWithPeriod rtdWithPeriods = new RateTableDetailsWithPeriod(rateTableDetails: rtddto, periods: periodsForTable)
        stage.rtd = rtdWithPeriods
        List<CostRatio> costRatioList = costRatioService.getCostRatiosForPeriod(period.id, matterId)
        if (matterPricing.size() > 0) {
            stage.finishedPricing = true
            matterPricing.forEach { mp ->
                {
                    boolean cap = false
                    if (mp.type == 0 && mp.value) {
                        cap = true
                    }
                    if (mp.value == null) {
                        mp.value = 0
                    }
                    List<CostTimeEstimate> costTimeEstimateList = costTimeEstimateService.getCostTimeEstimatesForPricing(mp.id)
                    List<TaskCostDTO> taskCostDTOList = []
                    costTimeEstimateList.forEach { cte ->
                        {
                            Date startDate = cte.task.status == TaskStatus.DONE.value() || cte.task.status == TaskStatus.IN_PROGRESS.value() ? cte.task.actualStartDate : cte.task.plannedStartDate
                            Date endDate = cte.task.status == TaskStatus.DONE.value() ? cte.task.actualEndDate : cte.task.plannedEndDate
                            TaskCostDTO taskCostDTO = new TaskCostDTO(name: cte.task.name, id: cte.task.id, status: cte.task.status, projectId: cte.task.projectId, pricingIndex: matterPricing.indexOf(mp), startDate: startDate, endDate: endDate)
                            taskCostDTOList.add(taskCostDTO)
                        }
                    }
                    stage.pricingDTOList.add(new PricingDTO(id: mp.id, type: mp.type, cap: cap, value: mp.value, fullReason: mp.reason, taskList: taskCostDTOList))
                }
            }
            stage.pricingDTOList.sort { pp -> pp.id }
        }
        if (costRatioList.size() > 0) {
            costRatioList = costRatioList.findAll { it.ratioValue > 0 }
            List<CostRatioDTO> costRatioDTOList = []
            costRatioList.forEach {
                CostRatioDTO cr = new CostRatioDTO(
                        ratioId: it.id,
                        gradeName: it.grade.name,
                        gradeId: it.gradeId,
                        colour_idx: it.grade.gradeCategory.colour_idx,
                        categoryName: it.grade.gradeCategory.name,
                        categoryId: it.grade.gradeCategory.id,
                        ratioValue: it.ratioValue,
                        recoveryRate: it.recoveryRate,
                        matterId: it.matterId,
                        projectId: it.project != null ? it.project.id : 0,
                        cteId: it.costTimeEstimate != null ? it.costTimeEstimate.id : 0
                )
                costRatioDTOList.add(cr)
            }
            stage.costRatioList = costRatioDTOList

            List<CostTimeEstimate> costTimeEstimateList = costTimeEstimateService.getCostTimeEstimatesForProjectionPeriod(period.id)
            if (costTimeEstimateList.size() > 0) {
                stage.finishedMatterResources = true
                List<CostTimeEstimateDTO> cteDTOList = []
                matter.projects.forEach { project ->
                    Collection<Task> orderedTasks = project.tasks.collect()
                    long index = 0
                    orderedTasks.forEach { task ->
                        def cte = costTimeEstimateList.findAll { CostTimeEstimate it -> it.taskId == task.id }
                        if (cte.size() > 0) {
                            Date startDate = cte[0].task.status == TaskStatus.DONE.value() || cte[0].task.status == TaskStatus.IN_PROGRESS.value() ? cte[0].task.actualStartDate : cte[0].task.plannedStartDate
                            Date endDate = cte[0].task.status == TaskStatus.DONE.value() ? cte[0].task.actualEndDate : cte[0].task.plannedEndDate
                            TaskCostDTO taskCostDTO = new TaskCostDTO(name: cte[0].task.name, id: cte[0].task.id, status: cte[0].task.status, projectId: cte[0].task.projectId, pricingIndex: matterPricing ? matterPricing.indexOf(cte[0].matterPricing) : 0, startDate: startDate, endDate: endDate)
                            CostTimeEstimateDTO cteDTO = new CostTimeEstimateDTO(task: taskCostDTO, hourValue: cte[0].hourValue, projectionPeriodId: cte[0].projectionPeriodId, id: cte[0].id, pricingId: cte[0].matterPricingId ? cte[0].matterPricingId : 0, taskmapPosition: index)
                            cteDTOList.add(cteDTO)
                        }
                        index++
                    }
                }
                stage.costTimeEstimateList = cteDTOList.sort(x -> x.task.status)
            }
        }
        return stage
    }

    def getClientProjectionStageData(long projectionPeriodId, Matter matter) {
        if (!matterAuthorisationService.hasCostsAndReadAccess(matter.id)) {
            throw new Exception()
        }
        ProjectionPeriod period = getProjectionPeriod(projectionPeriodId)
        if (!period) return null

        ClientProjectionStage stage = new ClientProjectionStage(id: period.id)
        stage.period = new ProjectionPeriodDTO(
            id: period.id,
            startDate: period.startDate,
            endDate: period.endDate
        )

        List<MatterPricing> matterPricing = matterPricingService.getAllMatterPricingByPeriod(period, matter)
        if (matterPricing && matterPricing.size() > 0) {
            stage.hasPricing = true
            MatterPricing mp = matterPricing.first()
            stage.pricing = new PricingDTO(
                id: mp.id,
                type: mp.type,
                cap: mp.type == 0 && mp.value ? true : false,
                value: mp.value != null ? mp.value : 0,
                fullReason: mp.reason,
                taskList: []
            )
        }

        List<CostTimeEstimate> cteList = costTimeEstimateService.getCostTimeEstimatesForProjectionPeriod(period.id)
        if (cteList && cteList.size() > 0) {
            stage.hasCostTimeEstimates = true
        }

        CostSnapshot snapshot = costSnapshotService.getCostSnapshotForPeriod(period)
        if (snapshot) {
            stage.hasSnapshot = true
            stage.snapshot = snapshot.snapshot
            stage.snapshotId = snapshot.id
            stage.isRetired = snapshot.is_retired ?: false
            AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
            def matterGroupPosition = matterGroupPositionDAOService
                .getMatterGroupPosition(matter, currentUser?.organisationGroup)
            boolean isClientPosition = matterGroupPosition?.groupPosition?.name == 'Client'
            stage.liveSnapshot = costSnapshotService.buildLiveSnapshotJson(matter, period, isClientPosition)
        }

        OutOfScopeDetails outOfScopeDetails = outOfScopeDetailsService.findByProjectionPeriod(period)
        if (outOfScopeDetails) {
            stage.outOfScopeDetails = new OutOfScopeDetailsDTO(
                id: outOfScopeDetails.id,
                writtenApprovalNeeded: outOfScopeDetails.writtenApprovalNeeded,
                reason: outOfScopeDetails.reason,
                projectionPeriodId: outOfScopeDetails.projectionPeriod?.id
            )
        }
        return stage
    }
}
