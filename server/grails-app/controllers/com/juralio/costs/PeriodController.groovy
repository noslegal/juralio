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
import grails.plugin.springsecurity.SpringSecurityService
import grails.plugin.springsecurity.annotation.Secured
import org.springframework.http.HttpStatus

@Secured(['IS_AUTHENTICATED_FULLY'])
class PeriodController {
    static allowedMethods = [index: "GET", save: "POST", show: "GET", update: "PATCH", delete: "POST"]

    SpringSecurityService springSecurityService
    UserRoleService userRoleService
    PeriodService periodService
    RateTableDetailsService rateTableDetailsService
    MatterAuthorisationService matterAuthorisationService

    @Secured("hasRole('ROLE_ORG_ADMIN')")
    def index(long id) {
        Period period = periodService.getPeriod(id)
        if (period) {
            respond period, [Status: HttpStatus.OK, view: '/period/_period']
        } else {
            respond [:], status: HttpStatus.BAD_REQUEST
        }
    }

    @Secured("hasRole('ROLE_ORG_ADMIN')")
    def show(long org_id) {
        List<Period> periodList = periodService.getPeriodsForOrgs(org_id)
        if (periodList) {
            respond periodList, [Status: HttpStatus.OK, view: '/period/_periodList']
        } else {
            respond [:], status: HttpStatus.BAD_REQUEST
        }
    }

    def save() {
        AppUser currentUser = springSecurityService.getCurrentUser()
        ValidatedParameterMap validatedBody = ParameterValidatorService.validate(request.JSON, [], ['name', 'startDate', 'endDate', 'rateTableDetailId'])
        if (!validatedBody.name ||!validatedBody.rateTableDetailId) {
            respond [:], status: HttpStatus.BAD_REQUEST
        } else {
            if (currentUser.organisation) {
                RateTableDetails rtd = rateTableDetailsService.getRateTableDetails(validatedBody.rateTableDetailId)
                if (rtd.matterId != null && !matterAuthorisationService.hasCostsAndUpdateAccess(rtd.matterId)) {
                    respond [:], status: HttpStatus.FORBIDDEN
                } else if (rtd.matterId == null && !userRoleService.hasOrgAdminRole(currentUser)) {
                    respond [:], status: HttpStatus.FORBIDDEN
                }
                List<Period> periodsInTable = periodService.getPeriodsForTable(rtd)
                def responseObj = periodService.createPeriod(validatedBody, currentUser.organisation, rtd, periodsInTable)
                if (periodsInTable.size() > 0) {
                    respond responseObj, [Status: HttpStatus.OK, view: '/period/_periodList']
                } else {
                    respond responseObj, [Status: HttpStatus.OK, view: '/period/_period']
                }

            } else {
                respond [:], status: HttpStatus.BAD_REQUEST
            }
        }
    }

    def update(long id) {
        try {
            Period periodToUpdate = periodService.getPeriod(id)
            AppUser currentUser = springSecurityService.getCurrentUser()
            RateTableDetails rtd = rateTableDetailsService.getRateTableDetails(periodToUpdate.rateTableDetailsId)
            if ((userRoleService.hasOrgAdminRole(currentUser) && rtd.matterId == null) || (rtd.matterId != null && matterAuthorisationService.hasCostsAndUpdateAccess(rtd.matterId))) {
                if (periodToUpdate) {
                    if (periodToUpdate.organisationId != currentUser.organisationId) {
                        respond [:], status: HttpStatus.FORBIDDEN
                        return
                    }
                    List<Period> periodsInTable = periodService.getPeriodsForTable(rtd)
                    ValidatedParameterMap validatedBody = ParameterValidatorService.validate(request.JSON, [], ['startDate', 'endDate'])
                    periodsInTable.remove(periodToUpdate)
                    if (validatedBody.startDate && validatedBody.startDate == '') {
                        respond [:], status: HttpStatus.BAD_REQUEST
                    } else {
                        def responseObj = periodService.updatePeriod(validatedBody, periodToUpdate, periodsInTable)
                        if (periodsInTable.size() > 0) {
                            ArrayList<PeriodDTO> periodDTOList = new ArrayList<PeriodDTO>()
                            responseObj.forEach { periodDTOList.add(new PeriodDTO(startDate: it.startDate, endDate: it.endDate, periodId: it.id)) }
                            respond periodDTOList, [Status: HttpStatus.OK]
                        } else {
                            respond responseObj, [Status: HttpStatus.OK, view: '/period/_period']
                        }

                    }
                } else {
                    respond [:], status: HttpStatus.BAD_REQUEST
                }
            } else {
                respond [:], status: HttpStatus.FORBIDDEN
            }
        } catch (Exception e) {
            respond e, status: HttpStatus.BAD_REQUEST
        }
    }

    def delete(long id) {
        try {
            Period periodToDelete = periodService.getPeriod(id)
            AppUser currentUser = springSecurityService.getCurrentUser()
            RateTableDetails rtd = rateTableDetailsService.getRateTableDetails(periodToDelete.rateTableDetailsId)

            if ((userRoleService.hasOrgAdminRole(currentUser) && rtd.matterId == null) || (rtd.matterId != null && matterAuthorisationService.hasCostsAndUpdateAccess(rtd.matterId))) {
                if (periodToDelete) {
                    if (periodToDelete.organisationId != currentUser.organisationId) {
                        respond [:], status: HttpStatus.FORBIDDEN
                        return
                    }
                    periodService.deletePeriod(periodToDelete)
                    List<Period> periodsInTable = periodService.getPeriodsForTable(rtd)
                    if (periodsInTable.size() > 0) {
                        ArrayList<PeriodDTO> periodDTOList = new ArrayList<PeriodDTO>()
                        periodsInTable.forEach { periodDTOList.add(new PeriodDTO(startDate: it.startDate, endDate: it.endDate, periodId: it.id)) }
                        respond periodDTOList, [Status: HttpStatus.OK]
                    } else {
                        respond periodsInTable, [Status: HttpStatus.OK, view: '/period/_period']
                    }
                } else {
                    respond [:], status: HttpStatus.BAD_REQUEST
                }
            } else {
                respond [:], status: HttpStatus.FORBIDDEN
            }
        } catch (Exception e) {
            respond e, status: HttpStatus.BAD_REQUEST
        }
    }
}
