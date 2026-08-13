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

package com.juralio.costs.dao

import com.juralio.costs.Grade
import com.juralio.costs.GradeService
import com.juralio.organisation.Organisation
import grails.gorm.transactions.Transactional

@Transactional
class GradeDAOService {
    GradeService gradeService

    Grade getGrade(long id) {
        Grade grade = Grade.get(id)
        grade.isBeingUsed =  gradeService.isGradeUsed(grade)
        return grade
    }

    List<Grade> getGradesForOrganisation(Organisation org){
        List<Grade> gradeList = Grade.findAllByOrganisation(org)
        gradeList.forEach {it.isBeingUsed = gradeService.isGradeUsed(it)}
        return gradeList
    }

    List<Grade> getGradesForOrganisationAndPosition(Organisation org,def position){
        List<Grade> gradeList = Grade.findAllByOrganisationAndGroupPosition(org,position)
        gradeList.forEach {it.isBeingUsed = gradeService.isGradeUsed(it)}
        return gradeList
    }

    Grade save(Grade grade) {
        grade.save(failOnError: true)
        return grade
    }

    Grade delete(Grade gradeToDelete) {
        return gradeToDelete.delete()
    }
}
