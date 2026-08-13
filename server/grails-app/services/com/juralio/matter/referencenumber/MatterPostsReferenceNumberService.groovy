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
class MatterPostsReferenceNumberService {

    final String PREFIX = "POST"
    final String MATTER_POSTS_SEQUENCE_PREFIX = "matter_post_reference_"

    ReferenceNumberService referenceNumberService
    Sql groovySql

    String getNextReferenceNumber(long matterId) {
        String sequenceName = MATTER_POSTS_SEQUENCE_PREFIX + matterId
        return referenceNumberService.getNextReferenceNumber(PREFIX, sequenceName)
    }

    void generateMatterPostsSequence(long matterId) {
        groovySql.execute("CREATE SEQUENCE " + MATTER_POSTS_SEQUENCE_PREFIX + matterId)
    }
}
