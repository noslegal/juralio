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

import asset.pipeline.grails.AssetResourceLocator
import com.juralio.auth.AppUser
import com.juralio.aws.SESService
import com.juralio.common.ParameterValidatorService
import com.juralio.common.ValidatedParameterMap
import com.juralio.config.ConfigService
import com.juralio.instance.InstanceSettings
import com.juralio.instance.InstanceSettingsService
import com.juralio.organisation.dao.OrganisationDAOService
import com.juralio.organisation.exception.CustomMessageTooLongException
import com.juralio.post.exception.PostContentTooLongException
import grails.gorm.transactions.Transactional
import grails.plugin.springsecurity.SpringSecurityService
import org.springframework.beans.factory.annotation.Autowired
import java.nio.charset.StandardCharsets
import java.sql.Timestamp

@Transactional
class OrganisationAdminMessageService {
    SpringSecurityService springSecurityService
    OrganisationDAOService organisationDAOService
    ParameterValidatorService parameterValidatorService
    OrganisationService organisationService
    ConfigService configService
    AssetResourceLocator assetResourceLocator
    @Autowired
    SESService sesService
    InstanceSettingsService instanceSettingsService

    String getTrialCardMessage(Organisation targetOrg) {
        return targetOrg.trialMessage
    }

    String getLapsedLoginMessage(Organisation targetOrg){
        return targetOrg.lapsedLoginMessage
    }

    def updateTrialCardMessage(String newMessage, Organisation targetOrg) throws CustomMessageTooLongException {
        ValidatedParameterMap validatedParams = parameterValidatorService.validate(['trialMessage': newMessage], [], ['trialMessage'])
        if(newMessage.length() > 20){
            throw new CustomMessageTooLongException()
        }

        organisationService.update(targetOrg.id, validatedParams)
    }

    def updateLapsedLoginMessage(String newMessage, Organisation targetOrg) throws CustomMessageTooLongException {
        ValidatedParameterMap validatedParams = parameterValidatorService.validate(['lapsedLoginMessage': newMessage], [], ['lapsedLoginMessage'])
        if(newMessage.length() > 150){
            throw new CustomMessageTooLongException()
        }

        organisationService.update(targetOrg.id, validatedParams)

    }

    void sendFreeTrialReminderEmail(AppUser user) {
        if(user.confirmationStatus == 'whitelisted'){
            return
        }
        String domain = configService.getProperty('domain')
        if (domain == '${DOMAIN}') {
            return
        }

        InstanceSettings instanceSettings = instanceSettingsService.getInstanceSettings()
        if(instanceSettings.enableUserConfirmation == false || user.trialReminderSent || !user.getOrganisationId()){
            return
        }
        int remainingTrialDays = getRemainingDays(user)
        String remainingDaysStr
        String customMsg
        if (  remainingTrialDays >7){
            return
        }

        if (remainingTrialDays == 0) {
            remainingDaysStr = ' < 1 '
        } else {
            remainingDaysStr = remainingTrialDays.toString()
        }

        Organisation userOrg = organisationDAOService.getOrganisation(user.getOrganisationId())

        if(userOrg.trialMessage == null || userOrg.trialMessage==''){
            customMsg = "your administrator"
        }else{customMsg = userOrg.trialMessage}

        String subject = "Your free trial has ${remainingDaysStr} days remaining"
        def template
        template = assetResourceLocator.findAssetForURI('FreeTrial7DaysReminder.html')

        String htmlBody = new String(template.getInputStream().bytes, StandardCharsets.UTF_8)
        htmlBody = htmlBody.replaceAll('DAYS_REMAINING', remainingDaysStr)
        htmlBody = htmlBody.replaceAll('CUSTOM_MESSAGE', customMsg)
        String body = htmlBody
        sesService.sendEmail(user.username, subject, body)

        user.trialReminderSent = true
        user.save()

    }

    private int getRemainingDays(AppUser user){
        InstanceSettings instanceSettings = instanceSettingsService.getInstanceSettings()
        if(instanceSettings.enableUserConfirmation){
            int trialDays = instanceSettings.trialPeriod
            Date currentDate = new Date()
            Date userTrialEndDate = new Date(user.trialStartDate.getTime())
            Calendar cal = Calendar.getInstance()
            cal.setTime(userTrialEndDate)
            cal.add(Calendar.DATE, trialDays)
            userTrialEndDate =  cal.getTime()
            int remainingDays = Math.max(Math.floor(
                    (userTrialEndDate.getTime()-currentDate.getTime())/(1000 * 3600 * 24)
            ),0
            )

            return remainingDays
        } else {
            return 0
        }
    }
}
