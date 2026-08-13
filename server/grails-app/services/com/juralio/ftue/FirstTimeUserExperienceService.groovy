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

package com.juralio.ftue

import com.juralio.auth.AppUser
import com.juralio.auth.UserAuthorisationService
import grails.gorm.transactions.Transactional
import grails.plugin.springsecurity.SpringSecurityService
import groovy.transform.CompileDynamic
import groovy.transform.CompileStatic

@CompileStatic
@Transactional
class FirstTimeUserExperienceService {

    SpringSecurityService springSecurityService
    UserAuthorisationService userAuthorisationService

    @CompileDynamic
    FirstTimeUserExperience update(def updatedValues) {
        AppUser user = springSecurityService.getCurrentUser() as AppUser
        user.firstTimeUserExperience.properties = updatedValues
        return user.firstTimeUserExperience
    }

    def resetTutorialProgress(AppUser user) {
        if(!userAuthorisationService.hasMutateUserAccess(user.id)){
            throw new Exception()
        }
        user.firstTimeUserExperience.hasSeenInbox = false
        user.firstTimeUserExperience.hasSeenTaskmap = false
        user.firstTimeUserExperience.hasSeenTemplates = false
        user.firstTimeUserExperience.hasSeenTemplateOverview = false
        user.firstTimeUserExperience.hasSeenTemplateTaskmap = false
        user.firstTimeUserExperience.hasSeenTimeline = false
        user.firstTimeUserExperience.hasSeenOrgAdmin = false
        user.firstTimeUserExperience.hasSeenRoadmap = false
        user.firstTimeUserExperience.hasSeenTasklist = false
        user.firstTimeUserExperience.hasSeenHomePage = false
        user.firstTimeUserExperience.hasSeenMatterAdmin = false
    }
}
