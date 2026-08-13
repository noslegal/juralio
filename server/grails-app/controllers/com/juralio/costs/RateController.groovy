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
import com.juralio.matter.MatterAuthorisationService
import com.juralio.matter.MatterService
import com.juralio.organisation.Organisation
import com.juralio.organisation.OrganisationAuthorisationService
import com.juralio.organisationgroup.dao.MatterGroupPositionDAOService
import com.juralio.organisation.dao.OrganisationDAOService
import grails.plugin.springsecurity.SpringSecurityService
import grails.plugin.springsecurity.annotation.Secured
import org.springframework.http.HttpStatus

@Secured('IS_AUTHENTICATED_FULLY')
class RateController {
    static allowedMethods = [index: "GET", save: "POST", bulkSave: "POST", show: "GET", update: "PATCH", getTable: "GET", getMatterTable: "GET",bulkUpdate: "PATCH"]

    SpringSecurityService springSecurityService
    UserRoleService userRoleService
    RateService rateService
    OrganisationDAOService organisationDAOService
    RateTableDetailsService rateTableDetailsService
    RateTypeService rateTypeService
    PeriodService periodService
    OrganisationAuthorisationService organisationAuthorisationService
    MatterAuthorisationService matterAuthorisationService
    MatterService matterService
    MatterGroupPositionDAOService matterGroupPositionDAOService

    @Secured("hasRole('ROLE_ORG_ADMIN')")
    def index(long id) {
        AppUser currentUser = springSecurityService.getCurrentUser()
        boolean isSysadmin = userRoleService.hasSysadminRole(currentUser)
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(currentUser.organisationId)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }
        Rate rate = rateService.getRate(id)
        if (rate) {
            respond rate, [Status: HttpStatus.OK, view: '/rate/_rate']
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
        }

        if (currentUser.organisation) {
            List<Rate> organisationRates = rateService.organisationRates(currentUser.organisation.id)
            if (organisationRates) {
                respond organisationRates, [Status: HttpStatus.OK, view: '/rate/_rateList']
            } else {
                respond [:], status: HttpStatus.BAD_REQUEST
            }
        }
    }

    @Secured("hasRole('ROLE_ORG_ADMIN') ")
    def save() {
        AppUser currentUser = springSecurityService.getCurrentUser()
        boolean isSysadmin = userRoleService.hasSysadminRole(currentUser)
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(currentUser.organisationId)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }
        if (userRoleService.hasOrgAdminRole(currentUser)) {
            ValidatedParameterMap validatedBody = ParameterValidatorService.validate(request.JSON, [], ['rate', 'gradeId', 'periodId', 'rateTypeId', 'rate_table_detailsId'])
            if (validatedBody.rate == null) {
                respond [:], status: HttpStatus.BAD_REQUEST
            } else if (!validatedBody.gradeId) {
                respond [:], status: HttpStatus.BAD_REQUEST
            } else if (!validatedBody.periodId) {
                respond [:], status: HttpStatus.BAD_REQUEST
            } else if (!validatedBody.rateTypeId) {
                respond [:], status: HttpStatus.BAD_REQUEST
            } else if (!validatedBody.rate_table_detailsId) {
                respond [:], status: HttpStatus.BAD_REQUEST
            } else {
                Organisation organisation = organisationDAOService.getOrganisation(currentUser.organisationId)
                if (rateTableDetailsService.getRateTableDetails(validatedBody.rate_table_detailsId).matterId) {
                    if (!matterAuthorisationService.hasCostsAndUpdateAccess(validatedBody.matter)) {
                        respond [:], status: HttpStatus.FORBIDDEN
                        return
                    }
                }
                if (organisation) {
                    respond rateService.createRate(validatedBody, currentUser)
                } else {
                    respond [:], status: HttpStatus.BAD_REQUEST
                }
            }
        } else {
            respond [:], status: HttpStatus.FORBIDDEN
        }
    }

    // @Secured("hasRole('ROLE_ORG_ADMIN') ")
    def bulkSave() {
        AppUser currentUser = springSecurityService.getCurrentUser()
        if (!organisationAuthorisationService.organisationIsNotFrozen(currentUser.organisationId)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }
        if (!currentUser.organisation) {
            respond [:], status: HttpStatus.BAD_REQUEST
            return
        }

        List<ValidatedParameterMap> items = request.JSON.collect {
            ParameterValidatorService.validate(it, [], ['rate', 'rate_table_detailsId', 'gradeId', 'periodId', 'rateTypeId', 'isAddGrade', 'matterId'])
        }

        // Validate the whole batch up front and bail before persisting anything if any item is
        // malformed or the caller lacks access for it. This runs in a method-level loop so the
        // early returns actually abort the request - inside the previous forEach closure a return
        // only skipped one iteration, so an unauthorised item still fell through to createRate.
        for (ValidatedParameterMap validatedBody : items) {
            if ((validatedBody.rate != null && Double.isNaN(validatedBody.rate)) || !validatedBody.gradeId || !validatedBody.periodId || !validatedBody.rateTypeId) {
                respond [:], status: HttpStatus.BAD_REQUEST
                return
            }
            boolean authorised = validatedBody.matterId ?
                    matterAuthorisationService.hasCostsAndUpdateAccess(validatedBody.matterId as long) :
                    userRoleService.hasOrgAdminRole(currentUser)
            if (!authorised) {
                respond [:], status: HttpStatus.FORBIDDEN
                return
            }
        }

        List<Rate> newRates = []
        items.each { ValidatedParameterMap validatedBody ->
            Rate newRate = rateService.createRate(validatedBody, currentUser)
            newRates.add(newRate)
            if (validatedBody.isAddGrade && rateTypeService.getStandardRateType(currentUser.organisation, newRate.rateTableDetails.groupPosition).id == validatedBody.rateTypeId) {
                rateService.addRateFromTemplate(newRate, validatedBody.rate_table_detailsId)
            }
        }

        if (newRates.size() > 0) {
            rateTableDetailsService.publishRateTable(newRates[0].rateTableDetails)
            respond newRates
        } else {
            respond [:], status: HttpStatus.BAD_REQUEST
        }
    }

    // @Secured("hasRole('ROLE_ORG_ADMIN')")
    def update(long id) {
        try {

            AppUser currentUser = springSecurityService.getCurrentUser()
            boolean isSysadmin = userRoleService.hasSysadminRole(currentUser)
            if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(currentUser.organisationId)) {
                respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
                return
            }
            Rate rateToUpdate = rateService.getRate(id)
            ValidatedParameterMap validatedBody = ParameterValidatorService.validate(request.JSON, [], ['rate', 'matterId'])
            if (validatedBody.matterId && matterAuthorisationService.hasCostsAndUpdateAccess(validatedBody.matterId as long)) {
                if (rateToUpdate) {
                    if (validatedBody.rate != null) {
                        if (Double.isNaN(validatedBody.rate)) {
                            respond [:], status: HttpStatus.BAD_REQUEST
                        } else {
                            respond rateService.updateRate(validatedBody, rateToUpdate)
                        }
                    } else {
                        respond rateService.updateRate(validatedBody, rateToUpdate)
                    }
                } else {
                    respond [:], status: HttpStatus.BAD_REQUEST
                }
            } else {
                if (userRoleService.hasOrgAdminRole(currentUser)) {
                    if (rateToUpdate) {
                        if (rateToUpdate.organisationId != currentUser.organisationId) {
                            respond [:], status: HttpStatus.FORBIDDEN
                            return
                        }
                        if (validatedBody.rate != null) {
                            if (Double.isNaN(validatedBody.rate)) {
                                respond [:], status: HttpStatus.BAD_REQUEST
                            } else {
                                respond rateService.updateRate(validatedBody, rateToUpdate)
                            }
                        } else {
                            respond rateService.updateRate(validatedBody, rateToUpdate)
                        }
                    } else {
                        respond [:], status: HttpStatus.BAD_REQUEST
                    }
                } else {
                    respond [:], status: HttpStatus.FORBIDDEN
                }
            }

        } catch (Exception e) {
            respond [:], status: HttpStatus.BAD_REQUEST
        }

    }

    @Secured("hasRole('ROLE_ORG_ADMIN') ")
    def bulkUpdate(){
        AppUser currentUser = springSecurityService.getCurrentUser()
        boolean isSysadmin = userRoleService.hasSysadminRole(currentUser)
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(currentUser.organisationId)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }
        if (userRoleService.hasOrgAdminRole(currentUser)) {
            Organisation organisation = organisationDAOService.getOrganisation(currentUser.organisationId)
            if (organisation) {
                def request = request.JSON
                request.forEach { def it ->
                    ValidatedParameterMap validatedBody = ParameterValidatorService.validate(it, [], ['id', 'rate'])
                    if (validatedBody.id) {
                        Rate rateToUpdate = rateService.getRate(validatedBody.id)
                        if (rateToUpdate) {
                            if (validatedBody.rate != null) {
                                if (Double.isNaN(new Double(validatedBody.rate))) {
                                    respond [:], status: HttpStatus.BAD_REQUEST
                                } else {
                                    respond rateService.updateRate(validatedBody, rateToUpdate)
                                }
                            } else {
                                respond rateService.updateRate(validatedBody, rateToUpdate)
                            }
                        } else {
                            respond [:], status: HttpStatus.BAD_REQUEST
                        }
                    } else {
                        respond [:], status: HttpStatus.BAD_REQUEST
                    }
                }
            }
        }
    }

    @Secured("hasRole('ROLE_ORG_ADMIN')")
    def getTable(long table_details_id) {
        try {
            AppUser currentUser = springSecurityService.getCurrentUser()
            boolean isSysadmin = userRoleService.hasSysadminRole(currentUser)
            if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(currentUser.organisationId)) {
                throw new Exception('Forbidden from accessing this information')
            }
            RateTableDetails rtd = rateTableDetailsService.getRateTableDetails(table_details_id)
            List<Rate> rateList = rateService.getTableRates(table_details_id)
            List<Rate> templateRateList
            Period latestPeriod
            if (rtd.matterId) {
                if (!matterAuthorisationService.hasCostsAndUpdateAccess(rtd.matterId)) {
                    respond [:], status: HttpStatus.FORBIDDEN
                }
            }

            if (rtd.client && rtd.rateTableDetails) {
                latestPeriod = periodService.getLatestPeriod(rtd.rateTableDetails)
                templateRateList = rateService.getStandardTableRatesForCurrentPeriod(rtd.rateTableDetails, latestPeriod)
                if (rateList.size() == 0) {
                    ArrayList<RateTableDTO> templateRateTableDTOArrayList = new ArrayList<RateTableDTO>()
                    templateRateList.forEach { templateRateTableDTOArrayList.add(new RateTableDTO(gradeName: it.grade.name, rate: it.rate, rateTypeName: it.rateType.name, categoryName: it.grade.gradeCategory.name, rateId: it.id, periodId: it.period.id, rateTypeId: it.rateType.id, gradeId: it.grade.id, templatePeriod: latestPeriod.startDate, colour_idx: it.grade.gradeCategory.colour_idx, rateTypeSysname: it.rateType.getSysName())) }
                    respond templateRateTableDTOArrayList, status: HttpStatus.OK
                    return
                }
            }
            ArrayList<RateTableDTO> rateTableDTOArrayList = new ArrayList<RateTableDTO>()
            rateList.forEach {
                def tempRate = templateRateList.find(r -> r.grade == it.grade)
                rateTableDTOArrayList.add(new RateTableDTO(gradeName: it.grade.name, rate: it.rate, rateTypeName: it.rateType.name, categoryName: it.grade.gradeCategory.name, rateId: it.id, periodId: it.period.id, rateTypeId: it.rateType.id, gradeId: it.grade.id, standardRate: rtd.client && rtd.rateTableDetails  && tempRate ? tempRate.rate : null, templatePeriod: rtd.client && rtd.rateTableDetails  ? latestPeriod.startDate : null, colour_idx: it.grade.gradeCategory.colour_idx, rateTypeSysname: it.rateType.getSysName()))
            }
            respond rateTableDTOArrayList.sort(it -> it.gradeId).sort(it -> it.periodId), status: HttpStatus.OK
        } catch (Exception e) {
            respond [:], status: HttpStatus.FORBIDDEN
        }

    }

    def getMatterTable(long table_details_id, long matter_id, boolean setup) {
        try {
            AppUser currentUser = springSecurityService.getCurrentUser()
            boolean isSysadmin = userRoleService.hasSysadminRole(currentUser)
            if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(currentUser.organisationId)) {
                respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
                return
            }
            if (!matterAuthorisationService.hasCostsAndReadAccess(matter_id)) {
                throw new Exception('Forbidden from accessing this information')
            }
            def matterGroupPosition = matterGroupPositionDAOService.getMatterGroupPosition(matterService.getMatter(matter_id), currentUser.organisationGroup)
            boolean isExternalClient = !currentUser.organisationGroup?.isInternal && matterGroupPosition?.groupPosition?.name == 'Client'
            RateTableDetails rtd = rateTableDetailsService.getRateTableDetails(table_details_id)
            List<Rate> templateRateList
            Period latestPeriod

            if (!rtd || (!setup && !rtd.rateTableDetails)) {
                respond new ArrayList<RateTableDTO>(), status: HttpStatus.OK
                return
            }

            if (setup) {
                latestPeriod = periodService.getLatestPeriod(rtd)
                templateRateList = rateService.getStandardTableRatesForCurrentPeriod(rtd, latestPeriod)
                ArrayList<RateTableDTO> templateRateTableDTOArrayList = new ArrayList<RateTableDTO>()
                templateRateList.forEach { templateRateTableDTOArrayList.add(new RateTableDTO(gradeName: it.grade.name, rate: it.rate, rateTypeName: it.rateType.name, categoryName: it.grade.gradeCategory.name, rateId: it.id, periodId: it.period.id, rateTypeId: it.rateType.id, gradeId: it.grade.id, templatePeriod: latestPeriod.startDate, colour_idx: it.grade.gradeCategory.colour_idx, rateTypeSysname: it.rateType.getSysName())) }
                respond templateRateTableDTOArrayList, status: HttpStatus.OK
            } else {
                latestPeriod = periodService.getLatestPeriod(rtd.rateTableDetails)
                templateRateList = rateService.getStandardTableRatesForCurrentPeriod(rtd.rateTableDetails, latestPeriod)
                List<Rate> breakEvenRates = rateService.getBreakEvenTableRatesForCurrentPeriod(rtd.rateTableDetails, latestPeriod)
                List<Rate> rateList = rateService.getTableRates(table_details_id)
                ArrayList<RateTableDTO> rateTableDTOArrayList = new ArrayList<RateTableDTO>()
                rateList.forEach {
                    def tempRate = templateRateList.find(r -> r.grade == it.grade)
                    rateTableDTOArrayList.add(new RateTableDTO(gradeName: it.grade.name, rate: it.rate, rateTypeName: it.rateType.name, categoryName: it.grade.gradeCategory.name, rateId: it.id, periodId: it.period.id, rateTypeId: it.rateType.id, gradeId: it.grade.id, standardRate: isExternalClient ? null : tempRate.rate, breakEvenRates: isExternalClient ? null : rateService.getBreakEvenRatesForMatterRatePeriod(it, breakEvenRates), templatePeriod: rtd.client ? latestPeriod.startDate : null, colour_idx: it.grade.gradeCategory.colour_idx, rateTypeSysname: it.rateType.getSysName()))
                }
                respond rateTableDTOArrayList.sort(it -> it.gradeId), status: HttpStatus.OK
            }
        } catch (Exception e) {
            respond [:], status: HttpStatus.FORBIDDEN
        }

    }


}
