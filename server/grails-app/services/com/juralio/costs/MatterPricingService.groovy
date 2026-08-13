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
import com.juralio.costs.dao.MatterPricingDAOService
import com.juralio.matter.Matter
import com.juralio.matter.MatterAuthorisationService
import com.juralio.matter.costs.MatterPricing
import grails.gorm.transactions.Transactional

@Transactional
class MatterPricingService {

    MatterPricingDAOService matterPricingDAOService
    ProjectionPeriodService projectionPeriodService
    CostTimeEstimateService costTimeEstimateService
    MatterAuthorisationService matterAuthorisationService

    MatterPricing getPrice(long matterPriceId) {
        MatterPricing matterPricing = matterPricingDAOService.getMatterPricing(matterPriceId)
        return matterPricing
    }

    MatterPricing getMatterPrice(Matter matter) {
        if (!matterAuthorisationService.hasCostsAndReadAccess(matter.id)) {
            throw new Exception()
        }
        MatterPricing matterPricing = matterPricingDAOService.getMatterPricing(matter)
        return matterPricing
    }

    MatterPricing getMatterPricingByPeriod(ProjectionPeriod period, Matter matter){
        if (!matterAuthorisationService.hasCostsAndUpdateAccess(matter.id)) {
            throw new Exception()
        }
        MatterPricing matterPricing = matterPricingDAOService.getMatterPricingByPeriod(period)
        return matterPricing
    }

    List<MatterPricing> getAllMatterPricingByPeriod(ProjectionPeriod period, Matter matter){
        if (!matterAuthorisationService.hasCostsAndReadAccess(matter.id)) {
            throw new Exception()
        }
        List<MatterPricing> matterPricing = matterPricingDAOService.getAllMatterPricingByPeriod(period)
        return matterPricing
    }

    def createMatterPricing(ValidatedParameterMap validatedBody, Matter matter, AppUser currentUser) {
        if (!matterAuthorisationService.hasCostsAndUpdateAccess(matter.id)) {
            throw new Exception()
        }
        MatterPricing matterPricing = new MatterPricing(validatedBody)
        matterPricing.matter = matter
        matterPricing.projectionPeriod = projectionPeriodService.getProjectionPeriod(validatedBody.period as long)
        def savedPricing = matterPricingDAOService.save(matterPricing)
        costTimeEstimateService.createOrUpdateCostTimeEstimateFromPricing(validatedBody.taskList,savedPricing,matter)
        return savedPricing
    }

    def updatePrice(ValidatedParameterMap validatedBody, long priceToUpdateId,long matterId){
        if (!matterAuthorisationService.hasCostsAndUpdateAccess(matterId)) {
            throw new Exception()
        }
        MatterPricing priceToUpdate = getPrice(priceToUpdateId)
        if(validatedBody.type as int>=0){
            priceToUpdate.type = validatedBody.type as int
        }
        if(validatedBody.value as int>=0){
            priceToUpdate.value = validatedBody.value as int
        }
        if( validatedBody.fullReason){
            priceToUpdate.reason = validatedBody.fullReason
        }

        MatterPricing savedPrice = matterPricingDAOService.save(priceToUpdate)
        return savedPrice
    }

    def deletePrice( long priceToDeleteId,long matterId){
        if (!matterAuthorisationService.hasCostsAndUpdateAccess(matterId)) {
            throw new Exception()
        }
        MatterPricing priceToDelete = getPrice(priceToDeleteId)
        if(priceToDelete){
            return matterPricingDAOService.delete(priceToDelete)
        }
    }
}
