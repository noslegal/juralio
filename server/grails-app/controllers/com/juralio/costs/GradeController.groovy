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
import com.juralio.matter.CostsAuthorisationService
import com.juralio.matter.Matter
import com.juralio.matter.MatterAuthorisationService
import com.juralio.matter.MatterService
import com.juralio.organisation.Organisation
import com.juralio.organisation.OrganisationAuthorisationService
import com.juralio.organisation.OrganisationService
import com.juralio.organisation.dao.OrganisationDAOService
import com.juralio.organisationgroup.OrganisationGroup
import grails.plugin.springsecurity.SpringSecurityService
import grails.plugin.springsecurity.annotation.Secured
import org.springframework.http.HttpStatus
import org.springframework.security.access.AccessDeniedException

@Secured(['IS_AUTHENTICATED_FULLY'])
class GradeController {
    static allowedMethods = [index: "GET", save: "POST", show: "POST", update: "PATCH", delete: "DELETE", generateDefaults: "POST",getGradesFromRTD: "GET"]

    SpringSecurityService springSecurityService
    UserRoleService userRoleService
    GradeService gradeService
    OrganisationDAOService organisationDAOService
    GradeCategoryService gradeCategoryService
    MatterService matterService
    CostsAuthorisationService costsAuthorisationService
    OrganisationAuthorisationService organisationAuthorisationService
    MatterAuthorisationService matterAuthorisationService

    @Secured("hasRole('ROLE_ORG_ADMIN')")
    def index(long id) {
        Grade grade = gradeService.getGrade(id)
        AppUser currentUser = springSecurityService.getCurrentUser()
        boolean isSysadmin = userRoleService.hasSysadminRole(currentUser)
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(currentUser.organisationId)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }else if(isSysadmin){
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }
        if (grade) {
            respond grade, [Status: HttpStatus.OK, view: '/grade/_grade']
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
            List<Grade> organisationGrades = gradeService.organisationPositionGrades(currentUser.organisation, validatedBody.position)
            organisationGrades.sort { it.grade_idx }
            if (organisationGrades) {
                respond organisationGrades, [Status: HttpStatus.OK, view: '/grade/_gradeList']
            } else {
                respond [:], status: HttpStatus.BAD_REQUEST
            }
        }
    }

    @Secured("hasRole('ROLE_ORG_ADMIN')")
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
                ValidatedParameterMap validatedBody = ParameterValidatorService.validate(request.JSON, [], ['name', 'categoryId', 'grade_idx', 'position'])
                if (!validatedBody.name) {
                    respond [:], status: HttpStatus.BAD_REQUEST
                } else {
                    if (currentUser.organisation) {
                        if (validatedBody.name && (validatedBody.name == '' || validatedBody.name.length() > 20)) {
                            respond [:], status: HttpStatus.BAD_REQUEST
                        }
                        Grade newGrade = gradeService.createGrade(validatedBody, currentUser.organisation, currentUser)
                        respond newGrade, [Status: HttpStatus.OK, view: '/grade/_grade']
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
            Grade gradeToUpdate = gradeService.getGrade(id)
            AppUser currentUser = springSecurityService.getCurrentUser()
            boolean isSysadmin = userRoleService.hasSysadminRole(currentUser)
            if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(currentUser.organisationId)) {
                respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
                return
            }else if(isSysadmin){
                throw new Exception('Forbidden from accessing this information')
            }
            if (userRoleService.hasOrgAdminRole(currentUser)) {
                if (gradeToUpdate) {
                    if (currentUser && currentUser.organisation.id != gradeToUpdate.organisation.id) {
                        throw new Exception('Forbidden from accessing this information')
                    }
                    ValidatedParameterMap validatedBody = ParameterValidatorService.validate(request.JSON, [], ['name', 'categoryId', 'gradeOrderList'])
                    if (validatedBody.gradeOrderList) {
                        gradeService.updateGradeOrder(validatedBody, currentUser.organisationId)
                        respond [:], status: HttpStatus.OK
                    }
                    if (validatedBody.name && (validatedBody.name == '' || validatedBody.name.length() > 20)) {
                        respond [:], status: HttpStatus.BAD_REQUEST
                    } else {
                        respond gradeService.updateGrade(validatedBody, gradeToUpdate)
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
    def generateDefaults(long orgId) {
        AppUser currentUser = springSecurityService.getCurrentUser()
        boolean isSysadmin = userRoleService.hasSysadminRole(currentUser)
        if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(currentUser.organisationId)) {
            respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
            return
        }else if(isSysadmin){
            throw new Exception('Forbidden from accessing this information')
        }
        if (userRoleService.hasOrgAdminRole(currentUser)) {
            Organisation organisation = organisationDAOService.getOrganisation(currentUser.organisationId)
            if (currentUser && currentUser.organisation.id != orgId) {
                throw new Exception('Forbidden from accessing this information')
            }
            if (organisation) {
                ValidatedParameterMap validatedBody = ParameterValidatorService.validate(request.JSON, [], ['position'])
                List<GradeCategory> orgGradeCategory = gradeCategoryService.organisationPositionCategories(organisation,validatedBody.position)
                List<Grade> orgGrade = gradeService.organisationPositionGrades(organisation,validatedBody.position)
                if (orgGradeCategory.size() == 0 && orgGrade.size() == 0) {
                    respond gradeService.generateDefaults(organisation,validatedBody)
                }

            } else {
                respond [:], status: HttpStatus.BAD_REQUEST
            }
        } else {
            respond [:], status: HttpStatus.FORBIDDEN
        }

    }

    @Secured("hasRole('ROLE_ORG_ADMIN')")
    def delete(long id) {
        try {
            Grade gradeToDelete = gradeService.getGrade(id)
            AppUser currentUser = springSecurityService.getCurrentUser()
            boolean isSysadmin = userRoleService.hasSysadminRole(currentUser)
            if (!isSysadmin && !organisationAuthorisationService.organisationIsNotFrozen(currentUser.organisationId)) {
                respond([text: 'Organisation is currently frozen'], status: HttpStatus.FORBIDDEN)
                return
            }else if(isSysadmin){
                throw new Exception('Forbidden from accessing this information')
            }
            if (!gradeToDelete) {
                throw new Exception()
            }
            if (currentUser && currentUser.organisation.id != gradeToDelete.organisationId) {
                throw new Exception('Forbidden from accessing this information')
            }
            gradeService.deleteGrade(gradeToDelete)
            respond [:], status: HttpStatus.OK
        } catch (Exception e) {
            respond [:], status: HttpStatus.FORBIDDEN
        }
    }

    def getGradesFromRTD(long matter_id){
        AppUser currentUser = springSecurityService.getCurrentUser()
        try {
            Matter matter = matterService.getMatter(matter_id)
            if (costsAuthorisationService.orgCostsSetupForMatterPosition(currentUser, matter) && matterAuthorisationService.hasCostsAndUpdateAccess(matter_id)) {
                List<Grade> gradeList = gradeService.getGradesForRTD(matter)
                respond gradeList
            } else {
                throw new Exception()
            }
        }
        catch (Exception exception) {
            render status: HttpStatus.BAD_REQUEST
        }
    }
}
