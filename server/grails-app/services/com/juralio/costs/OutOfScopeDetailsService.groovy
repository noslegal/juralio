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
import com.juralio.costs.dao.OutOfScopeDetailsDAOService
import com.juralio.costs.dao.ProjectionPeriodDAOService
import com.juralio.matter.Matter
import com.juralio.matter.MatterAuthorisationService
import com.juralio.matter.costs.OutOfScopeDetails
import grails.gorm.transactions.Transactional

@Transactional
class OutOfScopeDetailsService {

    OutOfScopeDetailsDAOService outOfScopeDetailsDAOService
    ProjectionPeriodDAOService projectionPeriodDAOService
    MatterAuthorisationService matterAuthorisationService

    OutOfScopeDetails getOutOfScopeDetails(long id) {
        return outOfScopeDetailsDAOService.getOutOfScopeDetails(id)
    }

    OutOfScopeDetails findByProjectionPeriod(ProjectionPeriod projectionPeriod) {
        if (!projectionPeriod) return null
        return outOfScopeDetailsDAOService.findByProjectionPeriod(projectionPeriod)
    }

    def createOutOfScopeDetails(ValidatedParameterMap validatedBody, Matter matter, AppUser currentUser) {
        if (!matterAuthorisationService.hasCostsAndUpdateAccess(matter.id)) {
            throw new Exception()
        }

        ProjectionPeriod projectionPeriod = projectionPeriodDAOService
            .getProjectionPeriod(validatedBody.projectionPeriodId as long)
        if (!projectionPeriod || projectionPeriod.matter?.id != matter.id) {
            throw new Exception('Projection period does not belong to this matter')
        }
        OutOfScopeDetails outOfScopeDetails = new OutOfScopeDetails(
            writtenApprovalNeeded: validatedBody.writtenApprovalNeeded as Boolean,
            reason: validatedBody.reason,
            projectionPeriod: projectionPeriod
        )
        def saved = outOfScopeDetailsDAOService.save(outOfScopeDetails)
        return saved
    }

    def updateOutOfScopeDetails(ValidatedParameterMap validatedBody, long outOfScopeDetailsId, long matterId) {
        if (!matterAuthorisationService.hasCostsAndUpdateAccess(matterId)) {
            throw new Exception()
        }
        OutOfScopeDetails toUpdate = getOutOfScopeDetails(outOfScopeDetailsId)
        if (!toUpdate) {
            throw new Exception('Out-of-scope details not found')
        }
        if (toUpdate.projectionPeriod?.matter?.id != matterId) {
            throw new Exception('Out-of-scope details do not belong to this matter')
        }
        if (validatedBody.writtenApprovalNeeded != null) {
            toUpdate.writtenApprovalNeeded = validatedBody.writtenApprovalNeeded as Boolean
        }
        if (validatedBody.containsKey('reason')) {
            toUpdate.reason = validatedBody.reason
        }
        if (validatedBody.projectionPeriodId != null) {
            ProjectionPeriod projectionPeriod = projectionPeriodDAOService
                .getProjectionPeriod(validatedBody.projectionPeriodId as long)
            if (!projectionPeriod || projectionPeriod.matter?.id != matterId) {
                throw new Exception('Projection period does not belong to this matter')
            }
            toUpdate.projectionPeriod = projectionPeriod
        }
        return outOfScopeDetailsDAOService.save(toUpdate)
    }

    def deleteOutOfScopeDetails(long outOfScopeDetailsId, long matterId) {
        if (!matterAuthorisationService.hasCostsAndUpdateAccess(matterId)) {
            throw new Exception()
        }
        OutOfScopeDetails toDelete = getOutOfScopeDetails(outOfScopeDetailsId)
        if (!toDelete) {
            return
        }
        if (toDelete.projectionPeriod?.matter?.id != matterId) {
            throw new Exception('Out-of-scope details do not belong to this matter')
        }
        return outOfScopeDetailsDAOService.delete(toDelete)
    }
}
