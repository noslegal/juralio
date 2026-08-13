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
import com.juralio.common.ParameterValidatorService
import com.juralio.common.ValidatedParameterMap
import com.juralio.matter.CostsAuthorisationService
import com.juralio.matter.Matter
import com.juralio.matter.MatterAuthorisationService
import com.juralio.matter.MatterService
import grails.plugin.springsecurity.SpringSecurityService
import grails.plugin.springsecurity.annotation.Secured
import org.springframework.http.HttpStatus

@Secured('IS_AUTHENTICATED_FULLY')
class ProjectionPeriodController {
    static allowedMethods = [index: "GET", save: "POST",update:"PATCH"]


    SpringSecurityService springSecurityService
    MatterService matterService
    CostsAuthorisationService costsAuthorisationService
    MatterAuthorisationService matterAuthorisationService
    ProjectionPeriodService projectionPeriodService

//    @Secured(['IS_AUTHENTICATED_FULLY'])
//    def index(long matter_id) {
//        AppUser currentUser = springSecurityService.getCurrentUser()
//        Matter matter = matterService.getMatter(matter_id)
//        if (matter.organisation.id != currentUser.organisation.id) {
//            throw new Exception('Forbidden from accessing this information')
//        }
//        if (costsAuthorisationService.organisationCostsEnabled(currentUser.organisation) && matterAuthorisationService.hasCostsAccess(matter_id)) {
//            ProjectionPeriod projectionPeriod = projectionPeriodService.getProjectionPeriodsByMatter(matter_id)
//            respond projectionPeriod, [Status: HttpStatus.OK]
//        } else {
//            respond [:], status: HttpStatus.FORBIDDEN
//        }
//    }

    @Secured(['IS_AUTHENTICATED_FULLY'])
    def save(long matter_id) {
        AppUser currentUser = springSecurityService.getCurrentUser()
        Matter matter = matterService.getMatter(matter_id as long)
        if (matter.organisation.id != currentUser.organisation.id) {
            render status: HttpStatus.FORBIDDEN
            return
        }
        if (costsAuthorisationService.orgCostsSetupForMatterPosition(currentUser, matter) && matterAuthorisationService.hasCostsAccess(matter.id)) {
            ValidatedParameterMap validatedBody = ParameterValidatorService.validate(request.JSON, [], ['startDate', 'endDate', 'matterId'])
            if (!validatedBody.endDate) {
                respond [:], status: HttpStatus.BAD_REQUEST
            } else if (!validatedBody.startDate) {
                respond [:], status: HttpStatus.BAD_REQUEST
            }  else if (!validatedBody.matterId) {
                respond [:], status: HttpStatus.BAD_REQUEST
            }
             else {
                ProjectionPeriod projectionPeriod = projectionPeriodService.saveProjectionPeriod(validatedBody,validatedBody.matterId as long)
                respond projectionPeriod, Status: HttpStatus.OK
            }

        } else {
            respond [:], status: HttpStatus.FORBIDDEN
        }
    }

    @Secured(['IS_AUTHENTICATED_FULLY'])
    def update(long projectionPeriodId) {
        AppUser currentUser = springSecurityService.getCurrentUser()
        Matter matter = matterService.getMatter(request.JSON.matterId as long)
        if (matter.organisation.id != currentUser.organisation.id) {
            throw new Exception('Forbidden from accessing this information')
        }
        if (costsAuthorisationService.orgCostsSetupForMatterPosition(currentUser, matter) && matterAuthorisationService.hasCostsAccess(matter.id)) {
            ProjectionPeriod projectionPeriod = projectionPeriodService.getProjectionPeriod(projectionPeriodId)
            if(projectionPeriod.matterId!=request.JSON.matterId){
                respond [:], status: HttpStatus.BAD_REQUEST
            }
            ValidatedParameterMap validatedBody = ParameterValidatorService.validate(request.JSON, [], ['startDate', 'endDate', 'matterId'])
            if (!validatedBody.endDate) {
                respond [:], status: HttpStatus.BAD_REQUEST
            } else if (!validatedBody.startDate) {
                respond [:], status: HttpStatus.BAD_REQUEST
            }  else if (!validatedBody.matterId) {
                respond [:], status: HttpStatus.BAD_REQUEST
            }
            else {
                ProjectionPeriod updatedProjectionPeriod = projectionPeriodService.updateProjectionPeriod(validatedBody,validatedBody.matterId as long,projectionPeriod)
                respond updatedProjectionPeriod, Status: HttpStatus.OK
            }

        } else {
            respond [:], status: HttpStatus.FORBIDDEN
        }
    }
}
