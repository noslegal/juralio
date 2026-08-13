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

package com.juralio.matter.costs

import com.juralio.costs.Grade
import com.juralio.costs.ProjectionPeriod
import com.juralio.matter.Matter
import com.juralio.project.Project

class CostRatio {
    Matter matter
    Grade grade
    Integer ratioValue
    Integer recoveryRate
    ProjectionPeriod projectionPeriod
    CostTimeEstimate costTimeEstimate
    Project project

    static constraints = {
        project nullable: true
        costTimeEstimate nullable: true
    }

    static mapping = {
        grade lazy: false
        costTimeEstimate lazy:false
        project lazy: false
    }
}
