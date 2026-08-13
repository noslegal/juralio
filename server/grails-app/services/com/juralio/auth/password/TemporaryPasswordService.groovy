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

package com.juralio.auth.password

import asset.pipeline.grails.AssetResourceLocator
import com.juralio.auth.AppUser
import com.juralio.auth.exception.CannotResetPasswordMoreThanOnceInMinute
import com.juralio.aws.SESService
import com.juralio.config.ConfigService
import grails.gorm.transactions.Transactional
import grails.plugin.springsecurity.SpringSecurityService
import org.springframework.beans.factory.annotation.Autowired

import java.nio.charset.StandardCharsets

@Transactional
class TemporaryPasswordService {

    def userService
    def passwordGeneratorService
    def userAuthTokenService
    @Autowired
    ConfigService configService
    @Autowired
    SESService sesService
    SpringSecurityService springSecurityService
    AssetResourceLocator assetResourceLocator
    MagicLinkService magicLinkService

    TemporaryPassword getTemporaryPassword(AppUser user) {
        //this is used when an admin resets a password, so we don't want to set the one time password
        TemporaryPassword temporaryPassword = passwordGeneratorService.generatePassword()
        user.passwordExpired = true
        user.password = temporaryPassword.password
        user.accountLocked = false
        user.oneTimePasswordReset = null
        userAuthTokenService.invalidateAllSessions(user)

        return temporaryPassword
    }

    void resetPasswordTimer(long userid) {
        Long minute = 60 * 1000
        AppUser user = AppUser.findById(userid)
        if (user.reset_pw_time == null) {
            user.reset_pw_time = new Date()
        } else {
            Long timeDiff = new Date().time - user.reset_pw_time.time
            if (timeDiff > minute) {
                user.reset_pw_time = new Date()
            } else {
                throw new CannotResetPasswordMoreThanOnceInMinute()
            }
        }

    }

    void sendForgotPasswordEmail(AppUser user, TemporaryPassword temporaryPassword, String context) {
        String domain = configService.getProperty('domain')
        if (domain == '${DOMAIN}') {
            return
        }
        String subject = 'Reset your Juralio password'


        String magicLink = domain + '/#/login?magic_link=' + magicLinkService.generateMagicLinkData(user.username, temporaryPassword.password, 'passwordReset')

        def template = assetResourceLocator.findAssetForURI('ForgotPassword.html')
        String htmlBody = new String(template.getInputStream().bytes, StandardCharsets.UTF_8)
        htmlBody = htmlBody.replaceAll('MAGIC_LINK', magicLink)


        String body = htmlBody
        sesService.sendEmail(user.username, subject, body)

    }


    void sendPasswordResetEmail(AppUser user, TemporaryPassword temporaryPassword, String context) {
        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
        String username
        if (currentUser.firstname != null && currentUser.lastname != null) {
            username = currentUser.firstname + ' ' + currentUser.lastname
        } else {
            username = currentUser.username
        }
        String username_2 = currentUser.username

        String subject = username + " has reset your Juralio password"
        if (currentUser.username == 'sysadmin@juralio.com') {
            subject = 'Your Juralio password has been reset'
            username = 'A system administrator'
            username_2 = 'a system administrator'
        }

        String domain = configService.getProperty('domain')
        if (domain == '${DOMAIN}') {
            return
        }

        if (context == 'auth_conversion') {
            user.temporaryPassword = temporaryPassword
            userService.emailAuthChange(user, true)
        } else {

            String magicLink = domain + '/#/login?magic_link=' + magicLinkService.generateMagicLinkData(user.username, temporaryPassword.password, 'passwordReset')

            def template = assetResourceLocator.findAssetForURI('PasswordReset.html')
            String htmlBody = new String(template.getInputStream().bytes, StandardCharsets.UTF_8)
            htmlBody = htmlBody.replaceAll('PERSON_NAME', username)
            htmlBody = htmlBody.replaceAll('ORG_NAME_HERE', user.organisation.name)
            htmlBody = htmlBody.replaceAll('PERSON_USERNAME', username_2)
            htmlBody = htmlBody.replaceAll('MAGIC_LINK', magicLink)


            String body = htmlBody
            sesService.sendEmail(user.username, subject, body)

        }
    }
}




