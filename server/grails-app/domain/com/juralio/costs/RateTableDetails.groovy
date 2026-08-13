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

import com.juralio.matter.Matter
import com.juralio.organisation.Organisation
import com.juralio.organisationgroup.GroupPosition
import com.juralio.project.TaskCountsDTO

class RateTableDetails {

    String work_type
    String currency
    String location
    Organisation organisation
    Matter matter
    Period initalPeriod
    Boolean draft = true
    Boolean client = false
    RateTableDetails rateTableDetails
    String client_name
    String templateLocation
    String templateWorkType
    Boolean isBeingUsed
    Boolean is_retired
    GroupPosition groupPosition

    static transients = ['initalPeriod','templateLocation','templateWorkType', 'isBeingUsed']

    static constraints = {
        rateTableDetails nullable: true
        client_name nullable: true
        matter nullable: true
    }

    static mapping = {
        matter lazy: false
    }
}
