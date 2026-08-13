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
import com.juralio.auth.BaseAuthorisationService
import com.juralio.auth.UserRoleService
import groovy.transform.CompileStatic

@CompileStatic
class ProjectTemplateAuthorisationService extends BaseAuthorisationService {

    UserRoleService userRoleService

    boolean hasFavouriteAccess(def entityId){
        AppUser user = getUser()
        if (!isNotExternalUser()) {
            return false
        }
        ProjectTemplate template = ProjectTemplate.get(entityId as Long)
        if (template.isSystemTemplate && (!userRoleService.hasSystemTemplateManagerRole(user) && !template.published)) {
            return false
        }
        if (!template.isSystemTemplate && !template.published && !userRoleService.hasKnowledgeManagerRole(user)) {
            return false
        }
        if (template.isSystemTemplate && template.published) {
            return true
        }
        if (user.organisation != null && template.organisation != null) {
            return user.organisation?.id == template.organisation.id
        } else {
            return userRoleService.hasSystemTemplateManagerRole(user) && template.isSystemTemplate
        }
    }

    boolean hasReadAccess(Long entityId) {
        AppUser user = getUser()
        if (!isNotExternalUser()) {
            return false
        }
        ProjectTemplate template = ProjectTemplate.get(entityId)

        if(template.published && userRoleService.hasSysadminRole(user)){ //temp
            return true
        }
       if (template.isSystemTemplate && (!userRoleService.hasSystemTemplateManagerRole(user) && !template.published)) {
           return false
       }
        if (!template.isSystemTemplate && !template.published && !userRoleService.hasKnowledgeManagerRole(user)) {
            return false
        }
        if (template.isSystemTemplate && template.published) {
            return true
        }
        if (user.organisation != null && template.organisation != null) {
            return user.organisation?.id == template.organisation.id
        } else {
            return userRoleService.hasSystemTemplateManagerRole(user) && template.isSystemTemplate
        }

        return false
    }

    boolean hasWriteAccess(Long entityId) {
        ProjectTemplate template = ProjectTemplate.get(entityId)
        if (template.isSystemTemplate && !userRoleService.hasSystemTemplateManagerRole(user)) {
            return false
        }
        if (!template.isSystemTemplate && !userRoleService.hasKnowledgeManagerRole(user)) {
            return false
        }
        return hasReadAccess(entityId) && hasCreateAccess()
    }

    boolean hasCreateAccess() {
        AppUser user = getUser()
        return userRoleService.hasKnowledgeManagerRole(user) || userRoleService.hasSystemTemplateManagerRole(user) || userRoleService.hasSysadminRole(user)//temp
    }

    boolean isNotExternalUser() {
        AppUser user = getUser()
        return user.externalUser == null
    }
}