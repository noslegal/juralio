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

import com.juralio.common.ParameterValidatorService
import com.juralio.common.ValidatedParameterMap
import com.juralio.config.ConfigService
import com.juralio.organisation.OrganisationUserConfirmationStatusService
import grails.plugin.springsecurity.annotation.Secured
import groovy.transform.CompileStatic
import org.springframework.http.HttpStatus

@CompileStatic
class InstanceSettingsController {

    static allowedMethods = [index: "GET", update: "PATCH"]

    InstanceSettingsService instanceSettingsService
    OrganisationUserConfirmationStatusService organisationUserConfirmationStatusService

    def index() {
        InstanceSettings instanceSettings =  instanceSettingsService.getInstanceSettings()
        // The frontend always fetches settings via the public (unauthenticated) path, and the
        // manage-users UI relies on these seat counts, so they are computed unconditionally here.
        // The counts use indexed COUNT queries (not a full AppUser scan) - see InstanceSettingsService.
        instanceSettings.fullSeats = instanceSettingsService.fullAvailableSeats() as long
        instanceSettings.limitedSeats = instanceSettingsService.limitedAvailableSeats() as long
        respond instanceSettings, [status: HttpStatus.OK, view: '/instanceSettings/_instanceSettings']
    }

    @Secured("hasRole('ROLE_SYSADMIN')")
    def update() {
        ValidatedParameterMap validatedParameters = ParameterValidatorService.validate(request.JSON as Map, [], ['microsoftSsoEnabled', 'oktaSsoEnabled', 'googleSsoEnabled', 'samlSsoEnabled', 'enableForgotMyPassword', 'initialTemplateId', 'showFirstLoginSplashScreen', 'enableUserConfirmation', 'trialPeriod','enableUrlValidation','emphasiseSsoLogin','enableAuditLogRotation','costsEnabled'])
        if (validatedParameters.get('enableUserConfirmation')) {
            organisationUserConfirmationStatusService.setConfirmationStatusToExistingUsers()
        }
        instanceSettingsService.updateInstanceSettings(validatedParameters)
    }
}
