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
import com.juralio.common.ValidatedParameterMap
import com.juralio.costs.dao.GradeCategoryDAOService
import com.juralio.organisation.Organisation
import com.juralio.organisationgroup.GroupPosition
import com.juralio.organisationgroup.dao.GroupPositionDAOService
import grails.gorm.transactions.Transactional

@Transactional
class GradeCategoryService {
    GradeCategoryDAOService gradeCategoryDAOService
    GradeService gradeService
    GroupPositionDAOService groupPositionDAOService

    GradeCategory getCategory(long id) {
        return gradeCategoryDAOService.getCategory(id)
    }

    List<GradeCategory> organisationCategories(Organisation org){
        return gradeCategoryDAOService.getCategoriesForOrganisation(org)
    }

    List<GradeCategory> organisationPositionCategories(Organisation org,def positionId){
        def position = groupPositionDAOService.getPosition(positionId)
        return gradeCategoryDAOService.getCategoriesForOrganisationAndPosition(org,position)
    }

    def createGradeCategory(ValidatedParameterMap validatedParams, AppUser currentUser,Organisation org) {
        GradeCategory newCategory = new GradeCategory(name: validatedParams.name)
        if (validatedParams.colour_idx != null) {
            newCategory.colour_idx = validatedParams.colour_idx as int
        }
        newCategory.organisation = currentUser.organisation
        // Grade categories are position-scoped: honour an explicit position,
        // defaulting to Advisor (mirrors generateDefaults and createGrade).
        newCategory.groupPosition = validatedParams.position == GroupPosition.findByOrganisationAndName(org, 'Client').id ? GroupPosition.findByOrganisationAndName(org, 'Client') : GroupPosition.findByOrganisationAndName(org, 'Advisor')

        List<GradeCategory> currentCategories= organisationCategories(org)
        if(currentCategories.size()>9){
            throw new Exception()
        }
        def savedCategory = gradeCategoryDAOService.save(newCategory)

        return savedCategory
    }

    def updateGradeCategory(ValidatedParameterMap params, GradeCategory category){
        if(params.name){
            category.name = params.name
        }
        def savedCategory = gradeCategoryDAOService.save(category)

        return savedCategory
    }

    def deleteGradeCategory(GradeCategory gradeCategoryToDelete){
        if(organisationCategories(gradeCategoryToDelete.organisation).size()==1){
            throw new Exception()
        }
        List<Grade>gradeList = gradeService.organisationGrades(gradeCategoryToDelete.organisation)
        if(gradeList.findAll(x->x.gradeCategory == gradeCategoryToDelete).size()>0)
        {
            throw new Exception()
        }
        gradeCategoryDAOService.delete(gradeCategoryToDelete)
    }

    def generateGradeCategoryDefaults(Organisation org,def validatedBody) {
        ArrayList<GradeCategory> list = new ArrayList<GradeCategory>()
        list.add(new GradeCategory(name:"Partners", organisation:org, colour_idx: 1,groupPosition:validatedBody.position== GroupPosition.findByOrganisationAndName(org, 'Client').id ? GroupPosition.findByOrganisationAndName(org, 'Client') :GroupPosition.findByOrganisationAndName(org, 'Advisor')))
        list.add(new GradeCategory(name:"Senior Lawyers", organisation:org, colour_idx: 2,groupPosition:validatedBody.position== GroupPosition.findByOrganisationAndName(org, 'Client').id ? GroupPosition.findByOrganisationAndName(org, 'Client') :GroupPosition.findByOrganisationAndName(org, 'Advisor')))
        list.add(new GradeCategory(name:"Mid Lawyers", organisation:org, colour_idx: 3,groupPosition:validatedBody.position== GroupPosition.findByOrganisationAndName(org, 'Client').id ? GroupPosition.findByOrganisationAndName(org, 'Client') :GroupPosition.findByOrganisationAndName(org, 'Advisor')))
        list.add(new GradeCategory(name:"Junior Lawyers", organisation:org, colour_idx: 4,groupPosition:validatedBody.position== GroupPosition.findByOrganisationAndName(org, 'Client').id ? GroupPosition.findByOrganisationAndName(org, 'Client') :GroupPosition.findByOrganisationAndName(org, 'Advisor')))
        list.add(new GradeCategory(name:"Legal Executives", organisation:org, colour_idx: 5,groupPosition:validatedBody.position== GroupPosition.findByOrganisationAndName(org, 'Client').id ? GroupPosition.findByOrganisationAndName(org, 'Client') :GroupPosition.findByOrganisationAndName(org, 'Advisor')))
        list.each {it.save()}
        return list
    }
}
