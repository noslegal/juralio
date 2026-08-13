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
import com.juralio.costs.RateType
import com.juralio.organisation.Organisation
import grails.gorm.transactions.Transactional

@Transactional
class RateDAOService {
    Rate getRate(long  id){
        return Rate.get(id)
    }

    List<Rate> getRatesForOrganisation(Organisation organisation){
        return Rate.findAllByOrganisation(organisation)
    }

    List<Rate> getRatesForRateTable(RateTableDetails rateTableDetails){
        return Rate.findAllByRateTableDetails(rateTableDetails)
    }

    List<Rate> getRatesForPeriod(Period period){
        return Rate.findAllByPeriod(period)
    }

    List<Rate> getRatesForPeriodAndRTD(Period period,RateTableDetails rtd){
        return Rate.findAllByPeriodAndRateTableDetails(period,rtd)
    }

    List<Rate> getBreakEvenRatesForRateTable(RateTableDetails rateTableDetails, RateType breakEven){
        return Rate.findAllByRateTypeAndRateTableDetails(breakEven, rateTableDetails)
    }

    List<Rate> getStandardRatesForRateTableCurrentPeriod(RateTableDetails rateTableDetails,RateType standard,Period latestPeriod){
        return Rate.findAllByRateTypeAndRateTableDetailsAndPeriod(standard,rateTableDetails,latestPeriod)
    }

    Rate save(Rate rate){
        rate.save(failOnError: true)

        return rate
    }

    def delete(Rate rate){
        return rate.delete()
    }


}
