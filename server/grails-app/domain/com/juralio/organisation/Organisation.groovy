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
import com.juralio.label.InactiveLabel
import com.juralio.label.Label
import com.juralio.organisationgroup.OrganisationGroup
import grails.plugins.orm.auditable.Auditable

class Organisation implements Auditable {
    String name
    boolean mfaEnabled = true
    boolean enabled = true
    boolean googleDriveEnabled = false
    byte[] logo
    String logoMimeType
    boolean microsoftSsoEnabled = false
    boolean oktaSsoEnabled = false
    boolean samlSsoEnabled = false
    boolean googleSsoEnabled = false
    boolean hasConfiguredBilling = false
    boolean costsEnabled = false
    boolean isFrozen = false
    boolean hasFinishedCostFlowClient = false
    boolean hasFinishedCostFlowAdvisor = false
    Date frozenDate
    Integer confirmedUserCount = 0
    String lapsedLoginMessage
    String trialMessage

    static transients = ['orgAdmins', 'isPendingDeletion','seatCount','hasFinishedCostFlowClient','hasFinishedCostFlowAdvisor', 'internalGroup']
    List<AppUser> orgAdmins = []
    boolean isPendingDeletion
    Long seatCount = 0
    OrganisationGroup internalGroup

    static constraints = {
        name blank: false, nullable: false, maxSize: 50, unique: true
        logo nullable: true, maxSize: 204800
        logoMimeType nullable: true
        frozenDate nullable: true, blank: true
        lapsedLoginMessage blank: true, nullable: true
        trialMessage blank: true, nullable: true

    }

    static hasMany = [users: AppUser, inactiveLabels: InactiveLabel, labels: Label]


    def beforeUpdate() {
        if (this.isFrozen && this.getPersistentValue('isFrozen') == false) {
            this.frozenDate = new Date()
        }
    }
}