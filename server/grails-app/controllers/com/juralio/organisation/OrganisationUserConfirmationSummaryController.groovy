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
import com.juralio.aws.SESService
import com.juralio.config.ConfigService
import com.juralio.instance.InstanceSettingsService
import grails.plugin.springsecurity.SpringSecurityService
import grails.plugin.springsecurity.annotation.Secured
import grails.rest.*
import grails.converters.*
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.HttpStatus
import org.springframework.scheduling.annotation.Scheduled
import server.ExportService
import server.MonthlyUsersReportSummary

import java.nio.file.Files
import java.nio.file.Paths
import java.time.LocalDate

@Secured('IS_AUTHENTICATED_FULLY')
class OrganisationUserConfirmationSummaryController {
    static allowedMethods = [getSummaryDataForOrg: "GET", getSpecificReport:'GET',forceGenerateReports:'GET']

    SpringSecurityService springSecurityService
    OrganisationUserConfirmationSummaryService organisationUserConfirmationSummaryService
    InstanceSettingsService instanceSettingsService
    UserRoleService userRoleService
    ExportService exportService
    OrganisationService organisationService

    String encoding = "UTF-8"
    String xlsxMimeType = "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"


    @Secured("hasRole('ROLE_ORG_OWNER')  or hasRole('ROLE_SYSADMIN')")
    def getSummaryDataForOrg() {
        Long orgId = params.id as Long
        AppUser currentUser = springSecurityService.getCurrentUser()
        Boolean isSysAdmin = userRoleService.hasSysadminRole(currentUser)
        if ((!isSysAdmin &&  currentUser.organisationId != orgId )|| !instanceSettingsService.getInstanceSettings().enableUserConfirmation) {
            respond [:], status: HttpStatus.FORBIDDEN
        } else {
            try {
                List<MonthlyUsersReportSummary> summaryReports = organisationUserConfirmationSummaryService.getSummaryReportsForOrganisation(orgId)
                respond summaryReports, [status: HttpStatus.OK, view: '/organisation/_summaryReportsList']

            } catch (Exception e) {
                respond [:], status: HttpStatus.FORBIDDEN
            }
        }

    }

//    @Secured("hasRole('ROLE_SYSADMIN')")
//    def forceGenerateReports(){
//        Long orgId = params.id as Long
//        organisationUserConfirmationSummaryService.forceReportGeneration(orgId)
//        respond [:], status: HttpStatus.OK
//
//    }

    @Secured("hasRole('ROLE_ORG_OWNER')  or hasRole('ROLE_SYSADMIN')")
    def getSpecificReport(){


        Long orgId = params.id as Long
        AppUser currentUser = springSecurityService.getCurrentUser()
        Boolean isSysAdmin = userRoleService.hasSysadminRole(currentUser)
        if ((!isSysAdmin &&  currentUser.organisationId != orgId )|| !instanceSettingsService.getInstanceSettings().enableUserConfirmation) {
            respond [:], status: HttpStatus.FORBIDDEN
        } else {
            try {
                String timeObj = params.specificMonth //MM-YYYY
                List<String> parts = timeObj.split('-')
                Long month =  parts[0].toLong()
                Long year =  parts[1].toLong()
                Organisation org = organisationService.organisationDAOService.getOrganisation(orgId)
                File report = organisationUserConfirmationSummaryService.getSpecificReport(org,month,year)
                response.status = HttpStatus.OK.value()
                response.setHeader("Content-disposition", "attachment; filename=${"Juralio Seats Report - " + month + '/' +year + exportService.EXCEL_FILE_SUFIX}")
                response.contentType = "${xlsxMimeType};charset=${encoding}"
                response.outputStream << Files.readAllBytes(Paths.get(report.getAbsolutePath()))

            } catch (Exception e) {
                respond [:], status: HttpStatus.FORBIDDEN
            }
        }
    }

    private Date getDateAtStartOfMonth(int month, int year){
        Calendar cal = Calendar.getInstance()
        cal.set(year,month,1,0,0,0)
        return cal.getTime()
    }

}
