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

package server

import com.juralio.auth.AppUser
import com.juralio.auth.UserRoleService
import com.juralio.common.ParameterValidatorService
import com.juralio.common.ValidatedParameterMap
import com.juralio.linkresource.LinkResource
import com.juralio.linkresource.LinkResourceService
import com.juralio.organisation.OrganisationAuthorisationService
import com.juralio.project.Project
import com.juralio.project.ProjectService
import grails.plugin.springsecurity.SpringSecurityService
import grails.plugin.springsecurity.annotation.Secured
import org.springframework.http.HttpStatus

@Secured(['IS_AUTHENTICATED_FULLY'])
class LinkResourceController {

    static allowedMethods = [index: "GET", save: "POST", patch: "PATCH", delete: "DELETE", listforMatter: 'GET', saveToMatter: 'POST', visit: 'POST', getMatterWorkstreamResources: 'GET']

    LinkResourceService linkResourceService
    ProjectService projectService
    SpringSecurityService springSecurityService
    UserRoleService userRoleService
    OrganisationAuthorisationService organisationAuthorisationService

    def index() {
        try {
            List<LinkResource> linkResources = linkResourceService.getLinkResourcesForMatter(params.matter_id as long)
            Boolean hasTreeRelatedResources = false
            if (params.project_id && params.project_id.isNumber()) {
                Project project = projectService.getProject(params.project_id as long)
                if (!projectService.canAccessPrivateWorkstream(project)) {
                    throw new Exception('Cannot access workstream')
                }
                //workstream view
                Integer matterLevelResourceCount = linkResources.findAll { it.matterId == params.matter_id as Long && it.workstreamId == null }.size()
                linkResources = linkResources.findAll { it.workstreamId == params.project_id as Long }
                if (matterLevelResourceCount > 0) {
                    hasTreeRelatedResources = true
                }
            } else {
                //matter view
                Integer workstreamLevelResourceCount = linkResources.findAll { it.matterId == params.matter_id as Long && it.workstreamId != null }.size()
                linkResources = linkResources.findAll { it.workstreamId == null }
                if (workstreamLevelResourceCount > 0) {
                    hasTreeRelatedResources = true
                }
            }

            HashMap linkResourceObject = new HashMap()
            linkResourceObject.put('linkResources', linkResources)
            linkResourceObject.put('hasTreeRelatedResources', hasTreeRelatedResources)

            respond linkResourceObject
        } catch (Exception ignored) {
            respond [:], status: HttpStatus.BAD_REQUEST
        }
    }

    def save() {
        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
        boolean isSysadmin = userRoleService.hasSysadminRole(currentUser)
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(currentUser.organisationId)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }
        try {
            ValidatedParameterMap validatedParameters = ParameterValidatorService.validate(request.JSON as Map,
                    ['name', 'url', 'image'], [])
            if (params.project_id && params.project_id.isNumber()) {
                Project project = projectService.getProject(params.project_id as long)
                if (!projectService.canAccessPrivateWorkstream(project)) {
                    throw new Exception('Cannot access workstream')
                }
            }
            LinkResource newResource = linkResourceService.save(params.matter_id as long, params.project_id as String, validatedParameters)
            respond newResource, [status: HttpStatus.OK, view: 'linkResource/_linkResource']
        } catch (Exception ignored) {
            respond [:], status: HttpStatus.BAD_REQUEST
        }
    }

    def patch() {
        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
        boolean isSysadmin = userRoleService.hasSysadminRole(currentUser)
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(currentUser.organisationId)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }
        try {
            ValidatedParameterMap validatedParameters = ParameterValidatorService.validate(request.JSON as Map,
                    [],
                    ['name', 'url', 'image', 'matterId', 'workstreamId'])
            if (params.project_id && params.project_id.isNumber()) {
                Project project = projectService.getProject(params.project_id as long)
                if (!projectService.canAccessPrivateWorkstream(project)) {
                    throw new Exception('Cannot access workstream')
                }
            }
            linkResourceService.update(params.matter_id, params.project_id, validatedParameters)
        } catch (Exception ignored) {
            respond [:], status: HttpStatus.BAD_REQUEST
        }
    }

    def delete() {
        AppUser currentUser = springSecurityService.getCurrentUser() as AppUser
        boolean isSysadmin = userRoleService.hasSysadminRole(currentUser)
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(currentUser.organisationId)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }
        if (params.project_id && params.project_id.isNumber()) {
            Project project = projectService.getProject(params.project_id as long)
            if (!projectService.canAccessPrivateWorkstream(project)) {
                throw new Exception('Cannot access workstream')
            }
        }
        try {
            linkResourceService.delete(params.matter_id as long,params.project_id, params.id as long)
            respond [:], status: HttpStatus.OK
        } catch (Exception ignored) {
            respond [:], status: HttpStatus.BAD_REQUEST
        }
    }

    def visit() {
        try {
            linkResourceService.visit(params.id as long)
            respond [:], status: HttpStatus.OK
        } catch(Exception e) {
            respond [:], status: HttpStatus.FORBIDDEN
        }
    }

    def getMatterWorkstreamResources() {
        List<LinkResource> linkResources = linkResourceService.getLinkResourcesForMatter(params.matter_id as long)
        respond linkResources.findAll { it.workstreamId != null }, [status: HttpStatus.OK, view: 'linkResource/_linkResourceList']
    }
}
