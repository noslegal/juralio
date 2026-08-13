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

package com.juralio.project.referencenumber

import grails.gorm.transactions.Transactional
import groovy.sql.Sql
import org.apache.commons.logging.Log
import org.apache.commons.logging.LogFactory

@Transactional
class ProjectContentReferenceNumberService {

    final String PREFIX = "P"
    private final String PROJECT_CONTENT_SEQUENCE_PREFIX = "project_number_sequence_"

    def referenceNumberService
    Sql groovySql

    protected final Log logger = LogFactory.getLog(getClass())

    String addRefNumberToProject(long matterId, long projectId) {
        String sequenceName = PROJECT_CONTENT_SEQUENCE_PREFIX + matterId
        String updateStatement = "UPDATE project SET reference_number = '" + referenceNumberService.getNextReferenceNumber(PREFIX, sequenceName) + "' WHERE id =" + projectId
        groovySql.execute(updateStatement)
    }

    void createProjectSequenceIfNotExists(long matterId) {
        String sequenceName = PROJECT_CONTENT_SEQUENCE_PREFIX + matterId
        String createSequenceStatement = "CREATE SEQUENCE IF NOT EXISTS " + sequenceName
        groovySql.execute(createSequenceStatement)
    }

    void getProjectReferenceNumber(long matterId, long projectId) {
        createProjectSequenceIfNotExists(matterId)
        addRefNumberToProject(matterId, projectId)
    }
}
