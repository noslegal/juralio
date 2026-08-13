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

package com.juralio.template.post.referencenumber

import groovy.sql.Sql
import org.apache.commons.logging.Log
import org.apache.commons.logging.LogFactory

class TemplatePostsReferenceNumberService {

    final String PREFIX = "POST"
    private final String TEMPLATE_POSTS_SEQUENCE_PREFIX = "template_post_reference_"

    def referenceNumberService
    Sql groovySql

    protected final Log logger = LogFactory.getLog(getClass())

    String getNextReferenceNumber(long templateId) {
        String sequenceName = TEMPLATE_POSTS_SEQUENCE_PREFIX + templateId
        return referenceNumberService.getNextReferenceNumber(PREFIX, sequenceName)
    }

    void generateTemplatePostsSequence(long templateId) {
        String createSequenceStatement = "CREATE SEQUENCE " + TEMPLATE_POSTS_SEQUENCE_PREFIX + templateId
        groovySql.execute(createSequenceStatement)
        logger.debug(TEMPLATE_POSTS_SEQUENCE_PREFIX + templateId + " sequence created")
    }
}
