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
import com.juralio.organisation.OrganisationAuthorisationService
import grails.plugin.springsecurity.SpringSecurityService
import grails.plugin.springsecurity.annotation.Secured
import grails.rest.*

import static org.springframework.http.HttpStatus.FORBIDDEN
import static org.springframework.http.HttpStatus.CREATED
import static org.springframework.http.HttpStatus.OK
import static org.springframework.http.HttpStatus.UNPROCESSABLE_ENTITY

@Secured(['ROLE_KNOWLEDGE_MANAGER'])
class ProjectTemplateUserExportController {

    static final int MAX_IMPORT_BYTES = 2_000_000

    static allowedMethods = [export: 'GET', importTemplate: 'POST']

    ProjectTemplateService projectTemplateService
    TemplateResourceService templateResourceService
    ProjectTemplateExportService projectTemplateExportService
    TemplateImportValidationService templateImportValidationService
    SpringSecurityService springSecurityService
    OrganisationAuthorisationService organisationAuthorisationService
    UserRoleService userRoleService

    def export() {
        Long templateId = params.templateId as Long
        ProjectTemplate template = projectTemplateService.getProjectTemplate(templateId)

        if (!template) {
            respond([error: 'Template not found'], status: 404)
            return
        }

        AppUser appUser = springSecurityService.getCurrentUser() as AppUser
        boolean isSysadmin = userRoleService.hasSysadminRole(appUser)
        boolean orgMatches = template.organisation?.id == appUser.organisation?.id

        if (!isSysadmin && !template.isSystemTemplate && !orgMatches) {
            respond([error: 'Access denied'], status: FORBIDDEN)
            return
        }

        template.resources = templateResourceService.getResourcesForTemplate(templateId)
        template.metadata = projectTemplateExportService.getExportData(template.id)

        String safeName = template.name.replaceAll(/[^\w\-]/, '_')
        response.setHeader('Content-Disposition', "attachment; filename=\"${safeName}.json\"")
        response.contentType = 'application/json'

        respond template, [status: OK, view: '/projectTemplateExport/_projectTemplateExport']
    }

    @Secured(["hasRole('ROLE_ORG_ADMIN') and hasRole('ROLE_KNOWLEDGE_MANAGER')"])
    def importTemplate() {
        long contentLength = request.contentLengthLong
        if (contentLength == -1L) {
            respond([errorCode: 'LENGTH_REQUIRED', message: 'A Content-Length header is required'], status: 411)
            return
        }
        if (contentLength > MAX_IMPORT_BYTES) {
            respond([errorCode: 'PAYLOAD_TOO_LARGE', message: 'File exceeds the maximum allowed size of 2MB'], status: 413)
            return
        }

        AppUser appUser = springSecurityService.getCurrentUser() as AppUser

        if (!organisationAuthorisationService.organisationIsNotFrozen(appUser.organisation.id)) {
            respond([error: 'Organisation is currently frozen'], status: FORBIDDEN)
            return
        }

        if (!request.contentType?.startsWith('application/json')) {
            respond([errorCode: 'INVALID_CONTENT_TYPE', message: 'Request must be application/json'], status: UNPROCESSABLE_ENTITY)
            return
        }

        Map templateDocument
        try {
            def parsedBody = request.JSON
            if (!(parsedBody instanceof Map)) {
                respond([errorCode: 'INVALID_PAYLOAD', message: 'Request body must be a JSON object'], status: UNPROCESSABLE_ENTITY)
                return
            }
            templateDocument = parsedBody as Map
        } catch (Exception ignored) {
            respond([errorCode: 'INVALID_PAYLOAD', message: 'Request body is not valid JSON'], status: UNPROCESSABLE_ENTITY)
            return
        }

        ValidationResult validationResult = templateImportValidationService.validate(templateDocument)
        if (!validationResult.valid) {
            respond([errorCode: validationResult.errorCode, message: validationResult.errorMessage], status: UNPROCESSABLE_ENTITY)
            return
        }

        ProjectTemplate newTemplate
        try {
            newTemplate = projectTemplateExportService.importTemplate(templateDocument, appUser.organisation)
        } catch (Exception e) {
            log.error('Template JSON import failed', e)
            respond([errorCode: 'IMPORT_FAILED', message: 'Failed to import template'], status: UNPROCESSABLE_ENTITY)
            return
        }

        if (!newTemplate) {
            respond([errorCode: 'IMPORT_FAILED', message: 'Failed to import template'], status: UNPROCESSABLE_ENTITY)
            return
        }

        respond([id: newTemplate.id, name: newTemplate.name], status: CREATED)
    }
}
