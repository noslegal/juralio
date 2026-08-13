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

import com.juralio.costs.ProjectionPeriod
import com.juralio.matter.Matter
import com.juralio.matter.costs.MatterPricing
import grails.gorm.transactions.Transactional

@Transactional
class MatterPricingDAOService {

    MatterPricing getMatterPricing(long id) {
        MatterPricing matterPricing = MatterPricing.get(id)
        return matterPricing
    }

    MatterPricing getMatterPricing(Matter matter) {
        MatterPricing matterPricing = MatterPricing.findByMatter(matter)
        return matterPricing
    }
    MatterPricing getMatterPricingByPeriod(ProjectionPeriod period){
        MatterPricing matterPricing = MatterPricing.findByProjectionPeriod(period)
        return matterPricing
    }

    List<MatterPricing> getAllMatterPricingByPeriod(ProjectionPeriod period){
        List<MatterPricing> matterPricing = MatterPricing.findAllByProjectionPeriod(period)
        return matterPricing
    }

    MatterPricing save(MatterPricing matterPricing) {
        matterPricing.save(failOnError: true)
        return matterPricing
    }

    MatterPricing delete(MatterPricing matterPricing) {
        matterPricing.delete(failOnError: true)
    }
}
