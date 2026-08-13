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

package com.juralio.matter

import com.juralio.auth.AppUser
import com.juralio.auth.UserRoleService
import com.juralio.common.ParameterValidatorService
import com.juralio.common.ValidatedParameterMap
import com.juralio.cron.CronService
import com.juralio.organisation.OrganisationAuthorisationService
import com.juralio.organisationgroup.MatterGroupPositionService
import grails.plugin.springsecurity.SpringSecurityService
import grails.plugin.springsecurity.annotation.Secured
import org.springframework.http.HttpStatus
import org.springframework.scheduling.annotation.Scheduled

import java.nio.file.AccessDeniedException
import java.text.SimpleDateFormat

@Secured(['IS_AUTHENTICATED_FULLY'])
class MatterController {

    static lazyInit = false

    static allowedMethods = [index: "GET", show: "GET", save: "POST", patch: "PATCH"]
    SpringSecurityService springSecurityService
    MatterPartyMemberService matterPartyMemberService
    MatterPartyService matterPartyService
    MatterService matterService
    OrganisationAuthorisationService organisationAuthorisationService
    UserRoleService userRoleService
    MatterGroupPositionService matterGroupPositionService

    @Secured("!hasRole('ROLE_SYSADMIN')")
    def index() {
        int startIndex = params.startIndex != null ? params.startIndex as int : -1
        int endIndex = params.endIndex != null ? params.endIndex as int : -1
        if (params.excludeAdministrable) {
            respond matterService.getMattersForTeamMember()
        } else if (params.allMatters) {
            if (startIndex >= 0 && endIndex > startIndex) {
                List<String> statuses = params.list('status') ?: null
                Map result = matterService.getAllMattersForOrganisationPaged(
                        startIndex,
                        endIndex,
                        params.q ?: null,
                        statuses,
                        params.sortField ?: null,
                        params.sortOrder ?: null
                )
                render(
                        view: '/matter/_pagedMatters',
                        status: HttpStatus.OK,
                        model: [
                                matters   : result.matters,
                                totalCount: (result.totalCount as Long),
                        ]
                )
            } else {
                respond matterService.getAllMattersForOrganisation(false)
            }
        } else {
            List<Matter> matters = matterService.getMattersForUser(startIndex,endIndex)
            matters.each { matterGroupPositionService.populateMatterGroupPositions(it) }
            respond matters, [status: HttpStatus.OK, view: '/matter/_matterWithProjectsList']
        }
    }

    def show() {
        Matter matter = matterService.getMatter(params.id as long)
        if (matter && matter.matterStatus == MatterStatus.PENDING_DELETION.value()) {
            respond [:], status: HttpStatus.NOT_FOUND
            return
        }
        matterGroupPositionService.populateMatterGroupPositions(matter)
        respond matter, [status: HttpStatus.OK, view: '/matter/_matterWithProjects']
    }

    @Secured(['ROLE_MATTER_CREATOR'])
    def save() {
        AppUser currentUser = springSecurityService.getCurrentUser()
        boolean isSysadmin = userRoleService.hasSysadminRole(currentUser)
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(currentUser.organisationId)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }
        ValidatedParameterMap validatedBody = ParameterValidatorService.validate(request.JSON, [], ['isNeutralMatter', 'description', 'name', 'clientName', 'userDefinedReferenceNumber','position','department'])
        SimpleDateFormat sdf = new SimpleDateFormat('YYYY-MM-dd')
        String dateString = sdf.format(new Date())
        if (!validatedBody.name) {
            String firstName = currentUser.firstname
            if (firstName.endsWith('s')) {
                firstName = firstName + '\''
            } else {
                firstName = firstName + '\'s'
            }
            String matterName = firstName + ' ' + dateString + ' matter'
            List<Matter> matchingMatters = matterService.getMattersMatchingPattern(matterName)
            if (matchingMatters.size() > 0) {
                matterName = matterName + ' (' + matchingMatters.size() + ')'
            }
            validatedBody.setProperty('name', matterName)
        }
        if (!validatedBody.clientName) {
            validatedBody.setProperty('clientName', currentUser.organisation.name)
        }
//        if (!validatedBody.userDefinedReferenceNumber) {
//            validatedBody.setProperty('userDefinedReferenceNumber', dateString)
//        }
        Matter matter = new Matter(validatedBody)

        if (validatedBody.isNeutralMatter == true) {

            matter = matterService.save(matter,validatedBody)

            def matterParties = request.JSON.matterParties
            if (matterParties) {
                matterParties.each { party ->

                    matterPartyService.save(
                            matter.id as long,
                            party.value[0] as String,
                            party.value[1] as String)
                }
                MatterParty neutralParty = matterPartyService.getNeutralParty(matter.id)
                matterPartyMemberService.save(
                        matterService.getMatterOnly(matter.id),
                        neutralParty.id,
                        currentUser)
            }
            respond matter
        } else {
            respond matterService.save(matter,validatedBody)
        }
    }

    def patch() {
        AppUser currentUser = springSecurityService.getCurrentUser()
        boolean isSysadmin = userRoleService.hasSysadminRole(currentUser)
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(currentUser.organisationId)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }
        try {

            ValidatedParameterMap validatedBody = ParameterValidatorService.validate(request.JSON, [], ['name', 'clientName', 'department', 'matterStatus', 'userDefinedReferenceNumber', 'description'])
            Matter matter = matterService.getMatter(params.matter_id as long)

            boolean matterActivation = false
            if (request.JSON.matterStatus == MatterStatus.ACTIVE.value()) {
                matterActivation = true
            }

            if (request.JSON.matterStatus == MatterStatus.PENDING_DELETION.value() && !organisationAuthorisationService.isOrgAdminForOrg(currentUser, matter.organisationId)) {
                throw new AccessDeniedException()
            }

            // prevent matter pending deletion from being edited, unless it's to reactivate it
            if (matter.matterStatus == MatterStatus.PENDING_DELETION.value() && !matterActivation) {
                respond [:], status: HttpStatus.FORBIDDEN
                return
            }


            matter = matterService.updateMatter(matter, validatedBody, matterActivation,request.JSON.matterStatus == MatterStatus.PENDING_DELETION.value())

            if (matter == null) {
                response.setStatus(HttpStatus.FORBIDDEN.value())
                return
            }

            respond matter, [status: HttpStatus.OK, view: '/matter/_matterWithProjects']
        } catch (AccessDeniedException e) {
            respond [:], status: HttpStatus.FORBIDDEN
        } catch (Exception e) {
            respond [:], status: HttpStatus.FORBIDDEN
        }

    }
}
