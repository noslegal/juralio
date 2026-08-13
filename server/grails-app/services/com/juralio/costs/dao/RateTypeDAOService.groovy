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

import com.juralio.costs.Grade
import com.juralio.costs.Rate
import com.juralio.costs.RateType
import com.juralio.organisation.Organisation
import com.juralio.organisationgroup.GroupPosition
import grails.gorm.transactions.Transactional

@Transactional
class RateTypeDAOService {

    RateType getRateType(long id){
        return RateType.get(id)
    }

    RateType getStandardRateType(Organisation org, GroupPosition position){
        return RateType.findByIsStandardAndOrganisationAndGroupPosition(true,org, position)
    }

    RateType getBreakEvenRateType(Organisation org, GroupPosition position){
        return RateType.findByIsBreakevenAndOrganisationAndGroupPosition(true, org, position)
    }

    RateType getAgreedClientRateType(Organisation org, GroupPosition position){
        return RateType.findByIsAgreedClientAndOrganisationAndGroupPosition(true, org, position)
    }
    RateType getAgreedMatterRateType(Organisation org){
        return RateType.findByIsAgreedMatterAndOrganisation(true, org)
    }

    List<RateType> getRateTypesForOrg(Organisation org){
        return RateType.findAllByOrganisation(org)
    }

    List<RateType> getRateTypesForOrgAndPosition(Organisation org,GroupPosition position){
        return RateType.findAllByOrganisationAndGroupPosition(org,position)
    }

    RateType save(RateType type){
        type.save(failOnError: true)
        return type
    }

    RateType delete(RateType rateTypeToDelete) {
        return rateTypeToDelete.delete()
    }
}
