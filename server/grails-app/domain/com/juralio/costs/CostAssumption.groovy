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
import com.juralio.matter.Matter
import com.juralio.task.Task

class CostAssumption {

    Matter matter
    Task task
    AppUser user
    String assumption
    String summary
    Integer position
    String status = AssumptionStatus.ON_TARGET.value()

    static belongsTo = [matter: Matter]

    static constraints = {
        matter nullable: false
        task nullable: false
        user nullable: false
        assumption nullable: false
        summary nullable: true
        position nullable: true
        status nullable: false, validator: { val -> AssumptionStatus.getAllValues().contains(val) }
    }
}
