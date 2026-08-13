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
import com.juralio.costs.RateTableDetails
import com.juralio.matter.Matter
import com.juralio.organisation.Organisation
import grails.gorm.transactions.Transactional

@Transactional
class PeriodDAOService {

    Period getPeriod(long id) {
        return Period.get(id)
    }

    Period getMatterPeriod(Matter matter) {
        return Period.findByMatter(matter)
    }

    List<Period> getPeriodsForOrganisation(Organisation org){
        return  Period.findAllByOrganisation(org)
    }

    List<Period> getPeriodsForTable(RateTableDetails rtd){
        return  Period.findAllByRateTableDetails(rtd)
    }

    Period save(Period period) {
        period.save(failOnError: true)
        return period
    }

    Period delete(Period period){
        period.delete()
        return
    }
}
