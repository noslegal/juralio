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

package com.juralio.matter.referencenumber

import com.juralio.reference.ReferenceNumberService
import groovy.sql.Sql
import groovy.transform.CompileDynamic
import groovy.transform.CompileStatic

@CompileStatic
class MatterContentReferenceNumberService {

    final String PREFIX = "JUR"
    private final String MATTER_CONTENT_SEQUENCE_PREFIX = "matter_content_reference_"

    ReferenceNumberService referenceNumberService
    Sql groovySql

    String getNextReferenceNumber(long matterId) {
        String sequenceName = MATTER_CONTENT_SEQUENCE_PREFIX + matterId
        return referenceNumberService.getNextReferenceNumber(PREFIX, sequenceName)
    }

    @CompileDynamic
    boolean isReferenceNumber(value) {
        if (value && value.size() > 0) {
            return value[0] == '#'//.matches("[Jj][Uu][Rr]{1}[0-9]+")
        }
        return false
    }

    void generateMatterContentSequence(long matterId) {
        groovySql.execute("CREATE SEQUENCE " + MATTER_CONTENT_SEQUENCE_PREFIX + matterId)
    }
}
