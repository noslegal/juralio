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

package com.juralio.template.referencenumber

import grails.gorm.transactions.Transactional
import groovy.sql.Sql
import org.apache.commons.logging.Log
import org.apache.commons.logging.LogFactory

@Transactional
class ProjectTemplateReferenceNumberService {

    final String PREFIX = "T"
    final String TEMPLATE_SEQUENCE_PREFIX = "template_reference_number_sequence_"

    Sql groovySql
    def referenceNumberService

    protected final Log logger = LogFactory.getLog(getClass())

    String getNextReferenceNumber(long organisationId) {
        createTemplateSequenceIfNotExists(organisationId)
        String sequenceName = TEMPLATE_SEQUENCE_PREFIX + organisationId
        return referenceNumberService.getNextReferenceNumber(PREFIX, sequenceName)
    }

    void createTemplateSequenceIfNotExists(long organisationId) {
        String sequenceName = TEMPLATE_SEQUENCE_PREFIX + organisationId
        String createSequenceStatement = "CREATE SEQUENCE IF NOT EXISTS " + sequenceName
        groovySql.execute(createSequenceStatement)
    }
}
