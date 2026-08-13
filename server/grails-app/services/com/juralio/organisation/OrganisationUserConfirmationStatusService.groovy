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
import com.juralio.auth.UserRoleService
import com.juralio.auth.UserService
import com.juralio.auth.userstatus.UserStatusEventService
import com.juralio.emailwhitelist.EmailWhitelist
import com.juralio.instance.InstanceSettings
import com.juralio.instance.InstanceSettingsService
import com.juralio.organisation.dao.OrganisationDAOService
import com.juralio.users.UserConfirmedStatus
import grails.gorm.transactions.Transactional

import java.util.concurrent.TimeUnit

@Transactional
class OrganisationUserConfirmationStatusService {
    OrganisationDAOService organisationDAOService
    InstanceSettingsService instanceSettingsService
    UserRoleService userRoleService
    UserStatusEventService userStatusEventService
    UserService userService
    OrganisationAdminMessageService organisationAdminMessageService

    void lapseUnconfirmedTrialingUsers() {
        InstanceSettings instanceSettings = instanceSettingsService.getInstanceSettings()
        if (!instanceSettings.enableUserConfirmation) {
            return
        }
        Integer trialDays = instanceSettings.trialPeriod

        List<Organisation> organisations = organisationDAOService.list().findAll { Organisation org -> org.enabled }
        organisations.each { Organisation organisation ->
            List<AppUser> users = organisationDAOService.getUsersFromOrg(organisation)

            users.each {
                if (it.confirmationStatus != UserConfirmedStatus.TRIALING.value()) {
                    return
                }
                long diffInMs = Math.abs(new Date().getTime() - it.trialStartDate.getTime())
                long daysSinceTrialStart = TimeUnit.DAYS.convert(diffInMs, TimeUnit.MILLISECONDS)

                if (daysSinceTrialStart > trialDays) {
                    it.confirmationStatus = UserConfirmedStatus.LAPSED.value()
                    it.enabled = false
                    userStatusEventService.recordLapsed(it.id)
                } else if (trialDays - daysSinceTrialStart == 7 && !userService.hasUserLoggedInBefore(it) && !it.trialReminderSent) {
                    organisationAdminMessageService.sendFreeTrialReminderEmail(it)
                }
            }
        }
    }

    void setConfirmationStatusToExistingUsers() {
        List<Organisation> organisations = organisationDAOService.list().findAll { Organisation org -> org.enabled }
        organisations.each { Organisation organisation ->
            List<AppUser> users = organisationDAOService.getActiveUsersFromOrg(organisation)

            users.each {
                if (it.confirmationStatus != null || userRoleService.hasSysadminRole(it)) {
                    return
                }
                if (EmailWhitelist.findByWhitelisted_email(it.username)) {
                    it.confirmationStatus = UserConfirmedStatus.WHITELISTED.value()
                } else {
                    it.trialStartDate = new Date()
                    it.confirmationStatus = UserConfirmedStatus.TRIALING.value()
                }
            }

            List<AppUser> inactiveUsers = organisationDAOService.getUsersFromOrg(organisation).findAll{AppUser au -> !au.enabled}
            inactiveUsers.each {
                if (it.confirmationStatus != null || userRoleService.hasSysadminRole(it)) {
                    return
                }
                it.trialStartDate = new Date()
                it.confirmationStatus = 'lapsed'
                userStatusEventService.recordLapsed(it.id)
            }
        }
    }
}
