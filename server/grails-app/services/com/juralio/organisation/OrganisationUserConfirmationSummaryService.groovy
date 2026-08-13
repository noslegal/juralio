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
import com.juralio.auth.UserStatusEvent
import com.juralio.auth.UserStatusEventType
import com.juralio.aws.S3Service
import com.juralio.aws.SESService
import com.juralio.config.ConfigService
import com.juralio.instance.InstanceSettingsService
import com.juralio.organisation.dao.OrganisationDAOService
import com.juralio.users.UserConfirmedStatus
import grails.gorm.transactions.Transactional
import grails.plugin.springsecurity.SpringSecurityService
import org.springframework.beans.factory.annotation.Autowired
import server.ExportService
import server.MonthlyUsersReportSummary

import java.time.ZonedDateTime

@Transactional
class OrganisationUserConfirmationSummaryService {
    UserRoleService userRoleService
    SpringSecurityService springSecurityService
    OrganisationService organisationService
    OrganisationDAOService organisationDAOService
    ConfigService configService
    ExportService exportService
    InstanceSettingsService instanceSettingsService
    S3Service s3Service
    @Autowired
    SESService sesService

    static lazyInit = false



    List<MonthlyUsersReportSummary> getSummaryReportsForOrganisation(Long orgId) {
        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
        Boolean isSysAdmin = userRoleService.hasSysadminRole(currentUser)
        Boolean isOrgOwner = userRoleService.hasOrgOwnerRole(currentUser)
        if((!isSysAdmin && !isOrgOwner) || (isOrgOwner && currentUser.organisationId != orgId) ){
            throw new Exception('Forbidden from accessing this information')
        }
        List<MonthlyUsersReportSummary> summaryList = MonthlyUsersReportSummary.findAllByOrgId(orgId)
        return summaryList
    }

    MonthlyUsersReportSummary getSummaryReportByOrganisationAndDate(Long orgId, Date startDate){
        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
        if( !userRoleService.hasSysadminRole(currentUser)) {
            if (currentUser && !userRoleService.hasOrgOwnerRole(currentUser) && !userRoleService.hasOrgAdminRole(currentUser)) {
                throw new Exception('Forbidden from accessing this information')
            }
            if (currentUser && currentUser.organisation.id != orgId) {
                throw new Exception('Forbidden from accessing this information')
            }
        }
        List<MonthlyUsersReportSummary> reports = MonthlyUsersReportSummary.findAllByOrgId(orgId).findAll{it -> it.summaryDate.getMonth() == startDate.getMonth() && it.summaryDate.getYear() == startDate.getYear()}
        MonthlyUsersReportSummary report
        if(reports.size() > 0){
            report = reports[0]
        }
        return report
    }

    void storeMonthlySummaryForOrganisation(Organisation org){
        Date lastMonth = Date.from(ZonedDateTime.now().minusMonths(1).toInstant())
        Date summaryDate =new Date(lastMonth.year,lastMonth.month,1,0,0,0)
        Long confirmedActiveUsers = organisationService.organisationDAOService.getActiveUsersFromOrg(org).findAll{ AppUser user -> user.getConfirmationStatus() == UserConfirmedStatus.CONFIRMED.value() }.size()
        Long seatCount = organisationService.getCurrentSeatCount(org, true)
        try {
            MonthlyUsersReportSummary summaryReport = new MonthlyUsersReportSummary(orgId:org.id,seats:seatCount,confirmedActiveUsers: confirmedActiveUsers,summaryDate: summaryDate)
            summaryReport.save(failOnError: true)
        } catch(Exception e){
            String domain = configService.getProperty('domain')
            String data = "OrgId: ${org.id}. Seats: ${seatCount}, ConfirmedActiveUsers: ${confirmedActiveUsers}. Error: ${e.getMessage()}"

            if (domain == '${DOMAIN}') {
                return
            }
            String subject = "${domain}: Internal Server Error"
            String body =  data
            sesService.sendEmail("support@example.com", subject, body)
        }
    }

    void uploadReportToS3(Organisation organisation, File report){
        Date lastMonth = Date.from(ZonedDateTime.now().minusMonths(1).toInstant())

        String filename = "${organisation.name.replace(' ','-')}-${lastMonth.getDateString().split('/')[0]}-${lastMonth.getDateString().split('/')[2]}.xlsx"
        String path = "userConfirmationReports/${organisation.id}"
        s3Service.uploadFile(report,path,filename)
    }

    File getSpecificReport(Organisation org, Long month, Long year){
        String path = "userConfirmationReports/${org.id}/${org.name.replace(' ','-')}-${"${month}"}-${year}.xlsx"
        File report = s3Service.getFile(path)
        return report
    }

    Date getDateAtStartOfMonth(int month, int year){
        Calendar cal = Calendar.getInstance()
        cal.set(year,month,1,0,0,0)
        return cal.getTime()
    }
    
    void getConfirmationDate(AppUser user) {
        def u = user
        UserStatusEvent date = UserStatusEvent.findByUserAndEventType(u, "CONFIRMED", [sort: 'time', order: 'asc'])
        if (date) {
            user.confirmationDate = date.time
        }
    }

    UserStatusEvent getPriorEvent(UserStatusEvent event) {
        List<UserStatusEvent> userEvents = UserStatusEvent.findAllByUser(event.user)
                .findAll { UserStatusEvent statusEvent -> statusEvent.time <= event.time && event.id != statusEvent.id }
                .sort { it.time }.reverse()
        if (userEvents.size() < 1) {
            return
        } else {
            UserStatusEvent priorEvent = userEvents[0]
            if (event.eventType == UserStatusEventType.REACTIVATION.value() && priorEvent.eventType == UserStatusEventType.ACTIVATION.value() && userEvents.size() > 1) {
                priorEvent = userEvents[1] //if reactivating, ignore activation event
            }
            return priorEvent
        }
    }


    boolean wasUserActiveAtEvent(UserStatusEvent event, boolean isReactivation = false){
        List<UserStatusEvent> userEvents = UserStatusEvent.findAllByUser(event.user)
                .findAll { UserStatusEvent statusEvent -> statusEvent.time <= event.time && event.id != statusEvent.id && [UserStatusEventType.ACTIVATION.value(),UserStatusEventType.REACTIVATION.value(),UserStatusEventType.DEACTIVATION.value()].contains(statusEvent.eventType) }
                .sort { it.time }.reverse()

        if(userEvents.size() < 1){
            return false
        } else{
            if(isReactivation && userEvents.size() >1){
                return userEvents[1].eventType != UserStatusEventType.DEACTIVATION.value()
            }
            return userEvents[0].eventType != UserStatusEventType.DEACTIVATION.value()
        }
    }


    static boolean isFirstEvent(UserStatusEvent event) {
        List<UserStatusEvent> userEvents = UserStatusEvent.findAllByUser(event.user)
                .findAll { UserStatusEvent statusEvent -> statusEvent.time <= event.time && event.id != statusEvent.id }
        return userEvents.size() == 0
    }

    boolean wasConfirmedAtThisEvent(UserStatusEvent event) {
        getConfirmationDate(event.user)
        return (event.eventType == UserStatusEventType.CONFIRMED.value()) || (event.user.confirmationDate && event.user.confirmationDate <= event.time)
    }
    boolean wasLapsedAtThisEvent(UserStatusEvent event) {
        UserStatusEvent priorEvent = getPriorEvent(event)
        if(priorEvent && priorEvent.eventType == UserStatusEventType.LAPSED.value()){
            return true
        }
        return false
    }

    // void forceReportGeneration(Long orgId){
    //     if (instanceSettingsService.getInstanceSettings().enableUserConfirmation) {
    //         Organisation org = organisationDAOService.getOrganisation(orgId)
    //         Calendar now = Calendar.getInstance()
    //         Date endDate = getDateAtStartOfMonth(now.get(Calendar.MONTH), now.get(Calendar.YEAR))
    //         now.add(Calendar.MONTH, -1);
    //         Date startDate = getDateAtStartOfMonth(now.get(Calendar.MONTH), now.get(Calendar.YEAR))

    //         File report = exportService.exportSeatsData(org.id, startDate, endDate)
    //         //uploadReportToS3(org, report)
    //         storeMonthlySummaryForOrganisation(org)

    //     }
    // }

}
