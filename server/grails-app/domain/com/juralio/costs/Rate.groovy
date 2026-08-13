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


import com.juralio.organisation.Organisation

class Rate {

    Organisation organisation
    Grade grade
    Period period
    Double rate
    RateType rateType
    RateTableDetails rateTableDetails


    static constraints = {
        rate nullable: true
    }

    static mapping = {
        grade lazy: false
        period lazy: false
        rate lazy: false
        rateType lazy: false
        rateTableDetails lazy: false
    }
}
