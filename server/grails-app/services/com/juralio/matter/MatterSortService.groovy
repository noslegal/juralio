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

package com.juralio.matter

import groovy.transform.CompileStatic

@CompileStatic
class MatterSortService {

    List<Matter> sortMatterList(List<Matter> matters) {
        List<Matter> inactiveMatters = matters.findAll { it.matterStatus == MatterStatus.INACTIVE.value() }.sort {
            it.creationDate
        }.reverse()
        List<Matter> activeMatters = matters.findAll { it.matterStatus == MatterStatus.ACTIVE.value() }.sort {
            it.creationDate
        }.reverse()
        List<Matter> closedMatters = matters.findAll { it.matterStatus == MatterStatus.CLOSED.value() }.sort {
            it.creationDate
        }.reverse()
        return inactiveMatters + activeMatters + closedMatters
    }
}

