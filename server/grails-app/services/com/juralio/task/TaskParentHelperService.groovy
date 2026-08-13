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

package com.juralio.task

import groovy.sql.GroovyRowResult
import groovy.sql.Sql
import groovy.transform.CompileStatic

@CompileStatic
class TaskParentHelperService {

    Sql groovySql

    final String PROJECT_TASK_QUERY = "select task_tasks_id from task_task where task_task.task_id="

    Task getParentTask(long taskId) {
        GroovyRowResult row = groovySql.firstRow(PROJECT_TASK_QUERY + taskId.toString())

        if (row) {
            return Task.get(row[0] as long)
        }

        return null
    }
}
