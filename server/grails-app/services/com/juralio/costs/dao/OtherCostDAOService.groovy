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


import com.juralio.costs.OtherCost
import com.juralio.costs.RateType
import com.juralio.organisation.Organisation
import com.juralio.organisationgroup.GroupPosition
import grails.gorm.transactions.Transactional

@Transactional
class OtherCostDAOService {

    OtherCost getOtherCost(long id) {
        return OtherCost.get(id)
    }

    List<OtherCost> getOtherCostsForOrganisation(Organisation org){
        return OtherCost.findAllByOrganisation(org)
    }

    List<OtherCost> getOtherCostsForOrganisationAndPosition(Organisation org,GroupPosition position){
        return OtherCost.findAllByOrganisationAndGroupPosition(org,position)
    }

    OtherCost save(OtherCost otherCost) {
        otherCost.save(failOnError: true)
        return otherCost
    }

    OtherCost delete(OtherCost otherCostToDelete) {
        return otherCostToDelete.delete()
    }
}
