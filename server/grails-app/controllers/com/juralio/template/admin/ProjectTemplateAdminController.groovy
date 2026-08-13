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

package com.juralio.template.admin

import com.juralio.auth.AppUser
import com.juralio.auth.UserRoleService
import com.juralio.common.ParameterValidatorService
import com.juralio.common.ValidatedParameterMap
import com.juralio.organisation.OrganisationAuthorisationService
import com.juralio.template.ProjectTemplate
import com.juralio.template.ProjectTemplateService
import com.juralio.template.exception.TemplateNotFoundException
import grails.plugin.springsecurity.SpringSecurityService
import grails.plugin.springsecurity.annotation.Secured
import org.springframework.http.HttpStatus
import org.springframework.security.access.AccessDeniedException

@Secured(['IS_AUTHENTICATED_FULLY'])
class ProjectTemplateAdminController {

    static allowedMethods = [update: "PATCH"]
    SpringSecurityService springSecurityService
    UserRoleService userRoleService
    OrganisationAuthorisationService organisationAuthorisationService

    ProjectTemplateService projectTemplateService

    def update(long templateId) {
        AppUser appUser = springSecurityService.getCurrentUser()
        boolean isSysadmin = userRoleService.hasSysadminRole(appUser)
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(appUser.organisation.id)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }
        ValidatedParameterMap validatedBody = ParameterValidatorService.validate(request.JSON, [], ['name', 'description', 'published', 'url', 'urlCredit', 'urlCreditName'])

        try {
            ProjectTemplate projectTemplate = projectTemplateService.updateProjectTemplate(templateId, validatedBody)
            if(request.JSON.tags){
                projectTemplateService.updateProjectImageTags(templateId,request.JSON.tags)
            }
            respond projectTemplate, [status: HttpStatus.OK]
        } catch (TemplateNotFoundException e) {
            respond [:], status: HttpStatus.NOT_FOUND
        } catch (AccessDeniedException e) {
            render status: HttpStatus.FORBIDDEN
        } catch (Exception e) {
            respond [:], status: HttpStatus.BAD_REQUEST
        }
    }
}
