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

package com.juralio.costs

import com.juralio.auth.AppUser
import com.juralio.auth.UserAuthorisationService
import com.juralio.auth.UserRoleService
import com.juralio.common.ParameterValidatorService
import com.juralio.common.ValidatedParameterMap
import com.juralio.organisation.Organisation
import com.juralio.organisation.OrganisationAuthorisationService
import com.juralio.organisation.OrganisationService
import com.juralio.organisation.dao.OrganisationDAOService
import grails.plugin.springsecurity.SpringSecurityService
import grails.plugin.springsecurity.annotation.Secured
import org.springframework.http.HttpStatus

@Secured('IS_AUTHENTICATED_FULLY')
class GradeCategoryController {
    static allowedMethods = [index: "GET", save: "POST", show: "POST", update: "PATCH", delete: "DELETE"]

    SpringSecurityService springSecurityService
    UserRoleService userRoleService
    GradeCategoryService gradeCategoryService
    OrganisationService organisationService
    OrganisationDAOService organisationDAOService
    UserAuthorisationService userAuthorisationService
    OrganisationAuthorisationService organisationAuthorisationService

    @Secured("hasRole('ROLE_ORG_ADMIN')")
    def index(long id) {
        GradeCategory category = gradeCategoryService.getCategory(id)
        AppUser currentUser = springSecurityService.getCurrentUser()
        boolean isSysadmin = userRoleService.hasSysadminRole(currentUser)
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(currentUser.organisationId)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }else if(isSysadmin){
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }
        if (category) {
            respond category, [Status: HttpStatus.OK, view: '/gradeCategory/_gradeCategory']
        } else {
            respond [:], status: HttpStatus.BAD_REQUEST
        }
    }

    @Secured("hasRole('ROLE_ORG_ADMIN')")
    def show() {
        AppUser currentUser = springSecurityService.getCurrentUser()
        boolean isSysadmin = userRoleService.hasSysadminRole(currentUser)
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(currentUser.organisationId)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }else if(isSysadmin){
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }
        if (currentUser.organisation) {
            ValidatedParameterMap validatedBody = ParameterValidatorService.validate(request.JSON, [], ['position'])
            List<GradeCategory> organisationCategories = gradeCategoryService.organisationPositionCategories(currentUser.organisation, validatedBody.position)
            if (organisationCategories) {
                organisationCategories.sort(it->it.id)
                respond organisationCategories, [Status: HttpStatus.OK, view: '/gradeCategory/_gradeCategoryList']
            } else {
                respond [:], status: HttpStatus.BAD_REQUEST
            }
        }
    }

    @Secured("hasRole('ROLE_ORG_ADMIN') ")
    def save() {
        try {
            AppUser currentUser = springSecurityService.getCurrentUser()
            boolean isSysadmin = userRoleService.hasSysadminRole(currentUser)
            if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(currentUser.organisationId)) {
                respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
                return
            }else if(isSysadmin){
                throw new Exception('Forbidden from accessing this information')
            }
            if (userRoleService.hasOrgAdminRole(currentUser)) {
                ValidatedParameterMap validatedBody = ParameterValidatorService.validate(request.JSON, [], ['name','colour_idx','position'])
                if (!validatedBody.name) {
                    respond [:], status: HttpStatus.BAD_REQUEST
                } else {
                    if (currentUser.organisation) {
                        if (validatedBody.name && (validatedBody.name == '' || validatedBody.name.length() > 20)) {
                            respond [:], status: HttpStatus.BAD_REQUEST
                        }
                        respond gradeCategoryService.createGradeCategory(validatedBody, currentUser,currentUser.organisation)
                    } else {
                        respond [:], status: HttpStatus.BAD_REQUEST
                    }
                }
            } else {
                respond [:], status: HttpStatus.FORBIDDEN
            }
        } catch (Exception e) {
            respond [:], status: HttpStatus.FORBIDDEN
        }
    }

    @Secured("hasRole('ROLE_ORG_ADMIN')")
    def update(long id) {
        try {
            GradeCategory categoryToUpdate = gradeCategoryService.getCategory(id)
            AppUser currentUser = springSecurityService.getCurrentUser()
            boolean isSysadmin = userRoleService.hasSysadminRole(currentUser)
            if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(currentUser.organisationId)) {
                respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
                return
            }else if(isSysadmin){
                throw new Exception('Forbidden from accessing this information')
            }
            if (currentUser && currentUser.organisation.id != categoryToUpdate.organisation.id) {
                throw new Exception('Forbidden from accessing this information')
            }
            if (userRoleService.hasOrgAdminRole(currentUser)) {
                if (categoryToUpdate) {
                    ValidatedParameterMap validatedBody = ParameterValidatorService.validate(request.JSON, [], ['name'])
                    if (validatedBody.name == '' || validatedBody.name.length() > 20) {
                        respond [:], status: HttpStatus.BAD_REQUEST
                    } else {
                        respond gradeCategoryService.updateGradeCategory(validatedBody, categoryToUpdate)
                    }
                } else {
                    respond [:], status: HttpStatus.BAD_REQUEST
                }
            } else {
                respond [:], status: HttpStatus.FORBIDDEN
            }
        } catch (Exception e) {
            respond [:], status: HttpStatus.FORBIDDEN
        }
    }

    @Secured("hasRole('ROLE_ORG_ADMIN')")
    def delete(long id) {
        try {
            GradeCategory gradeCategoryToDelete = gradeCategoryService.getCategory(id)
            AppUser currentUser = springSecurityService.getCurrentUser()
            boolean isSysadmin = userRoleService.hasSysadminRole(currentUser)
            if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(currentUser.organisationId)) {
                respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
                return
            }else if(isSysadmin){
                throw new Exception('Forbidden from accessing this information')
            }
            if (!gradeCategoryToDelete) {
                throw new Exception()
            }
            if (currentUser && currentUser.organisation.id != gradeCategoryToDelete.organisationId) {
                throw new Exception('Forbidden from accessing this information')
            }
            gradeCategoryService.deleteGradeCategory(gradeCategoryToDelete)
            respond [:], status: HttpStatus.OK
        } catch (Exception e) {
            respond [:], status: HttpStatus.FORBIDDEN
        }
    }
}
