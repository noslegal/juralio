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
import com.juralio.costs.dao.GradeDAOService
import com.juralio.costs.dao.RateDAOService
import com.juralio.matter.Matter
import com.juralio.matter.MatterAuthorisationService
import com.juralio.organisation.Organisation
import com.juralio.organisationgroup.GroupPosition
import com.juralio.organisationgroup.dao.GroupPositionDAOService
import grails.gorm.transactions.Transactional

@Transactional
class GradeService {
    GradeDAOService gradeDAOService
    GradeCategoryService gradeCategoryService
    RateService rateService
    RateTableDetailsService rateTableDetailsService
    PeriodService periodService
    RateDAOService rateDAOService
    MatterAuthorisationService matterAuthorisationService
    GroupPositionDAOService groupPositionDAOService

    Grade getGrade(long gradeId) {
        Grade grade = gradeDAOService.getGrade(gradeId)
        return grade
    }

    List<Grade> organisationGrades(Organisation org) {
        def grades = gradeDAOService.getGradesForOrganisation(org)
        return grades
    }

    List<Grade> organisationPositionGrades(Organisation org,def positionId) {
        def position = groupPositionDAOService.getPosition(positionId)
        def grades = gradeDAOService.getGradesForOrganisationAndPosition(org,position)
        return grades
    }

    def createGrade(ValidatedParameterMap validatedBody, Organisation org, AppUser currentUser){
        Grade grade = new Grade(validatedBody)
        grade.organisation = org
        List<Grade> currentGradeList = organisationGrades(org)
        if(currentGradeList.size()>49){
            throw new Exception()
        }
        if(validatedBody.categoryId){
            grade.gradeCategory = gradeCategoryService.getCategory(validatedBody.categoryId)
        }else{
            grade.gradeCategory = null
        }
        grade.groupPosition = validatedBody.position==GroupPosition.findByOrganisationAndName(org, 'Client').id ? GroupPosition.findByOrganisationAndName(org, 'Client') : GroupPosition.findByOrganisationAndName(org, 'Advisor')

        def savedGrade = gradeDAOService.save(grade)

        return savedGrade
    }

    def updateGrade(ValidatedParameterMap validatedBody, Grade gradeToUpdate){
        if(validatedBody.name){
            gradeToUpdate.name = validatedBody.name
        }
        if(validatedBody.categoryId){
            GradeCategory category = gradeCategoryService.getCategory(validatedBody.categoryId)
            if(!category){
                throw new Exception()
            }
            gradeToUpdate.gradeCategory = category
        }
        if( validatedBody.grade_idx){
            gradeToUpdate.grade_idx = validatedBody.grade_idx
        }

        Grade savedGrade = gradeDAOService.save(gradeToUpdate)
        return savedGrade
    }

    def updateGradeOrder(ValidatedParameterMap validatedBody, orgId){
        List<Grade>gradeList = organisationGrades(Organisation.findById(orgId))
        gradeList.forEach {grade -> {
            def x = validatedBody.gradeOrderList.find(y->y[0]==grade.id)
            if(x[1]!=grade.grade_idx){
                grade.grade_idx = x[1]
                grade.save()
            }

        }}
        return gradeList
    }

    def isGradeUsed(Grade grade){
        List<Rate> rateList = rateService.organisationRates(grade.organisation.id)
        if(rateList.findAll(x->x.grade ==grade).size()>0){
            return true
        }
        else {
            return false
        }
    }

    def deleteGrade(Grade gradeToDelete){
        List<Rate> rateList = rateService.organisationRates(gradeToDelete.organisation.id)
        if(rateList.findAll(x->x.grade ==gradeToDelete).size()>0){
            throw new Exception()
        }
        gradeDAOService.delete(gradeToDelete)
    }

    def getGradesForRTD(Matter matter){
        if (!matterAuthorisationService.hasCostsAndReadAccess(matter.id)) {
            throw new Exception()
        }
        RateTableDetails matterRTD =rateTableDetailsService.getMatterRateTableDetails(matter)
        Period period = periodService.getLatestPeriod(matterRTD)
        List<Rate> matterRates = rateDAOService.getRatesForPeriod(period)
        List<Grade> grades = matterRates.grade
        return grades.sort(it->it.gradeCategoryId)
    }

    def generateGradeDefaults(Organisation org,ArrayList<GradeCategory>gradeCategories,def validatedBody){
        ArrayList<Grade> list = new ArrayList<Grade>()
        list.add(new Grade(name:"Managing Partner",organisation: org,grade_idx: 0, gradeCategory:gradeCategories.find(x->x.name=='Partners'),groupPosition:validatedBody.position== GroupPosition.findByOrganisationAndName(org, 'Client').id ? GroupPosition.findByOrganisationAndName(org, 'Client') :GroupPosition.findByOrganisationAndName(org, 'Advisor')))
        list.add(new Grade(name:"Senior Partner", organisation:org,grade_idx: 1,gradeCategory:gradeCategories.find(x->x.name=='Partners'),groupPosition:validatedBody.position== GroupPosition.findByOrganisationAndName(org, 'Client').id ? GroupPosition.findByOrganisationAndName(org, 'Client') :GroupPosition.findByOrganisationAndName(org, 'Advisor')))
        list.add(new Grade(name:"Partner", organisation:org,grade_idx: 2,gradeCategory:gradeCategories.find(x->x.name=='Partners'),groupPosition:validatedBody.position== GroupPosition.findByOrganisationAndName(org, 'Client').id ? GroupPosition.findByOrganisationAndName(org, 'Client') :GroupPosition.findByOrganisationAndName(org, 'Advisor')))
        list.add(new Grade(name:"Legal Director", organisation:org,grade_idx: 3,gradeCategory:gradeCategories.find(x->x.name=='Senior Lawyers'),groupPosition:validatedBody.position== GroupPosition.findByOrganisationAndName(org, 'Client').id ? GroupPosition.findByOrganisationAndName(org, 'Client') :GroupPosition.findByOrganisationAndName(org, 'Advisor')))
        list.add(new Grade(name:"Senior Consultant", organisation:org,grade_idx: 4,gradeCategory:gradeCategories.find(x->x.name=='Senior Lawyers'),groupPosition:validatedBody.position== GroupPosition.findByOrganisationAndName(org, 'Client').id ? GroupPosition.findByOrganisationAndName(org, 'Client') :GroupPosition.findByOrganisationAndName(org, 'Advisor')))
        list.add(new Grade(name:"Of Counsel", organisation:org,grade_idx:5,gradeCategory:gradeCategories.find(x->x.name=='Senior Lawyers'),groupPosition:validatedBody.position== GroupPosition.findByOrganisationAndName(org, 'Client').id ? GroupPosition.findByOrganisationAndName(org, 'Client') :GroupPosition.findByOrganisationAndName(org, 'Advisor')))
        list.add(new Grade(name:"Executive Counsel", organisation:org,grade_idx:6,gradeCategory:gradeCategories.find(x->x.name=='Senior Lawyers'),groupPosition:validatedBody.position== GroupPosition.findByOrganisationAndName(org, 'Client').id ? GroupPosition.findByOrganisationAndName(org, 'Client') :GroupPosition.findByOrganisationAndName(org, 'Advisor')))
        list.add(new Grade(name:"Associate 8Y+", organisation:org,grade_idx: 7,gradeCategory:gradeCategories.find(x->x.name=='Senior Lawyers'),groupPosition:validatedBody.position== GroupPosition.findByOrganisationAndName(org, 'Client').id ? GroupPosition.findByOrganisationAndName(org, 'Client') :GroupPosition.findByOrganisationAndName(org, 'Advisor')))
        list.add(new Grade(name:"Associate 7Y+", organisation:org,grade_idx: 8,gradeCategory:gradeCategories.find(x->x.name=='Senior Lawyers'),groupPosition:validatedBody.position== GroupPosition.findByOrganisationAndName(org, 'Client').id ? GroupPosition.findByOrganisationAndName(org, 'Client') :GroupPosition.findByOrganisationAndName(org, 'Advisor')))
        list.add(new Grade(name:"Associate 6Y+", organisation:org,grade_idx: 9,gradeCategory:gradeCategories.find(x->x.name=='Senior Lawyers'),groupPosition:validatedBody.position== GroupPosition.findByOrganisationAndName(org, 'Client').id ? GroupPosition.findByOrganisationAndName(org, 'Client') :GroupPosition.findByOrganisationAndName(org, 'Advisor')))
        list.add(new Grade(name:"Associate 5Y+", organisation:org,grade_idx: 10,gradeCategory:gradeCategories.find(x->x.name=='Mid Lawyers'),groupPosition:validatedBody.position== GroupPosition.findByOrganisationAndName(org, 'Client').id ? GroupPosition.findByOrganisationAndName(org, 'Client') :GroupPosition.findByOrganisationAndName(org, 'Advisor')))
        list.add(new Grade(name:"Associate 4Y+", organisation:org,grade_idx: 11,gradeCategory:gradeCategories.find(x->x.name=='Mid Lawyers'),groupPosition:validatedBody.position== GroupPosition.findByOrganisationAndName(org, 'Client').id ? GroupPosition.findByOrganisationAndName(org, 'Client') :GroupPosition.findByOrganisationAndName(org, 'Advisor')))
        list.add(new Grade(name:"Associate 3Y+", organisation:org,grade_idx: 12,gradeCategory:gradeCategories.find(x->x.name=='Mid Lawyers'),groupPosition:validatedBody.position== GroupPosition.findByOrganisationAndName(org, 'Client').id ? GroupPosition.findByOrganisationAndName(org, 'Client') :GroupPosition.findByOrganisationAndName(org, 'Advisor')))
        list.add(new Grade(name:"Associate 2Y+", organisation:org,grade_idx: 13,gradeCategory:gradeCategories.find(x->x.name=='Junior Lawyers'),groupPosition:validatedBody.position== GroupPosition.findByOrganisationAndName(org, 'Client').id ? GroupPosition.findByOrganisationAndName(org, 'Client') :GroupPosition.findByOrganisationAndName(org, 'Advisor')))
        list.add(new Grade(name:"Associate 1Y+", organisation:org,grade_idx: 14,gradeCategory:gradeCategories.find(x->x.name=='Junior Lawyers'),groupPosition:validatedBody.position== GroupPosition.findByOrganisationAndName(org, 'Client').id ? GroupPosition.findByOrganisationAndName(org, 'Client') :GroupPosition.findByOrganisationAndName(org, 'Advisor')))
        list.add(new Grade(name:"Associate NQ", organisation:org,grade_idx: 15,gradeCategory:gradeCategories.find(x->x.name=='Junior Lawyers'),groupPosition:validatedBody.position== GroupPosition.findByOrganisationAndName(org, 'Client').id ? GroupPosition.findByOrganisationAndName(org, 'Client') :GroupPosition.findByOrganisationAndName(org, 'Advisor')))
        list.add(new Grade(name:"Staff Attorney", organisation:org,grade_idx: 16,gradeCategory:gradeCategories.find(x->x.name=='Legal Executives'),groupPosition:validatedBody.position== GroupPosition.findByOrganisationAndName(org, 'Client').id ? GroupPosition.findByOrganisationAndName(org, 'Client') :GroupPosition.findByOrganisationAndName(org, 'Advisor')))
        list.add(new Grade(name:"Project Manager", organisation:org,grade_idx: 17,gradeCategory:gradeCategories.find(x->x.name=='Legal Executives'),groupPosition:validatedBody.position== GroupPosition.findByOrganisationAndName(org, 'Client').id ? GroupPosition.findByOrganisationAndName(org, 'Client') :GroupPosition.findByOrganisationAndName(org, 'Advisor')))
        list.add(new Grade(name:"Process Engineer", organisation:org,grade_idx: 18,gradeCategory:gradeCategories.find(x->x.name=='Legal Executives'),groupPosition:validatedBody.position== GroupPosition.findByOrganisationAndName(org, 'Client').id ? GroupPosition.findByOrganisationAndName(org, 'Client') :GroupPosition.findByOrganisationAndName(org, 'Advisor')))
        list.add(new Grade(name:"Paralegal", organisation:org,grade_idx: 19,gradeCategory:gradeCategories.find(x->x.name=='Legal Executives'),groupPosition:validatedBody.position== GroupPosition.findByOrganisationAndName(org, 'Client').id ? GroupPosition.findByOrganisationAndName(org, 'Client') :GroupPosition.findByOrganisationAndName(org, 'Advisor')))
        list.add(new Grade(name:"Trainee Solicitor", organisation:org,grade_idx: 20,gradeCategory:gradeCategories.find(x->x.name=='Legal Executives'),groupPosition:validatedBody.position== GroupPosition.findByOrganisationAndName(org, 'Client').id ? GroupPosition.findByOrganisationAndName(org, 'Client') :GroupPosition.findByOrganisationAndName(org, 'Advisor')))
        list.each {it.save()}
    }


    def generateDefaults(Organisation org,def validatedBody){
        ArrayList<GradeCategory>gradeCategoryList = gradeCategoryService.generateGradeCategoryDefaults(org,validatedBody)
        generateGradeDefaults(org,gradeCategoryList,validatedBody)
    }
}
