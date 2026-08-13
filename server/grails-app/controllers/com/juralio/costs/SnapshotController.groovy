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
import com.juralio.auth.UserRoleService
import com.juralio.common.ParameterValidatorService
import com.juralio.common.ValidatedParameterMap
import com.juralio.matter.CostsAuthorisationService
import com.juralio.matter.Matter
import com.juralio.matter.MatterAuthorisationService
import com.juralio.matter.MatterService
import com.juralio.organisation.OrganisationAuthorisationService
import grails.plugin.springsecurity.SpringSecurityService
import grails.plugin.springsecurity.annotation.Secured
import org.springframework.http.HttpStatus

@Secured('IS_AUTHENTICATED_FULLY')
class SnapshotController {
    static allowedMethods = [show: "GET", index: "GET", update: "PATCH", save: "POST"]

    MatterAuthorisationService matterAuthorisationService
    CostsAuthorisationService costsAuthorisationService
    SpringSecurityService springSecurityService
    UserRoleService userRoleService
    OrganisationAuthorisationService organisationAuthorisationService
    CostSnapshotService costSnapshotService
    MatterService matterService

    @Secured(['IS_AUTHENTICATED_FULLY'])
    def index(long matter_id) {
        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
        boolean isSysadmin = userRoleService.hasSysadminRole(currentUser)
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(currentUser.organisation.id)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }
        if (costsAuthorisationService.orgCostsSetupForMatterPosition(currentUser, matterService.getMatterOnly(matter_id)) && matterAuthorisationService.hasCostsAccess(matter_id)) {
            CostSnapshot snapshot = costSnapshotService.getCostSnapshot(matter_id)
            if (snapshot) {
                CostSnapshotDTO snapshotDTO = new CostSnapshotDTO(snapshot: snapshot.snapshot, id: snapshot.id)
                respond snapshotDTO, [Status: HttpStatus.OK]
            } else {
                respond [:], status: HttpStatus.BAD_REQUEST
            }
        } else {
            respond [:], status: HttpStatus.FORBIDDEN
        }
    }

    @Secured(['IS_AUTHENTICATED_FULLY'])
    def save(long matter_id) {
        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
        boolean isSysadmin = userRoleService.hasSysadminRole(currentUser)
        if (!costsAuthorisationService.orgCostsSetupForMatterPosition(currentUser, matterService.getMatterOnly(matter_id))){
            respond [:], status: HttpStatus.FORBIDDEN
        }
        if(!matterAuthorisationService.hasCostsAndUpdateAccess(matter_id)){
            respond [:], status: HttpStatus.FORBIDDEN
        }
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(currentUser.organisation.id)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }
        if (costsAuthorisationService.orgCostsSetupForMatterPosition(currentUser, matterService.getMatterOnly(matter_id)) && matterAuthorisationService.hasCostsAccess(matter_id)) {
            ValidatedParameterMap validatedBody = ParameterValidatorService.validate(request.JSON, [], ['projectionPeriod', 'cteRevenueList', 'totalCost'])
            if(validatedBody.projectionPeriod == null){
                respond [:], status: HttpStatus.BAD_REQUEST
            }else if(validatedBody.cteRevenueList == null){
                respond [:], status: HttpStatus.BAD_REQUEST
            }else if(validatedBody.totalCost == null){
                respond [:], status: HttpStatus.BAD_REQUEST
            }else{
                costSnapshotService.saveSnapshot(matter_id,validatedBody)
            }
        } else {
            respond [:], status: HttpStatus.FORBIDDEN
        }
    }

    @Secured(['IS_AUTHENTICATED_FULLY'])
    def update(long matter_id,long snapshot_id) {
        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
        boolean isSysadmin = userRoleService.hasSysadminRole(currentUser)
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(currentUser.organisation.id)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }
        if (costsAuthorisationService.orgCostsSetupForMatterPosition(currentUser, matterService.getMatterOnly(matter_id)) && matterAuthorisationService.hasCostsAccess(matter_id)) {
            ValidatedParameterMap validatedBody = ParameterValidatorService.validate(request.JSON, [], ['is_retired','edit_mode'])
            costSnapshotService.updateSnapshot(matter_id,snapshot_id,validatedBody)
        } else {
            respond [:], status: HttpStatus.FORBIDDEN
        }
    }

}
