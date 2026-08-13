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

package com.juralio.template.dao

import com.juralio.template.ProjectTemplate
import com.juralio.template.TaskTemplate
import com.juralio.template.referencenumber.TaskTemplateReferenceNumberService
import grails.gorm.transactions.Transactional
import groovy.sql.Sql

@Transactional
class TaskTemplateDAOService {

    Sql groovySql
    TaskTemplateReferenceNumberService taskTemplateReferenceNumberService

    TaskTemplate get(long id) {
        return TaskTemplate.get(id)
    }

    List<TaskTemplate> findAllByProjectAndLevel(ProjectTemplate project, short level) {
        return TaskTemplate.findAllByProjectTemplateAndLevel(project, level)
    }

    TaskTemplate getParentTaskTemplate(TaskTemplate taskTemplate) {
        String query = "SELECT task_template_tasks_id AS parenttaskid " +
                "FROM task_template_task_template t " +
                "WHERE t.task_template_id = ${taskTemplate.id}"

        def row = groovySql.firstRow(query)
        if (row) {
            return get(row.parenttaskid)
        }
        return null
    }

    void delete(TaskTemplate taskTemplate) {
        taskTemplate.delete()
    }

    TaskTemplate create(String name, long level, ProjectTemplate projectTemplate, Boolean isMilestone = false, Boolean isDeliverable = false, String description = '') {
        TaskTemplate taskTemplate = new TaskTemplate(name: name, level: level, isMilestone: isMilestone, noticeboardText: description,isDeliverable: isDeliverable)
        taskTemplate.referenceNumber = taskTemplateReferenceNumberService.getNextReferenceNumber(projectTemplate.id)
        return taskTemplate
    }

    TaskTemplate save(TaskTemplate templateTask) {
        templateTask.save(failOnError: true)
        return templateTask
    }
}
