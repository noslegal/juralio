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
import com.juralio.common.ParameterValidatorService
import com.juralio.common.ValidatedParameterMap
import com.juralio.organisation.OrganisationAuthorisationService
import com.juralio.templateResource.TemplateResource
import grails.plugin.springsecurity.SpringSecurityService
import grails.plugin.springsecurity.annotation.Secured
import org.springframework.http.HttpStatus

@Secured(['IS_AUTHENTICATED_FULLY'])
class TemplateResourceController {
    static allowedMethods = [addResource: 'POST', listResources: 'GET', updateResource: 'PATCH', getResource: 'GET', deleteResource: 'DELETE']
    TemplateResourceService templateResourceService
    SpringSecurityService springSecurityService
    UserRoleService userRoleService
    OrganisationAuthorisationService organisationAuthorisationService

    def addResource() {
        AppUser appUser = springSecurityService.getCurrentUser()
        boolean isSysadmin = userRoleService.hasSysadminRole(appUser)
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(appUser.organisation.id)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }
        ValidatedParameterMap validatedParams = ParameterValidatorService.validate(request.JSON as Map, ['name', 'url'], ['image'])
        TemplateResource resource = templateResourceService.addResourceToTemplate(validatedParams, params.templateId as Long)
        respond resource, status: HttpStatus.CREATED
    }

    def listResources() {
        List<TemplateResource> resources = templateResourceService.getResourcesForTemplate(params.templateId as Long)
        respond resources, status: HttpStatus.OK
    }

    def updateResource() {
        AppUser appUser = springSecurityService.getCurrentUser()
        boolean isSysadmin = userRoleService.hasSysadminRole(appUser)
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(appUser.organisation.id)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }
        ValidatedParameterMap validatedParams = ParameterValidatorService.validate(request.JSON as Map, [], ['name', 'url', 'image'])
        TemplateResource updatedResource = templateResourceService.updateTemplateResource(params.id as Long, validatedParams, params.templateId as Long)
        respond updatedResource, status: HttpStatus.OK

    }

    def getResource() {
        try {
            TemplateResource resource = templateResourceService.getResource(params.templateId as Long, params.id as Long)
            respond resource, status: HttpStatus.OK
        } catch (Exception ignored) {
            respond [:], status: HttpStatus.BAD_REQUEST
        }

    }

    def deleteResource() {
        AppUser appUser = springSecurityService.getCurrentUser()
        boolean isSysadmin = userRoleService.hasSysadminRole(appUser)
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(appUser.organisation.id)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }
        try {
            templateResourceService.deleteResource(params.templateId as Long, params.id as Long)
            respond [:], status: HttpStatus.NO_CONTENT
        } catch (Exception ignored) {
            respond [:], status: HttpStatus.BAD_REQUEST
        }
    }
}
