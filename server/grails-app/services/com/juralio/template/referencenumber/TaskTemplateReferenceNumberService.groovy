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

import com.juralio.reference.ReferenceNumberService
import grails.gorm.transactions.Transactional
import groovy.sql.Sql
import org.apache.commons.logging.Log
import org.apache.commons.logging.LogFactory

@Transactional
class TaskTemplateReferenceNumberService {
    final String SEQUENCE_PREFIX = "JUR"
    final String SEQUENCE_NAME_PREFIX = "task_template_reference_number_sequence_"

    ReferenceNumberService referenceNumberService
    Sql groovySql

    protected final Log logger = LogFactory.getLog(getClass())

    String getNextReferenceNumber(long templateId) {
        logger.debug("Getting next reference number for " + templateId)
        return referenceNumberService.getNextReferenceNumber(SEQUENCE_PREFIX, SEQUENCE_NAME_PREFIX + templateId)
    }

    void createSequence(long templateId) {
        String createSequenceStatement = "CREATE SEQUENCE " + SEQUENCE_NAME_PREFIX + templateId
        groovySql.execute(createSequenceStatement)
        logger.debug(SEQUENCE_NAME_PREFIX + templateId + " sequence created.")
    }
}
