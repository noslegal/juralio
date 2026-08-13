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
import com.juralio.organisation.Organisation
import com.juralio.organisation.OrganisationAuthorisationService
import com.juralio.organisation.dao.OrganisationDAOService
import grails.plugin.springsecurity.SpringSecurityService
import grails.plugin.springsecurity.annotation.Secured
import org.springframework.http.HttpStatus

@Secured('IS_AUTHENTICATED_FULLY')
class OtherCostController {
    static allowedMethods = [index: "GET", save: "POST", show: "POST", update: "PATCH", delete: "DELETE", generateDefaults: 'POST']

    SpringSecurityService springSecurityService
    UserRoleService userRoleService
    OtherCostService otherCostService
    OrganisationDAOService organisationDAOService
    OrganisationAuthorisationService organisationAuthorisationService

    @Secured("hasRole('ROLE_ORG_ADMIN')")
    def index(long id) {
        AppUser currentUser = springSecurityService.getCurrentUser()
        boolean isSysadmin = userRoleService.hasSysadminRole(currentUser)
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(currentUser.organisationId)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }else if(isSysadmin){
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }
        OtherCost cost = otherCostService.getCost(id)
        if (cost) {
            respond cost, [Status: HttpStatus.OK, view: '/otherCost/_otherCost']
        } else {
            respond [:], status: HttpStatus.BAD_REQUEST
        }
    }

    @Secured("hasRole('ROLE_ORG_ADMIN')")
    def show() {
        AppUser currentUser = springSecurityService.getCurrentUser()
        boolean isSysadmin = userRoleService.hasSysadminRole(currentUser)
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(currentUser.organisationId)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }else if(isSysadmin){
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }
        if (currentUser.organisation) {
            ValidatedParameterMap validatedBody = ParameterValidatorService.validate(request.JSON, [], ['position'])
            List<OtherCost> organisationOtherCosts = otherCostService.organisationPositionOtherCosts(currentUser.organisation, validatedBody.position)
            if (organisationOtherCosts) {
                respond organisationOtherCosts.sort(it->it.id), [Status: HttpStatus.OK, view: '/otherCost/_otherCostList']
            } else {
                respond [:], status: HttpStatus.BAD_REQUEST
            }
        }
    }

    @Secured("hasRole('ROLE_ORG_ADMIN') ")
    def save() {
        try {
            AppUser currentUser = springSecurityService.getCurrentUser()
            boolean isSysadmin = userRoleService.hasSysadminRole(currentUser)
            if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(currentUser.organisationId)) {
                respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
                return
            }else if(isSysadmin){
                throw new Exception('Forbidden from accessing this information')
            }
            if (userRoleService.hasOrgAdminRole(currentUser) || userRoleService.hasOrgOwnerRole(currentUser)) {
                ValidatedParameterMap validatedBody = ParameterValidatorService.validate(request.JSON, [], ['name', 'position'])
                if (!validatedBody.name) {
                    respond [:], status: HttpStatus.BAD_REQUEST
                } else {
                    if (currentUser.organisation) {
                        if (validatedBody.name && (validatedBody.name == '' || validatedBody.name.length() > 20)) {
                            respond [:], status: HttpStatus.BAD_REQUEST
                        }
                        respond otherCostService.createOtherCost(validatedBody, currentUser)
                    } else {
                        respond [:], status: HttpStatus.BAD_REQUEST
                    }
                }
            } else {
                respond [:], status: HttpStatus.FORBIDDEN
            }
        } catch (Exception e) {
            respond [:], status: HttpStatus.FORBIDDEN
        }


    }

    @Secured("hasRole('ROLE_ORG_ADMIN')")
    def update(long id) {
        try {
            OtherCost costToUpdate = otherCostService.getCost(id)
            AppUser currentUser = springSecurityService.getCurrentUser()
            boolean isSysadmin = userRoleService.hasSysadminRole(currentUser)
            if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(currentUser.organisationId)) {
                respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
                return
            }else if(isSysadmin){
                throw new Exception('Forbidden from accessing this information')
            }
            if (currentUser && currentUser.organisation.id != costToUpdate.organisation.id) {
                throw new Exception('Forbidden from accessing this information')
            }
            if (userRoleService.hasOrgAdminRole(currentUser)) {
                if (costToUpdate) {
                    ValidatedParameterMap validatedBody = ParameterValidatorService.validate(request.JSON, [], ['name'])
                    if (validatedBody.name == '' || validatedBody.name.length() > 20) {
                        respond [:], status: HttpStatus.BAD_REQUEST
                    } else {
                        respond otherCostService.updateOtherCost(validatedBody, costToUpdate)
                    }
                } else {
                    respond [:], status: HttpStatus.BAD_REQUEST
                }
            } else {
                respond [:], status: HttpStatus.FORBIDDEN
            }
        } catch (Exception e) {
            respond [:], status: HttpStatus.FORBIDDEN
        }

    }

    @Secured("hasRole('ROLE_ORG_ADMIN')")
    def generateDefaults(long orgId) {
        AppUser currentUser = springSecurityService.getCurrentUser()
        boolean isSysadmin = userRoleService.hasSysadminRole(currentUser)
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(currentUser.organisationId)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }else if(isSysadmin){
            throw new Exception('Forbidden from accessing this information')
        }
        if (userRoleService.hasOrgAdminRole(currentUser)) {
            Organisation organisation = organisationDAOService.getOrganisation(currentUser.organisationId)
            if (currentUser && currentUser.organisation.id != orgId) {
                throw new Exception('Forbidden from accessing this information')
            }
            if (organisation) {
                ValidatedParameterMap validatedBody = ParameterValidatorService.validate(request.JSON, [], ['position'])
                List<OtherCost> orgOtherCosts = otherCostService.organisationPositionOtherCosts(organisation,validatedBody.position)
                if (orgOtherCosts.size() == 0) {
                    respond otherCostService.generateDefaults(organisation,validatedBody)
                }

            } else {
                respond [:], status: HttpStatus.BAD_REQUEST
            }
        } else {
            respond [:], status: HttpStatus.FORBIDDEN
        }
    }

    @Secured("hasRole('ROLE_ORG_ADMIN')")
    def delete(long id) {
        try {
            OtherCost otherCostToDelete = otherCostService.getCost(id)
            AppUser currentUser = springSecurityService.getCurrentUser()
            boolean isSysadmin = userRoleService.hasSysadminRole(currentUser)
            if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(currentUser.organisationId)) {
                respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
                return
            }else if(isSysadmin){
                throw new Exception('Forbidden from accessing this information')
            }
            if (!otherCostToDelete) {
                throw new Exception()
            }
            if (currentUser && currentUser.organisation.id != otherCostToDelete.organisationId) {
                throw new Exception('Forbidden from accessing this information')
            }
            otherCostService.deleteOtherCost(otherCostToDelete)
            respond [:], status: HttpStatus.OK
        } catch (Exception e) {
            respond [:], status: HttpStatus.FORBIDDEN
        }

    }
}
