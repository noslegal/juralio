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
import com.juralio.template.dao.ProjectTemplateDAOService
import com.juralio.template.dao.ProjectTemplateFavouriteDAOService
import grails.gorm.transactions.Transactional
import grails.plugin.springsecurity.SpringSecurityService

@Transactional
class ProjectTemplateFavouriteService {

    ProjectTemplateDAOService projectTemplateDAOService
    ProjectTemplateFavouriteDAOService projectTemplateFavouriteDAOService
    SpringSecurityService springSecurityService
    ProjectTemplateAuthorisationService projectTemplateAuthorisationService

    def favourite(def projectTemplateId) {
        if (!projectTemplateAuthorisationService.hasFavouriteAccess(projectTemplateId)) {
            throw new Exception()
        }
        AppUser currentUser = springSecurityService.getCurrentUser()
        ProjectTemplate projectTemplate = projectTemplateDAOService.get(projectTemplateId as Long)
        ProjectTemplateFavourite projectTemplateFavourite = new ProjectTemplateFavourite()
        projectTemplateFavourite.appUser = currentUser
        projectTemplateFavourite.projectTemplate = projectTemplate
        projectTemplateFavourite.save()
    }

    boolean isTemplateFavourited(def projectTemplateId) {
        if (!projectTemplateAuthorisationService.hasFavouriteAccess(projectTemplateId)) {
            throw new Exception()
        }
        AppUser currentUser = springSecurityService.getCurrentUser()
        boolean isFavourited = projectTemplateFavouriteDAOService.exists(projectTemplateId, currentUser.id)
        return isFavourited
    }

    def unfavourite(def projectTemplateId) {
        if (!projectTemplateAuthorisationService.hasFavouriteAccess(projectTemplateId)) {
            throw new Exception()
        }
        AppUser currentUser = springSecurityService.getCurrentUser()
        projectTemplateFavouriteDAOService.delete(projectTemplateId as long, currentUser.id)
    }

    boolean isFavourited(List<ProjectTemplateFavourite> favouriteTemplates, long templateId) {
        return favouriteTemplates.stream().filter({ t -> t.projectTemplate.id == templateId }).findFirst().isPresent()
    }
}
