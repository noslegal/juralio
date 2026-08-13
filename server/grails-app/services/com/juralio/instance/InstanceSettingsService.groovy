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

package com.juralio.instance

import com.juralio.auth.AppUser
import com.juralio.config.ConfigService
import com.juralio.organisation.OrganisationService
import grails.gorm.transactions.Transactional

@Transactional
class InstanceSettingsService {

    OrganisationService organisationService
    InstanceSettingsAuthorisationService instanceSettingsAuthorisationService
    ConfigService configService

    InstanceSettings getInstanceSettings() {
        return InstanceSettings.first()
    }

    def updateInstanceSettings(def validatedParameters) {
        if (!instanceSettingsAuthorisationService.hasUpdateAccess()) {
            throw new Exception()
        }
        InstanceSettings instanceSettings = InstanceSettings.first()
        instanceSettings.properties = validatedParameters
        instanceSettings.save()

        organisationService.disableSSOForAllOrganisations()
    }

    def fullAvailableSeats(){
        def fullSeatLimit  = configService.getProperty('fullSeats') ? configService.getProperty('fullSeats') as long : 1000
        long currFull = AppUser.countByEnabledAndExternalUserIsNull(true) - 1
        return  fullSeatLimit-currFull
    }

    def limitedAvailableSeats(){
        def limitedSeatLimit  =configService.getProperty('limitedSeats') ?  configService.getProperty('limitedSeats') as long : 1000
        long currLimited = AppUser.countByEnabledAndExternalUserIsNotNull(true)
        return limitedSeatLimit-currLimited
    }
}
