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

package com.juralio.template.dao

import com.juralio.auth.AppUser
import com.juralio.auth.UserRoleService
import com.juralio.template.ProjectTemplate
import grails.gorm.transactions.Transactional
import grails.plugin.springsecurity.SpringSecurityService
import groovy.transform.CompileDynamic
import groovy.transform.CompileStatic

@CompileStatic
@Transactional
class ProjectTemplateDAOService {

    SpringSecurityService springSecurityService
    UserRoleService userRoleService

    @CompileDynamic
    List<ProjectTemplate> getTemplates(Boolean filterOutDrafts = true) {
        AppUser user = springSecurityService.getCurrentUser() as AppUser
        List<ProjectTemplate> publishedSystemTemplates = ProjectTemplate.findAllByArchivedAndPublishedAndIsSystemTemplate(
                false,
                true,
                true,
                [sort: 'dateCreated', order: 'desc'])

        if (userRoleService.hasSystemTemplateManagerRole(user)) {
            return filterOutDrafts ? publishedSystemTemplates :
                    ProjectTemplate.findAllByArchivedAndIsSystemTemplate(
                            false,
                            true,
                            [sort: 'dateCreated', order: 'desc'])
        } else {
            List<ProjectTemplate> orgTemplates = filterOutDrafts ?
                    ProjectTemplate.findAllByArchivedAndPublishedAndOrganisation(
                            false,
                            true,
                            user.organisation,
                            [sort: 'dateCreated', order: 'desc']) :
                    ProjectTemplate.findAllByArchivedAndOrganisation(
                            false,
                            user.organisation,
                            [sort: 'dateCreated', order: 'desc'])
            List<ProjectTemplate> templates = orgTemplates + publishedSystemTemplates
            return templates.sort { a, b -> b.dateCreated <=> a.dateCreated }
        }
    }

    ProjectTemplate get(long id) {
        return ProjectTemplate.get(id)
    }

    void delete(ProjectTemplate template) {
        template.archived = true
    }

    ProjectTemplate create(String templateName) {
        AppUser user = springSecurityService.getCurrentUser() as AppUser
        ProjectTemplate result = new ProjectTemplate(name: templateName)
        result.organisation = user.organisation

        return result
    }
}
