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

package com.juralio.emailwhitelist

import com.juralio.auth.AppUser
import com.juralio.auth.UserService
import com.juralio.common.ParameterValidatorService
import com.juralio.common.ValidatedParameterMap
import com.juralio.instance.InstanceSettings
import com.juralio.users.UserConfirmedStatus
import grails.gorm.transactions.Transactional

@Transactional
class EmailWhitelistService {
    UserService userService

    void updateExistingUserFromWhitelistAdd(AppUser user){
        ValidatedParameterMap validatedParameters = ParameterValidatorService.validate(['confirmationStatus': UserConfirmedStatus.WHITELISTED.value()], ['confirmationStatus'], [])
        userService.update(user.id,validatedParameters)

    }
    void updateExistingUserFromWhitelistRemoval(AppUser user){
        ValidatedParameterMap validatedParameters = ParameterValidatorService.validate(['confirmationStatus': UserConfirmedStatus.TRIALING.value(),'trialStartDate': new Date()], ['confirmationStatus','trialStartDate'], [])
        userService.update(user.id,validatedParameters)
    }

    EmailWhitelist get(Long id) {
        return EmailWhitelist.findById(id)
    }

    List<EmailWhitelist> list(Map args) {
        return EmailWhitelist.findAll(args)
    }

    Long count() {
        return  EmailWhitelist.findAll().size()
    }

    EmailWhitelist delete(Long id) {
        EmailWhitelist item = EmailWhitelist.findById(id)
        if(item) {
            item.delete()
            AppUser user = userService.findByUsername(item.whitelisted_email,[:])
            if(user){
                updateExistingUserFromWhitelistRemoval(user)
            }
            return item
        }
        return null
    }

    EmailWhitelist save(EmailWhitelist emailWhitelist) {
        emailWhitelist.save()
        AppUser user = userService.findByUsername(emailWhitelist.whitelisted_email,[:])
        if(user){
            updateExistingUserFromWhitelistAdd(user)
        }
        return emailWhitelist
    }
}
