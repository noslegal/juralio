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

package com.juralio.cron

import com.juralio.AuditTrail
import com.juralio.auth.AppUser
import com.juralio.auth.UserRoleService
import com.juralio.auth.userstatus.UserStatusEventService
import com.juralio.aws.SESService
import com.juralio.common.DateUtilService
import com.juralio.config.ConfigService
import com.juralio.instance.InstanceSettings
import com.juralio.instance.InstanceSettingsService
import com.juralio.matter.MatterDeletionService
import com.juralio.organisation.Organisation
import com.juralio.organisation.OrganisationDeletionService
import com.juralio.organisation.OrganisationService
import com.juralio.organisation.OrganisationUserConfirmationStatusService
import com.juralio.organisation.OrganisationUserConfirmationSummaryService
import com.juralio.organisation.dao.OrganisationDAOService
import grails.gorm.transactions.Transactional
import org.grails.web.json.JSONArray
import org.grails.web.json.JSONObject
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.scheduling.annotation.Scheduled
import server.ExportService

@Transactional
class CronService {
    static lazyInit = false
    OrganisationUserConfirmationStatusService organisationUserConfirmationStatusService
    OrganisationUserConfirmationSummaryService organisationUserConfirmationSummaryService
    InstanceSettingsService instanceSettingsService
    OrganisationService organisationService
    ExportService exportService
    MatterDeletionService matterDeletionService
    DateUtilService dateUtilService
    ConfigService configService
    @Autowired
    SESService sesService
    OrganisationDAOService organisationDAOService
    UserStatusEventService userStatusEventService
    OrganisationDeletionService organisationDeletionService
    UserRoleService userRoleService

    def rotateAuditLog() {
        InstanceSettings instanceSettings = instanceSettingsService.getInstanceSettings()
        if(instanceSettings.enableAuditLogRotation) {
            Long ROTATION_DAYS = 90

            List<String> actorsToKeep = AppUser.findAll().findAll { AppUser user ->
                userRoleService.hasSysadminRole(user)
            }.collect { it.username }.flatten() as List<String>
            actorsToKeep.push('SYS')
            String actorString = actorsToKeep.join("', '")
            Long ROTATION_CUTOFF = new Date().getTime() - (1000 * 60 * 60 * 24 * ROTATION_DAYS)
            String query = "DELETE from AuditTrail where actor NOT IN  ('${actorString}') and EXTRACT(EPOCH FROM dateCreated) * 1000 < ${ROTATION_CUTOFF}"
            AuditTrail.executeUpdate(query)
        }

    }

    @Scheduled(cron = "0 0 1 * * *")
    private void runAtOneAm() {
        try {
            lapseUnconfirmedTrialingUsers()
            deletePendingMatters()
            organisationDeletionService._cronDeleteOrganisationsMarkedForDeletion()
            rotateAuditLog()

        } catch(Exception e){
            String domain = configService.getProperty('domain')
            if (domain == '${DOMAIN}') {
                return
            }
            String subject = "One AM issue" + domain
            String body =  e.getMessage()
            sesService.sendEmail("support@example.com", subject, body)
        }
    }

    @Scheduled(cron = "0 0 1 1 * *")
    private void runAtOneAmFirstOfMonth() {
        monthlyReportGeneration()
        emailUsageSummary()
    }

    private void lapseUnconfirmedTrialingUsers() {
        organisationUserConfirmationStatusService.lapseUnconfirmedTrialingUsers()
    }

    def monthlyReportGeneration() {
        if (instanceSettingsService.getInstanceSettings().enableUserConfirmation) {
            List<Organisation> orgs = organisationService.organisationDAOService.list()
            Calendar now = Calendar.getInstance()
            Date endDate = organisationUserConfirmationSummaryService.getDateAtStartOfMonth(now.get(Calendar.MONTH), now.get(Calendar.YEAR))
            now.add(Calendar.MONTH, -1);
            Date startDate = organisationUserConfirmationSummaryService.getDateAtStartOfMonth(now.get(Calendar.MONTH), now.get(Calendar.YEAR))

            orgs.each { Organisation org ->
                File report = exportService.exportSeatsData(org.id, startDate, endDate)
                try {
                    organisationUserConfirmationSummaryService.uploadReportToS3(org, report)
                } catch (Exception e) {
                    String domain = configService.getProperty('domain')
                    if (domain == '${DOMAIN}') {
                        return
                    }
                    String subject = "Failed to save monthly report"
                    String body = e.getMessage()
                    sesService.sendEmail("developers@example.com", subject, body)
                }
                String domain = configService.getProperty('domain')
                organisationUserConfirmationSummaryService.storeMonthlySummaryForOrganisation(org)
                String body = """
                    Hello,<br/>
                        Here is this month's report for  ${org.name} on ${domain}.<br/>
                    <br/>
                    All the best,<br/>
                        Juralio Automated Monthly Email Service<br/>
                    <br/>
                    --------------------------------<br/>
                    Domain: ${domain}<br/>
                    Organisation : ${org.name}
                """
                if (domain != '${DOMAIN}') {
                    sesService.sendEmailWithFile('info@example.com', "Monthly Confirmed Users Report: ${org.name} on ${domain}", body, report)
                }
            }
        }
    }


    def emailUsageSummary() {
        try {
            def dateInPreviousMonth = userStatusEventService.getDateOneMonthPreviously()
            def start = dateUtilService.getStartOfMonth(dateInPreviousMonth)
            def end = dateUtilService.getEndOfMonth(start)
            String domain = configService.getProperty('domain')
            if (domain == '${DOMAIN}') {
                return
            }

            String subject = "${userStatusEventService.getHostID()} usage for ${dateUtilService.getShortMonthAndYearString(dateInPreviousMonth)}"
            String body = userStatusEventService.createUsageSummary(start, end)
            sesService.sendEmail("info@example.com", subject, body)
        } catch (Exception ex) {
            String domain = configService.getProperty('domain')
            if (domain == '${DOMAIN}') {
                return
            }
            String subject = "Exception from Scheduled Email " + domain
            String body =  """<html><body><h3>Unhandled Error</h3>
            <table>
            <tr><td>Exception Type</td><td>${ex.getClass()}</td></tr>
            <tr><td>Detail Message</td><td>${ex.getMessage()}</td></tr>
            <tr><td>Stacktrace</td><td><pre>${userStatusEventService.getStackTraceString(ex)}</pre></td></tr>
            </table>
            </body></html>"""
            sesService.sendEmail("info@example.com", subject, body)
        }
    }

    void deletePendingMatters() {
        matterDeletionService.deletePendingMattersForOrg()
    }
}
