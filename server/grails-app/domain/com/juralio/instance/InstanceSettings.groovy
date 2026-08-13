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
import grails.plugins.orm.auditable.Auditable

class InstanceSettings implements Auditable {

    Boolean microsoftSsoEnabled, oktaSsoEnabled, samlSsoEnabled, showFirstLoginSplashScreen, googleSsoEnabled
    Boolean enableForgotMyPassword = false
    Integer initialTemplateId
    Boolean enablePaymentPlatformIntegration = false
    Boolean enableUrlValidation = true
    Boolean enableUserConfirmation = false
    Integer trialPeriod = 21
    Boolean emphasiseSsoLogin = false
    Boolean enableAuditLogRotation = false
    Boolean costsEnabled = false

    static transients = ['fullSeats','limitedSeats']
    Long fullSeats
    Long limitedSeats

    static constraints = {
        microsoftSsoEnabled nullable: false, blank: false
        oktaSsoEnabled nullable: false, blank: false
        samlSsoEnabled nullable: false, blank: false
        googleSsoEnabled nullable: false, blank: false
        enableForgotMyPassword nullable: false, blank: false
        initialTemplateId nullable: true, blank: false
        showFirstLoginSplashScreen nullable: false, blank: false
        enablePaymentPlatformIntegration nullable: false, blank: false
        enableUrlValidation nullable:false, blank: false
        enableUserConfirmation nullable: false, blank: false
        trialPeriod nullable: false, blank: false
        emphasiseSsoLogin nullable:false, blank:false
        enableAuditLogRotation nullable:false, blank: false
        costsEnabled nullable:false, blank: false
    }
}