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

import com.fasterxml.jackson.databind.ObjectMapper
import com.juralio.auth.AppUser
import com.juralio.common.ValidatedParameterMap
import com.juralio.costs.dao.SnapshotDAOService
import com.juralio.matter.Matter
import com.juralio.matter.MatterAuthorisationService
import com.juralio.matter.MatterService
import com.juralio.matter.costs.CostRatio
import com.juralio.matter.costs.CostTimeEstimate
import com.juralio.matter.costs.MatterPricing
import com.juralio.matter.costs.OutOfScopeDetails
import com.juralio.organisationgroup.dao.MatterGroupPositionDAOService
import com.juralio.project.Project
import com.juralio.project.ProjectService
import com.juralio.task.Task
import com.juralio.task.status.TaskStatus
import grails.gorm.transactions.Transactional
import grails.plugin.springsecurity.SpringSecurityService


@Transactional
class CostSnapshotService {
    MatterService matterService
    CostRatioService costRatioService
    CostTimeEstimateService costTimeEstimateService
    SnapshotDAOService snapshotDAOService
    ProjectionPeriodService projectionPeriodService
    ProjectService projectService
    MatterPricingService matterPricingService
    RateService rateService
    PeriodService periodService
    RateTableDetailsService rateTableDetailsService
    MatterAuthorisationService matterAuthorisationService
    CostAssumptionService costAssumptionService
    OutOfScopeDetailsService outOfScopeDetailsService
    SpringSecurityService springSecurityService
    MatterGroupPositionDAOService matterGroupPositionDAOService

    CostSnapshot getCostSnapshot(long matter_id) {
        if (!matterAuthorisationService.hasCostsAndReadAccess(matter_id)) {
            throw new Exception()
        }
        Matter matter = matterService.getMatter(matter_id)
        return snapshotDAOService.getSnapshot(matter)
    }

    CostSnapshot getCostSnapshotForPeriod(ProjectionPeriod projectionPeriod) {
        if (!matterAuthorisationService.hasCostsAndReadAccess(projectionPeriod.matterId)) {
            throw new Exception()
        }
        return snapshotDAOService.getSnapshotForPeriod(projectionPeriod)
    }

    CostSnapshot getCostSnapshotById(long snapshotId,long matter_id) {
        if (!matterAuthorisationService.hasCostsAndReadAccess(matter_id)) {
            throw new Exception()
        }
        return snapshotDAOService.getSnapshotById(snapshotId)
    }

    def updateSnapshot(long matter_id,long snapshotId,ValidatedParameterMap validatedBody){
        if (!matterAuthorisationService.hasCostsAndUpdateAccess(matter_id)) {
            throw new Exception()
        }
        CostSnapshot snapshotToUpdate = getCostSnapshotById(snapshotId,matter_id)
        //for now this is fine as we can only change the is retired
        if(validatedBody.is_retired){
            snapshotToUpdate.is_retired = validatedBody.is_retired
        }
        if(validatedBody.edit_mode!=null){
            snapshotToUpdate.edit_mode = validatedBody.edit_mode
        }
        return snapshotToUpdate.save()
    }

    def saveSnapshot(long matter_id, ValidatedParameterMap validatedBody) {
        if (!matterAuthorisationService.hasCostsAndUpdateAccess(matter_id)) {
            throw new Exception()
        }
        Matter matter = matterService.getMatter(matter_id)
        ProjectionPeriod period = projectionPeriodService.getProjectionPeriod(validatedBody.projectionPeriod as long)
        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
        def matterGroupPosition = matterGroupPositionDAOService
            .getMatterGroupPosition(matter, currentUser?.organisationGroup)
        boolean isClientPosition = matterGroupPosition?.groupPosition?.name == 'Client'

        SnapshotObject snapshotObject = buildSnapshotObject(matter, period, isClientPosition, validatedBody)
        ObjectMapper mapper = new ObjectMapper()
        def json = mapper.writeValueAsString(snapshotObject)
        CostSnapshot costSnapshot = new CostSnapshot(snapshot: json, snapshot_date: new Date(), matter: matter, projectionPeriod: period,is_retired: false,edit_mode: false)
        CostSnapshot savedSnapshot = snapshotDAOService.saveSnapshot(costSnapshot)
        return savedSnapshot
    }

    String buildLiveSnapshotJson(Matter matter, ProjectionPeriod period, boolean isClientPosition) {
        SnapshotObject snapshotObject = buildSnapshotObject(matter, period, isClientPosition, null)
        if (isClientPosition) {
            snapshotObject.matterRatesList?.each { rate ->
                rate.standardRate = null
                rate.breakEvenRates = null
            }
            if (snapshotObject.revenueValuesDTO) {
                snapshotObject.revenueValuesDTO.totalCost = null
                snapshotObject.revenueValuesDTO.margin = 0
            }
        }
        ObjectMapper mapper = new ObjectMapper()
        return mapper.writeValueAsString(snapshotObject)
    }

    private SnapshotObject buildSnapshotObject(Matter matter, ProjectionPeriod period, boolean isClientPosition, ValidatedParameterMap validatedBody) {
        long matter_id = matter.id
        SnapshotObject snapshotObject = new SnapshotObject()
        snapshotObject.matter_name = matter.name
        snapshotObject.matter_id = matter.id
        List<Project> workstreams = projectService.getProjectsByMatterId(matter_id, true, false, true, false, false)
        List<WorkstreamCostDTO> workstreamDTOList = []
        workstreams.forEach { workstream ->
            WorkstreamCostDTO workstreamDTO = new WorkstreamCostDTO(id: workstream.id, name: workstream.name)
            workstreamDTOList.add(workstreamDTO)
        }
        snapshotObject.workstreamList = workstreamDTOList

        RateTableDetails matterRTD = rateTableDetailsService.getMatterRateTableDetails(matter)
        RateTableDetails referenceRTD = isClientPosition || matterRTD.rateTableDetails == null
            ? null
            : rateTableDetailsService.getRateTableDetails(matterRTD?.rateTableDetails?.id)
        Period latestPeriod = isClientPosition || referenceRTD == null
                ? null
                : periodService.getLatestPeriod(matterRTD.rateTableDetails)
        ArrayList<PeriodDTO> periodsForTable = new ArrayList<PeriodDTO>()
        List<Rate> standardRateList = isClientPosition || referenceRTD == null
            ? null
            : rateService.getStandardTableRatesForCurrentPeriod(referenceRTD, latestPeriod)
        if (matterRTD) {
            periodService.getPeriodsForTable(matterRTD).sort { it.id }.forEach { periodsForTable.add(new PeriodDTO(startDate: it.startDate, endDate: it.endDate, periodId: it.id)) }
            RTDDTO rtddto = new RTDDTO(standardRateName: standardRateList?.getAt(0)?.rateType?.name,  id: matterRTD.id,work_type: matterRTD.work_type,location: matterRTD.location,currency: matterRTD.currency,initalPeriod: matterRTD.initalPeriod,draft: matterRTD.draft,client: matterRTD?.rateTableDetails?.client,client_name: matterRTD?.rateTableDetails?.client_name,templateLocation: matterRTD.templateLocation,templateWorkType: matterRTD.templateWorkType, matter: matterRTD.matter ? true : false, isBeingUsed: false)
            RateTableDetailsWithPeriod rtdWithPeriods = new RateTableDetailsWithPeriod(rateTableDetails: rtddto, periods: periodsForTable)
            snapshotObject.rtd = rtdWithPeriods

            OutOfScopeDetails outOfScopeDetails = outOfScopeDetailsService.findByProjectionPeriod(period)
            if (outOfScopeDetails) {
                snapshotObject.outOfScopeDetails = new OutOfScopeDetailsDTO(
                    id: outOfScopeDetails.id,
                    writtenApprovalNeeded: outOfScopeDetails.writtenApprovalNeeded,
                    reason: outOfScopeDetails.reason,
                    projectionPeriodId: outOfScopeDetails.projectionPeriod?.id
                )
            }
        }
        List<Rate> rateList = rateService.getRatesForMatter(matter)
        List<Rate> breakEvenRateList = referenceRTD != null
            ? rateService.getBreakEvenTableRatesForCurrentPeriod(referenceRTD, latestPeriod)
            : null
        List<MatterRatesDTO> matterRatesDTOList = []
        rateList.forEach { rate ->
            def standardRate = standardRateList?.find(r -> r.grade == rate.grade)
            def breakEvenRates = breakEvenRateList != null
                ? rateService.getBreakEvenRatesForMatterRatePeriod(rate, breakEvenRateList)
                : null
            MatterRatesDTO rateDTO = new MatterRatesDTO(rateTypeName: rate.rateType.name, rateValue: rate.rate, standardRate: standardRate?.rate, breakEvenRates: breakEvenRates, periodId: rate.period.id, startDate: rate.period.startDate, endDate: rate.period.endDate, gradeId: rate.grade.id,gradeName: rate.grade.name,categoryName: rate.grade.gradeCategory.name, gradeCategoryId: rate.grade.gradeCategory.id, rateId: rate.id, colour_idx: rate.grade.gradeCategory.colour_idx)
            matterRatesDTOList.add(rateDTO)
        }
        snapshotObject.matterRatesList = matterRatesDTOList
        ProjectionPeriodDTO periodDTO = new ProjectionPeriodDTO(startDate: period.startDate, endDate: period.endDate, id: period.id)
        snapshotObject.period = periodDTO
        List<MatterPricing> matterPricing = matterPricingService.getAllMatterPricingByPeriod(period, matter)
        if (matterPricing.size() > 0) {
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
                            TaskCostDTO taskCostDTO = new TaskCostDTO(name: cte.task.name, id: cte.task.id, status: cte.task.status, projectId: cte.task.projectId, pricingIndex: matterPricing.indexOf(mp),startDate:startDate,endDate: endDate, deliverables: getDeliverableSubtasks(cte.task))
                            taskCostDTOList.add(taskCostDTO)
                        }
                    }
                    snapshotObject.pricingDTOList.add(new PricingDTO(id: mp.id, type: mp.type, cap: cap, value: mp.value, fullReason: mp.reason, taskList: taskCostDTOList))
                }
            }
            snapshotObject.pricingDTOList.sort { pDTO -> pDTO.id }
        }
        List<CostRatio> costRatioList = costRatioService.getCostRatiosForPeriod(period.id, matter_id)
        List<CostRatioDTO> costRatioDTOList = []
        costRatioList.findAll {it.ratioValue>0}.forEach { CostRatio cr ->
            CostRatioDTO costRatioDTO = new CostRatioDTO( gradeName: cr.grade.name, gradeId: cr.gradeId,colour_idx: cr.grade.gradeCategory.colour_idx, categoryName: cr.grade.gradeCategory.name, categoryId: cr.grade.gradeCategory.id, ratioValue: cr.ratioValue, recoveryRate: cr.recoveryRate, matterId: cr.matterId, cteId: cr.costTimeEstimate ? cr.costTimeEstimate.id : 0, projectId: cr.project ? cr.project.id : 0)
            costRatioDTOList.add(costRatioDTO)
        }
        snapshotObject.costRatioList = costRatioDTOList
        List<CostTimeEstimate> costTimeEstimateList = costTimeEstimateService.getCostTimeEstimatesForProjectionPeriod(period.id)
        List<CostTimeEstimateDTO> costTimeEstimateDTOList = []
        def periodLength = java.time.Period.between(period.startDate.toLocalDate(), period.endDate.toLocalDate())
        def numMonths = periodLength.years * 12 + periodLength.getMonths()
        matter.projects.forEach {project->
            Collection<Task> orderedTasks = project.tasks.collect()
            long index = 0
            orderedTasks.forEach {task ->
                def cte = costTimeEstimateList.findAll {CostTimeEstimate it -> it.taskId == task.id}
                if(cte.size() > 0){
                    def revenueValue = 0
                    def revenueData = validatedBody?.cteRevenueList
                    if (revenueData != null) {
                        for (int i = 0; i < revenueData.length(); ++i) {
                            if(revenueData[i][0] == cte[0].task.id){
                                revenueValue = revenueData[i][1][1]
                            }
                        }
                    }

                    Date startDate = cte[0].task.status == TaskStatus.DONE.value() || cte[0].task.status == TaskStatus.IN_PROGRESS.value() ? cte[0].task.actualStartDate : cte[0].task.plannedStartDate
                    Date endDate = cte[0].task.status == TaskStatus.DONE.value() ? cte[0].task.actualEndDate : cte[0].task.plannedEndDate
                    TaskCostDTO taskCostDTO = new TaskCostDTO(name: cte[0].task.name, id:cte[0].task.id, status:cte[0].task.status, projectId:cte[0].task.projectId,pricingIndex:matterPricing ? matterPricing.indexOf(cte[0].matterPricing) : 0,startDate:startDate,endDate: endDate, deliverables: getDeliverableSubtasks(cte[0].task) )
                    CostTimeEstimateDTO cteDTO  = new CostTimeEstimateDTO(task:taskCostDTO , hourValue: cte[0].hourValue, revenueValue: revenueValue, projectionPeriodId: cte[0].projectionPeriodId, id: cte[0].id, pricingId: cte[0].matterPricingId ? cte[0].matterPricingId : 0, taskmapPosition: index)
                    costTimeEstimateDTOList.add(cteDTO)
                }
                index++
            }
        }
        snapshotObject.costTimeEstimateList = costTimeEstimateDTOList
        snapshotObject.revenueValuesDTO = createRevenueValueDTO(matterPricing,costTimeEstimateDTOList)
        if (validatedBody?.totalCost != null) {
            snapshotObject.revenueValuesDTO.totalCost = validatedBody.totalCost
        }
        List<CostAssumption> assumptions = costAssumptionService.getAssumptionsForMatter(matter_id)
        assumptions.forEach { CostAssumption ca ->
            snapshotObject.assumptionList.add(new CostAssumptionDTO(
                id: ca.id,
                taskId: ca.task.id,
                projectId: ca.task.projectId,
                assumption: ca.assumption,
                summary: ca.summary,
                status: ca.status,
            ))
        }
        return snapshotObject
    }

    private static List<DeliverableDTO> getDeliverableSubtasks(Task task) {
        if (!task.tasks) return []
        List<DeliverableDTO> deliverables = []
        task.tasks.each { Task child ->
            if (child.isDeliverable) {
                deliverables.add(new DeliverableDTO(id: child.id, name: child.name))
            }
            deliverables.addAll(getDeliverableSubtasks(child))
        }
        return deliverables
    }

    private def getMatterRatesForMonth(Date taskDate, Matter matter) {
        RateTableDetails matterRTD = rateTableDetailsService.getMatterRateTableDetails(matter)
        List<Period> matterPeriodList = periodService.getPeriodsForTable(matterRTD).reverse()
        List<Rate> matterRateList = []
        if (matterPeriodList.size() > 1) {
            for (def x = 0; x < matterPeriodList.size(); x++) {
                if (taskDate.after(matterPeriodList[x].startDate) && (matterPeriodList[x].endDate == null || taskDate.before(matterPeriodList[x].endDate))) {
                    matterRateList = rateService.getRatesForPeriod(matterPeriodList[x])
                    return matterRateList
                    break
                } else if(x == 0 && taskDate.before(matterPeriodList[0].startDate)){
                    matterRateList = rateService.getRatesForPeriod(matterPeriodList[0])
                    return matterRateList
                    break
                }
            }
        } else {
            matterRateList = rateService.getRatesForPeriod(matterPeriodList[0])
            return matterRateList
        }
    }

    private static def createRevenueValueDTO(List<MatterPricing> matterPricing, List<CostTimeEstimateDTO>costTimeEstimateList){
        revenueValuesDTO revenueValuesDTO = new revenueValuesDTO(totalRevenue: 0,margin: 0)
        matterPricing.forEach { pricing->
            Double pricingTotal = 0
            if(pricing.type==0){
                List<CostTimeEstimateDTO> currPricingCte = costTimeEstimateList.findAll(cte->cte.pricingId==pricing.id)
                currPricingCte.forEach {cte->pricingTotal = pricingTotal + cte.revenueValue}
                if(pricing.value>0 && pricing.value<pricingTotal){
                    revenueValuesDTO.totalRevenue = revenueValuesDTO.totalRevenue + pricing.value
                } else {
                    revenueValuesDTO.totalRevenue = revenueValuesDTO.totalRevenue + pricingTotal
                }
            } else if (pricing.type==1){
                revenueValuesDTO.totalRevenue = revenueValuesDTO.totalRevenue + pricing.value
            }

        }
        return revenueValuesDTO
    }
}
