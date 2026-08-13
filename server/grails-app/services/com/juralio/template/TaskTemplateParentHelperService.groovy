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

package com.juralio.template

import groovy.sql.GroovyRowResult
import groovy.sql.Sql
import groovy.transform.CompileStatic

@CompileStatic
class TaskTemplateParentHelperService {

    Sql groovySql
    final String TEMPLATE_TASK_QUERY =
            "select task_template_tasks_id as parentId from task_template_task_template t where t.task_template_id="

    TaskTemplate getParentTaskTemplate(long taskTemplateId) {
        GroovyRowResult row = groovySql.firstRow(TEMPLATE_TASK_QUERY + taskTemplateId.toString())

        if (row) {
            return TaskTemplate.get(row.parentId as long)
        }

        return null
    }
}
