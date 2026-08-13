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

import com.juralio.costs.GradeCategory
import com.juralio.organisation.Organisation
import com.juralio.organisationgroup.GroupPosition
import grails.gorm.transactions.Transactional

@Transactional
class GradeCategoryDAOService {

    GradeCategory getCategory(long id) {
        return GradeCategory.get(id)
    }

    List<GradeCategory> getCategoriesForOrganisation(Organisation org){
        return  GradeCategory.findAllByOrganisation(org)
    }

    List<GradeCategory> getCategoriesForOrganisationAndPosition(Organisation org,GroupPosition position){
        return  GradeCategory.findAllByOrganisationAndGroupPosition(org,position)
    }

    GradeCategory save(GradeCategory category) {
        category.save(failOnError: true)
        return category
    }

    GradeCategory delete(GradeCategory gradeCategoryToDelete){
        return gradeCategoryToDelete.delete()
    }
}
