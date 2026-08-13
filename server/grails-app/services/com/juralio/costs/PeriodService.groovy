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
import com.juralio.costs.dao.PeriodDAOService
import com.juralio.matter.Matter
import com.juralio.matter.MatterService
import com.juralio.organisation.Organisation
import com.juralio.organisation.dao.OrganisationDAOService
import grails.gorm.transactions.Transactional

@Transactional
class PeriodService {
    PeriodDAOService periodDAOService
    OrganisationDAOService organisationDAOService
    MatterService matterService
    RateService rateService


    Period getPeriod(long id) {
        Period period = periodDAOService.getPeriod(id)
        return period
    }

    Period getMatterPeriod(long matterId) {
        Matter matter = matterService.getMatter(matterId)
        Period period = periodDAOService.getMatterPeriod(matter)
        return period
    }

    List<Period> getPeriodsForTable(RateTableDetails rtd) {
        if (rtd) {
            List<Period> periods = periodDAOService.getPeriodsForTable(rtd)
            return periods
        } else {
            return null
        }
    }

    Period getLatestPeriod(RateTableDetails rtd) {
        List<Period> periods = periodDAOService.getPeriodsForTable(rtd).sort(it -> it.id)
        Period latestPeriod = periods.size() == 0 ? null : periods.get(periods.size() - 1)
        return latestPeriod
    }

    List<Period> getPeriodsForOrgs(long orgId) {
        Organisation org = organisationDAOService.getOrganisation(orgId)

        if (org) {
            List<Period> periods = periodDAOService.getPeriodsForOrganisation(org)
            return periods
        } else {
            return null
        }
    }

    def createPeriod(ValidatedParameterMap params, Organisation org, RateTableDetails rtd, List<Period> periodsInTable) {
        Period newPeriod = new Period(params)
        newPeriod.organisation = org
        newPeriod.rateTableDetails = rtd
        Period savedPeriod = periodDAOService.save(newPeriod)
        if (periodsInTable.size() > 0) {
            List<Period> updatedPeriods = updateNullEnd(periodsInTable, savedPeriod)
            updatedPeriods.add(savedPeriod)
            return updatedPeriods
        }
        return savedPeriod
    }

    def updateNullEnd(List<Period> periodList, Period newPeriod) {
        periodList.forEach { Period it ->
            if (it.endDate == null) {
                it.endDate = newPeriod.startDate
                periodDAOService.save(it)
            }
        }
        return periodList
    }

    def updatePreviousEndDate(List<Period> periodList, Date oldDate, Period newPeriod) {
        periodList.forEach { Period it ->
            if (it.endDate == oldDate) {
                it.endDate = newPeriod.startDate
                periodDAOService.save(it)
            }
        }
        return periodList
    }

    def updatePeriod(def params, Period period, List<Period> periodsInTable) {
        Date oldDate = period.startDate
        period.properties = params
        Period savedPeriod = periodDAOService.save(period)
        if (periodsInTable.size() > 0) {
            List<Period> updatedPeriods = updatePreviousEndDate(periodsInTable, oldDate, period)
            updatedPeriods.add(savedPeriod)
            return updatedPeriods
        }
        return savedPeriod
    }

    def deletePeriod(Period periodToDelete){
        //Don't call this function without already havng done auth
        List<Rate> ratesToDelete = rateService.getRatesForPeriod(periodToDelete)
        ratesToDelete.forEach {rateService.deleteRate(it)}
        List<Period> periods = getPeriodsForTable(periodToDelete.rateTableDetails).sort {it.id}
        def index = periods.indexOf(periodToDelete)
        Period prevPeriod = periods[index-1]
        prevPeriod.endDate = null
        prevPeriod.save()
        return periodDAOService.delete(periodToDelete)
    }
}
