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

package com.juralio.bootstrap

import com.juralio.auth.AppUser
import com.juralio.auth.Role
import com.juralio.auth.Roles
import com.juralio.auth.UserRole
import com.juralio.ftue.FirstTimeUserExperience
import com.juralio.organisation.Organisation
import com.juralio.organisationgroup.GroupPosition
import com.juralio.organisationgroup.OrganisationGroup
import com.juralio.organisationgroup.OrganisationGroupService
import grails.gorm.transactions.Transactional

@Transactional
class BootstrapService {
    OrganisationGroupService organisationGroupService

    def init() {
        //Ensure Roles up to date.
        TimeZone.setDefault(TimeZone.getTimeZone("UTC"))
        Roles.values().each {
            if (Role.findByAuthority(it.code()) == null)
                new Role(authority: it.code()).save(flush: true)
        }
        
        if (Organisation.count() > 0) {
            return
        }

        //Organisation
        Organisation defaultOrganisation = new Organisation(name: 'Juralio', mfaEnabled: false).save()

        //Default Group for default Organisation
        OrganisationGroup defaultGroup = organisationGroupService.generateDefaults(defaultOrganisation)

        //Sysadmin
        AppUser sysadmin = new AppUser(password: 'Password1Password1$',
                firstname: 'system', lastname: 'administrator')
        sysadmin.username = 'sysadmin@juralio.com'
        sysadmin.save()
        UserRole.create(sysadmin, Role.findByAuthority(Roles.SYSADMIN.code()))
        //todo this isn;t applied to existing dbs
        UserRole.create(sysadmin, Role.findByAuthority(Roles.SYSTEM_TEMPLATE_MANAGER.code()))
        UserRole.create(sysadmin, Role.findByAuthority(Roles.USER.code()))

        //Matter Creator
        createMatterCreator(defaultOrganisation, defaultGroup)

    }


    def createMatterCreator(Organisation organisation, OrganisationGroup defaultGroup) {
        AppUser matterCreator = new AppUser(password: 'Password2Password2$',
                firstname: 'matter', lastname: 'creator', organisation: organisation, organisationGroup: defaultGroup)
        matterCreator.username = 'matter.creator@juralio.com'
        matterCreator.save()
        UserRole.create(matterCreator, Role.findByAuthority(Roles.MATTER_CREATOR.code()))
        UserRole.create(matterCreator, Role.findByAuthority(Roles.USER.code()))
        matterCreator.organisation = organisation
        matterCreator.save(flush: true)

        FirstTimeUserExperience matterCreatorFTUE = matterCreator.firstTimeUserExperience
        matterCreatorFTUE.hasSeenInbox = true
        matterCreatorFTUE.hasSeenTaskmap = true
        matterCreatorFTUE.hasSeenTemplates = true
        matterCreatorFTUE.hasSeenTemplateOverview = true
        matterCreatorFTUE.hasSeenTemplateTaskmap = true
        matterCreatorFTUE.hasSeenTimeline = true
        matterCreatorFTUE.hasSeenOrgAdmin = true
        matterCreatorFTUE.hasSeenHomePage = true
        matterCreatorFTUE.hasSeenRoadmap = true
        matterCreatorFTUE.hasSeenMatterAdmin = true
        matterCreatorFTUE.save()
    }
}
