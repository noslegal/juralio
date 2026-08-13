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

package com.juralio.project.admin

import com.juralio.auth.AppUser
import com.juralio.auth.UserRoleService
import com.juralio.common.ParameterValidatorService
import com.juralio.common.ValidatedParameterMap
import com.juralio.common.error.CustomErrors
import com.juralio.matter.Matter
import com.juralio.matter.MatterService
import com.juralio.matter.MatterStatus
import com.juralio.organisation.OrganisationAuthorisationService
import com.juralio.project.Project
import com.juralio.project.ProjectService
import com.juralio.project.dao.ProjectDAOService
import grails.plugin.springsecurity.SpringSecurityService
import grails.plugin.springsecurity.annotation.Secured
import org.springframework.http.HttpStatus
import org.springframework.validation.Errors
import org.springframework.validation.FieldError
import org.springframework.validation.ObjectError

@Secured(['IS_AUTHENTICATED_FULLY'])
class ProjectAdminController {

    static allowedMethods = [update: "PATCH"]

    ProjectService projectService
    ProjectAdminService projectAdminService
    ProjectDAOService projectDAOService
    SpringSecurityService springSecurityService
    MatterService matterService
    UserRoleService userRoleService
    OrganisationAuthorisationService organisationAuthorisationService
    List<String> permittedParameters = ['description']
    List<String> restrictedParameters = ['name', 'active', 'isPrivate']

    def update() {
        AppUser currentUser = springSecurityService.getCurrentUser()
        Project projectToUpdate = projectDAOService.get(params.project_id as long)

        boolean isSysadmin = userRoleService.hasSysadminRole(currentUser)
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(currentUser.organisationId)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }
        if (params.matter_id as long != projectToUpdate.matter.id as long) {
            respond [:], status: HttpStatus.NOT_FOUND
            return
        }

        Matter matter = matterService.getMatterOnly(params.matter_id as long)
        if(matter && matter.matterStatus == MatterStatus.PENDING_DELETION.value()) {
            respond [:],status: HttpStatus.NOT_FOUND
            return
        }

        if (matterService.isMatterAdmin(projectToUpdate.matterId, currentUser.id)) {
            permittedParameters = permittedParameters + restrictedParameters
        }

        ValidatedParameterMap parameters = ParameterValidatorService.validate(request.JSON, [], permittedParameters)

        Errors validationErrors = validateDuplicateProjectName(parameters)
        if (validationErrors) {
            respond validationErrors, [status: HttpStatus.BAD_REQUEST]
        } else {
            respond projectAdminService.updateProject(projectToUpdate, parameters), [status: HttpStatus.OK, view: "/project/_projectWithTaskCounts"]
        }
    }

    def validateDuplicateProjectName(def parameters) {
        if (parameters.name && projectService.getProjectsByUser(true).find {
            it.matter.id == params.matter_id as long && it.name == parameters.name
        }) {
            Errors errors = new CustomErrors(Project.class.toString())
            ObjectError error = new FieldError(Project.class.toString(),
                    'name', null, false, ["unique"] as String[], null, 'Workstream already exists')
            errors.addError(error)
            return errors
        }
        return null
    }
}