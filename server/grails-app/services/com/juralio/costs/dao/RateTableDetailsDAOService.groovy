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
import com.juralio.costs.Rate
import com.juralio.costs.RateTableDetails
import com.juralio.matter.Matter
import com.juralio.organisation.Organisation
import com.juralio.organisationgroup.GroupPosition
import grails.gorm.transactions.Transactional

@Transactional
class RateTableDetailsDAOService {

    RateTableDetails getRateTableDetails(long  id){
        return RateTableDetails.get(id)
    }

    List<RateTableDetails> getRateTableDetailsForOrganisation(Organisation organisation){
       List<RateTableDetails> rateTableDetailsList =  RateTableDetails.findAllByOrganisation(organisation)
        rateTableDetailsList = rateTableDetailsList.findAll {it.matter==null}
        rateTableDetailsList.forEach {
            it.initalPeriod = Period.findByRateTableDetails(it)
            it.isBeingUsed = isBeingUsed(it)
        }
        return rateTableDetailsList

    }

    List<RateTableDetails> getRateTableDetailsForOrganisationAndPosition(Organisation organisation,GroupPosition position){
        List<RateTableDetails> rateTableDetailsList =  RateTableDetails.findAllByOrganisationAndGroupPosition(organisation,position)
        rateTableDetailsList = rateTableDetailsList.findAll {it.matter==null}
        rateTableDetailsList.forEach {
            it.initalPeriod = Period.findByRateTableDetails(it)
            it.isBeingUsed = isBeingUsed(it)
        }
        return rateTableDetailsList

    }

    RateTableDetails getRateTableDetailsForMatter(Matter matter){
        return RateTableDetails.findByMatter(matter)
    }

    RateTableDetails save(RateTableDetails rateTableDetails){
        rateTableDetails.save(failOnError: true)
        return rateTableDetails
    }

    List<RateTableDetails> getAllUsingAsTemplate(RateTableDetails templateRTD){
        List<RateTableDetails> rtdUsingTemplate = RateTableDetails.findAllByRateTableDetails(templateRTD)
        return rtdUsingTemplate
    }

    Boolean isBeingUsed(RateTableDetails currRtd){
        List<RateTableDetails> usedByList = RateTableDetails.findAllByRateTableDetails(currRtd)
        return usedByList.size() > 0
    }

    RateTableDetails delete(RateTableDetails rtdToDelete){
        return rtdToDelete.delete(flush:true)
    }
}
