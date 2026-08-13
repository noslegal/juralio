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
import com.juralio.matter.Matter
import com.juralio.matter.MatterAuthorisationService
import com.juralio.matter.MatterService
import com.juralio.organisation.OrganisationAuthorisationService
import com.juralio.organisation.dao.OrganisationDAOService
import com.juralio.organisationgroup.GroupPosition
import grails.plugin.springsecurity.SpringSecurityService
import grails.plugin.springsecurity.annotation.Secured
import org.springframework.http.HttpStatus

@Secured(['IS_AUTHENTICATED_FULLY'])
class RateTableDetailsController {
    static allowedMethods = [index: "GET", save: "POST", show: "POST", update: "PATCH", delete: "DELETE", getMatterRTD: "GET", deleteMatterRTD: "DELETE", filteredOrgRateTableDetails: "POST"]

    SpringSecurityService springSecurityService
    UserRoleService userRoleService
    RateTableDetailsService rateTableDetailsService
    OrganisationDAOService organisationDAOService
    PeriodService periodService
    MatterService matterService
    OrganisationAuthorisationService organisationAuthorisationService
    MatterAuthorisationService matterAuthorisationService

    @Secured("hasRole('ROLE_ORG_ADMIN')")
    def index(long id) {
        AppUser currentUser = springSecurityService.getCurrentUser()
        boolean isSysadmin = userRoleService.hasSysadminRole(currentUser)
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(currentUser.organisationId)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }
        RateTableDetails rateTableDetails = rateTableDetailsService.getRateTableDetails(id)
        if (rateTableDetails) {
            respond rateTableDetails, [Status: HttpStatus.OK, view: '/rate/_rateTableDetails']
        } else {
            respond [:], status: HttpStatus.BAD_REQUEST
        }
    }

    def getMatterRTD(long matterId) {
        AppUser currentUser = springSecurityService.getCurrentUser()
        boolean isSysadmin = userRoleService.hasSysadminRole(currentUser)
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(currentUser.organisationId)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }
        Matter matter = matterService.getMatter(matterId as long)
        if (matter) {
            RateTableDetails rateTableDetails = rateTableDetailsService.getMatterRateTableDetails(matter)
            ArrayList<PeriodDTO> periodsForTable = new ArrayList<PeriodDTO>()
            if (rateTableDetails) {
                periodService.getPeriodsForTable(rateTableDetails).sort { it.id }.forEach { periodsForTable.add(new PeriodDTO(startDate: it.startDate, endDate: it.endDate, periodId: it.id)) }
                RTDDTO rtddto = new RTDDTO(is_retired: rateTableDetails.is_retired, id: rateTableDetails.id, work_type: rateTableDetails.work_type, location: rateTableDetails.location, currency: rateTableDetails.currency, initalPeriod: rateTableDetails.initalPeriod, draft: rateTableDetails.draft, client: rateTableDetails.client, client_name: rateTableDetails.client_name, templateLocation: rateTableDetails.templateLocation, templateWorkType: rateTableDetails.templateWorkType, matter: rateTableDetails.matter ? true : false, isBeingUsed: false)
                RateTableDetailsWithPeriod rtdWithPeriods = new RateTableDetailsWithPeriod(rateTableDetails: rtddto, periods: periodsForTable)
                respond rtdWithPeriods, [Status: HttpStatus.OK]
            } else {
                respond [:], status: HttpStatus.BAD_REQUEST
            }
        } else {
            respond [:], status: HttpStatus.BAD_REQUEST
        }

    }

    @Secured("hasRole('ROLE_ORG_ADMIN')")
    def show() {
        AppUser currentUser = springSecurityService.getCurrentUser()
        boolean isSysadmin = userRoleService.hasSysadminRole(currentUser)
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(currentUser.organisation.id)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        } else if (isSysadmin) {
            throw new Exception('Forbidden from accessing this information')
        }
        if (currentUser.organisation) {
            ValidatedParameterMap validatedBody = ParameterValidatorService.validate(request.JSON, [], ['position'])
            List<RateTableDetails> organisationRates = rateTableDetailsService.organisationPositionRateTableDetails(currentUser.organisation.id,validatedBody.position)
            if (organisationRates) {
                ArrayList<RateTableDetailsWithPeriod> rateTablewithPeriodList = new ArrayList<RateTableDetailsWithPeriod>()
                organisationRates.forEach {
                    ArrayList<PeriodDTO> periodsForTable = new ArrayList<PeriodDTO>()
                    periodService.getPeriodsForTable(it).sort { it.id }.forEach { periodsForTable.add(new PeriodDTO(startDate: it.startDate, endDate: it.endDate, periodId: it.id)) }
                    if (it.client && it.rateTableDetails) {
                        it.templateLocation = it.rateTableDetails.location
                        it.templateWorkType = it.rateTableDetails.work_type
                    }
                    RTDDTO rtddto = new RTDDTO(associated_id:it.rateTableDetails ?  it.rateTableDetails.id : null,id: it.id, work_type: it.work_type, location: it.location, currency: it.currency, initalPeriod: it.initalPeriod, draft: it.draft, client: it.client, client_name: it.client_name, templateLocation: it.templateLocation, templateWorkType: it.templateWorkType, matter: it.matter ? true : false, isBeingUsed: it.isBeingUsed, is_retired: it.is_retired,groupPosition:it.groupPosition)
                    rateTablewithPeriodList.add(new RateTableDetailsWithPeriod(rateTableDetails: rtddto, periods: periodsForTable))
                }
                respond rateTablewithPeriodList, [Status: HttpStatus.OK]
            } else {
                ArrayList<RateTableDetailsWithPeriod> emptyList = []
                respond emptyList, status: HttpStatus.OK
            }
        }
    }

    def filteredOrgRateTableDetails() {
        AppUser currentUser = springSecurityService.getCurrentUser()
        boolean isSysadmin = userRoleService.hasSysadminRole(currentUser)
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(currentUser.organisationId)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        } else if (isSysadmin) {
            throw new Exception('Forbidden from accessing this information')
        }
        if (currentUser.organisation) {
            ValidatedParameterMap validatedBody = ParameterValidatorService.validate(request.JSON, [], ['removeDraft', 'removeClient', 'removeOrg', 'position'])
            List<RateTableDetails> organisationRates = rateTableDetailsService.organisationPositionRateTableDetails(currentUser.organisationId, validatedBody.position)
            if (organisationRates) {
                ArrayList<RateTableDetailsWithPeriod> rateTablewithPeriodList = new ArrayList<RateTableDetailsWithPeriod>()
                organisationRates.forEach {
                    if(it.is_retired){return }
                    if (validatedBody.removeDraft && it.draft == true) {
                        //add more cases like this later e.g matter client org
                    } else {
                        ArrayList<PeriodDTO> periodsForTable = new ArrayList<PeriodDTO>()
                        periodService.getPeriodsForTable(it).sort { it.id }.forEach { periodsForTable.add(new PeriodDTO(startDate: it.startDate, endDate: it.endDate, periodId: it.id)) }
                        if (it.client && it.rateTableDetails) {
                            it.templateLocation = it.rateTableDetails.location
                            it.templateWorkType = it.rateTableDetails.work_type
                        }
                        RTDDTO rtddto = new RTDDTO(is_retired:it.is_retired, id: it.id, work_type: it.work_type, location: it.location, currency: it.currency, initalPeriod: it.initalPeriod, draft: it.draft, client: it.client, client_name: it.client_name, templateLocation: it.templateLocation, templateWorkType: it.templateWorkType, matter: it.matter ? true : false, isBeingUsed: it.isBeingUsed)
                        rateTablewithPeriodList.add(new RateTableDetailsWithPeriod(rateTableDetails: rtddto, periods: periodsForTable))
                    }

                }
                respond rateTablewithPeriodList, [Status: HttpStatus.OK]
            } else {
                respond [:], status: HttpStatus.BAD_REQUEST
            }
        }
    }

//@Secured("hasRole('ROLE_ORG_ADMIN') ")
    def save() {
        try {
            AppUser currentUser = springSecurityService.getCurrentUser()
            boolean isSysadmin = userRoleService.hasSysadminRole(currentUser)
            if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(currentUser.organisationId)) {
                respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
                return
            } else if (isSysadmin) {
                throw new Exception('Forbidden from accessing this information')
            }
            ValidatedParameterMap validatedBody = ParameterValidatorService.validate(request.JSON, [], ['location', 'currency', 'work_type', 'draft', 'client', 'rateTableDetails', 'client_name', 'matter','position'])
            if (validatedBody.matter) {
                if (!matterAuthorisationService.hasCostsAndUpdateAccess(validatedBody.matter as long)) {
                    throw new Exception('Forbidden from accessing this information')
                }
                GroupPosition position = GroupPosition.findById(validatedBody.position)
                if(position.name == 'Client') {
                    if(!validatedBody.currency){
                        respond [:], status: HttpStatus.BAD_REQUEST
                    }else{
                        if (currentUser.organisation) {
                            RateTableDetails savedRTD = rateTableDetailsService.createRateTableDetails(validatedBody, currentUser)
                            respond savedRTD, [Status: HttpStatus.OK, view: '/rate/_rateTableDetails']

                        } else {
                            respond [:], status: HttpStatus.BAD_REQUEST
                        }
                    }
                } else if (!validatedBody.location || !validatedBody.work_type || !validatedBody.currency || validatedBody.draft == null || validatedBody.client == null) {
                    respond [:], status: HttpStatus.BAD_REQUEST
                } else {
                    if (currentUser.organisation) {
                        RateTableDetails savedRTD = rateTableDetailsService.createRateTableDetails(validatedBody, currentUser)
                        respond savedRTD, [Status: HttpStatus.OK, view: '/rate/_rateTableDetails']

                    } else {
                        respond [:], status: HttpStatus.BAD_REQUEST
                    }
                }
            } else if (userRoleService.hasOrgAdminRole(currentUser)) {
                if (!validatedBody.location || !validatedBody.work_type || !validatedBody.currency || validatedBody.draft == null || validatedBody.client == null) {
                    respond [:], status: HttpStatus.BAD_REQUEST
                } else {
                    if (currentUser.organisation) {
                        RateTableDetails savedRTD = rateTableDetailsService.createRateTableDetails(validatedBody, currentUser)
                        respond savedRTD, [Status: HttpStatus.OK, view: '/rate/_rateTableDetails']

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
            RateTableDetails rateToUpdate = rateTableDetailsService.getRateTableDetails(id)
            AppUser currentUser = springSecurityService.getCurrentUser()
            boolean isSysadmin = userRoleService.hasSysadminRole(currentUser)
            if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(currentUser.organisationId)) {
                respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
                return
            } else if (isSysadmin) {
                throw new Exception('Forbidden from accessing this information')
            }
            if (currentUser && currentUser.organisation.id != rateToUpdate.organisation.id) {
                throw new Exception('Forbidden from accessing this information')
            }
            if (userRoleService.hasOrgAdminRole(currentUser) || userRoleService.hasOrgOwnerRole(currentUser)) {
                if (rateToUpdate) {
                    ValidatedParameterMap validatedBody = ParameterValidatorService.validate(request.JSON, [], ['location', 'work_type', 'currency', 'draft', 'client', 'client_name', 'is_retired','rateTableDetails'])
                    if ((validatedBody.location == '' || validatedBody.work_type == '' || validatedBody.currency == '') || validatedBody.is_retired == '') {
                        respond [:], status: HttpStatus.BAD_REQUEST
                    } else {
                        respond rateTableDetailsService.updateRateTableDetails(validatedBody, rateToUpdate)
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
    def delete(long id) {
        try {
            RateTableDetails rateToDelete = rateTableDetailsService.getRateTableDetails(id)
            AppUser currentUser = springSecurityService.getCurrentUser()
            boolean isSysadmin = userRoleService.hasSysadminRole(currentUser)
            if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(currentUser.organisationId)) {
                respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
                return
            } else if (isSysadmin) {
                throw new Exception('Forbidden from accessing this information')
            }
            if (currentUser && currentUser.organisation.id != rateToDelete.organisation.id) {
                throw new Exception('Forbidden from accessing this information')
            }
            if (userRoleService.hasOrgAdminRole(currentUser)) {
                if (rateToDelete) {
                    rateTableDetailsService.deleteRTD(rateToDelete)
                    respond [:], status: HttpStatus.OK
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

    def deleteMatterRTD(long matterId) {
        try {
            Matter matter = matterService.getMatter(matterId as long)
            AppUser currentUser = springSecurityService.getCurrentUser()
            boolean isSysadmin = userRoleService.hasSysadminRole(currentUser)
            if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(currentUser.organisationId)) {
                respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
                return
            } else if (isSysadmin) {
                throw new Exception('Forbidden from accessing this information')
            }
            if (matter) {
                if (!matterAuthorisationService.hasCostsAndUpdateAccess(matter.id)) {
                    throw new Exception('Forbidden from accessing this information')
                }
                RateTableDetails rtdToDelete = rateTableDetailsService.getMatterRateTableDetails(matter)
                if (!rtdToDelete) {
                    throw new Exception()
                }
                if (currentUser && currentUser.organisation.id != rtdToDelete.organisationId) {
                    throw new Exception('Forbidden from accessing this information')
                }
                rateTableDetailsService.deleteRTD(rtdToDelete)
                respond [:], status: HttpStatus.OK
            } else {
                throw new Exception('Matter does not exist')
            }
        } catch (Exception e) {
            respond [:], status: HttpStatus.FORBIDDEN
        }
    }

}
