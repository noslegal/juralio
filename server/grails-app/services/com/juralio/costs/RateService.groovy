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
import com.juralio.costs.dao.PeriodDAOService
import com.juralio.costs.dao.RateDAOService
import com.juralio.matter.Matter
import com.juralio.organisation.Organisation
import com.juralio.organisation.dao.OrganisationDAOService
import grails.gorm.transactions.Transactional

@Transactional
class RateService {
    RateDAOService rateDAOService
    PeriodDAOService periodDAOService
    RateTypeService rateTypeService
    GradeService gradeService
    OrganisationDAOService  organisationDAOService
    RateTableDetailsService rateTableDetailsService
    PeriodService periodService

    Rate getRate(long id){
        Rate rate = rateDAOService.getRate(id)
        return rate
    }

    List<Rate> organisationRates(long orgId){
        Organisation org = organisationDAOService.getOrganisation(orgId)
        if(org){
            List<Rate> rates = rateDAOService.getRatesForOrganisation(org)
            return rates
        }else{
            return null
        }
    }

    List<Rate> getTableRates(long rateTableDetailsId){
        RateTableDetails rateTableDetails = rateTableDetailsService.getRateTableDetails(rateTableDetailsId)
        if(rateTableDetails){
            List<Rate> rates = rateDAOService.getRatesForRateTable(rateTableDetails)
            return rates
        }else{
            return null
        }
    }

    List<Rate> getStandardTableRatesForCurrentPeriod(RateTableDetails rateTableDetails,Period latestPeriod){
        RateType standard = rateTypeService.getStandardRateType(rateTableDetails.organisation, rateTableDetails.groupPosition)
        if(rateTableDetails){
            List<Rate> rates
            if(rateTableDetails.client){
              rates = rateDAOService.getRatesForPeriodAndRTD(latestPeriod,rateTableDetails)
            }else{
                 rates = rateDAOService.getStandardRatesForRateTableCurrentPeriod(rateTableDetails,standard,latestPeriod)
            }
            return rates
        }else{
            return null
        }
    }

    List<Rate> getBreakEvenTableRatesForCurrentPeriod(RateTableDetails rateTableDetails,Period latestPeriod) {
        RateType breakEven = rateTypeService.getBreakEvenRateType(rateTableDetails.organisation, rateTableDetails.groupPosition)
        if(rateTableDetails){
            List<Rate> rates
            if(rateTableDetails.client){
                RateTableDetails orgRTD = rateTableDetailsService.getRateTableDetails(rateTableDetails.rateTableDetails.id)
                rates = rateDAOService.getBreakEvenRatesForRateTable(orgRTD, breakEven)
            }else{
                rates = rateDAOService.getBreakEvenRatesForRateTable(rateTableDetails, breakEven)
            }
            return rates
        }else{
            return null
        }
    }

    List<BreakEvenRateDTO> getBreakEvenRatesForMatterRatePeriod(Rate matterRate, List<Rate> breakEvenRates){
        List<BreakEvenRateDTO> matchingBreakEven = []
        Period matterRatePeriod = periodService.getPeriod(matterRate.periodId)
        breakEvenRates.forEach { Rate rate ->
            if(rate.gradeId == matterRate.gradeId){
                Period currRatePeriod = periodService.getPeriod(rate.periodId)
                matchingBreakEven.add(new BreakEvenRateDTO(id: rate.id, rate: rate.rate, periodId: rate.periodId, gradeId: rate.gradeId, startDate: currRatePeriod.startDate, endDate: currRatePeriod.endDate ))
            }else{
                return
            }

        }
        return matchingBreakEven
    }

    List<Rate> getRatesForMatter (Matter matter){
        RateTableDetails rtd = rateTableDetailsService.getMatterRateTableDetails(matter)
        List<Rate>rates = rateDAOService.getRatesForRateTable(rtd)
        return rates
    }

    List<Rate> getRatesForPeriod (Period period){
        List<Rate>rates = rateDAOService.getRatesForPeriod(period)
        return rates
    }

    Rate createRate(ValidatedParameterMap params, AppUser currentUser){
        Rate newRate = new Rate(params)
        newRate.organisation = currentUser.organisation
        newRate.period = periodDAOService.getPeriod(params.periodId)
        newRate.grade = gradeService.getGrade(params.gradeId)
        newRate.rateType = rateTypeService.getRateType(params.rateTypeId)
        newRate.rateTableDetails = rateTableDetailsService.getRateTableDetails(params.rate_table_detailsId)

        Rate savedRate = rateDAOService.save(newRate)

        return savedRate
    }

    def updateRate(ValidatedParameterMap  params, Rate rateToUpdate){
        if(params.rate){
            rateToUpdate.rate = params.rate
        } else {
            rateToUpdate.rate = null
        }
        Rate savedRate = rateDAOService.save(rateToUpdate)

        return savedRate
    }

    def deleteRate(Rate rateToDelete){
        //Don't call this function without already havng done auth
        return rateDAOService.delete(rateToDelete)
    }

    def addRateFromTemplate(Rate addedRate, long templateRtdId){
        RateTableDetails templateRtd = rateTableDetailsService.getRateTableDetails(templateRtdId)
        List<RateTableDetails> usingTemplate = rateTableDetailsService.getAllFromTemplateRTD(templateRtd)
        usingTemplate.forEach {rtd ->
            RateType rateType = rateTypeService.getAgreedClientRateType(rtd.organisation, rtd.groupPosition)
            List<Period> rtdPeriods = periodService.getPeriodsForTable(rtd)
            rtdPeriods.forEach {Period period ->
                Rate newRate = new Rate(organisation: rtd.organisation, period: period, rate: null, grade: addedRate.grade, rateType: rateType, rateTableDetails: rtd)
                rateDAOService.save(newRate)
            }

        }
    }

}
