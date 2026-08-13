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

package com.juralio.project.dao


import com.juralio.project.TaskCountsDTO
import com.juralio.task.Task
import grails.gorm.transactions.Transactional
import groovy.sql.GroovyRowResult
import groovy.sql.Sql
import groovy.transform.CompileStatic

@CompileStatic
@Transactional
class TaskCountsDAOService {
    Sql groovySql

    TaskCountsDTO getTaskCounts(long projectId, boolean excludeNotRequired = false) {
        String query = """
SELECT 
(SELECT count(status) from task where project_id=$projectId AND task.status='done') as Done,
(SELECT count(status) from task where project_id=$projectId AND task.status='in-progress') as InProgress,
(SELECT count(status) from task where project_id=$projectId AND task.status='not-started') as NotStarted,
(SELECT count(status) from task where project_id=$projectId AND task.status='task-not-required') as NotRequired
"""

        GroovyRowResult result = groovySql.firstRow(query)

        return new TaskCountsDTO(
                excludeNotRequired ? 0 : result[3] as long,
                result[2] as long,
                result[1] as long,
                result[0] as long
                )
    }

    TaskCountsDTO getTaskCounts(Task task, boolean excludeNotRequired = false) {
        long done = 0
        long inProgress = 0
        long notStarted = 0
        long notRequired = 0

        String query = """
            WITH RECURSIVE children AS (
            SELECT
                task_id
            FROM
                task_task
            WHERE
                task_tasks_id = ${task.id}
            UNION
                SELECT
                    e.task_id
                FROM
                    task_task e
                INNER JOIN children s ON s.task_id = e.task_tasks_id
            ) SELECT status , count(status)
                FROM children 
                join task on task.id = children.task_id group by status
        """
        groovySql.eachRow(query) { row ->
            switch (row.getString('status')) {
                case 'not-required':
                    notStarted = row.getLong('count')
                case 'not-started':
                    notStarted = row.getLong('count')
                case 'in-progress':
                    notStarted = row.getLong('count')
                case 'done':
                    done = row.getLong('count')
            }
        }
        return new TaskCountsDTO(excludeNotRequired ? 0 : notRequired, notStarted, inProgress, done)
    }
}