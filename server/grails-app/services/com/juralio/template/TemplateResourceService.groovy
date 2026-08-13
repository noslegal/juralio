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

import com.juralio.common.ValidatedParameterMap
import com.juralio.templateResource.TemplateResource
import grails.gorm.transactions.Transactional

@Transactional
class TemplateResourceService {
    TemplateResourceAuthorisationService templateResourceAuthorisationService

    List<TemplateResource> getResourcesForTemplate(Long templateId) {
        if (!templateResourceAuthorisationService.hasReadAccess(templateId)) {
            throw new Exception()
        }
        List<TemplateResource> resources = TemplateResource.findAllByTemplateId(templateId)
        return sortResourcesByRecency(resources)
    }

    TemplateResource addResourceToTemplate(ValidatedParameterMap params, Long templateId) {
        if (!templateResourceAuthorisationService.hasCreateAccess(templateId)) {
            throw new Exception()
        }
        TemplateResource newResource = new TemplateResource()
        newResource.properties = params
        newResource.templateId = templateId
        newResource.save()
        return newResource
    }

    TemplateResource updateTemplateResource(Long resourceId, ValidatedParameterMap params, Long templateId) {
        if (!templateResourceAuthorisationService.hasUpdateAccess(templateId)) {
            throw new Exception()
        }
        TemplateResource resource = TemplateResource.findById(resourceId)
        resource.properties = params
        resource.templateId = templateId
        resource.save()
        return resource
    }

    TemplateResource getResource(Long templateId, Long resourceId) {
        if(!templateResourceAuthorisationService.hasReadAccess(templateId)){
            throw new Exception()
        }
        TemplateResource resource = TemplateResource.findById(resourceId)
        if (resource.templateId != templateId) {
            throw new Exception('resource not part of requested template')
        }
        return resource
    }

    void deleteResource(Long templateId, Long resourceId) {
        if (!templateResourceAuthorisationService.hasUpdateAccess(templateId)) {
            throw new Exception()
        }
        TemplateResource resource = TemplateResource.findById(resourceId)
        if (resource.templateId != templateId) {
            throw new Exception('resource not part of requested template')
        }
        resource.delete()
    }

    TemplateResource copyResource(Long originalTemplateId, Long resourceId, Long templateId) {
        if (!templateResourceAuthorisationService.hasCreateAccess(templateId)) {
            throw new Exception()
        }
        TemplateResource existingResource = getResource(originalTemplateId,resourceId)

        TemplateResource newResource = new TemplateResource()
        newResource.properties = existingResource.properties
        newResource.templateId = templateId
        newResource.save()
        return newResource
    }

    private static List<TemplateResource> sortResourcesByRecency(List<TemplateResource> resources) {
        return resources.sort { it.lastUpdated }
    }
}
