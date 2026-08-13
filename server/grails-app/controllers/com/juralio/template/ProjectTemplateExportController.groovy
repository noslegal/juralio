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

import com.juralio.auth.provider.UserAuthenticationProvider
import com.juralio.auth.token.UserAuthenticationToken
import com.juralio.config.ConfigService
import grails.plugin.springsecurity.annotation.Secured
import grails.rest.*
import grails.converters.*
import org.springframework.security.core.context.SecurityContext
import org.springframework.security.core.context.SecurityContextHolder

import java.nio.charset.StandardCharsets
import java.security.MessageDigest

import static org.springframework.http.HttpStatus.CREATED
import static org.springframework.http.HttpStatus.FORBIDDEN
import static org.springframework.http.HttpStatus.OK

@Secured(['IS_AUTHENTICATED_ANONYMOUSLY'])
class ProjectTemplateExportController {
    static allowedMethods = [export: "GET", importTemplate:'POST']
    ProjectTemplateService projectTemplateService
    TemplateResourceService templateResourceService
    ProjectTemplateExportService projectTemplateExportService
    ConfigService configService

    @Secured("hasRole('ROLE_SYSADMIN')")
    def export() {
        Long templateId = params.templateId as Long
        ProjectTemplate template = projectTemplateService.getProjectTemplate(templateId)
        template.resources = templateResourceService.getResourcesForTemplate(templateId)
        template.metadata = projectTemplateExportService.getExportData(template.id)
        respond template, [status: OK, view: '/projectTemplateExport/_projectTemplateExport']
    }


    def importTemplate() {
        String configuredKey = configService.templateImportAccessKey
        String suppliedKey = request.getHeader('accessKey')

        // Fail closed: with no key configured the endpoint is unusable rather than open.
        // NB use `render status:` rather than `respond ..., [status:]` — the latter puts the
        // status in the response *body* and still returns HTTP 200.
        if (!configuredKey) {
            log.warn('Template import rejected: TEMPLATE_IMPORT_ACCESS_KEY is not configured')
            render status: FORBIDDEN
            return
        }

        if (!suppliedKey || !MessageDigest.isEqual(
                suppliedKey.getBytes(StandardCharsets.UTF_8),
                configuredKey.getBytes(StandardCharsets.UTF_8))) {
            render status: FORBIDDEN
            return
        }

        ProjectTemplate template = projectTemplateExportService.importTemplate(request.JSON as Map)
        respond template, [status: CREATED]
    }
}
