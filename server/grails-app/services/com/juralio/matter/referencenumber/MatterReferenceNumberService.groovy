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
import groovy.transform.CompileStatic

@CompileStatic
class MatterReferenceNumberService {

    final String PREFIX = "M"
    final String MATTER_SEQUENCE_PREFIX = "matter_number_sequence_"

    ReferenceNumberService referenceNumberService
    Sql groovySql

    private String updateRefNumberColumnn(long organisationId, long matterId) {
        String sequenceName = MATTER_SEQUENCE_PREFIX + organisationId
        String case_id = referenceNumberService.getNextReferenceNumber(PREFIX, sequenceName)
        groovySql.execute("UPDATE matter SET case_id = '" + case_id + "' WHERE id =" + matterId)
        return case_id
    }

    private void createMatterSequenceIfNotExists(long organisationId) {
        String sequenceName = MATTER_SEQUENCE_PREFIX + organisationId
        groovySql.execute("CREATE SEQUENCE IF NOT EXISTS " + sequenceName)
    }

    String addReferenceNumberToMatter(long organisationId, long matterId) {
        createMatterSequenceIfNotExists(organisationId)
        String case_id = updateRefNumberColumnn(organisationId, matterId)
        return case_id
    }
}
