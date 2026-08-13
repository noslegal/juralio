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

import grails.plugin.springsecurity.annotation.Secured

import static org.springframework.http.HttpStatus.OK

@Secured(['ROLE_USER'])
class SystemTemplateController {
    static allowedMethods = [updateSystemTemplate: "PATCH", getSystemTemplate: "GET"]
    ProjectTemplateService projectTemplateService
    SystemTemplateService systemTemplateService

    @Secured("hasRole('ROLE_SYSADMIN')")
    def updateSystemTemplate() {
        ProjectTemplate updatedTemplate = systemTemplateService.updateSystemTemplate(request.JSON as Map,params.templateId as long)
        respond updatedTemplate, [status: OK]

    }

    @Secured("hasRole('ROLE_SYSADMIN')")
    def getSystemTemplate(){
        ProjectTemplate projectTemplate = projectTemplateService.getProjectTemplate(params.templateId as long)
        respond projectTemplate, [status: OK]
    }
}
