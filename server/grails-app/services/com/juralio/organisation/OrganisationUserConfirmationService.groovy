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
import com.juralio.auth.UserService
import com.juralio.auth.exception.UserDoesNotExistException
import com.juralio.common.ParameterValidatorService
import com.juralio.common.ValidatedParameterMap
import com.juralio.instance.InstanceSettings
import com.juralio.instance.InstanceSettingsService
import com.juralio.users.UserConfirmedStatus
import grails.gorm.transactions.Transactional

@Transactional
class OrganisationUserConfirmationService {

    UserService userService
    OrganisationService organisationService
    InstanceSettingsService instanceSettingsService

    void setConfirmedStatus(long id) {
        InstanceSettings instanceSettings = instanceSettingsService.getInstanceSettings()
        if (!instanceSettings.enableUserConfirmation) {
            return
        }
        if(id != null) {
            AppUser appUser = userService.getUserById(id)
            Organisation userOrg = appUser.organisation
            if(userOrg.confirmedUserCount <= (getTotalActiveConfirmedUsers(userOrg, id))){

                ValidatedParameterMap validatedParameters = ParameterValidatorService.validate(['updateConfirmedCount': userOrg.confirmedUserCount += 1], [], ['updateConfirmedCount'])
                organisationService.update(userOrg.id, validatedParameters)
            }

            ValidatedParameterMap validatedParameters = ParameterValidatorService.validate(['confirmationStatus': UserConfirmedStatus.CONFIRMED.value(), 'confirmationDate': new Date()], [], ['confirmationStatus','confirmationDate'])
            userService.update(id, validatedParameters)
        }else {
            throw new UserDoesNotExistException()
        }
    }

    int getTotalActiveConfirmedUsers(Organisation organisation, long userToIgnoreId){
        List<AppUser> usersInOrg = organisation.getUsers().toList()
        List<AppUser> activeUsers = usersInOrg.findAll{AppUser user -> user.enabled && user.confirmationStatus == UserConfirmedStatus.CONFIRMED.value()}
        activeUsers.removeIf { it.id == userToIgnoreId}
        return (activeUsers.size())
    }

    String getConfirmedStatus(long id){
        InstanceSettings instanceSettings = instanceSettingsService.getInstanceSettings()
        if (!instanceSettings.enableUserConfirmation) {
            return
        }
        if(id != null) {
            AppUser appUser = userService.getUserById(id)
            return appUser.confirmationStatus
        }else{
            throw new UserDoesNotExistException()
        }
    }
}
