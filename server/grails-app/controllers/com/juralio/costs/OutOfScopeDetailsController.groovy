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
import com.juralio.matter.costs.OutOfScopeDetails
import com.juralio.organisation.OrganisationAuthorisationService
import grails.plugin.springsecurity.SpringSecurityService
import grails.plugin.springsecurity.annotation.Secured
import org.springframework.http.HttpStatus
import org.springframework.security.access.AccessDeniedException

@Secured(['IS_AUTHENTICATED_FULLY'])
class OutOfScopeDetailsController {
    static allowedMethods = [save: "POST", update: "PATCH", delete: 'DELETE']

    SpringSecurityService springSecurityService
    UserRoleService userRoleService
    OrganisationAuthorisationService organisationAuthorisationService
    MatterService matterService
    OutOfScopeDetailsService outOfScopeDetailsService
    MatterAuthorisationService matterAuthorisationService
    CostsAuthorisationService costsAuthorisationService

    @Secured(['IS_AUTHENTICATED_FULLY'])
    def save(long matterId) {
        AppUser currentUser = springSecurityService.getCurrentUser()
        Matter matter = matterService.getMatter(matterId)
        boolean isSysadmin = userRoleService.hasSysadminRole(currentUser)
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(currentUser.organisationId)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }
        if (matter.organisation.id != currentUser.organisation.id) {
            render status: HttpStatus.FORBIDDEN
            return
        }
        if (!costsAuthorisationService.orgCostsSetupForMatterPosition(currentUser, matter)) {
            render status: HttpStatus.FORBIDDEN
            return
        }
        if (!matterAuthorisationService.hasCostsAndUpdateAccess(matterId)) {
            render status: HttpStatus.FORBIDDEN
            return
        }
        try {
            ValidatedParameterMap validatedBody = ParameterValidatorService.validate(
                request.JSON, ['writtenApprovalNeeded', 'projectionPeriodId'], ['reason']
            )
            OutOfScopeDetails saved = outOfScopeDetailsService
                .createOutOfScopeDetails(validatedBody, matter, currentUser)
            respond saved, status: HttpStatus.OK
        }
        catch (AccessDeniedException exception) {
            render status: HttpStatus.FORBIDDEN
        }
        catch (Exception exception) {
            render status: HttpStatus.BAD_REQUEST
        }
    }

    @Secured(['IS_AUTHENTICATED_FULLY'])
    def update(long matterId, long id) {
        AppUser currentUser = springSecurityService.getCurrentUser()
        Matter matter = matterService.getMatter(matterId)
        boolean isSysadmin = userRoleService.hasSysadminRole(currentUser)
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(currentUser.organisationId)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }
        if (matter.organisation.id != currentUser.organisation.id) {
            throw new Exception('Forbidden from accessing this information')
        }
        if (!costsAuthorisationService.orgCostsSetupForMatterPosition(currentUser, matter)) {
            throw new Exception('Forbidden from accessing this information')
        }
        if (!matterAuthorisationService.hasCostsAndUpdateAccess(matterId)) {
            render status: HttpStatus.FORBIDDEN
            return
        }
        try {
            ValidatedParameterMap validatedBody = ParameterValidatorService.validate(
                request.JSON, [], ['writtenApprovalNeeded', 'reason', 'projectionPeriodId']
            )
            respond outOfScopeDetailsService.updateOutOfScopeDetails(validatedBody, id, matterId)
        }
        catch (AccessDeniedException exception) {
            render status: HttpStatus.FORBIDDEN
        }
        catch (Exception exception) {
            render status: HttpStatus.BAD_REQUEST
        }
    }

    @Secured(['IS_AUTHENTICATED_FULLY'])
    def delete(long matterId, long id) {
        AppUser currentUser = springSecurityService.getCurrentUser()
        Matter matter = matterService.getMatter(matterId)
        boolean isSysadmin = userRoleService.hasSysadminRole(currentUser)
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(currentUser.organisationId)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }
        if (matter.organisation.id != currentUser.organisation.id) {
            throw new Exception('Forbidden from accessing this information')
        }
        if (!costsAuthorisationService.orgCostsSetupForMatterPosition(currentUser, matter)) {
            throw new Exception('Forbidden from accessing this information')
        }
        if (!matterAuthorisationService.hasCostsAndUpdateAccess(matterId)) {
            render status: HttpStatus.FORBIDDEN
            return
        }
        try {
            outOfScopeDetailsService.deleteOutOfScopeDetails(id, matterId)
            respond([text: ''], status: HttpStatus.OK)
        }
        catch (AccessDeniedException exception) {
            render status: HttpStatus.FORBIDDEN
        }
        catch (Exception exception) {
            render status: HttpStatus.BAD_REQUEST
        }
    }
}
