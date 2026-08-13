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

package com.juralio.organisation

import com.juralio.auth.AppUser
import com.juralio.auth.Roles
import com.juralio.auth.UserStatusEvent
import com.juralio.auth.UserStatusEventType
import com.juralio.auth.userstatus.UserStatusEventService
import com.juralio.instance.InstanceSettings
import com.juralio.instance.InstanceSettingsService
import com.juralio.organisation.dao.OrganisationDAOService
import grails.gorm.transactions.Transactional
import server.MonthlyUsersReportSummary

@Transactional
class OrganisationService {

    OrganisationDAOService organisationDAOService
    InstanceSettingsService instanceSettingsService
    OrganisationUserConfirmationSummaryService organisationUserConfirmationSummaryService
    UserStatusEventService userStatusEventService
    OrganisationAuthorisationService organisationAuthorisationService

    Organisation update(long id, def validatedParameters) {
        if (!organisationAuthorisationService.hasUpdateAccess(id,validatedParameters)) {
            throw new Exception()
        }
        Organisation organisation = organisationDAOService.getOrganisation(id)
        organisation.properties = validatedParameters
        return organisationDAOService.save(organisation)
    }

    def disableSSOForAllOrganisations() {
        if (!organisationAuthorisationService.hasSysAdminAccess()) {
            throw new Exception()
        }
        InstanceSettings instanceSettings = instanceSettingsService.getInstanceSettings()
        organisationDAOService.list().each {
            if(it.microsoftSsoEnabled && !instanceSettings.microsoftSsoEnabled){
                it.setMicrosoftSsoEnabled(false)
            }
            if(it.oktaSsoEnabled && !instanceSettings.oktaSsoEnabled){
                it.setOktaSsoEnabled(false)
            }
            if(it.samlSsoEnabled && !instanceSettings.samlSsoEnabled){
                it.setSamlSsoEnabled(false)
            }
            if(it.googleSsoEnabled && !instanceSettings.googleSsoEnabled){
                it.setGoogleSsoEnabled(false)
            }

            it.save()
        }
    }

    Long getCurrentSeatCount(Organisation organisation, boolean usePreviousMonth = false){
        Calendar calendar = Calendar.getInstance()
        Calendar now = Calendar.getInstance()
        Date dateNow = now.getTime()
        Date startDate = organisationUserConfirmationSummaryService.getDateAtStartOfMonth(now.get(Calendar.MONTH), now.get(Calendar.YEAR))

        calendar.setTime(startDate)
        if(usePreviousMonth){
            calendar.add(Calendar.MONTH, -2)
        }else{
            calendar.add(Calendar.MONTH, -1)
        }
        Date previousSummaryDate = calendar.getTime()
        MonthlyUsersReportSummary monthlyUsersReportSummary = organisationUserConfirmationSummaryService.getSummaryReportByOrganisationAndDate(organisation.id, previousSummaryDate)
        Long summarySeats = monthlyUsersReportSummary && monthlyUsersReportSummary.seats ? monthlyUsersReportSummary.seats : 0
        Long summaryConfirmedActiveUsers = monthlyUsersReportSummary && monthlyUsersReportSummary.confirmedActiveUsers ? monthlyUsersReportSummary.confirmedActiveUsers : 0

        Long seatCount = summarySeats
        Long emptySeats = summarySeats - summaryConfirmedActiveUsers
        List<UserStatusEvent> allEvents = userStatusEventService.getEventsForUserReport(startDate, dateNow).findAll { it.user.organisationId == organisation.id }
        List<UserStatusEvent> eventsThisMonth = allEvents.findAll { it.eventType == UserStatusEventType.CONFIRMED.value() || it.eventType == UserStatusEventType.DEACTIVATION.value() || it.eventType == UserStatusEventType.REACTIVATION.value() || it.eventType == UserStatusEventType.ACTIVATION.value() || it.eventType == UserStatusEventType.LAPSED.value() }
                .findAll { UserStatusEvent event ->
                    (event.eventType == UserStatusEventType.ACTIVATION.value() && organisationUserConfirmationSummaryService.isFirstEvent(event)) || event.eventType != UserStatusEventType.ACTIVATION.value()
                }


        eventsThisMonth.each {UserStatusEvent event ->
            if(event.eventType == UserStatusEventType.CONFIRMED.value() && organisationUserConfirmationSummaryService.wasUserActiveAtEvent(event)){
                if(emptySeats > 0){
                    emptySeats = emptySeats -1
                } else{
                    seatCount = seatCount+1
                }
            }
            if(event.eventType == UserStatusEventType.REACTIVATION.value() && (organisationUserConfirmationSummaryService.wasConfirmedAtThisEvent(event)|| organisationUserConfirmationSummaryService.wasLapsedAtThisEvent(event))){
                if(emptySeats > 0){
                    emptySeats = emptySeats -1
                } else{
                    seatCount = seatCount+1
                }
            }
            if(event.eventType == UserStatusEventType.DEACTIVATION.value() && organisationUserConfirmationSummaryService.wasConfirmedAtThisEvent(event)){
                emptySeats = emptySeats+1
            }
        }

       return  seatCount
    }

    Boolean checkIfEarlyAccessOrg(Organisation org) {
        List<AppUser> users = organisationDAOService.getUsersFromOrg(org)
        List<AppUser> orgOwners = users.findAll { user ->
            user.hydrateRoles()
            user.roles.contains(Roles.ORG_OWNER.code())
        }

        Date startDate = new Date(122, 5, 22)
        Date endDate = new Date(122, 7, 1)

        for (orgOwner in orgOwners) {
            UserStatusEvent events = UserStatusEvent.findByUserAndEventTypeAndTimeBetween(orgOwner, "ACTIVATION", startDate, endDate)
            if (events != null)
                return true
        }

        return false
    }


}
