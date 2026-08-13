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

package com.juralio.organisationgroup.dao

import com.juralio.matter.Matter
import com.juralio.organisationgroup.MatterGroupPosition
import com.juralio.organisationgroup.OrganisationGroup
import grails.gorm.transactions.Transactional

@Transactional
class MatterGroupPositionDAOService {

    def getMatterGroupPositions(Matter matter) {
        return MatterGroupPosition.findAllByMatter(matter)
    }

    def getMatterGroupPosition(Matter matter, OrganisationGroup group){
        return MatterGroupPosition.findByMatterAndOrganisationGroup(matter, group)
    }

    def delete(Matter matter, OrganisationGroup group){
        MatterGroupPosition toDelete = getMatterGroupPosition(matter,group)
        toDelete?.delete()
    }
}

