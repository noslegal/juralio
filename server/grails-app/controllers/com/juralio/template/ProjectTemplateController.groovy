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

package com.juralio.template

import com.juralio.auth.AppUser
import com.juralio.auth.UserRoleService
import com.juralio.auth.UserSessionEvent
import com.juralio.auth.UserSessionEventType
import com.juralio.instance.InstanceSettings
import com.juralio.instance.InstanceSettingsService
import com.juralio.organisation.OrganisationAuthorisationService
import com.juralio.project.Project
import com.juralio.project.ProjectService
import com.juralio.recency.RecencyService
import com.juralio.template.exception.TemplateNotFoundException
import grails.plugin.springsecurity.SpringSecurityService
import grails.plugin.springsecurity.annotation.Secured
import org.springframework.http.HttpStatus

import static org.springframework.http.HttpStatus.NO_CONTENT
import static org.springframework.http.HttpStatus.OK

@Secured(['ROLE_USER'])
class ProjectTemplateController {

    static allowedMethods = [save: "POST", listRecentProjectTemplatesForUser: "GET", index: "GET", show: "GET", delete: "DELETE", getStructure:'GET']

    RecencyService recencyService
    ProjectTemplateService projectTemplateService
    ProjectTemplateOverviewService projectTemplateOverviewService
    ProjectTemplateFavouriteService projectTemplateFavouriteService
    SpringSecurityService springSecurityService
    UserRoleService userRoleService
    InstanceSettingsService instanceSettingsService
    OrganisationAuthorisationService organisationAuthorisationService

    private boolean shouldShowInitialTemplate(Integer templateId) {
        AppUser user = springSecurityService.getCurrentUser() as AppUser
        if (!templateId) {
            return false
        }
        ProjectTemplate template = projectTemplateService.getProjectTemplate(templateId)
        if (!template) {
            return false
        }
        Project project = Project.findByCreatorAndTemplate(user, template)
        if (project) {
            return false
        }
        List<UserSessionEvent> loginEvents = UserSessionEvent.findAllByUserAndEventType(user, UserSessionEventType.LOGIN_SUCCESS.value(), [max: 4])
        if (loginEvents.size() > 3) {
            return false
        }
        return true


    }

    def getStructure() {
        ProjectTemplate template = projectTemplateService.getProjectStructure(params.id as long)
        respond template, [status: HttpStatus.OK, view: '/projectTemplate/_projectTemplateStructure']
    }

    @Secured("!hasRole('ROLE_SYSADMIN')")
    def index() {
        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
        List<ProjectTemplateOverview> projectTemplates = projectTemplateService.getList(params.limit as Long)
        if (params.basic == '1') {
            projectTemplates = projectTemplates.findAll { ProjectTemplateOverview pto ->
                !pto.isSystemTemplate || userRoleService.hasSystemTemplateManagerRole(currentUser)
            }
        }
        if (params.random) {
            InstanceSettings instanceSettings = instanceSettingsService.getInstanceSettings()
            if (instanceSettings.initialTemplateId != null) {
                if (shouldShowInitialTemplate(instanceSettings.initialTemplateId)) {
                    ProjectTemplateOverview p = projectTemplates.find { ProjectTemplateOverview pto -> pto.id == instanceSettings.initialTemplateId }
                    p.isInitialTemplate = true
                    if (p) {
                        respond p, [status: HttpStatus.OK]
                        return
                    } else {
                        respond null
                        return
                    }
                }

            }
            Collections.shuffle(projectTemplates)
            ProjectTemplateOverview p = projectTemplates.find { ProjectTemplateOverview pto -> pto.published }
            if (p) {
                respond p , [status: HttpStatus.OK]
            } else {
                respond null
            }
        } else {
            respond projectTemplates, [status: HttpStatus.OK]
        }
    }

    def show() {
        ProjectTemplate projectTemplate = projectTemplateService.getProjectTemplate(params.id as long)
        recencyService.updateTemplateRecency(projectTemplate)
        if (params.overview) {
            boolean isFavourited = projectTemplateFavouriteService.isTemplateFavourited(params.id)
            ProjectTemplateOverview overviewResponse = projectTemplateOverviewService.constructProjectTemplateOverview(projectTemplate, isFavourited)
            respond overviewResponse, [status: OK]
        } else if (params.overviewWithPosts) {
            boolean isFavourited = projectTemplateFavouriteService.isTemplateFavourited(params.id)
            ProjectTemplateOverview overviewResponse = projectTemplateOverviewService.constructProjectTemplateOverviewWithPosts(projectTemplate, isFavourited)
            respond overviewResponse, [status: OK]
        } else {
            boolean isFavourited = projectTemplateFavouriteService.isTemplateFavourited(params.id)
            projectTemplate.isFavourited = isFavourited
            projectTemplate.postCount = projectTemplateService.findAllTemplatePosts(projectTemplate)
            projectTemplate.publishedPostCount = projectTemplateService.findAllPublishedTemplatePosts(projectTemplate)
            respond projectTemplate, [status: HttpStatus.OK, view: 'projectTemplate/_projectTemplate']
        }
    }

    def delete() {
        AppUser appUser = springSecurityService.getCurrentUser()
        boolean isSysadmin = userRoleService.hasSysadminRole(appUser)
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(appUser.organisation.id)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }
        projectTemplateService.delete(params.id as long)
        render status: NO_CONTENT
    }

    def save() {
        AppUser appUser = springSecurityService.getCurrentUser()
        boolean isSysadmin = userRoleService.hasSysadminRole(appUser)
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(appUser.organisation.id)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }
        ProjectTemplate newTemplate

        if (request.JSON.projectId) {
            newTemplate = projectTemplateService.createTemplateFromProject(request.JSON.projectId as long, request.JSON.name)
        } else {
            newTemplate = projectTemplateService.createTemplateFromScratch(request.JSON.name)
        }

        if (newTemplate.hasErrors()) {
            respond newTemplate.errors
            return
        }

        respond newTemplate, [status: HttpStatus.CREATED]
    }

    def listRecentProjectTemplatesForUser() {
        respond recencyService.getRecentProjectTemplatesForUser()
    }


    def preview() {
        ProjectTemplate project = projectTemplateService.getProjectTemplate(params.id as long)
        List<ProjectTemplateService.Preview> results = projectTemplateService.generatePreview(project)
        respond results
    }
}
