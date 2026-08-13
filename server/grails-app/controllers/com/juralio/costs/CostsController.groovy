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
import com.juralio.matter.costs.CostTimeEstimate
import com.juralio.matter.costs.MatterPricing
import com.juralio.organisation.OrganisationAuthorisationService
import com.juralio.organisationgroup.GroupPosition
import com.juralio.organisationgroup.dao.MatterGroupPositionDAOService
import com.juralio.task.status.TaskStatus
import grails.plugin.springsecurity.SpringSecurityService
import grails.plugin.springsecurity.annotation.Secured
import org.springframework.http.HttpStatus

@Secured('IS_AUTHENTICATED_FULLY')
class CostsController {
    static allowedMethods = [getStageData: "POST", getMatterStageData: "GET", getClientMatterStageData: "GET", getResourceStageData: "GET", getProjectionStageData: "GET"]

    SpringSecurityService springSecurityService
    GradeService gradeService
    RateService rateService
    RateTypeService rateTypeService
    OtherCostService otherCostService
    RateTableDetailsService rateTableDetailsService
    MatterService matterService
    CostsAuthorisationService costsAuthorisationService
    MatterPricingService matterPricingService
    MatterAuthorisationService matterAuthorisationService
    CostRatioService costRatioService
    CostTimeEstimateService costTimeEstimateService
    ProjectionPeriodService projectionPeriodService
    CostSnapshotService costSnapshotService
    PeriodService periodService
    UserRoleService userRoleService
    OrganisationAuthorisationService organisationAuthorisationService
    MatterGroupPositionDAOService matterGroupPositionDAOService


    @Secured("hasRole('ROLE_ORG_ADMIN')")
    def getStageData() {
        ValidatedParameterMap validatedBody = ParameterValidatorService.validate(request.JSON, [], ['position'])
        AppUser currentUser = springSecurityService.getCurrentUser()
        if(!costsAuthorisationService.instanceCostsEnabled(currentUser.organisation)){
            respond [:], status: HttpStatus.FORBIDDEN
            return
        }
        boolean isSysadmin = userRoleService.hasSysadminRole(currentUser)
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(currentUser.organisationId)) {
            respond [:], status: HttpStatus.FORBIDDEN
            return
        }
        if(isSysadmin){
            respond [:], status: HttpStatus.FORBIDDEN
            return
        }
        Stage stage = new Stage()
        List<Grade> orgGrades = gradeService.organisationPositionGrades(currentUser.organisation,validatedBody.position)
        if (orgGrades.size() == 0) {
            stage.stage = 0
            respond stage, [status: HttpStatus.OK]
            return
        }

        List<RateType> orgRateTypes = rateTypeService.organisationPositionRateTypes(currentUser.organisation,validatedBody.position)
        if (orgRateTypes.size() == 0) {
            //respond with stage 1 and data
            stage.stage = 2
            stage.isReturning = true
            respond stage, [Status: HttpStatus.OK]
            return
        }
        List<OtherCost> orgOtherCosts = otherCostService.organisationPositionOtherCosts(currentUser.organisation,validatedBody.position)
        if (orgOtherCosts.size() == 0) {
            //respond with stage 2 and data
            stage.stage = 3
            stage.isReturning = true
            respond stage, [Status: HttpStatus.OK]
            return
        }
        if (orgOtherCosts.size() > 0 && orgRateTypes.size() > 0 && orgGrades.size() > 0 && validatedBody.position== GroupPosition.findByOrganisationAndName(currentUser.organisation,'Client').id) {
            stage.stage = 7
            respond stage, [Status: HttpStatus.OK]
            return
        }
        List<RateTableDetails> orgRateTableDetails = rateTableDetailsService.organisationRateTableDetails(currentUser.organisation.id)
        if (orgRateTableDetails.size() == 0) {
            //respond with stage 3 and data
            stage.stage = 4
            stage.isReturning = true
            respond stage, [Status: HttpStatus.OK]
            return
        }
        List<Rate> orgRates = rateService.organisationRates(currentUser.organisation.id)
        if (orgOtherCosts.size() > 0 && orgRateTypes.size() > 0 && orgGrades.size() > 0 && orgRateTableDetails.size() > 0 && orgRates.size() == 0) {
            stage.stage = 6
            stage.isReturning = true
            respond stage, [Status: HttpStatus.OK]
            return
        }
        if (orgRates.size() > 0) {
            stage.stage = 7
            respond stage, [Status: HttpStatus.OK]
            return
        } else {
            respond [:], status: HttpStatus.BAD_REQUEST
            return
        }

    }

    @Secured(['IS_AUTHENTICATED_FULLY'])
    def getMatterStageData(long matterId) {
        AppUser currentUser = springSecurityService.getCurrentUser()
        Matter matter = matterService.getMatter(matterId)
        if (matter.organisation.id != currentUser.organisation.id) {
            throw new Exception('Forbidden from accessing this information')
        }
        if(!matterAuthorisationService.hasCostsAndReadAccess(matter.id)){
            respond [:], status: HttpStatus.FORBIDDEN
            return
        }
        boolean isSysadmin = userRoleService.hasSysadminRole(currentUser)
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(currentUser.organisationId)) {
            respond [:], status: HttpStatus.FORBIDDEN
            return
        }
        if(isSysadmin){
            respond [:], status: HttpStatus.FORBIDDEN
            return
        }
        if (costsAuthorisationService.orgCostsSetupForMatterPosition(currentUser, matter) && matterAuthorisationService.hasCostsAccess(matterId)) {
            def matterGroupPosition = matterGroupPositionDAOService.getMatterGroupPosition(matter, currentUser.organisationGroup)
            boolean isExternalClient = !currentUser.organisationGroup?.isInternal && matterGroupPosition?.groupPosition?.name == 'Client'
            MatterStage stage = new MatterStage(stage: 0)
            RateTableDetails matterRTD = rateTableDetailsService.getMatterRateTableDetails(matter)
            ArrayList<PeriodDTO> periodsForTable = new ArrayList<PeriodDTO>()
            if (matterRTD) {
                periodService.getPeriodsForTable(matterRTD).sort { it.id }.forEach { periodsForTable.add(new PeriodDTO(startDate: it.startDate, endDate: it.endDate, periodId: it.id)) }
                RTDDTO rtddto = new RTDDTO(is_retired: matterRTD.is_retired, id: matterRTD.id, work_type: matterRTD.work_type, location: matterRTD.location, currency: matterRTD.currency, initalPeriod: matterRTD.initalPeriod, draft: matterRTD.draft, client: matterRTD.rateTableDetails.client, client_name: matterRTD.rateTableDetails.client_name, templateLocation: matterRTD.templateLocation, templateWorkType: matterRTD.templateWorkType, matter: matterRTD.matter ? true : false, isBeingUsed: false)
                RateTableDetailsWithPeriod rtdWithPeriods = new RateTableDetailsWithPeriod(rateTableDetails: rtddto, periods: periodsForTable)
                stage.finishedMatterRates = true
                stage.rtd = rtdWithPeriods
                stage.stage = 2
            }
            List<ProjectionPeriod> projectionPeriods = projectionPeriodService.getProjectionPeriodsByMatter(matterId)
            List<ProjectionPeriodDTO> periods = []
            projectionPeriods.forEach { projectionPeriod ->
                stage.hasProjectionPeriods = true
                Boolean isRetired = CostSnapshot.findByProjectionPeriod(projectionPeriod) ?CostSnapshot.findByProjectionPeriod(projectionPeriod).is_retired  : false
                ProjectionPeriodDTO periodDTO = new ProjectionPeriodDTO(startDate: projectionPeriod.startDate, endDate: projectionPeriod.endDate, id: projectionPeriod.id,isRetired: isRetired)
                periods.add(periodDTO)
                stage.projectionPeriodList = periods
            }
            List<ProjectionStage> projectionStageList = []
            periods.forEach { def it ->
                CostSnapshot snapshot = CostSnapshot.findByProjectionPeriod(projectionPeriods.find(x->x.id==it.id))
                if(!matterAuthorisationService.hasCostsAndUpdateAccess(matterId)  && (it.isRetired || snapshot==null)){
                    return
                }else {
                    ProjectionStage stageData = projectionPeriodService.getProjectionStageData(it.id, matter, matter.id)
                    if (stageData) {
                        projectionStageList.add(stageData)
                    }
                }
            }
            stage.projectionStageList = projectionStageList
            if (isExternalClient) {
                def slurper = new groovy.json.JsonSlurper()
                projectionStageList.each { ProjectionStage projStage ->
                    if (projStage.snapshot?.trim()) {
                        def snapshotObj = slurper.parseText(projStage.snapshot)
                        snapshotObj.matterRatesList?.each { rate ->
                            rate.remove('standardRate')
                            rate.remove('breakEvenRates')
                        }
                        snapshotObj.revenueValuesDTO.remove('margin')
                        snapshotObj.revenueValuesDTO.remove('totalCost')
                        projStage.snapshot = groovy.json.JsonOutput.toJson(snapshotObj)
                    }
                }
            }
            respond stage, [Status: HttpStatus.OK]
        } else {
            respond [:], status: HttpStatus.FORBIDDEN
        }

    }

    @Secured(['IS_AUTHENTICATED_FULLY'])
    def getClientMatterStageData(long matterId) {
        AppUser currentUser = springSecurityService.getCurrentUser()
        Matter matter = matterService.getMatter(matterId)
        if (matter.organisation.id != currentUser.organisation.id) {
            throw new Exception('Forbidden from accessing this information')
        }
        if (!matterAuthorisationService.hasCostsAndReadAccess(matter.id)) {
            respond [:], status: HttpStatus.FORBIDDEN
            return
        }
        boolean isSysadmin = userRoleService.hasSysadminRole(currentUser)
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(currentUser.organisationId)) {
            respond [:], status: HttpStatus.FORBIDDEN
            return
        }
        if (isSysadmin) {
            respond [:], status: HttpStatus.FORBIDDEN
            return
        }

        ClientMatterStage stage = new ClientMatterStage()

        RateTableDetails matterRTD = rateTableDetailsService.getMatterRateTableDetails(matter)
        if (matterRTD) {
            stage.rateTableDetails = new RTDDTO(
                id: matterRTD.id,
                associated_id: matterRTD.rateTableDetails?.id,
                work_type: matterRTD.work_type,
                location: matterRTD.location,
                currency: matterRTD.currency,
                draft: matterRTD.draft,
                client: matterRTD.rateTableDetails?.client,
                client_name: matterRTD.rateTableDetails?.client_name,
                templateLocation: matterRTD.templateLocation,
                templateWorkType: matterRTD.templateWorkType,
                matter: matterRTD.matter ? true : false,
                is_retired: matterRTD.is_retired
            )
        }

        List<ProjectionPeriod> projectionPeriods = projectionPeriodService.getProjectionPeriodsByMatter(matterId)
        ProjectionPeriod latestPeriod = projectionPeriods ? projectionPeriods.sort { it.id }.last() : null
        if (latestPeriod) {
            stage.hasProjectionPeriod = true
            stage.stage = 0
            stage.projectionPeriod = new ProjectionPeriodDTO(
                id: latestPeriod.id,
                startDate: latestPeriod.startDate,
                endDate: latestPeriod.endDate
            )

            List<MatterPricing> matterPricing = matterPricingService.getAllMatterPricingByPeriod(latestPeriod, matter)
            if (matterPricing && matterPricing.size() > 0) {
                stage.hasPricing = true
                stage.stage = 1
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

            List<CostTimeEstimate> cteList = costTimeEstimateService.getCostTimeEstimatesForProjectionPeriod(latestPeriod.id)
            if (cteList && cteList.size() > 0) {
                stage.hasCostTimeEstimates = true
                stage.stage = Math.max(stage.stage, 2L)
            }

            CostSnapshot snapshot = costSnapshotService.getCostSnapshotForPeriod(latestPeriod)
            if (snapshot) {
                stage.hasSnapshot = true
                stage.stage = Math.max(stage.stage, 3L)
            }

            List<ClientProjectionStage> projectionStageList = []
            projectionPeriods.sort { it.id }.forEach { ProjectionPeriod p ->
                ClientProjectionStage stageData = projectionPeriodService.getClientProjectionStageData(p.id, matter)
                if (stageData) {
                    projectionStageList.add(stageData)
                }
            }
            stage.projectionStageList = projectionStageList
        }

        respond stage, [status: HttpStatus.OK]
    }

    @Secured(['IS_AUTHENTICATED_FULLY'])
    def getProjectionStageData(long projectionPeriodId) {
        AppUser currentUser = springSecurityService.getCurrentUser()
        ProjectionPeriod period = projectionPeriodService.getProjectionPeriod(projectionPeriodId)
        Matter matter = matterService.getMatter(period.matterId)
        if (matter.organisation.id != currentUser.organisation.id) {
            throw new Exception('Forbidden from accessing this information')
        }
        if (costsAuthorisationService.orgCostsSetupForMatterPosition(currentUser, matter) && matterAuthorisationService.hasCostsAccess(matter.id)) {
            ProjectionStage stage = new ProjectionStage(stage: 1)

            List<MatterPricing> matterPricing = matterPricingService.getAllMatterPricingByPeriod(period, matter)
            CostSnapshot snapshot = costSnapshotService.getCostSnapshotForPeriod(period)

            if(snapshot){
                stage.finishedPricing = true
                stage.finishedMatterResources = true
                stage.isFinalised = true
                stage.snapshot = snapshot.snapshot
            }  else {
                stage.period =  new ProjectionPeriodDTO(id: period.id, startDate: period.startDate, endDate: period.endDate)
                RateTableDetails matterRTD = rateTableDetailsService.getMatterRateTableDetails(matter)
                ArrayList<PeriodDTO> periodsForTable = new ArrayList<PeriodDTO>()
                periodService.getPeriodsForTable(matterRTD).sort { it.id }.forEach { periodsForTable.add(new PeriodDTO(startDate: it.startDate, endDate: it.endDate, periodId: it.id)) }
                RTDDTO rtddto = new RTDDTO(is_retired: matterRTD.is_retired, id: matterRTD.id, work_type: matterRTD.work_type, location: matterRTD.location, currency: matterRTD.currency, initalPeriod: matterRTD.initalPeriod, draft: matterRTD.draft, client: matterRTD.rateTableDetails.client, client_name: matterRTD.client_name, templateLocation: matterRTD.templateLocation, templateWorkType: matterRTD.templateWorkType, matter: matterRTD.matter ? true : false, isBeingUsed: false)
                RateTableDetailsWithPeriod rtdWithPeriods = new RateTableDetailsWithPeriod(rateTableDetails: rtddto, periods: periodsForTable)
                stage.rtd = rtdWithPeriods
                List<CostRatio> costRatioList = costRatioService.getCostRatiosForPeriod(period.id,period.matterId)
                if (matterPricing.size()>0) {
                    stage.finishedPricing = true
                    matterPricing.forEach {mp ->{
                        boolean cap = false
                        if(mp.type == 0 && mp.value){
                            cap = true
                        }
                        if(mp.value == null){
                            mp.value = 0
                        }
                        List<CostTimeEstimate> costTimeEstimateList = costTimeEstimateService.getCostTimeEstimatesForPricing(mp.id)
                        List<TaskCostDTO> taskCostDTOList = []
                        costTimeEstimateList.forEach {cte-> {
                            Date startDate = cte.task.status == TaskStatus.DONE.value() || cte.task.status == TaskStatus.IN_PROGRESS.value() ? cte.task.actualStartDate : cte.task.plannedStartDate
                            Date endDate = cte.task.status == TaskStatus.DONE.value() ? cte.task.actualEndDate : cte.task.plannedEndDate
                            TaskCostDTO taskCostDTO =  new TaskCostDTO(name: cte.task.name, id:cte.task.id, status:cte.task.status, projectId:cte.task.projectId,pricingIndex:matterPricing.indexOf(mp),startDate:startDate,endDate: endDate)
                            taskCostDTOList.add(taskCostDTO)
                        }}
                        stage.pricingDTOList.add(new PricingDTO(id: mp.id, type: mp.type, cap: cap, value: mp.value, fullReason: mp.reason,taskList: taskCostDTOList))
                    }}
                    stage.pricingDTOList.sort {pp->pp.id}
                }
                if (costRatioList.size() > 0) {
                    stage.costRatioList = costRatioList.findAll {it.ratioValue > 0}
                    List<CostTimeEstimate> costTimeEstimateList = costTimeEstimateService.getCostTimeEstimatesForProjectionPeriod(period.id)
                    if (costTimeEstimateList.size() > 0) {
                        stage.finishedMatterResources = true
                        List<CostTimeEstimateDTO> cteDTOList = []
                        costTimeEstimateList.forEach {cte ->
                            Date startDate = cte.task.status == TaskStatus.DONE.value() || cte.task.status == TaskStatus.IN_PROGRESS.value() ? cte.task.actualStartDate : cte.task.plannedStartDate
                            Date endDate = cte.task.status == TaskStatus.DONE.value() ? cte.task.actualEndDate : cte.task.plannedEndDate
                            TaskCostDTO taskCostDTO = new TaskCostDTO(name: cte.task.name, id:cte.task.id, status:cte.task.status, projectId:cte.task.projectId,pricingIndex:matterPricing ? matterPricing.indexOf(cte.matterPricing) : 0,startDate:startDate,endDate: endDate)
                            CostTimeEstimateDTO cteDTO  = new CostTimeEstimateDTO(task:taskCostDTO , hourValue: cte.hourValue, projectionPeriodId: cte.projectionPeriodId, id: cte.id, pricingId: cte.matterPricingId ? cte.matterPricingId : 0)
                            cteDTOList.add(cteDTO)
                        }
                        stage.costTimeEstimateList = cteDTOList.sort(x->x.task.status )
                    }
                }
            }
            respond stage, [Status: HttpStatus.OK]
        } else {
            respond [:], status: HttpStatus.FORBIDDEN
        }
    }

}
