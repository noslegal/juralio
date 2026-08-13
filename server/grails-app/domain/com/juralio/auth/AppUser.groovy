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

package com.juralio.auth

import com.juralio.auth.password.TemporaryPassword
import com.juralio.ftue.FirstTimeUserExperience
import com.juralio.organisationgroup.OrganisationGroup
import com.juralio.organisation.Organisation
import com.juralio.organisation.exception.UserAlreadyHasOrganisationException
import grails.compiler.GrailsCompileStatic
import grails.plugins.orm.auditable.Auditable
import groovy.transform.EqualsAndHashCode
import groovy.transform.ToString

@GrailsCompileStatic
@EqualsAndHashCode(includes = 'username')
@ToString(includes = 'username', includeNames = true, includePackage = false)
class AppUser implements Auditable, Serializable {

    public static final String USERNAME = "username"
    public static final String FIRST_NAME = "firstname"
    public static final String LAST_NAME = "lastname"
    public static final String ORGANISATION = "organisation"

    private static final long serialVersionUID = 1

    String username
    String password
    String oneTimePasswordReset
    boolean enabled = true
    boolean accountExpired
    boolean accountLocked
    boolean passwordExpired
    int failedLoginAttempts
    Date accountLockedTime
    Date reset_pw_time

    String confirmationStatus = null
    Date trialStartDate
    Boolean trialReminderSent = false

    String thirdPartyUserId
    boolean isThirdPartyUser = false
    String thirdPartyProvider

    int avatarColorIndex
    int avatarImageIndex

    ExternalUser externalUser

    String firstname
    String lastname
    Organisation organisation
    FirstTimeUserExperience firstTimeUserExperience = new FirstTimeUserExperience()

    boolean mfaEnabled = false
    boolean mfaRegistered = false
    String mfaKey
    Long costsId

    Set<Role> getAuthorities() {
        if(AppUser.findById(this.id)) {
            (UserRole.findAllByUser(this) as List<UserRole>)*.role as Set<Role>
        }
    }

    void hydrateRoles() {
        roles = getAuthorities()*.authority
        if (organisation && organisation.isFrozen) {
            roles.push(Roles.FROZEN_ORG_USER.code())
        }
    }




    static transients = ['roles', 'isActiveOnMatter','isOnAllSubtasks','isOnSomeSubtasks', 'isViewerOnMatter', 'temporaryPassword', 'sessionTimeout', 'isFirstLogin', 'needsToConfigureBilling', 'isEarlyAccessOrg', 'confirmationDate', 'hasNeverSignedIn','isPlaceholder', 'lapsedDate','costsId']
    List<String> roles
    boolean isActiveOnMatter
    boolean isOnAllSubtasks = false
    boolean isOnSomeSubtasks = false
    boolean isViewerOnMatter
    boolean isFirstLogin = false
    boolean needsToConfigureBilling = false
    boolean isEarlyAccessOrg = false
    TemporaryPassword temporaryPassword
    int sessionTimeout
    Date confirmationDate
    boolean hasNeverSignedIn = false
    boolean isPlaceholder = false
    Date lapsedDate
    OrganisationGroup organisationGroup

    static constraints = {
        firstname length: 35, nullable: true, blank: true
        lastname length: 35, nullable: true, blank: true
        password nullable: false, blank: false, password: true
        username nullable: false, blank: false, unique: true, email: true
        organisation nullable: true
        externalUser nullable: true
        accountLockedTime nullable: true, bindable: false
        reset_pw_time nullable: true
        mfaKey nullable: true, blank: false, bindable: false
        mfaRegistered bindable: false
        thirdPartyUserId nullable: true
        thirdPartyProvider nullable: true, bindable: true
        oneTimePasswordReset nullable: true
        confirmationStatus length: 15, nullable: true, validator: {it == null || it == 'trialing' || it == 'confirmed' || it == 'lapsed' || it == 'whitelisted'}
        trialStartDate nullable: true
        organisationGroup nullable: true
    }

    static mapping = {
        password column: '`password`'
        oneTimePasswordReset column: '`one_time_password_reset`'
        organisationGroup lazy: false
    }

    def beforeUpdate() {
        if (isDirty(ORGANISATION)) {
            def newOrganisation = organisation
            def originalOrganisation = this.getPersistentValue(ORGANISATION)
            if (originalOrganisation && newOrganisation && originalOrganisation != newOrganisation) {
                throw new UserAlreadyHasOrganisationException()
            }
        }
    }
}
